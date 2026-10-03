import { NextResponse } from "next/server";
import { z } from "zod";
import { runTurn } from "@/ai/pipeline/turn";
import { rateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

const schema = z.object({
  sessionId: z.string().min(8),
  text: z.string().min(1).max(2000),
  speaker: z.enum(["PARENT", "LEARNER", "TOGETHER"]),
});

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  if (!rateLimit(`chat:${ip}`, 40)) return NextResponse.json({ error: "Slow down a moment, then send again." }, { status: 429 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Message needs a speaker and some text." }, { status: 400 });
  try {
    const result = await runTurn(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    logger.error({ err: error }, "chat failed");
    return NextResponse.json({ error: "Disha could not answer. Try again, or talk to a counsellor." }, { status: 500 });
  }
}
