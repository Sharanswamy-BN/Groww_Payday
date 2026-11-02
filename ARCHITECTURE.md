# Architecture (simple)

**Product:** Groww Payday  
This note explains **how the website will be put together**, in plain language.  
**Status:** Draft — matches `PRD.md`. App not built yet.

---

## 1. Big picture

Three services. No AI.

| Name | Role | Everyday analogy |
| --- | --- | --- |
| **GitHub** | Stores the code (private repo is fine) | The recipe book |
| **Vercel** | Runs the website and gives a public link | The restaurant |
| **Neon** | Database — SIP drafts, cash-flow, risk flag | The filing cabinet |

People who only need to **see the product** use the **Vercel link**. They do not need GitHub.

```
User browser
    → Vercel (Next.js pages + APIs)
         → Neon (funds are static in code; SIPs and cash-flow are stored)
```

There is **no** Groq, payment gateway, or Groww production API.

---

## 2. What you see in the browser

The site is a **Next.js** app (React). Look and colours follow Groww (green `#00D09C`, grey text `#44475B`, white background).

| Screen | Suggested URL | Job |
| --- | --- | --- |
| Fund list | `/` | Browse mock funds, Start SIP |
| Amount | `/sip/new?fund=…` | Step 1 amount |
| Date path | `/sip/date` | Step 2 — Option 1 vs Option 2 |
| Cash-flow form | `/sip/cashflow` | Step 3 — Option 2 only |
| Recommendation | `/sip/recommend` | Step 4 — date + 90% check / modal |
| Payment | `/sip/pay` | Step 5 — mock UPI / net banking / card + mandate |
| Confirmation | `/sip/done` | Success + optional 2-day reminder |

A small **Demo prototype** banner stays on every page.

Header name: **Groww Payday**.

Wizard state can live in the browser for the current session and be **saved to Neon** when the user confirms (and when they hit Proceed Anyway, so the risk flag is not lost).

---

## 3. Core logic (runs on the server)

Keep date math and the 90% rule in one module (for example `src/lib/payday.ts`) so the UI cannot invent a different date.

### Commitment check

```
total_expenses      = housing + utilities + groceries + miscellaneous
existing_deductions = other SIPs / FDs / RDs
total_commitments   = total_expenses + existing_deductions + new_sip_amount
pct                 = total_commitments / net_salary × 100
```

- If `pct ≤ 90` → Branch A (healthy).  
- If `pct > 90` → Branch B (warning modal).

### Suggested debit day (Option 2)

```
S = salary credit day (1–28)
E = max day-of-month among dated outgoings (ignore blank dates)
suggested_day = min(28, max(S, E) + buffer)
buffer = 3 if max(S,E)+3 ≤ 28 else 2 (still clamp to 28)
```

### Reduced SIP suggestion (Adjust)

```
max_sip = floor(0.90 × salary − total_expenses − existing_deductions)
suggest = max(0, round down max_sip to nearest 100)
```

Option 1 **does not** run these formulas. It uses `favourite_sip_day` (default 5, or last saved SIP day for this demo user).

---

## 4. What happens on each step (APIs)

All money and mandate calls are **fake**. APIs only validate input and write Neon.

| Action | API (planned) | What it does |
| --- | --- | --- |
| List funds | `GET /api/funds` | Returns static fund cards |
| Save amount + fund | `POST /api/sip/draft` | Creates/updates a draft SIP |
| Choose Option 1 | `POST /api/sip/date-preset` | Sets debit day = favourite; skips cash-flow |
| Save cash-flow | `POST /api/sip/cashflow` | Stores salary and outgoings |
| Evaluate | `POST /api/sip/evaluate` | Returns suggested day, %, branch A/B, optional reduced amount |
| Acknowledge warning | `POST /api/sip/acknowledge-risk` | Sets `high_commitment_ack = true` |
| Mock pay + mandate | `POST /api/sip/complete` | Marks SIP `active`; no bank call |
| Read result | `GET /api/sip/:id` | Confirmation data |

Evaluate must be **server-side** so the 90% guardrail cannot be skipped by editing the page.

---

## 5. Database (Neon) — main tables

Tables are created automatically on first use (same pattern as Groww Discovery Engine).

### `demo_users`

