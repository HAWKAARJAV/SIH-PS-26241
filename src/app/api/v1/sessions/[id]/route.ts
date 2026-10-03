import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const session = await prisma.session.findUnique({
    where: { id },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      objections: { where: { status: "open" }, orderBy: { createdAt: "desc" }, take: 12 },
      family: { select: { joinCode: true, deletedAt: true } },
    },
  });
  if (!session || session.family.deletedAt) return NextResponse.json({ error: "Room not found." }, { status: 404 });
  return NextResponse.json({
    joinCode: session.family.joinCode,
    stage: session.stage,
    messages: session.messages.map((m) => ({ id: m.id, speaker: m.speaker, text: m.text, trace: m.speaker === "DISHA" ? safeTrace(m.traceJson) : undefined })),
    objections: session.objections.map((o) => ({ tag: o.tag, speaker: o.speaker, intensity: o.intensity })),
  });
}

function safeTrace(raw: string) {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return undefined;
  }
}
