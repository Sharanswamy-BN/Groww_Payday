# Product Requirements Document (PRD)

**Product:** Groww Payday  
**Who it is for:** Groww product reviewers, and anyone opening the live website  
**Status:** Local MVP built — deploy to Vercel when GitHub + Neon env are set  
**Type:** Clickable web MVP that looks like a Groww SIP-setup feature

---

## 1. What this product is (in one minute)

Groww Payday is a SIP setup flow that picks a **debit date aligned with the user’s payday and bills**, so auto-debit is less likely to bounce.

Today many SIPs fail because the debit date does not match salary credit, or because rent and other bills leave the account low. A failed debit can mean bank bounce fees and the user stopping the SIP.

This MVP is a **Groww-looking website**, not a change inside the real Groww app. Payments and bank mandates are **simulated**. No real money moves.

---

## 2. Problem

People who start SIPs often discontinue them because of **insufficient funds** on debit day. Typical causes:

- SIP auto-debit date does not match **salary credit date**
- Other expenses hit first, so the balance is low when SIP debit runs

**Job to be done:** “Let me start this SIP on a date my salary can actually cover, and warn me if the amount is too large for my monthly cash flow.”

---

## 3. Who uses it

| User | What they do |
| --- | --- |
| First-time or returning SIP investor (demo) | Pick a fund, enter amount, choose a date path, complete fake payment |
| Habitual investor | Use **pre-set favourite date** (same date as prior SIPs) |
| New / cash-flow-aware investor | Use **Smart Cash-Flow Analyzer** |
| Reviewer / stakeholder | Open the Vercel link and walk the full flow |

The GitHub repo can stay **private**. People should be sent the **Vercel website link**.

---

## 4. Goals

| Goal | Success looks like |
| --- | --- |
| Reduce bounce risk in the demo | Suggested date = salary + bills cleared + 2–3 day buffer |
| Protect liquidity | If commitments > 90% of salary, show warning; allow Adjust SIP or Proceed Anyway |
| Feel like Groww | UI, colours, and copy match Groww’s design language |
| Finish setup | User can complete first (simulated) payment and see SIP confirmed |

**Primary product outcome this MVP illustrates:** fewer failed first-year SIP instalments caused by date/cash-flow mismatch — not higher fund returns.

---

## 5. What the website shows (end-to-end flow)

### Step 1 — Fund selection & initiation

- User browses a **small mock list** of mutual funds (static, Groww-like cards).
- Taps **Start SIP** (or **Monthly SIP**).
- Enters monthly SIP amount (example: ₹5,000).
- Amount must be a positive number. No fund/stock recommendation.

### Step 2 — Dual-option date selection

Not a plain calendar grid. Two paths:

**Option 1 — Pre-set favourite date (auto-select)**  
- Pre-selects the debit date used across active or prior SIPs in this demo (default example: **5th** of every month).  
- For habitual investors with a stable debit routine.

**Option 2 — Smart Cash-Flow Analyzer (Recommended)**  
- Collects salary and outgoing timings.  
- Calculates a safer debit date and aims to reduce bounce fees.

### Step 3 — Branching & data inputs

**If Option 1:** system assigns the pre-set date and goes to **Step 5**. No cash-flow form.

**If Option 2:** user enters:

| Field | What we collect |
| --- | --- |
| Income | Salary credit date (day of month) and net monthly salary |
| Housing & living | Rent, maintenance, EMIs — amount + approximate date |
| Utilities & communications | Electricity, Wi-Fi, postpaid — amount + approximate date |
| Groceries & household | Approximate monthly amount (date optional; if blank, treat as spread / early-month) |
| Existing deductions | Other SIPs, FDs, RDs — amount + date if known |
| Miscellaneous | Subscriptions, personal budget — approximate monthly amount |

Amounts may be approximate. Dates are **day of month** (1–28 for simplicity in the MVP, so February never breaks).

### Step 4 — Smart recommendation & 90% guardrail

**Formula**

```
Total commitments = Total expenses + Existing deductions + New SIP amount
Commitment %     = Total commitments / Net monthly salary × 100
```

**Branch A — Healthy liquidity (commitments ≤ 90% of salary)**

- Map salary arrival and major expense clearance dates.
- Add a **2–3 day safety window** after the later of: salary credit day, last dated major outgoing.
- Cap the suggested day at 28.
- Show the optimal debit date (example: salary 1st, expenses cleared by 4th → suggested SIP date **7th**).
- User taps **Confirm & Continue** → Step 5.

**Branch B — Over-leveraging (commitments > 90% of salary)**

Warning modal:

> **Salary Limit Warning (90%+ Commitment)**  
> Your fixed expenses and commitments (including this SIP) will consume **[X]%** of your total monthly salary.  
> Creating this SIP may impact your buffer for unexpected or miscellaneous expenses.  
> **[Adjust SIP Amount]**  **[Proceed Anyway]**

Copy stays factual. No fear, FOMO, or urgency language beyond this clear warning.

**Action B1 — Adjust SIP Amount**

- Modal closes; user returns to **Step 1 amount input** (same fund).
- System **suggests** a reduced SIP amount so total commitments ≤ 90%.
- User updates and re-confirms. **Do not** show the warning modal again for that session if the new amount keeps commitments ≤ 90%.

