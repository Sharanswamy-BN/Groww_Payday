import { NextResponse } from "next/server";
import { getSipId, getUserId } from "@/lib/session";
import { acknowledgeRisk } from "@/lib/sip-store";

export async function POST() {
  try {
    const userId = await getUserId();
    const sipId = await getSipId();
    if (!userId || !sipId) return NextResponse.json({ error: "Start a SIP first" }, { status: 400 });
    await acknowledgeRisk(sipId, userId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
