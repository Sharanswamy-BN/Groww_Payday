import { getFund } from "./funds";
import { ensureUser, getSql } from "./db";
import { evaluateCommitments, FAVOURITE_DEFAULT, suggestedDebitDay } from "./payday";

export type SipRow = {
  id: string;
  demo_user_id: string;
  fund_id: string;
  fund_name: string;
  amount_inr: string;
  date_path: string | null;
  debit_day: number | null;
  commitment_pct: string | null;
  high_commitment_ack: boolean;
  status: string;
  pay_method: string | null;
};

export type CashflowRow = {
  sip_id: string;
  salary_day: number;
  net_salary_inr: string;
  housing_inr: string;
  housing_day: number | null;
  utilities_inr: string;
  utilities_day: number | null;
  groceries_inr: string;
  groceries_day: number | null;
  existing_deductions_inr: string;
  existing_deductions_day: number | null;
  misc_inr: string;
  total_commitments_inr: string | null;
  suggested_debit_day: number | null;
};

function num(v: string | number | null | undefined) {
  return Number(v || 0);
}

export async function getFavouriteDay(userId: string) {
  await ensureUser(userId, FAVOURITE_DEFAULT);
  const sql = getSql();
  const rows = (await sql`
    SELECT favourite_sip_day FROM payday_users WHERE id = ${userId}
  `) as { favourite_sip_day: number }[];
  return rows[0]?.favourite_sip_day ?? FAVOURITE_DEFAULT;
}

export async function getSip(sipId: string, userId: string) {
  const sql = getSql();
  const rows = (await sql`
    SELECT * FROM payday_sips WHERE id = ${sipId} AND demo_user_id = ${userId}
  `) as SipRow[];
  return rows[0] ?? null;
}

export async function getCashflow(sipId: string) {
  const sql = getSql();
  const rows = (await sql`
    SELECT * FROM payday_cashflow WHERE sip_id = ${sipId}
  `) as CashflowRow[];
  return rows[0] ?? null;
}

export async function upsertDraft(userId: string, fundId: string, amount: number, existingSipId?: string | null) {
  await ensureUser(userId);
  const fund = getFund(fundId);
  if (!fund) throw new Error("Fund not found");
  if (!Number.isFinite(amount) || amount < fund.minSip) {
    throw new Error(`Minimum SIP for this fund is ₹${fund.minSip}`);
  }
  const sql = getSql();
  if (existingSipId) {
    const existing = await getSip(existingSipId, userId);
    if (existing && existing.status === "draft") {
      await sql`
        UPDATE payday_sips
        SET fund_id = ${fund.id},
            fund_name = ${fund.name},
            amount_inr = ${amount},
            high_commitment_ack = FALSE,
            updated_at = NOW()
        WHERE id = ${existing.id}
      `;
      return existing.id;
    }
  }
  const id = crypto.randomUUID();
  await sql`
    INSERT INTO payday_sips (id, demo_user_id, fund_id, fund_name, amount_inr, status)
    VALUES (${id}, ${userId}, ${fund.id}, ${fund.name}, ${amount}, 'draft')
  `;
  return id;
}

export async function applyPresetDate(sipId: string, userId: string) {
  const sip = await getSip(sipId, userId);
  if (!sip || sip.status !== "draft") throw new Error("Start a SIP first");
  const day = await getFavouriteDay(userId);
  const sql = getSql();
  await sql`
    UPDATE payday_sips
    SET date_path = 'preset',
        debit_day = ${day},
        commitment_pct = NULL,
        high_commitment_ack = FALSE,
        updated_at = NOW()
    WHERE id = ${sipId}
  `;
  return day;
}

export type CashflowInput = {
  salaryDay: number;
  netSalary: number;
  housing: number;
  housingDay: number | null;
  utilities: number;
  utilitiesDay: number | null;
  groceries: number;
  groceriesDay: number | null;
  existingDeductions: number;
  existingDeductionsDay: number | null;
  misc: number;
};

