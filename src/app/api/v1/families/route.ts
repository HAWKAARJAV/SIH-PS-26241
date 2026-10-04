import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { dbRateLimit } from "@/lib/rate-limit-db";
import { checkSimulatedParentCode } from "@/lib/otp";
import { isSameOrigin } from "@/lib/origin";

const bodySchema = z.object({
  locale: z.string().default("en"),
  mode: z.string().default("together"),
  stateId: z.string().optional(),
  districtId: z.string().optional(),
  incomeBand: z.string().optional(),
  worry: z.string().optional(),
  assisted: z.boolean().optional(),
  persons: z.array(z.object({
    role: z.string(),
    ageBand: z.string().optional(),
    gender: z.string().optional(),
    interests: z.string().optional(),
    classDone: z.string().optional(),
  })).default([]),
  consents: z.array(z.string()).default(["counselling"]),
  parental: z.boolean().optional(),
  otp: z.string().optional(),
});

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Request origin was rejected." }, { status: 403 });
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  if (!(await dbRateLimit(`family:${ip}`, 20))) return NextResponse.json({ error: "Too many rooms. Wait a minute." }, { status: 429 });
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Check the form and try again." }, { status: 400 });
  const otpError = checkSimulatedParentCode(parsed.data.otp, Boolean(parsed.data.parental));
  if (otpError) return NextResponse.json({ error: otpError }, { status: 400 });
  const now = new Date().toISOString();
  const familyId = randomUUID();
  const sessionId = randomUUID();
  const joinCode = String(Math.floor(100000 + Math.random() * 900000));
  await prisma.family.create({
    data: {
      id: familyId,
      locale: parsed.data.locale,
      mode: parsed.data.mode,
      stateId: parsed.data.stateId,
      districtId: parsed.data.districtId,
      incomeBand: parsed.data.incomeBand,
      biggestWorry: parsed.data.worry,
      joinCode,
      assisted: Boolean(parsed.data.assisted),
      createdAt: now,
      persons: {
        create: parsed.data.persons.map((p, i) => ({
          id: `${familyId}-p${i}`,
          role: p.role,
          ageBand: p.ageBand,
          gender: p.gender,
          classDone: p.classDone,
          interests: p.interests ?? "",
        })),
      },
      consents: {
        create: [{
          id: `${familyId}-c`,
          purposes: parsed.data.consents.join(","),
          version: "2026-10-03",
          parental: Boolean(parsed.data.parental),
          simulatedOtp: Boolean(parsed.data.parental),
          grantedAt: now,
        }],
      },
      sessions: { create: [{ id: sessionId, locale: parsed.data.locale, stage: "understand", createdAt: now }] },
    },
  });
  return NextResponse.json({ familyId, sessionId, joinCode });
}
