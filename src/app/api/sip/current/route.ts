import { NextResponse } from "next/server";
import { getSipId, getUserId } from "@/lib/session";
import { getCashflow, getFavouriteDay, getSip, reevaluateExisting } from "@/lib/sip-store";
import { getFund } from "@/lib/funds";

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: "No session" }, { status: 401 });
    const sipId = await getSipId();
    const favouriteDay = await getFavouriteDay(userId);
    if (!sipId) return NextResponse.json({ sip: null, favouriteDay });
    const sip = await getSip(sipId, userId);
    if (!sip) return NextResponse.json({ sip: null, favouriteDay });
    const cashflow = await getCashflow(sip.id);
    const fund = getFund(sip.fund_id);
    let evaluation = null;
    if (cashflow && sip.status === "draft") {
      evaluation = await reevaluateExisting(sip.id, userId);
    }
    return NextResponse.json({ sip, cashflow, fund, favouriteDay, evaluation });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
