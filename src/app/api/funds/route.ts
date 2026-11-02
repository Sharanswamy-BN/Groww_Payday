import { NextResponse } from "next/server";
import { FUNDS } from "@/lib/funds";

export async function GET() {
  return NextResponse.json({ funds: FUNDS });
}
