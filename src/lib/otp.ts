export const SIMULATED_PARENT_CODE = "123456";

export function checkSimulatedParentCode(code: string | undefined, required: boolean): string | null {
  if (!required) return null;
  if (code === SIMULATED_PARENT_CODE) return null;
  return "That parent code is wrong. This check is simulated.";
}
