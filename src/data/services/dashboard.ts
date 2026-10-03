import { prisma } from "@/lib/db";
import { isHotspot, mean, stdev } from "@/lib/analytics/resistance";
import { readEnv } from "@/config/env";

export type ResistanceRow = {
  districtId: string;
  districtName: string;
  stateCode: string;
  stateName: string;
  n: number;
  meanRi: number;
  hotspot: boolean;
  syntheticRibbon: boolean;
};

export async function resistanceRows(): Promise<ResistanceRow[]> {
  const events = await prisma.analyticsEvent.findMany({
    where: { kind: "session" },
    select: { districtId: true, stateCode: true, payload: true, synthetic: true },
  });
  const min = readEnv().K_ANON_MIN;
  const buckets = new Map<
    string,
    { districtId: string; stateCode: string; n: number; ri: number[]; syntheticCount: number }
  >();
  for (const event of events) {
    const payload = JSON.parse(event.payload) as { ri?: number };
    const key = event.districtId;
    const bucket =
      buckets.get(key) ?? { districtId: key, stateCode: event.stateCode, n: 0, ri: [], syntheticCount: 0 };
    bucket.n += 1;
    if (event.synthetic) bucket.syntheticCount += 1;
    if (typeof payload.ri === "number") bucket.ri.push(payload.ri);
    buckets.set(key, bucket);
  }
  const districtIds = [...buckets.keys()];
  const districts = await prisma.district.findMany({
    where: { id: { in: districtIds } },
    include: { state: true },
  });
  const nameById = new Map(districts.map((d) => [d.id, { districtName: d.name, stateName: d.state.name }]));

  const rows = [...buckets.values()].map((bucket) => ({
    districtId: bucket.districtId,
    districtName: nameById.get(bucket.districtId)?.districtName ?? bucket.districtId,
    stateCode: bucket.stateCode,
    stateName: nameById.get(bucket.districtId)?.stateName ?? bucket.stateCode,
    n: bucket.n,
    ri: bucket.ri,
    syntheticRibbon: bucket.syntheticCount === bucket.n,
    meanRi: Math.round(mean(bucket.ri) * 10) / 10,
  }));
  const visible = rows.filter((row) => row.n >= min);
  const byState = new Map<string, number[]>();
  for (const row of visible) {
    const list = byState.get(row.stateCode) ?? [];
    list.push(row.meanRi);
    byState.set(row.stateCode, list);
  }
  return visible.map((row) => {
    const stateVals = byState.get(row.stateCode) ?? [];
    return {
      districtId: row.districtId,
      districtName: row.districtName,
      stateCode: row.stateCode,
      stateName: row.stateName,
      n: row.n,
      meanRi: row.meanRi,
      syntheticRibbon: row.syntheticRibbon,
      hotspot: isHotspot(row.meanRi, mean(stateVals), stdev(stateVals), row.n),
    };
  });
}

export async function objectionTagCounts(): Promise<Record<string, number>> {
  const events = await prisma.analyticsEvent.findMany({
    where: { kind: "session" },
    select: { payload: true },
  });
  const tags: Record<string, number> = {};
  for (const event of events) {
    const payload = JSON.parse(event.payload) as { tag?: string };
    if (!payload.tag) continue;
    tags[payload.tag] = (tags[payload.tag] ?? 0) + 1;
  }
  return tags;
}
