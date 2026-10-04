import { z } from "zod";
import { runTurn } from "@/ai/pipeline/turn";
import { rateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import { participantFromRequest } from "@/lib/participant";
import { publish } from "@/realtime/room-bus";

const schema = z.object({
  sessionId: z.string().min(8),
  text: z.string().min(1).max(2000),
  speaker: z.enum(["PARENT", "LEARNER", "TOGETHER"]),
});

function chunkText(text: string, size = 14) {
  const parts: string[] = [];
  for (let i = 0; i < text.length; i += size) parts.push(text.slice(i, i + size));
  return parts;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  if (!rateLimit(`chat:${ip}`, 40)) {
    return new Response(JSON.stringify({ error: "Slow down a moment, then send again." }), { status: 429 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Message needs a speaker and some text." }), { status: 400 });
  }
  const participant = participantFromRequest(request);
  const speaker = participant && participant.sessionId === parsed.data.sessionId ? participant.role : parsed.data.speaker;
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const result = await runTurn({ ...parsed.data, speaker });
        publish(parsed.data.sessionId, "message.created", { speaker });
        const full = result.message.text;
        for (const piece of chunkText(full)) {
          publish(parsed.data.sessionId, "disha.chunk", { text: piece });
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "token", text: piece })}\n\n`));
          await new Promise((r) => setTimeout(r, 16));
        }
        publish(parsed.data.sessionId, "disha.done", { id: result.message.id });
        publish(parsed.data.sessionId, "ledger.updated", {});
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "done",
              message: result.message,
              trace: result.trace,
              card: result.card,
              objections: result.objections,
              needsHuman: result.needsHuman,
            })}\n\n`,
          ),
        );
        controller.close();
      } catch (error) {
        logger.error({ err: error }, "chat stream failed");
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "error", error: "Disha could not answer." })}\n\n`));
        controller.close();
      }
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
