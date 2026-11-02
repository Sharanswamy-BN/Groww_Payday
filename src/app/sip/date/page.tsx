"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Stepper } from "@/components/Stepper";
import { ordinal } from "@/lib/payday";

export default function DatePage() {
  const router = useRouter();
  const [favourite, setFavourite] = useState(5);
  const [fundName, setFundName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/sip/current")
      .then((r) => r.json())
      .then((data) => {
        if (!data.sip) {
          router.replace("/");
          return;
        }
        setFavourite(data.favouriteDay ?? 5);
        setFundName(data.sip.fund_name);
      });
  }, [router]);

  async function choosePreset() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/sip/date-preset", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not set date");
      router.push("/sip/pay");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not set date");
      setLoading(false);
    }
  }

  return (
    <div>
      <Stepper current={2} />
      <h1 className="text-[20px] font-semibold text-groww-text">Choose SIP debit date</h1>
      <p className="mt-1 text-[13px] text-groww-muted">
        {fundName ? `${fundName}. ` : ""}Pick your usual date, or let Payday find a safer day after salary and bills.
      </p>
      <button
        type="button"
        disabled={loading}
        onClick={choosePreset}
        className="mt-5 w-full rounded-2xl border border-groww-line p-4 text-left hover:border-groww-green"
      >
        <p className="text-[12px] font-semibold uppercase tracking-wide text-groww-muted">Option 1</p>
        <p className="mt-1 text-[16px] font-semibold text-groww-text">Pre-set favourite date</p>
        <p className="mt-1 text-[13px] text-groww-muted">
          Auto-selects the {ordinal(favourite)} of every month — the date used on your active or prior SIPs.
        </p>
      </button>
      <button
        type="button"
        disabled={loading}
        onClick={() => router.push("/sip/cashflow")}
        className="mt-3 w-full rounded-2xl border-2 border-groww-green bg-groww-mint p-4 text-left"
      >
        <p className="text-[12px] font-semibold uppercase tracking-wide text-groww-greenDark">
          Option 2 · Recommended
        </p>
        <p className="mt-1 text-[16px] font-semibold text-groww-text">Smart Cash-Flow Analyzer</p>
        <p className="mt-1 text-[13px] text-groww-muted">
          Uses salary credit and outgoings to suggest a debit date and check a 90% salary guardrail.
        </p>
      </button>
      {error ? <p className="mt-3 text-[13px] text-groww-danger">{error}</p> : null}
    </div>
  );
}
