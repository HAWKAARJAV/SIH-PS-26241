export type ObjectionStatus = "open" | "addressed" | "resolved";

export function nextObjectionStatus(input: {
  current: ObjectionStatus;
  answeredWithEvidence: boolean;
  speakerClearedIt: boolean;
}): ObjectionStatus {
  if (input.speakerClearedIt) return "resolved";
  if (input.current === "resolved") return "resolved";
  if (input.answeredWithEvidence) return "addressed";
  return input.current;
}
