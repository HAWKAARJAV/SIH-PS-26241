import { requireStaff } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EscalationsAdmin() {
  await requireStaff();
  const cases = await prisma.escalationCase.findMany({ include: { outcome: true }, orderBy: { createdAt: "desc" } });
  return (
    <section>
      <h1 className="font-display text-3xl">Escalations</h1>
      {cases.length === 0 ? <p>No family has asked yet. The queue is empty, not broken.</p> : (
        <table className="mt-4 w-full text-left">
          <thead><tr><th>Status</th><th>Language</th><th>SLA</th></tr></thead>
          <tbody>{cases.map((c) => <tr key={c.id}><td>{c.status}</td><td>{c.language}</td><td>{c.slaDueAt}</td></tr>)}</tbody>
        </table>
      )}
    </section>
  );
}
