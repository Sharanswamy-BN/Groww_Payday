import { NextResponse } from "next/server";
import { getSipId, getUserId, setSipCookie } from "@/lib/session";
import { getCashflow, reevaluateExisting, upsertDraft } from "@/lib/sip-store";

export async function POST(req: Request) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: "No session" }, { status: 401 });
    const body = (await req.json()) as { fundId?: string; amount?: number };
    if (!body.fundId || body.amount == null) {
      return NextResponse.json({ error: "Fund and amount are required" }, { status: 400 });
    }
    const existing = await getSipId();
    const sipId = await upsertDraft(userId, body.fundId, Number(body.amount), existing);
    await setSipCookie(sipId);
    const cashflow = await getCashflow(sipId);
    let evaluation = null;
    if (cashflow) evaluation = await reevaluateExisting(sipId, userId);
    return NextResponse.json({ sipId, hasCashflow: Boolean(cashflow), evaluation });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
