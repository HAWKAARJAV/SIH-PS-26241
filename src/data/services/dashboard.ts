import { prisma } from "@/lib/db";
import { isHotspot, mean, stdev } from "@/lib/analytics/resistance";
import { readEnv } from "@/config/env";

export async function resistanceRows() {
  const events = await prisma.analyticsEvent.findMany({ where: { synthetic: true } });
  const min = readEnv().K_ANON_MIN;
  const buckets = new Map<string, { districtId: string; stateCode: string; n: number; ri: number[]; tags: Record<string, number> }>();
  for (const event of events) {
    if (event.kind !== "session") continue;
    const payload = JSON.parse(event.payload) as { ri?: number; tag?: string };
    const key = event.districtId;
    const bucket = buckets.get(key) ?? { districtId: key, stateCode: event.stateCode, n: 0, ri: [], tags: {} };
    bucket.n += 1;
    if (typeof payload.ri === "number") bucket.ri.push(payload.ri);
    if (payload.tag) bucket.tags[payload.tag] = (bucket.tags[payload.tag] ?? 0) + 1;
    buckets.set(key, bucket);
  }
  const rows = [...buckets.values()].map((bucket) => ({
    ...bucket,
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
      ...row,
      hotspot: isHotspot(row.meanRi, mean(stateVals), stdev(stateVals), row.n),
    };
  });
}
