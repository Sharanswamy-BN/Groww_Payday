import { neon } from "@neondatabase/serverless";

export function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is missing. Add your Neon connection string to .env.local");
  }
  return neon(url);
}

export async function migrate() {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS payday_users (
      id TEXT PRIMARY KEY,
      favourite_sip_day INTEGER NOT NULL DEFAULT 5,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS payday_sips (
      id TEXT PRIMARY KEY,
      demo_user_id TEXT NOT NULL REFERENCES payday_users(id) ON DELETE CASCADE,
      fund_id TEXT NOT NULL,
      fund_name TEXT NOT NULL,
      amount_inr NUMERIC NOT NULL,
      date_path TEXT,
      debit_day INTEGER,
      commitment_pct NUMERIC,
      high_commitment_ack BOOLEAN NOT NULL DEFAULT FALSE,
      status TEXT NOT NULL DEFAULT 'draft',
      pay_method TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS payday_cashflow (
      sip_id TEXT PRIMARY KEY REFERENCES payday_sips(id) ON DELETE CASCADE,
      salary_day INTEGER NOT NULL,
      net_salary_inr NUMERIC NOT NULL,
      housing_inr NUMERIC NOT NULL DEFAULT 0,
      housing_day INTEGER,
      utilities_inr NUMERIC NOT NULL DEFAULT 0,
      utilities_day INTEGER,
      groceries_inr NUMERIC NOT NULL DEFAULT 0,
      groceries_day INTEGER,
      existing_deductions_inr NUMERIC NOT NULL DEFAULT 0,
      existing_deductions_day INTEGER,
      misc_inr NUMERIC NOT NULL DEFAULT 0,
      total_commitments_inr NUMERIC,
      suggested_debit_day INTEGER,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

export async function ensureUser(userId: string, favourite = 5) {
  const sql = getSql();
  await migrate();
  await sql`
    INSERT INTO payday_users (id, favourite_sip_day)
    VALUES (${userId}, ${favourite})
    ON CONFLICT (id) DO NOTHING
  `;
}