**Action B2 — Proceed Anyway**

- Warning acknowledged.
- System still sets the **calculated optimal date** (salary + expense clearance + 2–3 day buffer), not a random date.
- System stores an internal risk flag: **User-Acknowledged High Commitment**.
- User goes to Step 5.

### Step 5 — First payment & Autopay (simulated)

- User “authorizes” the first instalment via **UPI / Net Banking / Debit Card** (UI only; always succeeds in the demo).
- User “registers” AutoPay / OTM / E-Mandate for future monthly debits on the chosen payday-aligned date (UI only).
- **Confirmation:** SIP setup complete; show fund, amount, debit date.
- **If Proceed Anyway was chosen:** extra reminder to keep balance **2 days before** debit date to avoid bounce penalties.

---

## 6. Product rules (must follow)

- UI/UX and colour scheme must match **existing Groww** (green `#00D09C`, grey `#44475B`, white surfaces, clean type). Feel polished and consistent.
- Do **not** recommend which fund to buy. The user already picked a fund.
- Do **not** use fear, FOMO, or countdown urgency. The 90% modal is a **liquidity warning**, not a scare tactic.
- Do **not** give investment advice or projected returns.
- Do **not** collect PAN, Aadhaar, real account numbers, OTPs, email, or phone. Demo identity is enough (guest session or a fake name).
- Payments and mandates are **mock**. Screens must say this is a **demo / prototype** in a small footer or banner so reviewers are not confused.
- Do not put secrets in GitHub. Keys live in `.env.local` and Vercel env vars.

---

## 7. Suggested SIP date — exact MVP logic

Let:

- `S` = salary credit day of month  
- `E` = maximum day-of-month among dated outgoings the user entered (rent, EMIs, utilities, other SIPs). Ignore undated items for the date map.  
- `buffer` = 3 days if `(max(S, E) + 3) ≤ 28`, else 2 days, else clamp to 28  

```
suggested_day = min(28, max(S, E) + buffer)
```

If Option 1 is used, `suggested_day` = stored favourite date (demo default **5**), not this formula.

---

## 8. Suggested reduced SIP amount (Adjust path)

```
max_sip = floor(0.90 × salary − total expenses − existing deductions)
```

If `max_sip` ≤ 0, show that this SIP cannot fit under 90% at any positive amount; user may still **Proceed Anyway** from the warning (they must go back through Option 2 or the warning, not a silent auto-start).

Round suggested amount down to the nearest ₹100 for a clean UI.

---

## 9. What success looks like (reviewer checklist)

| Check | Passes when |
| --- | --- |
| Link works | Vercel URL opens without GitHub login |
| Step 1 | Can pick a fund and enter an amount |
| Option 1 | Skips analyzer, uses favourite date, reaches confirmation |
| Option 2 healthy | Salary and bills → date with 2–3 day buffer → confirm |
| Option 2 over 90% | Modal with X%; Adjust returns to amount with a lower suggestion |
| Adjust | New amount ≤ 90% does **not** re-open the warning |
| Proceed Anyway | Confirmation includes 2-day balance reminder; risk flag stored |
| Look and feel | Groww-like colours, layout, and language |
| Honesty | Demo banner: no real UPI / mandate |

---

## 10. Out of scope

- Real Groww app / Play Store listing  
- Real UPI, net banking, debit card, OTM, or e-mandate  
- Live Groww fund APIs, KYC, or live SIP orders  
- Reading salary from bank statements  
- AI / LLM (Groq, OpenAI, etc.) — not needed  
- Native iOS / Android apps  
- Fund or stock recommendations  
- Multi-user production login, KYC, or PII vaults  

---

## 11. Accounts required to go live later

| Account | Required? | Role |
| --- | --- | --- |
| **GitHub** | Yes | Code |
| **Vercel** | Yes | Public website |
| **Neon** | Yes | Save SIP draft, dates, cash-flow, risk flag |
| Groq / other LLM | No | Rule-based product |
| Payment gateway | No | Payments are simulated |

Reuse the same GitHub / Vercel / Neon accounts from earlier Groww work if convenient.

---

## 12. How a reviewer should walk the demo (once built)

1. Open the Vercel link.  
2. Pick any fund → Start SIP → enter ₹5,000.  
3. Try **Option 1** once (happy path to confirmation).  
4. Start again → **Option 2** with salary high enough that commitments stay under 90%. Confirm suggested date.  
5. Start again → **Option 2** with salary so low that commitments exceed 90%. Try **Adjust SIP**, then try **Proceed Anyway**.  
6. On Proceed Anyway, check the 2-day balance reminder on the confirmation screen.

---

## 13. Open decisions (locked for this MVP)

| Topic | Decision |
| --- | --- |
| Platform | Web (Next.js), not inside real Groww |
| Auth | Guest demo; one browser session is enough |
| Funds | Small static list (about 5–8), names inspired by public Groww funds, not live NAV |
| Favourite date | Default 5th; if the demo user already completed a SIP in Neon, reuse that day |
| Day range | 1–28 only |
| Buffer | 2–3 days as in section 7 |
| Guardrail | 90% of **net** monthly salary |
| Currency | INR |
