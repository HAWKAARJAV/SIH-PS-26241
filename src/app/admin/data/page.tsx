import { requireStaff } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { ImportPanel } from "@/components/admin/import-panel";

export const dynamic = "force-dynamic";

export default async function DataPage() {
  const session = await requireStaff();
  const pending = await prisma.outcomeStat.findMany({ where: { status: "pending_verification" }, include: { source: true } });
  const jobs = await prisma.importJob.findMany({ orderBy: { createdAt: "desc" }, take: 10 });
  return (
    <section className="space-y-4">
      <h1 className="font-display text-3xl">Data</h1>
      <h2 className="text-xl">Verification queue</h2>
      <ul>
        {pending.map((row) => (
          <li key={row.id}>{row.id} · {row.source.title} · hidden from families until approved</li>
        ))}
      </ul>
      <ImportPanel email={session.user.email ?? ""} />
      <h2 className="text-xl">Import jobs</h2>
      <ul>{jobs.map((job) => <li key={job.id}>{job.filename} · {job.status}</li>)}</ul>
      <p>Templates live in /templates/outcomes.csv and a sample in /samples/organiser.csv.</p>
    </section>
  );
}
