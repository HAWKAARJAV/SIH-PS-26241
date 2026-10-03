import { createHash, randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Sign in as a steward." }, { status: 401 });
  const action = new URL(request.url).searchParams.get("action");
  const job = await prisma.importJob.findUnique({ where: { id } });
  if (!job) return NextResponse.json({ error: "Import not found." }, { status: 404 });
  if (action === "rollback") {
    if (job.datasetId) {
      await prisma.dataset.update({ where: { id: job.datasetId }, data: { status: "rolled_back" } });
      await prisma.outcomeStat.updateMany({ where: { datasetId: job.datasetId }, data: { status: "rejected" } });
    }
    await prisma.importJob.update({ where: { id }, data: { status: "rolled_back" } });
    await prisma.auditLog.create({ data: { id: randomUUID(), actorId: session.user.email, action: "import.rollback", target: id, at: new Date().toISOString() } });
    return NextResponse.json({ ok: true });
  }
  if (job.makerId === session.user.email) return NextResponse.json({ error: "A different steward must approve." }, { status: 403 });
  const dry = JSON.parse(job.dryRun) as { ok: number };
  const datasetId = randomUUID();
  const version = (await prisma.dataset.count()) + 1;
  await prisma.dataset.create({
    data: {
      id: datasetId,
      version,
      label: "Evaluation dataset (provided by organisers — dummy)",
      status: "live",
      checksum: job.checksum || createHash("sha256").update(id).digest("hex"),
      kind: "evaluation",
      createdAt: new Date().toISOString(),
      approvedBy: session.user.email,
    },
  });
  await prisma.importJob.update({ where: { id }, data: { status: "live", checkerId: session.user.email, datasetId } });
  await prisma.auditLog.create({ data: { id: randomUUID(), actorId: session.user.email, action: "import.approve", target: id, detail: `${dry.ok} rows`, at: new Date().toISOString() } });
  return NextResponse.json({ ok: true, datasetId, note: "Approved. Row publish stores the version. Reload outcomes from the dry-run file if you need figures live." });
}
