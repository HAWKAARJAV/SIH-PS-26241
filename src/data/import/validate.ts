import { z } from "zod";

export const outcomeRowSchema = z.object({
  trade_slug: z.string().min(1),
  scope: z.enum(["provider", "district", "state"]),
  district: z.string().optional().default(""),
  state: z.string().optional().default(""),
  provider_name: z.string().optional().default(""),
  cohort_period: z.string().min(4),
  cohort_size: z.coerce.number().int().min(1),
  placement_rate: z.coerce.number().min(0).max(1).optional(),
  placement_window_months: z.coerce.number().int().min(1).max(36).default(6),
  earnings_p25: z.coerce.number().int().nonnegative().optional(),
  earnings_median: z.coerce.number().int().nonnegative().optional(),
  earnings_p75: z.coerce.number().int().nonnegative().optional(),
  women_placement_rate: z.coerce.number().min(0).max(1).optional(),
});

export type OutcomeRow = z.infer<typeof outcomeRowSchema>;

export type RowIssue = { row: number; field: string; message: string };

const CANONICAL = [
  "trade_slug",
  "scope",
  "district",
  "state",
  "provider_name",
  "cohort_period",
  "cohort_size",
  "placement_rate",
  "placement_window_months",
  "earnings_p25",
  "earnings_median",
  "earnings_p75",
  "women_placement_rate",
] as const;

function norm(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export function suggestMapping(headers: string[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const header of headers) {
    const n = norm(header);
    const hit = CANONICAL.find((field) => norm(field) === n || n.includes(norm(field)) || norm(field).includes(n));
    if (hit) map[header] = hit;
  }
  return map;
}

export function validateRows(
  rows: Record<string, string>[],
  knownTrades: string[],
  knownDistricts: string[],
): { ok: OutcomeRow[]; issues: RowIssue[] } {
  const ok: OutcomeRow[] = [];
  const issues: RowIssue[] = [];
  const seen = new Set<string>();
  rows.forEach((raw, index) => {
    const parsed = outcomeRowSchema.safeParse(raw);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        issues.push({ row: index + 2, field: issue.path.join("."), message: issue.message });
      }
      return;
    }
    const row = parsed.data;
    if (!knownTrades.includes(row.trade_slug)) {
      const suggestion = knownTrades.find((slug) => slug.includes(row.trade_slug) || row.trade_slug.includes(slug));
      issues.push({
        row: index + 2,
        field: "trade_slug",
        message: suggestion ? `Unknown trade. Did you mean ${suggestion}?` : "Unknown trade.",
      });
      return;
    }
    if (row.scope === "district" && row.district && !knownDistricts.includes(row.district)) {
      issues.push({ row: index + 2, field: "district", message: "Unknown district." });
      return;
    }
    if (
      row.earnings_p25 != null &&
      row.earnings_median != null &&
      row.earnings_p75 != null &&
      !(row.earnings_p25 <= row.earnings_median && row.earnings_median <= row.earnings_p75)
    ) {
      issues.push({ row: index + 2, field: "earnings", message: "Need P25 ≤ median ≤ P75." });
      return;
    }
    const key = `${row.trade_slug}|${row.scope}|${row.district}|${row.provider_name}|${row.cohort_period}`;
    if (seen.has(key)) {
      issues.push({ row: index + 2, field: "duplicate", message: "Duplicate cohort row." });
      return;
    }
    seen.add(key);
    ok.push(row);
  });
  return { ok, issues };
}

export function swingFlags(
  next: { key: string; placement?: number }[],
  live: { key: string; placement?: number }[],
): string[] {
  const flags: string[] = [];
  const liveMap = new Map(live.map((row) => [row.key, row.placement]));
  for (const row of next) {
    const prev = liveMap.get(row.key);
    if (prev == null || row.placement == null || prev === 0) continue;
    const delta = Math.abs(row.placement - prev) / prev;
    if (delta > 0.3) flags.push(`${row.key} moves more than 30% (${prev} → ${row.placement}).`);
  }
  return flags;
}
