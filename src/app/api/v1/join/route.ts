import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const schema = z.object({ code: z.string().regex(/^\d{6}$/) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter the 6-digit code." }, { status: 400 });
  const family = await prisma.family.findUnique({ where: { joinCode: parsed.data.code }, include: { sessions: true } });
  if (!family || family.deletedAt) return NextResponse.json({ error: "That code is not active." }, { status: 404 });
  const session = family.sessions[0];
  if (!session) return NextResponse.json({ error: "That room has no session." }, { status: 404 });
  return NextResponse.json({ sessionId: session.id, familyId: family.id });
}
