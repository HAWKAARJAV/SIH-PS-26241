import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const schema = z.object({ note: z.string().min(8).max(1000) });

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Sign in as a counsellor." }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Write a short suggestion first." }, { status: 400 });
  await prisma.auditLog.create({
    data: {
      id: randomUUID(),
      actorId: session.user.email ?? "counsellor",
      action: "playbook.suggest",
      target: "playbook",
      detail: parsed.data.note,
      at: new Date().toISOString(),
    },
  });
  return NextResponse.json({ message: "Suggestion logged for an admin to approve." });
}
