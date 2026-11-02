import Link from "next/link";
import { FUNDS } from "@/lib/funds";
import { inr } from "@/lib/payday";

export default function HomePage() {
  return (
    <div>
      <h1 className="text-[22px] font-semibold text-groww-text">Mutual funds</h1>
      <p className="mt-1 text-[13px] text-groww-muted">
        Pick a fund and start a monthly SIP. Payday helps choose a debit date that matches your salary.
      </p>
      <ul className="mt-4 space-y-3">
        {FUNDS.map((fund) => (
          <li key={fund.id} className="rounded-2xl border border-groww-line p-3 shadow-card">
            <div className="flex gap-3">
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[13px] font-bold text-white"
                style={{ background: fund.accent }}
              >
                {fund.initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold text-groww-text">{fund.name}</p>
                <p className="text-[12px] text-groww-muted">
                  {fund.category} · {fund.risk} risk
                </p>
                <p className="mt-1 text-[12px] text-groww-muted">Min SIP {inr(fund.minSip)}</p>
              </div>
            </div>
            <Link
              href={`/sip/new?fund=${fund.id}`}
              className="mt-3 block rounded-xl bg-groww-green py-2.5 text-center text-[14px] font-semibold text-[#0b3d32]"
            >
              Start SIP
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
