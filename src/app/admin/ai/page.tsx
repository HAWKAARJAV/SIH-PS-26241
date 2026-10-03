import { requireStaff } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AiQualityPage() {
  await requireStaff();
  const runs = await prisma.evalRun.findMany({ orderBy: { at: "desc" }, take: 3 });
  const flags = await prisma.reportFlag.count();
  return (
    <section>
      <h1 className="font-display text-3xl">AI Quality</h1>
      <p>Run <code>npm run eval</code> to refresh docs/evidence/eval. Unsupported numbers must stay at zero.</p>
      <p>Open flags: {flags}</p>
      {runs.length === 0 ? <p>No eval run stored yet. The file report is still written by the eval script.</p> : (
        <ul>{runs.map((run) => <li key={run.id}>{run.at} · {run.passed ? "passed" : "failed"} · {run.summary}</li>)}</ul>
      )}
    </section>
  );
}
