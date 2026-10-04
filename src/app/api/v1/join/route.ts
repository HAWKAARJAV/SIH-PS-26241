import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { signParticipant } from "@/lib/participant";
import { publish } from "@/realtime/room-bus";

const schema = z.object({
  code: z.string().regex(/^\d{6}$/),
  role: z.enum(["PARENT", "LEARNER"]).default("PARENT"),
});

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`join:${ip}`, 10, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many code attempts. Wait ten minutes." }, { status: 429 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter the 6-digit code." }, { status: 400 });
  const family = await prisma.family.findUnique({ where: { joinCode: parsed.data.code }, include: { sessions: true } });
  if (!family || family.deletedAt) return NextResponse.json({ error: "That code is not active." }, { status: 404 });
  const session = family.sessions[0];
  if (!session) return NextResponse.json({ error: "That room has no session." }, { status: 404 });
  const token = signParticipant(session.id, parsed.data.role);
  publish(session.id, "presence.joined", { role: parsed.data.role });
  const response = NextResponse.json({ sessionId: session.id, familyId: family.id, role: parsed.data.role });
  response.cookies.set("nourish_participant", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 24 * 60 * 60,
  });
  return response;
}
