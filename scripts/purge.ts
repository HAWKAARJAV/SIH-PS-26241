import { prisma } from "@/lib/db";
import { isPastRetention } from "@/lib/privacy/retention";

const days = Number(process.env.RETENTION_DAYS ?? "365");

async function main() {
  const now = Date.now();
  const old = await prisma.message.findMany({ select: { id: true, createdAt: true } });
  const ids = old.filter((row) => isPastRetention(row.createdAt, now, days)).map((row) => row.id);
  if (ids.length) await prisma.message.deleteMany({ where: { id: { in: ids } } });
  console.log(`purged ${ids.length} messages older than ${days} days`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
