import { describe, expect, it } from "vitest";
import { findUngroundedNumbers, guardReply, resolveSlots } from "@/ai/guard/number-guard";
import { resistanceIndex, resolutionRate, sentimentLift } from "@/lib/analytics/resistance";
import { suggestMapping, swingFlags, validateRows } from "@/data/import/validate";
import { can, stateScope } from "@/lib/rbac";
import { kAnonSuppress, redactPii } from "@/lib/privacy/redact";
import { familyRoiMonths, formatInr } from "@/lib/format/money";
import { scriptedTurn } from "@/ai/scripted/brain";

describe("number guard", () => {
  it("resolves slots and blocks stray digits", () => {
    const facts = { earn: { id: "earn", tier: "V0" as const, valueLabel: "₹16,000", rangeLabel: "₹12,000 to ₹22,000", rateLabel: "7 out of 10" } };
    const resolved = resolveSlots("In range {{range:earn}}.", facts);
    expect(resolved.usedFactIds).toEqual(["earn"]);
    expect(resolved.text).toContain("12,000");
    expect(guardReply(resolved.text, []).ok).toBe(false);
    expect(findUngroundedNumbers("placement is 100%", []).length).toBeGreaterThan(0);
  });

  it("refuses a guarantee in the scripted guide", () => {
    const turn = scriptedTurn({ text: "Guarantee me a job with 100% placement", locale: "en", speaker: "PARENT", parentSilentTurns: 0, attemptCount: 0, hasVerifiedFact: false });
    const text = turn.blocks.map((b) => ("text" in b ? b.text : "")).join(" ");
    expect(text.toLowerCase()).toContain("cannot guarantee");
    expect(guardReply(text, []).ok).toBe(true);
  });
});

describe("resistance", () => {
  it("matches the published weights", () => {
    const ri = resistanceIndex({ openIntensities: [2, 2, 2], parentSentiments: [-1, -1, -1], stance: "VETO", escalationRequested: true, sameTagRepeats: 3 });
    expect(ri).toBe(100);
    expect(sentimentLift(80, 50)).toBe(30);
    expect(resolutionRate(1, 4)).toBe(0.25);
  });
});

describe("import and privacy", () => {
  it("validates ranges and maps headers", () => {
    const map = suggestMapping(["Trade Slug", "cohort size"]);
    expect(map["Trade Slug"]).toBe("trade_slug");
    const result = validateRows([
      { trade_slug: "electrician", scope: "district", district: "Neemganj", cohort_period: "2025", cohort_size: "10", earnings_p25: "9", earnings_median: "8", earnings_p75: "7" },
    ], ["electrician"], ["Neemganj"]);
    expect(result.issues.some((i) => i.field === "earnings")).toBe(true);
    expect(swingFlags([{ key: "a", placement: 0.8 }], [{ key: "a", placement: 0.4 }]).length).toBe(1);
  });

  it("enforces roles and k-anonymity", () => {
    expect(can("VIEWER", "analytics:read")).toBe(true);
    expect(can("VIEWER", "dataset:approve")).toBe(false);
    expect(stateScope("STATE_ADMIN", "UP", "MH")).toBe(false);
    expect(kAnonSuppress([{ n: 3 }, { n: 12 }], 10)).toEqual([{ n: 12 }]);
    expect(redactPii("call 9876543210")).toContain("[redacted]");
  });

  it("formats rupees and ROI", () => {
    expect(formatInr(125000)).toContain("1,25,000");
    expect(familyRoiMonths(15000, 5000)).toBe(3);
  });
});
