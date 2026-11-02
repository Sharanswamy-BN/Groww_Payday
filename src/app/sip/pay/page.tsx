"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Stepper } from "@/components/Stepper";
import { PrimaryButton } from "@/components/Field";
import { inr, ordinal } from "@/lib/payday";

const METHODS = [
  { id: "upi", label: "UPI" },
  { id: "netbanking", label: "Net Banking" },
  { id: "card", label: "Debit Card" },
];

export default function PayPage() {
  const router = useRouter();
  const [method, setMethod] = useState("upi");
  const [mandate, setMandate] = useState(false);
  const [summary, setSummary] = useState<{
    fundName: string;
    amount: number;
    debitDay: number;
    over: boolean;
    ack: boolean;
  } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/sip/current")
      .then((r) => r.json())
      .then((res) => {
        if (!res.sip || !res.sip.debit_day) {
          router.replace("/");
          return;
        }
        const pct = Number(res.sip.commitment_pct || 0);
        if (res.sip.date_path === "analyzer" && pct > 90 && !res.sip.high_commitment_ack) {
          router.replace("/sip/recommend");
          return;
        }
        setSummary({
          fundName: res.sip.fund_name,
          amount: Number(res.sip.amount_inr),
          debitDay: res.sip.debit_day,
          over: pct > 90,
          ack: Boolean(res.sip.high_commitment_ack),
        });
      });
  }, [router]);

  async function pay() {
    if (!mandate) {
      setError("Set up AutoPay / OTM to continue.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/sip/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payMethod: method }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment failed");
      router.push("/sip/done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
      setLoading(false);
    }
  }

  if (!summary) return <p className="text-sm text-groww-muted">Loading…</p>;

  return (
    <div>
      <Stepper current={4} />
      <h1 className="text-[20px] font-semibold text-groww-text">First payment & Autopay</h1>
      <div className="mt-4 rounded-2xl border border-groww-line p-4 text-[14px]">
        <p className="font-semibold text-groww-text">{summary.fundName}</p>
        <p className="mt-2 flex justify-between text-groww-muted">
          <span>First instalment</span>
          <span className="font-medium text-groww-text">{inr(summary.amount)}</span>
        </p>
        <p className="mt-1 flex justify-between text-groww-muted">
          <span>Monthly debit date</span>
          <span className="font-medium text-groww-text">{ordinal(summary.debitDay)}</span>
        </p>
      </div>
      <p className="mt-5 text-[13px] font-medium text-groww-text">Pay first instalment with</p>
      <div className="mt-2 space-y-2">
        {METHODS.map((m) => (
          <label
            key={m.id}
            className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 ${
              method === m.id ? "border-groww-green bg-groww-mint" : "border-groww-line"
            }`}
          >
            <input type="radio" name="pay" checked={method === m.id} onChange={() => setMethod(m.id)} />
            <span className="text-[14px] font-medium">{m.label}</span>
          </label>
        ))}
      </div>
      <label className="mt-4 flex items-start gap-2 text-[13px] text-groww-text">
        <input type="checkbox" className="mt-1" checked={mandate} onChange={(e) => setMandate(e.target.checked)} />
        <span>
          Set up AutoPay / One-Time Mandate (OTM) or E-Mandate for future monthly debits on the{" "}
          {ordinal(summary.debitDay)}.
        </span>
      </label>
      {error ? <p className="mt-3 text-[13px] text-groww-danger">{error}</p> : null}
      <div className="mt-6">
        <PrimaryButton type="button" disabled={loading} onClick={pay}>
          {loading ? "Authorising…" : `Pay ${inr(summary.amount)}`}
        </PrimaryButton>
      </div>
    </div>
  );
}
