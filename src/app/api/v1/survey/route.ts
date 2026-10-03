import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const schema = z.object({
  sessionId: z.string(),
  understood: z.number().int().min(1).max(3),
  confident: z.number().int().min(1).max(3),
  willVisit: z.number().int().min(1).max(3),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Pick an answer for each question." }, { status: 400 });
  const session = await prisma.session.findUnique({ where: { id: parsed.data.sessionId } });
  if (!session) return NextResponse.json({ error: "Open a family room first." }, { status: 404 });
  await prisma.microSurvey.upsert({
    where: { sessionId: session.id },
    update: {
      understood: parsed.data.understood,
      confident: parsed.data.confident,
      willVisit: parsed.data.willVisit,
    },
    create: {
      id: randomUUID(),
      sessionId: session.id,
      understood: parsed.data.understood,
      confident: parsed.data.confident,
      willVisit: parsed.data.willVisit,
      createdAt: new Date().toISOString(),
    },
  });
  return NextResponse.json({ ok: true });
}
