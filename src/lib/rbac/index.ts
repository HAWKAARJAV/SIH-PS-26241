export const ROLES = ["ADMIN", "STATE_ADMIN", "COUNSELLOR", "DATA_STEWARD", "VIEWER"] as const;
export type Role = (typeof ROLES)[number];

const PERMISSIONS: Record<Role, string[]> = {
  ADMIN: ["*"],
  STATE_ADMIN: ["analytics:read", "intervention:write", "escalation:read"],
  COUNSELLOR: ["case:read", "case:write", "playbook:suggest"],
  DATA_STEWARD: ["dataset:read", "dataset:approve", "dataset:rollback"],
  VIEWER: ["analytics:read"],
};

export function can(role: Role, permission: string): boolean {
  const list = PERMISSIONS[role];
  return list.includes("*") || list.includes(permission);
}

export function stateScope(role: Role, userState: string | null, targetState: string): boolean {
  if (role === "ADMIN" || role === "DATA_STEWARD" || role === "VIEWER") return true;
  if (role === "STATE_ADMIN") return userState === targetState;
  return true;
}
