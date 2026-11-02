export const FAVOURITE_DEFAULT = 5;
export const DAY_MAX = 28;
export const GUARDRAIL = 0.9;

export function clampDay(day: number) {
  if (!Number.isFinite(day)) return 1;
  return Math.min(DAY_MAX, Math.max(1, Math.round(day)));
}

export function suggestedDebitDay(salaryDay: number, datedOutgoingDays: number[]) {
  const S = clampDay(salaryDay);
  const valid = datedOutgoingDays.map(clampDay);
  const E = valid.length ? Math.max(...valid) : S;
  const base = Math.max(S, E);
  const buffer = base + 3 <= DAY_MAX ? 3 : 2;
  return Math.min(DAY_MAX, base + buffer);
}

export function evaluateCommitments(input: {
  salary: number;
  housing: number;
  utilities: number;
  groceries: number;
  misc: number;
  existingDeductions: number;
  sipAmount: number;
}) {
  const totalExpenses = input.housing + input.utilities + input.groceries + input.misc;
  const total = totalExpenses + input.existingDeductions + input.sipAmount;
  const pct = input.salary > 0 ? (total / input.salary) * 100 : 999;
  const maxSip = Math.floor(GUARDRAIL * input.salary - totalExpenses - input.existingDeductions);
  const suggestedSip = Math.max(0, Math.floor(maxSip / 100) * 100);
  return {
    totalExpenses,
    totalCommitments: total,
    pct,
    overGuardrail: pct > 90,
    suggestedSip,
    maxSip,
  };
}

export function ordinal(n: number) {
  const day = clampDay(n);
  const j = day % 10;
  const k = day % 100;
  if (j === 1 && k !== 11) return `${day}st`;
  if (j === 2 && k !== 12) return `${day}nd`;
  if (j === 3 && k !== 13) return `${day}rd`;
  return `${day}th`;
}

export function inr(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}
