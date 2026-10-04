import { prisma } from "@/lib/db";
import { eventsSince, subscribe, type RoomEvent } from "@/realtime/room-bus";

export const dynamic = "force-dynamic";

export async function GET(request: Request, context: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await context.params;
  const session = await prisma.session.findUnique({ where: { id: sessionId }, select: { id: true, family: { select: { deletedAt: true } } } });
  if (!session || session.family.deletedAt) {
    return new Response(JSON.stringify({ error: "Room not found." }), { status: 404 });
  }
  const lastId = request.headers.get("last-event-id");
  const encoder = new TextEncoder();
  let unsubscribe = () => undefined as void;
  let heartbeat: ReturnType<typeof setInterval> | undefined;
  const stream = new ReadableStream({
    start(controller) {
      const write = (event: RoomEvent) => {
        controller.enqueue(encoder.encode(`id: ${event.id}\ndata: ${JSON.stringify(event)}\n\n`));
      };
      for (const event of eventsSince(sessionId, lastId)) write(event);
      unsubscribe = subscribe(sessionId, write);
      heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(`: heartbeat\n\n`));
      }, 15_000);
    },
    cancel() {
      unsubscribe();
      if (heartbeat) clearInterval(heartbeat);
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
