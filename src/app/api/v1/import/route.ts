import { createHash, randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { suggestMapping, swingFlags, validateRows } from "@/data/import/validate";
import { can, type Role } from "@/lib/rbac";

export async function POST(request: Request) {
  const session = await auth();
  const role = (session?.user.role ?? "VIEWER") as Role;
  if (!session?.user || !can(role, "dataset:approve") && role !== "ADMIN" && role !== "DATA_STEWARD") {
    return NextResponse.json({ error: "A data steward must sign in." }, { status: 401 });
  }
  const body = await request.json().catch(() => null) as { filename?: string; headers?: string[]; rows?: Record<string, string>[] } | null;
  if (!body?.rows || !body.headers) return NextResponse.json({ error: "Upload rows and headers." }, { status: 400 });
  const trades = await prisma.trade.findMany({ select: { slug: true } });
  const districts = await prisma.district.findMany({ select: { name: true } });
  const mapping = suggestMapping(body.headers);
  const mapped = body.rows.map((row) => {
    const next: Record<string, string> = {};
    for (const [header, value] of Object.entries(row)) {
      const key = mapping[header] ?? header;
      next[key] = value ?? "";
    }
    return next;
  });
  const result = validateRows(mapped, trades.map((t) => t.slug), districts.map((d) => d.name));
  const live = await prisma.outcomeStat.findMany({ where: { status: "live", scope: "district" }, include: { trade: true, district: true } });
  const flags = swingFlags(
    result.ok.map((row) => ({ key: `${row.trade_slug}|${row.district}`, placement: row.placement_rate })),
    live.map((row) => ({ key: `${row.trade?.slug ?? ""}|${row.district?.name ?? ""}`, placement: row.placementRate ?? undefined })),
  );
  const checksum = createHash("sha256").update(JSON.stringify(mapped)).digest("hex");
  const job = await prisma.importJob.create({
    data: {
      id: randomUUID(),
      filename: body.filename ?? "upload.csv",
      status: "pending_approval",
      mapping: JSON.stringify(mapping),
      dryRun: JSON.stringify({ ok: result.ok.length, issues: result.issues, flags, added: result.ok.length }),
      checksum,
      makerId: session.user.email ?? "maker",
      createdAt: new Date().toISOString(),
    },
  });
  await prisma.auditLog.create({
    data: { id: randomUUID(), actorId: session.user.email ?? "maker", action: "import.dry_run", target: job.id, at: new Date().toISOString() },
  });
  return NextResponse.json({ jobId: job.id, mapping, issues: result.issues, flags, ready: result.ok.length });
}
