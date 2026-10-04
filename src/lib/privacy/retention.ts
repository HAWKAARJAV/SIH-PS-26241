export function isPastRetention(createdAt: string, nowMs: number, days: number): boolean {
  const then = Date.parse(createdAt);
  if (Number.isNaN(then)) return false;
  return nowMs - then > days * 24 * 60 * 60 * 1000;
}

export function nextWindowCount(current: number | null, limit: number): { allow: boolean; count: number } {
  const count = (current ?? 0) + 1;
  return { allow: count <= limit, count };
}
