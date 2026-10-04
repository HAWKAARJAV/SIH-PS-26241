/** Numbers the guide may say without a fact slot. Each line is a named exception, not a salary. */
export const NAMED_ALLOW = [
  "8", // Class 8 entry
  "10", // Class 10 entry, and "out of 10" icon arrays after the rate slot is rendered
  "12", // Class 12 entry
  "nsqf",
  "ncrf",
  "pm-setu",
  "naps",
] as const;

export function allowListForTurn(userText: string): string[] {
  const fromUser = userText.match(/[0-9\u0966-\u096F\u0BE6-\u0BEF]+/g) ?? [];
  return [...NAMED_ALLOW, ...fromUser];
}
