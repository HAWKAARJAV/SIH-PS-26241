import { readEnv } from "@/config/env";
import { prisma } from "@/lib/db";
import { formatInr, formatRate, outOfTen } from "@/lib/format/money";

export type EvidenceCard = {
  id: string;
  tier: "V0" | "V1" | "V2" | "V3";
  label: string;
  period: string;
  cohortSize: number;
  placementRate: number | null;
  outOfTen: number | null;
  p25: number | null;
  median: number | null;
  p75: number | null;
  womenPlacementRate: number | null;
  windowMonths: number;
  placedDefinition: string;
  sourceTitle: string;
  sourceUrl: string;
  datasetLabel: string;
  scopeNote: string;
  fallback: boolean;
  rangeLabel: string;
  rateLabel: string;
  valueLabel: string;
};

type Stat = {
  id: string;
  scope: string;
  cohortPeriod: string;
  cohortSize: number;
  placementRate: number | null;
  placementWindowMonths: number;
  earningsP25: number | null;
  earningsMedian: number | null;
  earningsP75: number | null;
  womenPlacementRate: number | null;
  tier: string;
  placedDefinition: string;
  source: { title: string; url: string };
  dataset: { label: string };
  provider?: { name: string } | null;
  district?: { name: string } | null;
};

function toCard(stat: Stat, scopeNote: string, fallback: boolean, locale: string): EvidenceCard {
  const tier = stat.tier as EvidenceCard["tier"];
  const rateLabel =
    stat.placementRate == null
      ? "placement not reported"
      : `${outOfTen(stat.placementRate)} out of 10 (${formatRate(stat.placementRate)})`;
  const rangeLabel =
    stat.earningsMedian == null
      ? "earnings not reported"
      : `${formatInr(stat.earningsP25 ?? stat.earningsMedian, locale)} – ${formatInr(stat.earningsMedian, locale)} – ${formatInr(stat.earningsP75 ?? stat.earningsMedian, locale)} a month`;
  return {
    id: stat.id,
    tier,
    label: stat.provider?.name ?? stat.district?.name ?? "State",
    period: stat.cohortPeriod,
    cohortSize: stat.cohortSize,
    placementRate: stat.placementRate,
    outOfTen: stat.placementRate == null ? null : outOfTen(stat.placementRate),
    p25: stat.earningsP25,
    median: stat.earningsMedian,
    p75: stat.earningsP75,
    womenPlacementRate: stat.womenPlacementRate,
    windowMonths: stat.placementWindowMonths,
    placedDefinition: stat.placedDefinition,
    sourceTitle: stat.source.title,
    sourceUrl: stat.source.url,
    datasetLabel: stat.dataset.label,
    scopeNote,
    fallback,
    rangeLabel,
    rateLabel,
    valueLabel: rangeLabel,
  };
}

const include = { source: true, dataset: true, provider: true, district: true } as const;

export async function resolveEvidence(opts: {
  tradeId: string;
  districtId?: string | null;
  stateId?: string | null;
  providerId?: string | null;
  locale?: string;
}): Promise<{ card: EvidenceCard | null; level: string }> {
  const min = readEnv().MIN_COHORT;
  const locale = opts.locale ?? "en";
  const live = { status: "live" as const, tradeId: opts.tradeId };

  if (opts.providerId) {
    const row = await prisma.outcomeStat.findFirst({
      where: { ...live, scope: "provider", providerId: opts.providerId, cohortSize: { gte: min } },
      include,
    });
    if (row) return { card: toCard(row, "This training centre", false, locale), level: "provider" };
  }
  if (opts.districtId) {
    const row = await prisma.outcomeStat.findFirst({
      where: { ...live, scope: "district", districtId: opts.districtId, cohortSize: { gte: min } },
      include,
    });
    if (row) return { card: toCard(row, "Trainees in this district", false, locale), level: "district" };
  }
  const stateWhere = opts.stateId ? { stateId: opts.stateId } : {};
  const row = await prisma.outcomeStat.findFirst({
    where: { ...live, scope: "state", ...stateWhere, cohortSize: { gte: min } },
    include,
  });
  if (row) {
    return {
      card: toCard(
        row,
        opts.districtId ? "District cohort is too small, so this is the state figure." : "Trainees in this state",
        Boolean(opts.districtId) || !opts.stateId,
        locale,
      ),
      level: "state",
    };
  }
  return { card: null, level: "none" };
}
