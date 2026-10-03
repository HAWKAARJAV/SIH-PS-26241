import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const schema = z.object({
  familyId: z.string().nullable(),
  sessionId: z.string().nullable(),
  when: z.string(),
  language: z.string(),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !parsed.data.familyId) return NextResponse.json({ error: "Open a family room before requesting a counsellor." }, { status: 400 });
  const family = await prisma.family.findUnique({ where: { id: parsed.data.familyId }, include: { consents: true } });
  if (!family || family.deletedAt) return NextResponse.json({ error: "That family room is closed." }, { status: 404 });
  const sharing = family.consents.some((c) => c.purposes.includes("counsellor") && !c.withdrawnAt);
  const now = new Date();
  const due = new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString();
  const open = await prisma.escalationCase.count({ where: { status: "queued" } });
  const created = await prisma.escalationCase.create({
    data: {
      id: randomUUID(),
      familyId: family.id,
      sessionId: parsed.data.sessionId,
      status: "queued",
      reason: `Callback requested for ${parsed.data.when}`,
      language: parsed.data.language,
      districtId: family.districtId,
      priority: 2,
      slaDueAt: due,
      brief: sharing ? `Worry: ${family.biggestWorry ?? "unspecified"}. Sharing consented.` : "Family did not consent to share the transcript.",
      createdAt: now.toISOString(),
    },
  });
  return NextResponse.json({ id: created.id, position: open + 1, slaDueAt: due });
}

export async function GET() {
  const cases = await prisma.escalationCase.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
  return NextResponse.json({ cases });
}
