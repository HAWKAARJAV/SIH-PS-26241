const LOCALE: Record<string, string> = {
  en: "en-IN",
  hi: "hi-IN",
  mr: "mr-IN",
  ta: "ta-IN",
};

export function intlLocale(locale: string): string {
  return LOCALE[locale] ?? "en-IN";
}

export function formatInr(amount: number, locale = "en", nativeDigits = false): string {
  const loc = nativeDigits ? intlLocale(locale) : "en-IN";
  return new Intl.NumberFormat(loc, {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatMonth(amount: number, locale = "en", nativeDigits = false): string {
  return `${formatInr(amount, locale, nativeDigits)}/month`;
}

export function outOfTen(rate: number): number {
  return Math.round(rate * 10);
}

export function formatRate(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}

export function formatIst(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

/** Illustrative months to recover fees at median monthly earnings. */
export function familyRoiMonths(feesInr: number, medianMonthly: number): number | null {
  if (feesInr <= 0 || medianMonthly <= 0) return null;
  return Math.ceil(feesInr / medianMonthly);
}
