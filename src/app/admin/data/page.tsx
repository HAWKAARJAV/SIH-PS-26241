import { requireStaff } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { ImportWizard } from "@/components/admin/import-wizard";

export const dynamic = "force-dynamic";

export default async function DataPage() {
  const session = await requireStaff();
  const pending = await prisma.outcomeStat.findMany({ where: { status: "pending_verification" }, include: { source: true } });
  const jobs = await prisma.importJob.findMany({ orderBy: { createdAt: "desc" }, take: 10 });
  return (
    <section className="space-y-6">
      <h1 className="font-display text-3xl">Data</h1>
      <div className="rounded-[var(--radius-card)] border border-line bg-warm p-4">
        <h2 className="text-xl font-semibold">Verification queue</h2>
        <ul className="mt-2 space-y-1 text-sm">
          {pending.length === 0 ? <li>Nothing waiting.</li> : pending.map((row) => (
            <li key={row.id}>{row.source.title} · {row.id} · hidden from families until approved</li>
          ))}
        </ul>
      </div>
      <ImportWizard
        email={session.user.email ?? ""}
        jobs={jobs.map((j) => ({ id: j.id, filename: j.filename, status: j.status, makerId: j.makerId }))}
      />
    </section>
  );
}
