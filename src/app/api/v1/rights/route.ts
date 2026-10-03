import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const schema = z.object({ familyId: z.string(), action: z.enum(["delete", "withdraw"]) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Missing family." }, { status: 400 });
  const now = new Date().toISOString();
  if (parsed.data.action === "withdraw") {
    await prisma.consent.updateMany({ where: { familyId: parsed.data.familyId }, data: { withdrawnAt: now } });
    return NextResponse.json({ ok: true });
  }
  await prisma.family.update({ where: { id: parsed.data.familyId }, data: { deletedAt: now } });
  const sessions = await prisma.session.findMany({ where: { familyId: parsed.data.familyId } });
  await prisma.message.deleteMany({ where: { sessionId: { in: sessions.map((s) => s.id) } } });
  return NextResponse.json({ ok: true });
}
