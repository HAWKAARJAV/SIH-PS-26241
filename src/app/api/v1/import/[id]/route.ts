import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { publishOutcomeRows, rollbackDataset } from "@/data/import/publish";
import type { OutcomeRow } from "@/data/import/validate";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Sign in as a steward." }, { status: 401 });
  const action = new URL(request.url).searchParams.get("action");
  const job = await prisma.importJob.findUnique({ where: { id } });
  if (!job) return NextResponse.json({ error: "Import not found." }, { status: 404 });
  if (action === "rollback") {
    if (job.datasetId) await rollbackDataset(prisma, job.datasetId);
    await prisma.importJob.update({ where: { id }, data: { status: "rolled_back" } });
    await prisma.auditLog.create({ data: { id: randomUUID(), actorId: session.user.email, action: "import.rollback", target: id, at: new Date().toISOString() } });
    return NextResponse.json({ ok: true });
  }
  if (job.makerId === session.user.email) return NextResponse.json({ error: "A different steward must approve." }, { status: 403 });
  const dry = JSON.parse(job.dryRun) as { ok: number; rows?: OutcomeRow[] };
  const rows = dry.rows ?? [];
  const published = await publishOutcomeRows(prisma, {
    rows,
    label: "Evaluation dataset (provided by organisers — dummy)",
    checksum: job.checksum,
    approvedBy: session.user.email,
  });
  await prisma.importJob.update({ where: { id }, data: { status: "live", checkerId: session.user.email, datasetId: published.datasetId } });
  await prisma.auditLog.create({ data: { id: randomUUID(), actorId: session.user.email, action: "import.approve", target: id, detail: `${published.written} rows`, at: new Date().toISOString() } });
  return NextResponse.json({ ok: true, datasetId: published.datasetId, written: published.written });
}
