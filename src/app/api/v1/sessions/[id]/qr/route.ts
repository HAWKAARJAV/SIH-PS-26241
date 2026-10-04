import { prisma } from "@/lib/db";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const session = await prisma.session.findUnique({
    where: { id },
    select: { family: { select: { joinCode: true, deletedAt: true, locale: true } } },
  });
  if (!session || session.family.deletedAt) {
    return new Response(JSON.stringify({ error: "Room not found." }), { status: 404 });
  }
  const origin = new URL(request.url).origin;
  const locale = session.family.locale || "en";
  const target = `${origin}/${locale}/room/join/${session.family.joinCode}`;
  const svg = await QRCode.toString(target, { type: "svg", margin: 1, width: 168, errorCorrectionLevel: "M" });
  return new Response(svg, { headers: { "Content-Type": "image/svg+xml", "Cache-Control": "no-store" } });
}