export async function saveCashflowAndEvaluate(sipId: string, userId: string, input: CashflowInput) {
  const sip = await getSip(sipId, userId);
  if (!sip || sip.status !== "draft") throw new Error("Start a SIP first");
  const amount = num(sip.amount_inr);
  const dated = [
    input.housingDay,
    input.utilitiesDay,
    input.groceriesDay,
    input.existingDeductionsDay,
  ].filter((d): d is number => d != null);
  const debitDay = suggestedDebitDay(input.salaryDay, dated);
  const evalResult = evaluateCommitments({
    salary: input.netSalary,
    housing: input.housing,
    utilities: input.utilities,
    groceries: input.groceries,
    misc: input.misc,
    existingDeductions: input.existingDeductions,
    sipAmount: amount,
  });
  const sql = getSql();
  await sql`
    INSERT INTO payday_cashflow (
      sip_id, salary_day, net_salary_inr, housing_inr, housing_day,
      utilities_inr, utilities_day, groceries_inr, groceries_day,
      existing_deductions_inr, existing_deductions_day, misc_inr,
      total_commitments_inr, suggested_debit_day
    )
    VALUES (
      ${sipId}, ${input.salaryDay}, ${input.netSalary}, ${input.housing}, ${input.housingDay},
      ${input.utilities}, ${input.utilitiesDay}, ${input.groceries}, ${input.groceriesDay},
      ${input.existingDeductions}, ${input.existingDeductionsDay}, ${input.misc},
      ${evalResult.totalCommitments}, ${debitDay}
    )
    ON CONFLICT (sip_id) DO UPDATE SET
      salary_day = EXCLUDED.salary_day,
      net_salary_inr = EXCLUDED.net_salary_inr,
      housing_inr = EXCLUDED.housing_inr,
      housing_day = EXCLUDED.housing_day,
      utilities_inr = EXCLUDED.utilities_inr,
      utilities_day = EXCLUDED.utilities_day,
      groceries_inr = EXCLUDED.groceries_inr,
      groceries_day = EXCLUDED.groceries_day,
      existing_deductions_inr = EXCLUDED.existing_deductions_inr,
      existing_deductions_day = EXCLUDED.existing_deductions_day,
      misc_inr = EXCLUDED.misc_inr,
      total_commitments_inr = EXCLUDED.total_commitments_inr,
      suggested_debit_day = EXCLUDED.suggested_debit_day,
      updated_at = NOW()
  `;
  await sql`
    UPDATE payday_sips
    SET date_path = 'analyzer',
        debit_day = ${debitDay},
        commitment_pct = ${evalResult.pct},
        high_commitment_ack = CASE WHEN ${evalResult.overGuardrail} THEN high_commitment_ack ELSE FALSE END,
        updated_at = NOW()
    WHERE id = ${sipId}
  `;
  return { ...evalResult, debitDay, amount, fundName: sip.fund_name };
}

export async function reevaluateExisting(sipId: string, userId: string) {
  const cf = await getCashflow(sipId);
  if (!cf) return null;
  return saveCashflowAndEvaluate(sipId, userId, {
    salaryDay: cf.salary_day,
    netSalary: num(cf.net_salary_inr),
    housing: num(cf.housing_inr),
    housingDay: cf.housing_day,
    utilities: num(cf.utilities_inr),
    utilitiesDay: cf.utilities_day,
    groceries: num(cf.groceries_inr),
    groceriesDay: cf.groceries_day,
    existingDeductions: num(cf.existing_deductions_inr),
    existingDeductionsDay: cf.existing_deductions_day,
    misc: num(cf.misc_inr),
  });
}

export async function acknowledgeRisk(sipId: string, userId: string) {
  const sip = await getSip(sipId, userId);
  if (!sip || sip.status !== "draft") throw new Error("Start a SIP first");
  if (sip.date_path !== "analyzer") throw new Error("Risk flag applies only to analyzer path");
  const sql = getSql();
  await sql`
    UPDATE payday_sips
    SET high_commitment_ack = TRUE, updated_at = NOW()
    WHERE id = ${sipId}
  `;
}

export async function completeSip(sipId: string, userId: string, payMethod: string) {
  const sip = await getSip(sipId, userId);
  if (!sip || sip.status !== "draft") throw new Error("Start a SIP first");
  if (!sip.debit_day) throw new Error("Pick a SIP date first");
  if (sip.date_path === "analyzer") {
    const pct = num(sip.commitment_pct);
    if (pct > 90 && !sip.high_commitment_ack) {
      throw new Error("Acknowledge the salary limit warning before continuing");
    }
  }
  const sql = getSql();
  await sql`
    UPDATE payday_sips
    SET status = 'active', pay_method = ${payMethod}, updated_at = NOW()
    WHERE id = ${sipId}
  `;
  await sql`
    UPDATE payday_users
    SET favourite_sip_day = ${sip.debit_day}
    WHERE id = ${userId}
  `;
}
