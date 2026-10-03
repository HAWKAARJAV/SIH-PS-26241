import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Sign in." }, { status: 401 });
  const { id } = await context.params;
  const body = await request.json().catch(() => ({})) as { action?: string };
  const item = await prisma.escalationCase.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ error: "Case not found." }, { status: 404 });
  const now = new Date().toISOString();
  if (body.action === "accept") {
    await prisma.escalationCase.update({ where: { id }, data: { status: "accepted" } });
    return NextResponse.json({ message: "Accepted. AI stays available until you join the room." });
  }
  if (body.action === "join") {
    await prisma.escalationCase.update({ where: { id }, data: { status: "live" } });
    await prisma.escalationNote.create({ data: { id: randomUUID(), caseId: id, author: session.user.email ?? "counsellor", body: "Simulated counsellor joined. This reply is labelled simulated.", createdAt: now } });
    return NextResponse.json({ message: "Simulated counsellor joined. The AI pauses while a human is marked live." });
  }
  await prisma.escalationOutcome.upsert({
    where: { caseId: id },
    update: { code: "Intends to enrol", createdAt: now },
    create: { id: randomUUID(), caseId: id, code: "Intends to enrol", createdAt: now },
  });
  await prisma.escalationCase.update({ where: { id }, data: { status: "closed" } });
  return NextResponse.json({ message: "Outcome saved: Intends to enrol." });
}
