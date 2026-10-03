export const FAMILY_WORRIES = [
  { id: "INCOME_POTENTIAL", chip: "income" },
  { id: "JOB_SECURITY", chip: "job" },
  { id: "SOCIAL_STATUS", chip: "status" },
  { id: "GIRLS_SAFETY_TRAVEL", chip: "girls" },
  { id: "DEGREE_PREFERENCE", chip: "degree" },
  { id: "COST_FEES", chip: "fees" },
] as const;

const CHIP_BY_TAG: Record<string, (typeof FAMILY_WORRIES)[number]["chip"]> = Object.fromEntries(
  FAMILY_WORRIES.map((row) => [row.id, row.chip]),
);

export function worryChip(tag: string) {
  return CHIP_BY_TAG[tag];
}

export const WORRY_PLAIN: Record<string, string> = {
  INCOME_POTENTIAL: "How much can they earn?",
  JOB_SECURITY: "Is the job secure?",
  SOCIAL_STATUS: "What will people say?",
  GIRLS_SAFETY_TRAVEL: "Is it safe for daughters?",
  DEGREE_PREFERENCE: "Better than a degree?",
  COST_FEES: "Fees and costs?",
};

export const PLACE_NAMES: Record<string, string> = {
  "st-up": "Uttar Pradesh",
  "st-mh": "Maharashtra",
  "st-tn": "Tamil Nadu",
  "st-br": "Bihar",
  "d-neemganj": "Neemganj",
  "d-loharpur": "Loharpur",
  "d-mangoan": "Mangoan",
  "d-talewadi": "Talewadi",
  "d-thenpadi": "Thenpadi",
  "d-mullai": "Mullai",
  "d-gangauli": "Gangauli",
  "d-sonpurwa": "Sonpurwa",
};

export const INTEREST_NAMES: Record<string, string> = {
  electrician: "Electrician",
  sewing: "Sewing",
  gda: "Patient care",
  solar: "Solar",
  copa: "Computer operator",
  plumber: "Plumber",
};
