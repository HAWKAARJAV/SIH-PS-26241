import { NextResponse } from "next/server";
import { isDemoMode } from "@/config/env";
import { SIMULATED_PARENT_CODE } from "@/lib/otp";

export function GET() {
  if (!isDemoMode()) return NextResponse.json({ error: "Parent codes are not shown outside demo mode." }, { status: 404 });
  return NextResponse.json({ simulated: true, code: SIMULATED_PARENT_CODE, label: "Simulated parent code for this demo." });
}
