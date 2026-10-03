import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const schema = z.object({
  sessionId: z.string().optional(),
  messageId: z.string().optional(),
  kind: z.enum(["report", "wrong_number"]),
  note: z.string().max(500).default(""),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Could not save that report." }, { status: 400 });
  await prisma.reportFlag.create({
    data: {
      id: randomUUID(),
      sessionId: parsed.data.sessionId,
      messageId: parsed.data.messageId,
      kind: parsed.data.kind,
      note: parsed.data.note,
      createdAt: new Date().toISOString(),
      status: "open",
    },
  });
  return NextResponse.json({ ok: true });
}
