"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Stepper } from "@/components/Stepper";
import { Field, PrimaryButton, TextInput } from "@/components/Field";
import { FUNDS } from "@/lib/funds";
import { inr } from "@/lib/payday";

function AmountForm() {
  const router = useRouter();
  const params = useSearchParams();
  const fundId = params.get("fund") || "";
  const suggested = params.get("suggested");
  const fund = FUNDS.find((f) => f.id === fundId);
  const [amount, setAmount] = useState(suggested || "5000");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (suggested) setAmount(suggested);
  }, [suggested]);

  if (!fund) {
    return <p className="text-sm text-groww-muted">Fund not found. Go back and pick a fund.</p>;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/sip/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fundId, amount: Number(amount) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save");
      if (data.hasCashflow) {
        router.push("/sip/recommend");
        return;
      }
      router.push("/sip/date");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <Stepper current={1} />
      <p className="text-[12px] font-medium uppercase tracking-wide text-groww-muted">Monthly SIP</p>
      <h1 className="mt-1 text-[20px] font-semibold text-groww-text">{fund.name}</h1>
      <p className="text-[13px] text-groww-muted">
        {fund.category} · Min {inr(fund.minSip)}
      </p>
      {suggested ? (
        <p className="mt-3 rounded-xl bg-groww-mint px-3 py-2 text-[13px] text-groww-greenDark">
          Suggested amount to stay within 90% of salary: {inr(Number(suggested))}
        </p>
      ) : null}
      <div className="mt-5">
        <Field label="SIP amount (₹ / month)">
          <TextInput
            type="number"
            min={fund.minSip}
            step={100}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </Field>
      </div>
      {error ? <p className="mt-3 text-[13px] text-groww-danger">{error}</p> : null}
      <div className="mt-6">
        <PrimaryButton type="submit" disabled={loading}>
          {loading ? "Saving…" : "Continue"}
        </PrimaryButton>
      </div>
    </form>
  );
}

export default function NewSipPage() {
  return (
    <Suspense fallback={<p className="text-sm text-groww-muted">Loading…</p>}>
      <AmountForm />
    </Suspense>
  );
}
