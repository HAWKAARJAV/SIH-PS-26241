const PATTERNS: RegExp[] = [
  /\b[2-9]\d{3}\s?\d{4}\s?\d{4}\b/g,
  /\b[A-Z]{5}\d{4}[A-Z]\b/gi,
  /\b\d{10}\b/g,
  /\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/gi,
];

export function redactPii(text: string): string {
  let out = text;
  for (const pattern of PATTERNS) {
    out = out.replace(pattern, "[redacted]");
  }
  return out;
}

export function kAnonSuppress<T extends { n: number }>(rows: T[], min: number): T[] {
  return rows.filter((row) => row.n >= min);
}
