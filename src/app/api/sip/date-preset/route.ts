import { NextResponse } from "next/server";
import { getSipId, getUserId } from "@/lib/session";
import { applyPresetDate } from "@/lib/sip-store";

export async function POST() {
  try {
    const userId = await getUserId();
    const sipId = await getSipId();
    if (!userId || !sipId) return NextResponse.json({ error: "Start a SIP first" }, { status: 400 });
    const debitDay = await applyPresetDate(sipId, userId);
    return NextResponse.json({ debitDay });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
