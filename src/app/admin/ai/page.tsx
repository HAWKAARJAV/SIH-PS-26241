import { requireStaff } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

export const dynamic = "force-dynamic";

export default async function AiQualityPage() {
  await requireStaff();
  const [flags, evalRuns] = await Promise.all([
    prisma.reportFlag.count(),
    prisma.evalRun.findMany({ orderBy: { at: "desc" }, take: 5 }),
  ]);
  const evalPath = join(process.cwd(), "docs/evidence/eval/latest.json");
  const evalSnippet = existsSync(evalPath) ? readFileSync(evalPath, "utf8").slice(0, 800) : "Run npm run eval to generate docs/evidence/eval/latest.json";
  return (
    <section className="space-y-4">
      <h1 className="font-display text-3xl">AI Quality</h1>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-[var(--radius-card)] bg-surface p-4"><p className="text-muted">Report flags</p><p className="tabular text-3xl">{flags}</p></div>
        <div className="rounded-[var(--radius-card)] bg-surface p-4"><p className="text-muted">Eval runs</p><p className="tabular text-3xl">{evalRuns.length}</p></div>
        <div className="rounded-[var(--radius-card)] bg-surface p-4"><p className="text-muted">Scripted fallback</p><p className="text-sm">Visible in Judge Mode trace per turn</p></div>
      </div>
      <h2 className="text-xl font-semibold">Latest eval</h2>
      <pre className="overflow-auto rounded-xl bg-sunken p-3 text-xs">{evalSnippet}</pre>
      <ul className="text-sm">
        {evalRuns.map((run) => (
          <li key={run.id}>{run.id} · {run.at} · pass={run.passed ? "yes" : "no"}</li>
        ))}
      </ul>
    </section>
  );
}
