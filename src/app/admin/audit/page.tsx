import { requireStaff } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  await requireStaff();
  const logs = await prisma.auditLog.findMany({ orderBy: { at: "desc" }, take: 30 });
  return (
    <section>
      <h1 className="font-display text-3xl">Audit</h1>
      {logs.length === 0 ? <p>No staff actions yet.</p> : <ul>{logs.map((l) => <li key={l.id}>{l.at} · {l.actorId} · {l.action}</li>)}</ul>}
    </section>
  );
}
