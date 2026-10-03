import { NextResponse } from "next/server";
import { isDemoMode } from "@/config/env";

export async function GET() {
  return NextResponse.json({ ok: true, service: "nourish", demo: isDemoMode(), time: new Date().toISOString() });
}
