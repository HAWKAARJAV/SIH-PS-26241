export type Stance = "OPEN" | "HESITANT" | "RESISTANT" | "VETO";

const STANCE_SCORE: Record<Stance, number> = {
  OPEN: 0,
  HESITANT: 0.4,
  RESISTANT: 0.8,
  VETO: 1,
};

export type ResistanceInput = {
  openIntensities: number[];
  parentSentiments: number[];
  stance: Stance;
  escalationRequested: boolean;
  sameTagRepeats: number;
};

export function resistanceIndex(input: ResistanceInput): number {
  const intensitySum = input.openIntensities.reduce((a, b) => a + b, 0);
  const U = Math.min(1, intensitySum / 6);
  const recent = input.parentSentiments.slice(-3);
  const avg =
    recent.length === 0 ? 0 : recent.reduce((a, b) => a + b, 0) / recent.length;
  const S = (1 - avg) / 2;
  const I = STANCE_SCORE[input.stance];
  const E = input.escalationRequested ? 1 : 0;
  const P = Math.min(1, input.sameTagRepeats / 3);
  const raw = 100 * (0.35 * U + 0.25 * S + 0.2 * I + 0.1 * E + 0.1 * P);
  return Math.round(raw * 10) / 10;
}

export function sentimentLift(start: number, end: number): number {
  return Math.round((start - end) * 10) / 10;
}

export function resolutionRate(resolved: number, raised: number): number | null {
  if (raised <= 0) return null;
  return resolved / raised;
}

export function isHotspot(districtMean: number, stateMean: number, stateSd: number, sessions: number): boolean {
  return sessions >= 30 && districtMean > stateMean + stateSd;
}

export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function stdev(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  const v = values.reduce((a, b) => a + (b - m) ** 2, 0) / values.length;
  return Math.sqrt(v);
}
