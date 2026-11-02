"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Stepper } from "@/components/Stepper";
import { GhostButton, PrimaryButton } from "@/components/Field";
import { inr, ordinal } from "@/lib/payday";

type Eval = {
  pct: number;
  overGuardrail: boolean;
  debitDay: number;
  amount: number;
  fundName: string;
  suggestedSip: number;
  totalCommitments: number;
};

export default function RecommendPage() {
  const router = useRouter();
  const [data, setData] = useState<Eval | null>(null);
  const [fundId, setFundId] = useState("");
  const [showWarn, setShowWarn] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/sip/current")
      .then((r) => r.json())
      .then((res) => {
        if (!res.sip) {
          router.replace("/");
          return;
        }
        setFundId(res.sip.fund_id);
        if (!res.evaluation) {
          router.replace("/sip/cashflow");
          return;
        }
        setData(res.evaluation);
        setShowWarn(Boolean(res.evaluation.overGuardrail) && !res.sip.high_commitment_ack);
      });
  }, [router]);

  async function continueHealthy() {
    router.push("/sip/pay");
  }

  async function proceedAnyway() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/sip/acknowledge-risk", { method: "POST" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Could not continue");
      router.push("/sip/pay");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not continue");
      setLoading(false);
    }
  }

  if (!data) return <p className="text-sm text-groww-muted">Calculating…</p>;

  const salaryOn = data.debitDay;
  return (
    <div>
      <Stepper current={3} />
      <h1 className="text-[20px] font-semibold text-groww-text">Recommended SIP date</h1>
      <p className="mt-1 text-[13px] text-groww-muted">{data.fundName}</p>
      <div className="mt-5 rounded-2xl bg-groww-mint p-5 text-center">
        <p className="text-[12px] font-medium uppercase tracking-wide text-groww-greenDark">Optimal debit date</p>
        <p className="mt-1 text-[40px] font-semibold leading-none text-groww-text">{ordinal(salaryOn)}</p>
        <p className="mt-2 text-[13px] text-groww-muted">of every month</p>
      </div>
      <p className="mt-4 text-[13px] leading-relaxed text-groww-muted">
        Mapped from salary credit and the latest dated bill, plus a 2–3 day buffer so the debit is less likely to bounce.
      </p>
      <div className="mt-4 rounded-2xl border border-groww-line p-4 text-[13px]">
        <p className="flex justify-between">
          <span className="text-groww-muted">This SIP</span>
          <span className="font-medium">{inr(data.amount)}</span>
        </p>
        <p className="mt-2 flex justify-between">
          <span className="text-groww-muted">Total monthly commitments</span>
          <span className="font-medium">{inr(data.totalCommitments)}</span>
        </p>
        <p className="mt-2 flex justify-between">
          <span className="text-groww-muted">Share of salary</span>
          <span className={`font-semibold ${data.overGuardrail ? "text-groww-danger" : "text-groww-greenDark"}`}>
            {data.pct.toFixed(0)}%
          </span>
        </p>
      </div>
      {!data.overGuardrail ? (
        <div className="mt-6">
          <PrimaryButton type="button" onClick={continueHealthy}>
            Confirm & Continue
          </PrimaryButton>
        </div>
      ) : (
        <p className="mt-4 text-[13px] text-groww-muted">Review the salary limit warning to continue.</p>
      )}
      {error ? <p className="mt-3 text-[13px] text-groww-danger">{error}</p> : null}

      {showWarn ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-[400px] rounded-2xl bg-white p-5 shadow-card">
            <p className="text-[13px]">⚠️</p>
            <h2 className="mt-1 text-[18px] font-semibold text-groww-text">Salary Limit Warning (90%+ Commitment)</h2>
            <p className="mt-3 text-[14px] leading-relaxed text-groww-text">
              Your fixed expenses and commitments (including this SIP) will consume{" "}
              <strong>{data.pct.toFixed(0)}%</strong> of your total monthly salary.
            </p>
            <p className="mt-2 text-[13px] text-groww-muted">
              Creating this SIP may impact your buffer for unexpected or miscellaneous expenses.
            </p>
            <div className="mt-5 space-y-2">
              <PrimaryButton
                type="button"
                onClick={() =>
                  router.push(`/sip/new?fund=${fundId}&suggested=${Math.max(data.suggestedSip, 0)}`)
                }
              >
                Adjust SIP Amount
              </PrimaryButton>
              <GhostButton type="button" disabled={loading} onClick={proceedAnyway}>
                Proceed Anyway
              </GhostButton>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
