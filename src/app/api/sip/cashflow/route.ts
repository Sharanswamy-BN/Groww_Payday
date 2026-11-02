import { NextResponse } from "next/server";
import { getSipId, getUserId } from "@/lib/session";
import { saveCashflowAndEvaluate } from "@/lib/sip-store";
import { clampDay } from "@/lib/payday";

function optDay(v: unknown) {
  if (v === null || v === undefined || v === "") return null;
  return clampDay(Number(v));
}

function money(v: unknown) {
  const n = Number(v ?? 0);
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

export async function POST(req: Request) {
  try {
    const userId = await getUserId();
    const sipId = await getSipId();
    if (!userId || !sipId) return NextResponse.json({ error: "Start a SIP first" }, { status: 400 });
    const body = (await req.json()) as Record<string, unknown>;
    const netSalary = money(body.netSalary);
    if (netSalary <= 0) return NextResponse.json({ error: "Enter net monthly salary" }, { status: 400 });
    const evaluation = await saveCashflowAndEvaluate(sipId, userId, {
      salaryDay: clampDay(Number(body.salaryDay || 1)),
      netSalary,
      housing: money(body.housing),
      housingDay: optDay(body.housingDay),
      utilities: money(body.utilities),
      utilitiesDay: optDay(body.utilitiesDay),
      groceries: money(body.groceries),
      groceriesDay: optDay(body.groceriesDay),
      existingDeductions: money(body.existingDeductions),
      existingDeductionsDay: optDay(body.existingDeductionsDay),
      misc: money(body.misc),
    });
    return NextResponse.json(evaluation);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