One row per browser demo (cookie or generated `demo_user_id`). Optional. If skipped, store `demo_user_id` on the SIP row only.

| Column | Meaning |
| --- | --- |
| `id` | UUID |
| `favourite_sip_day` | Default 5; updated after a successful SIP |

### `sips`

| Column | Meaning |
| --- | --- |
| `id` | UUID |
| `demo_user_id` | Who in the demo |
| `fund_id` | Static fund key |
| `fund_name` | Display name |
| `amount_inr` | Monthly SIP |
| `date_path` | `preset` or `analyzer` |
| `debit_day` | 1–28 |
| `commitment_pct` | Null on Option 1 |
| `high_commitment_ack` | True if Proceed Anyway |
| `status` | `draft` / `active` |
| `created_at` | Timestamp |

### `cashflow_profiles`

One per SIP draft that used Option 2.

| Column | Meaning |
| --- | --- |
| `sip_id` | FK |
| `salary_day` | 1–28 |
| `net_salary_inr` | Number |
| `housing_inr`, `housing_day` | Amount + optional day |
| `utilities_inr`, `utilities_day` | Amount + optional day |
| `groceries_inr`, `groceries_day` | Amount + optional day |
| `existing_deductions_inr`, `existing_deductions_day` | Amount + optional day |
| `misc_inr` | Amount |
| `total_commitments_inr` | Snapshot at evaluate time |
| `suggested_debit_day` | Snapshot |

No PAN, Aadhaar, real account numbers, OTPs, emails, or phones.

### `funds`

Optional table. **MVP default:** funds stay in a TypeScript file (`src/lib/funds.ts`) so Neon is only for user-entered SIP data.

---

## 6. Secrets (never put these in GitHub)

| Variable | Where | What |
| --- | --- | --- |
| `DATABASE_URL` | `.env.local` and Vercel | Neon connection string |

`.env.local` is git-ignored. No LLM keys. No payment keys.

---

## 7. Folders in the code (planned)

```
src/app/page.tsx                 Fund list
src/app/sip/new/                 Amount
src/app/sip/date/                Dual options
src/app/sip/cashflow/            Analyzer form
src/app/sip/recommend/           Date + 90% modal
src/app/sip/pay/                 Mock payment + mandate
src/app/sip/done/                Confirmation
src/app/api/funds/               Static funds
src/app/api/sip/                 Draft, evaluate, complete
src/lib/payday.ts                90% + date + reduced amount
src/lib/funds.ts                 Mock fund list
src/lib/db.ts                    Neon + table setup
src/components/AppShell.tsx      Groww-like chrome + demo banner
```

---

## 8. UI architecture

- Shared shell: Groww-style top bar, primary green buttons, light background.
- One vertical wizard; back control returns to the previous step without wiping Neon draft if a draft id exists.
- Warning in Step 4 is a **modal** with exactly two actions: Adjust SIP Amount, Proceed Anyway.
- Adjust navigates to amount screen with `suggestedAmount` query (or draft field), same `fund_id`.
- Confirmation reads `high_commitment_ack` to show or hide the 2-day balance reminder.

No third-party UI kit required. CSS (or Tailwind) tokens:

| Token | Value |
| --- | --- |
| Primary | `#00D09C` |
| Text | `#44475B` |
| Background | `#FFFFFF` / light grey page |
| Warning | Neutral dark modal; not red-alarm spam |

---

## 9. Limits reviewers should know

- **Not the real Groww app.** Same visual language, separate website.  
- **UPI / mandate always succeed.** There is no bank.  
- **Fund NAVs and lists are fake/static.**  
- **Guest only.** Closing the browser may start a new demo user unless the cookie remains.  
- **Days 29–31** are not used, to keep every month valid.

---

## 10. How a change will go live (when we build)

1. Edit code on the laptop.  
2. `git push` to GitHub `main`.  
3. Vercel rebuilds automatically.  
4. Open the production `.vercel.app` URL (not a preview URL that asks for Vercel login).

If the site asks for Vercel login, turn off **Deployment Protection** for Production so reviewers can open the link.

---

## 11. What we are not adding

- Groq / OpenAI  
- Razorpay or any payment SDK  
- Bank aggregators / account aggregators  
- Scraping groww.in for live funds  
- Native mobile wrappers  

Those would change this from a **product demo** into a regulated payments build.
