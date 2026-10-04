import { prisma } from "@/lib/db";
import { nextWindowCount } from "@/lib/privacy/retention";

export async function dbRateLimit(key: string, limit = 30, windowMs = 60_000): Promise<boolean> {
  const now = Date.now();
  const row = await prisma.rateBucket.findUnique({ where: { key } });
  const expired = !row || Date.parse(row.resetAt) < now;
  const current = expired ? null : row.count;
  const next = nextWindowCount(current, limit);
  const resetAt = expired ? new Date(now + windowMs).toISOString() : row.resetAt;
  await prisma.rateBucket.upsert({
    where: { key },
    create: { key, count: next.count, resetAt },
    update: { count: next.count, resetAt },
  });
  return next.allow;
}
