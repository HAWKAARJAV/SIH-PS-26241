import { randomUUID } from "crypto";
import type { PrismaClient } from "@prisma/client";
import type { OutcomeRow } from "./validate";

export async function publishOutcomeRows(
  prisma: PrismaClient,
  input: { rows: OutcomeRow[]; label: string; checksum: string; approvedBy: string },
) {
  const now = new Date().toISOString();
  return prisma.$transaction(async (tx) => {
    const datasetId = randomUUID();
    const version = (await tx.dataset.count()) + 1;
    const previousLive = await tx.dataset.findFirst({ where: { status: "live" }, orderBy: { version: "desc" } });
    if (previousLive) await tx.dataset.update({ where: { id: previousLive.id }, data: { status: "superseded" } });
    await tx.dataset.create({
      data: {
        id: datasetId,
        version,
        label: input.label,
        status: "live",
        checksum: input.checksum,
        kind: "evaluation",
        createdAt: now,
        approvedBy: input.approvedBy,
        note: previousLive ? previousLive.id : "",
      },
    });
    const restoreIds: string[] = [];
    for (const row of input.rows) {
      const trade = await tx.trade.findUnique({ where: { slug: row.trade_slug } });
      const district = row.district ? await tx.district.findFirst({ where: { name: row.district } }) : null;
      const state = district
        ? await tx.state.findUnique({ where: { id: district.stateId } })
        : row.state
          ? await tx.state.findFirst({ where: { name: row.state } })
          : null;
      const overlapping = await tx.outcomeStat.findMany({
        where: {
          status: "live",
          scope: row.scope,
          tradeId: trade?.id,
          districtId: district?.id ?? null,
        },
        select: { id: true },
      });
      if (overlapping.length) {
        restoreIds.push(...overlapping.map((item) => item.id));
        await tx.outcomeStat.updateMany({ where: { id: { in: overlapping.map((item) => item.id) } }, data: { status: "superseded" } });
      }
      await tx.outcomeStat.create({
        data: {
          id: randomUUID(),
          scope: row.scope,
          tradeId: trade?.id,
          districtId: district?.id,
          stateId: state?.id,
          cohortPeriod: row.cohort_period,
          cohortSize: row.cohort_size,
          placementRate: row.placement_rate,
          placementWindowMonths: row.placement_window_months,
          earningsP25: row.earnings_p25,
          earningsMedian: row.earnings_median,
          earningsP75: row.earnings_p75,
          womenPlacementRate: row.women_placement_rate,
          tier: "V0",
          status: "live",
          sourceId: "src-demo",
          datasetId,
          lastVerifiedAt: now,
          verifiedBy: input.approvedBy,
          placedDefinition: "A trainee counts as placed with a job or self-employment inside the stated window.",
        },
      });
    }
    await tx.dataset.update({ where: { id: datasetId }, data: { note: JSON.stringify({ previousDatasetId: previousLive?.id ?? null, restoreIds }) } });
    return { datasetId, written: input.rows.length };
  });
}

export async function rollbackDataset(prisma: PrismaClient, datasetId: string) {
  const dataset = await prisma.dataset.findUnique({ where: { id: datasetId } });
  if (!dataset) return;
  const note = safeNote(dataset.note);
  await prisma.$transaction(async (tx) => {
    await tx.dataset.update({ where: { id: datasetId }, data: { status: "rolled_back" } });
    await tx.outcomeStat.updateMany({ where: { datasetId }, data: { status: "rejected" } });
    if (note.restoreIds.length) {
      await tx.outcomeStat.updateMany({ where: { id: { in: note.restoreIds } }, data: { status: "live" } });
    }
    if (note.previousDatasetId) {
      await tx.dataset.update({ where: { id: note.previousDatasetId }, data: { status: "live" } });
    }
  });
}

function safeNote(raw: string): { previousDatasetId: string | null; restoreIds: string[] } {
  try {
    const parsed = JSON.parse(raw) as { previousDatasetId?: string | null; restoreIds?: string[] };
    return { previousDatasetId: parsed.previousDatasetId ?? null, restoreIds: parsed.restoreIds ?? [] };
  } catch {
    return { previousDatasetId: raw || null, restoreIds: [] };
  }
}
