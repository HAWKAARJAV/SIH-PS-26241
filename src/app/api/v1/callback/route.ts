import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  locale: z.string().default("en"),
  districtId: z.string().optional(),
  phone: z.string().max(20).optional(),
  note: z.string().max(500).optional(),
});

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  if (!rateLimit(`callback:${ip}`, 10)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid callback request." }, { status: 400 });
  await prisma.auditLog.create({
    data: {
      id: randomUUID(),
      actorId: "family",
      action: "callback.request",
      target: parsed.data.districtId ?? "unknown",
      detail: parsed.data.note ?? "",
      at: new Date().toISOString(),
    },
  });
  return NextResponse.json({ ok: true, queued: true });
}
