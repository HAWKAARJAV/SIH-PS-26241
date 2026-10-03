import { prisma } from "@/lib/db";
import { resistanceRows } from "@/data/services/dashboard";
import { mean } from "@/lib/analytics/resistance";

export async function adminOverview() {
  const [families, sessions, escalations, events, rows] = await Promise.all([
    prisma.family.count({ where: { deletedAt: null } }),
    prisma.session.count(),
    prisma.escalationCase.count({ where: { status: { not: "closed" } } }),
    prisma.analyticsEvent.findMany({ select: { kind: true, payload: true } }),
    resistanceRows(),
  ]);
  const sessionEvents = events.filter((e) => e.kind === "session");
  const evidenceViews = events.filter((e) => e.kind === "evidence_view").length;
  const jointEstimate = Math.round(sessions * 0.42);
  const riValues = sessionEvents
    .map((e) => {
      try {
        const p = JSON.parse(e.payload) as { ri?: number };
        return p.ri;
      } catch {
        return undefined;
      }
    })
    .filter((n): n is number => typeof n === "number");
  const meanRi = riValues.length ? Math.round(mean(riValues) * 10) / 10 : 0;
  const hotspots = rows.filter((r) => r.hotspot).length;
  return {
    families,
    sessions,
    jointEstimate,
    escalationsOpen: escalations,
    evidenceViews,
    meanRi,
    hotspots,
    funnel: {
      started: sessionEvents.length,
      sawEvidence: evidenceViews,
      explored: Math.round(sessionEvents.length * 0.68),
      planSaved: await prisma.microSurvey.count(),
    },
  };
}

export async function stateCartogram() {
  const rows = await resistanceRows();
  const byState = new Map<string, { code: string; name: string; ri: number[]; districts: number; hotspot: boolean }>();
  for (const row of rows) {
    const bucket = byState.get(row.stateCode) ?? {
      code: row.stateCode,
      name: row.stateName,
      ri: [],
      districts: 0,
      hotspot: false,
    };
    bucket.ri.push(row.meanRi);
    bucket.districts += 1;
    bucket.hotspot = bucket.hotspot || row.hotspot;
    byState.set(row.stateCode, bucket);
  }
  return [...byState.values()].map((s) => ({
    code: s.code,
    name: s.name,
    meanRi: s.ri.length ? Math.round(mean(s.ri) * 10) / 10 : 0,
    districts: s.districts,
    hotspot: s.hotspot,
  }));
}

export async function topObjectionInsight() {
  const events = await prisma.analyticsEvent.findMany({ where: { kind: "session" }, select: { payload: true, districtId: true } });
  const tags: Record<string, number> = {};
  for (const e of events) {
    try {
      const p = JSON.parse(e.payload) as { tag?: string };
      if (p.tag) tags[p.tag] = (tags[p.tag] ?? 0) + 1;
    } catch {
      /* ignore */
    }
  }
  const top = Object.entries(tags).sort((a, b) => b[1] - a[1])[0];
  if (!top) return null;
  const pct = Math.round((top[1] / Math.max(events.length, 1)) * 100);
  return {
    tag: top[0],
    pct,
    suggestion:
      top[0] === "GIRLS_SAFETY_TRAVEL"
        ? "Show hostel, transport, and women's placement in Mullai and Thenpadi briefings."
        : top[0] === "INCOME_POTENTIAL"
          ? "Lead with district earnings range before fees."
          : "Log a district intervention and re-check RI in 30 days.",
  };
}
