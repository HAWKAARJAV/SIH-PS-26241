import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { participantFromRequest } from "@/lib/participant";
import { isSameOrigin } from "@/lib/origin";
import { randomUUID } from "crypto";

const schema = z.object({ familyId: z.string(), action: z.enum(["delete", "withdraw"]) });

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Request origin was rejected." }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Missing family." }, { status: 400 });
  const participant = participantFromRequest(request);
  if (!participant) return NextResponse.json({ error: "Open your family room on this phone first." }, { status: 401 });
  const owned = await prisma.session.findFirst({ where: { id: participant.sessionId, familyId: parsed.data.familyId } });
  if (!owned) return NextResponse.json({ error: "This phone cannot change that family's data." }, { status: 403 });
  const now = new Date().toISOString();
  if (parsed.data.action === "withdraw") {
    await prisma.consent.updateMany({ where: { familyId: parsed.data.familyId }, data: { withdrawnAt: now } });
    await prisma.auditLog.create({ data: { id: randomUUID(), actorId: parsed.data.familyId, action: "consent.withdraw", target: parsed.data.familyId, at: now } });
    return NextResponse.json({ ok: true });
  }
  await prisma.family.update({ where: { id: parsed.data.familyId }, data: { deletedAt: now } });
  const sessions = await prisma.session.findMany({ where: { familyId: parsed.data.familyId } });
  await prisma.message.deleteMany({ where: { sessionId: { in: sessions.map((s) => s.id) } } });
  await prisma.person.deleteMany({ where: { familyId: parsed.data.familyId } });
  await prisma.consent.deleteMany({ where: { familyId: parsed.data.familyId } });
  await prisma.auditLog.create({ data: { id: randomUUID(), actorId: parsed.data.familyId, action: "family.delete", target: parsed.data.familyId, at: now } });
  return NextResponse.json({ ok: true });
}
