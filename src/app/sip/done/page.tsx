"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { inr, ordinal } from "@/lib/payday";

export default function DonePage() {
  const [info, setInfo] = useState<{
    fundName: string;
    amount: number;
    debitDay: number;
    ack: boolean;
    status: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/sip/current")
      .then((r) => r.json())
      .then((res) => {
        if (!res.sip) return;
        setInfo({
          fundName: res.sip.fund_name,
          amount: Number(res.sip.amount_inr),
          debitDay: res.sip.debit_day,
          ack: Boolean(res.sip.high_commitment_ack),
          status: res.sip.status,
        });
      });
  }, []);

  return (
    <div className="pt-8 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-groww-green text-3xl text-white">
        ✓
      </div>
      <h1 className="mt-5 text-[24px] font-semibold text-groww-text">SIP created successfully</h1>
      <p className="mt-2 text-[14px] text-groww-muted">
        Setup is complete. Future instalments are scheduled on your payday-aligned date.
      </p>
      {info ? (
        <div className="mt-6 rounded-2xl border border-groww-line p-4 text-left text-[14px]">
          <p className="font-semibold text-groww-text">{info.fundName}</p>
          <p className="mt-2 flex justify-between">
            <span className="text-groww-muted">Monthly amount</span>
            <span>{inr(info.amount)}</span>
          </p>
          <p className="mt-1 flex justify-between">
            <span className="text-groww-muted">Debit date</span>
            <span>{ordinal(info.debitDay)} of every month</span>
          </p>
          <p className="mt-1 flex justify-between">
            <span className="text-groww-muted">Status</span>
            <span className="font-medium text-groww-greenDark">
              {info.status === "active" ? "Active" : info.status}
            </span>
          </p>
        </div>
      ) : null}
      {info?.ack ? (
        <p className="mt-4 rounded-xl bg-[#FFF6E8] px-3 py-3 text-left text-[13px] text-groww-text">
          Reminder: keep sufficient balance in your account 2 days before the {info.debitDay ? ordinal(info.debitDay) : "debit"} to avoid bank bounce penalties.
        </p>
      ) : null}
      <Link
        href="/"
        className="mt-8 inline-block w-full rounded-xl bg-groww-green py-3 text-[15px] font-semibold text-[#0b3d32]"
      >
        Start another SIP
      </Link>
    </div>
  );
}
