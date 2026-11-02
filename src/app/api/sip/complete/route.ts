import { NextResponse } from "next/server";
import { getSipId, getUserId } from "@/lib/session";
import { completeSip } from "@/lib/sip-store";

export async function POST(req: Request) {
  try {
    const userId = await getUserId();
    const sipId = await getSipId();
    if (!userId || !sipId) return NextResponse.json({ error: "Start a SIP first" }, { status: 400 });
    const body = (await req.json()) as { payMethod?: string };
    const payMethod = body.payMethod || "upi";
    await completeSip(sipId, userId, payMethod);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
