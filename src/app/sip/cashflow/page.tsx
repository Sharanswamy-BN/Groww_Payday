"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Stepper } from "@/components/Stepper";
import { Field, PrimaryButton, TextInput } from "@/components/Field";

type FormState = {
  salaryDay: string;
  netSalary: string;
  housing: string;
  housingDay: string;
  utilities: string;
  utilitiesDay: string;
  groceries: string;
  groceriesDay: string;
  existingDeductions: string;
  existingDeductionsDay: string;
  misc: string;
};

const empty: FormState = {
  salaryDay: "1",
  netSalary: "60000",
  housing: "15000",
  housingDay: "3",
  utilities: "2500",
  utilitiesDay: "4",
  groceries: "8000",
  groceriesDay: "",
  existingDeductions: "2000",
  existingDeductionsDay: "5",
  misc: "4000",
};

export default function CashflowPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(empty);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(key: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/sip/cashflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          salaryDay: Number(form.salaryDay),
          netSalary: Number(form.netSalary),
          housing: Number(form.housing || 0),
          housingDay: form.housingDay || null,
          utilities: Number(form.utilities || 0),
          utilitiesDay: form.utilitiesDay || null,
          groceries: Number(form.groceries || 0),
          groceriesDay: form.groceriesDay || null,
          existingDeductions: Number(form.existingDeductions || 0),
          existingDeductionsDay: form.existingDeductionsDay || null,
          misc: Number(form.misc || 0),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not analyse cash flow");
      router.push("/sip/recommend");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not analyse cash flow");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 pb-4">
      <Stepper current={2} />
      <h1 className="text-[20px] font-semibold text-groww-text">Your monthly cash flow</h1>
      <p className="text-[13px] text-groww-muted">
        Amounts can be approximate. Days are 1–28. This stays in the demo only — no bank login.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Salary credit day">
          <TextInput type="number" min={1} max={28} value={form.salaryDay} onChange={(e) => set("salaryDay", e.target.value)} required />
        </Field>
        <Field label="Net monthly salary (₹)">
          <TextInput type="number" min={1} value={form.netSalary} onChange={(e) => set("netSalary", e.target.value)} required />
        </Field>
      </div>
      <p className="pt-1 text-[12px] font-semibold uppercase tracking-wide text-groww-muted">Housing & living</p>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Rent / EMI / maintenance">
          <TextInput type="number" min={0} value={form.housing} onChange={(e) => set("housing", e.target.value)} />
        </Field>
        <Field label="Day (optional)">
          <TextInput type="number" min={1} max={28} value={form.housingDay} onChange={(e) => set("housingDay", e.target.value)} />
        </Field>
      </div>
      <p className="pt-1 text-[12px] font-semibold uppercase tracking-wide text-groww-muted">Utilities & communications</p>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Electricity, Wi-Fi, postpaid">
          <TextInput type="number" min={0} value={form.utilities} onChange={(e) => set("utilities", e.target.value)} />
        </Field>
        <Field label="Day (optional)">
          <TextInput type="number" min={1} max={28} value={form.utilitiesDay} onChange={(e) => set("utilitiesDay", e.target.value)} />
        </Field>
      </div>
      <p className="pt-1 text-[12px] font-semibold uppercase tracking-wide text-groww-muted">Groceries & household</p>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Approximate amount">
          <TextInput type="number" min={0} value={form.groceries} onChange={(e) => set("groceries", e.target.value)} />
        </Field>
        <Field label="Day (optional)">
          <TextInput type="number" min={1} max={28} value={form.groceriesDay} onChange={(e) => set("groceriesDay", e.target.value)} />
        </Field>
      </div>
      <p className="pt-1 text-[12px] font-semibold uppercase tracking-wide text-groww-muted">Existing deductions</p>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Other SIPs, FDs, RDs">
          <TextInput type="number" min={0} value={form.existingDeductions} onChange={(e) => set("existingDeductions", e.target.value)} />
        </Field>
        <Field label="Day (optional)">
          <TextInput type="number" min={1} max={28} value={form.existingDeductionsDay} onChange={(e) => set("existingDeductionsDay", e.target.value)} />
        </Field>
      </div>
      <Field label="Miscellaneous (subscriptions, personal budget)">
        <TextInput type="number" min={0} value={form.misc} onChange={(e) => set("misc", e.target.value)} />
      </Field>
      {error ? <p className="text-[13px] text-groww-danger">{error}</p> : null}
      <PrimaryButton type="submit" disabled={loading}>
        {loading ? "Calculating…" : "See recommended date"}
      </PrimaryButton>
    </form>
  );
}
