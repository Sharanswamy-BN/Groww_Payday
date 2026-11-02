"use client";

import type { ReactNode } from "react";
import Link from "next/link";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#e9edf0] py-6">
      <div className="mx-auto w-full max-w-[430px] overflow-hidden rounded-[28px] border border-groww-line bg-white shadow-card">
        <header className="flex items-center gap-2 border-b border-groww-line px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-groww-green text-sm font-bold text-white">
              G
            </span>
            <div>
              <p className="text-[15px] font-semibold leading-tight text-groww-text">Groww Payday</p>
              <p className="text-[11px] text-groww-muted">SIP date aligned to your salary</p>
            </div>
          </Link>
        </header>
        <main className="min-h-[720px] bg-white px-4 py-4">{children}</main>
      </div>
    </div>
  );
}
