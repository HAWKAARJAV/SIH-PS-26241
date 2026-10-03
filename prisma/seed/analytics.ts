import type { PrismaClient } from "@prisma/client";
import { DISTRICTS } from "./catalog";
import { resistanceIndex, type Stance } from "../../src/lib/analytics/resistance";

function iso(monthIndex: number, day: number) {
  const startMonth = 4 + monthIndex;
  const y = startMonth > 12 ? 2027 : 2026;
  const m = ((startMonth - 1) % 12) + 1;
  return `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}T08:00:00.000Z`;
}

export async function seedAnalytics(prisma: PrismaClient) {
  const rows: {
    id: string;
    kind: string;
    sessionKey: string;
    stateCode: string;
    districtId: string;
    locale: string;
    tradeSlug: string;
    gender: string;
    incomeBand: string;
    payload: string;
    at: string;
    synthetic: boolean;
  }[] = [];
  const stateById = new Map(DISTRICTS.map((d) => [d.id, d.stateId.replace("st-", "").toUpperCase()]));
  for (let i = 0; i < 4200; i++) {
    const district = DISTRICTS[i % DISTRICTS.length]!;
    const month = i % 6;
    const day = (i % 27) + 1;
    const at = `${month < 9 ? iso(month, day) : iso(month, day)}`;
    const girlsHot = district.id === "d-mullai" || district.id === "d-kaveryoor";
    const ruralIncome = district.rural && district.stateId === "st-up";
    const degreeState = district.stateId === "st-mh";
    let tag = "JOB_SECURITY";
    if (girlsHot && i % 3 !== 0) tag = "GIRLS_SAFETY_TRAVEL";
    else if (degreeState && i % 2 === 0) tag = "DEGREE_PREFERENCE";
    else if (ruralIncome) tag = "INCOME_POTENTIAL";
    const easing = ruralIncome && month >= 3;
    const afterIntervention = district.id === "d-mullai" && month >= 2;
    const stance: Stance = afterIntervention || easing ? "HESITANT" : girlsHot ? "RESISTANT" : "HESITANT";
    const sentiment = afterIntervention ? 0.2 : easing ? 0 : -0.4;
    const ri = resistanceIndex({
      openIntensities: afterIntervention ? [1] : [2, easing ? 1 : 2],
      parentSentiments: [sentiment, sentiment],
      stance,
      escalationRequested: i % 17 === 0,
      sameTagRepeats: easing ? 1 : 2,
    });
    const gender = girlsHot && i % 2 === 0 ? "girl" : i % 5 === 0 ? "girl" : "boy";
    rows.push({
      id: `ae-${i}`,
      kind: i % 5 === 0 ? "evidence_view" : "session",
      sessionKey: `syn-${i}`,
      stateCode: stateById.get(district.id) ?? "UP",
      districtId: district.id,
      locale: district.stateId === "st-tn" ? "ta" : district.stateId === "st-mh" ? "mr" : "hi",
      tradeSlug: i % 2 === 0 ? "electrician" : "sewing",
      gender,
      incomeBand: district.rural ? "under-10k" : "10-25k",
      payload: JSON.stringify({ tag, ri, stance, sentiment, month }),
      at,
      synthetic: true,
    });
  }
  for (let i = 0; i < rows.length; i += 500) {
    await prisma.analyticsEvent.createMany({ data: rows.slice(i, i + 500) });
  }
}
