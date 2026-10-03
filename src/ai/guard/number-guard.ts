export type FactSlot = {
  id: string;
  tier: "V0" | "V1" | "V2" | "V3";
  valueLabel: string;
  rangeLabel: string;
  rateLabel: string;
  prefix?: string;
};

const SLOT = /\{\{(fact|range|rate):([a-zA-Z0-9_-]+)\}\}/g;

const DIGIT =
  /[0-9\u0966-\u096F\u0BE6-\u0BEF]+(?:[.,][0-9\u0966-\u096F\u0BE6-\u0BEF]+)?%?/g;

const NUMBER_WORDS =
  /\b(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|hundred|thousand|lakh|crore|percent|percentage)\b|\b(ek|do|teen|char|paanch|panch|sau|hazaar|hazar|lakh|pratishat)\b|प्रतिशत|हज़ार|हजार|लाख|सौ|நூறு|ஆயிரம்|சதவீत/gi;

export type ResolveResult = {
  text: string;
  usedFactIds: string[];
  missing: string[];
};

export function resolveSlots(template: string, facts: Record<string, FactSlot>): ResolveResult {
  const usedFactIds: string[] = [];
  const missing: string[] = [];
  const text = template.replace(SLOT, (_m, kind: string, id: string) => {
    const fact = facts[id];
    if (!fact) {
      missing.push(id);
      return "";
    }
    if (!usedFactIds.includes(id)) usedFactIds.push(id);
    const prefix = fact.tier === "V0" ? "In demo data, " : fact.prefix ?? "";
    if (kind === "range") return `${prefix}${fact.rangeLabel}`;
    if (kind === "rate") return `${prefix}${fact.rateLabel}`;
    return `${prefix}${fact.valueLabel}`;
  });
  return { text, usedFactIds, missing };
}

export function findUngroundedNumbers(text: string, allowList: string[]): string[] {
  const allow = new Set(allowList.map((item) => item.toLowerCase()));
  const hits: string[] = [];
  const stripped = text.replace(SLOT, " ");
  for (const match of stripped.match(DIGIT) ?? []) {
    if (!allow.has(match.toLowerCase()) && !allow.has(match.replace("%", ""))) hits.push(match);
  }
  for (const match of stripped.match(NUMBER_WORDS) ?? []) {
    if (!allow.has(match.toLowerCase())) hits.push(match);
  }
  return hits;
}

export function guardReply(text: string, allowList: string[]): { ok: boolean; violations: string[] } {
  const violations = findUngroundedNumbers(text, allowList);
  return { ok: violations.length === 0, violations };
}
