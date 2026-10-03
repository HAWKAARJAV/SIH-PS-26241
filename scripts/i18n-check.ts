import { readFileSync } from "fs";

function keys(value: unknown, prefix = ""): string[] {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return Object.entries(value as Record<string, unknown>).flatMap(([k, v]) => keys(v, prefix ? `${prefix}.${k}` : k));
  }
  return [prefix];
}
const en = keys(JSON.parse(readFileSync("src/messages/en.json", "utf8")));
for (const locale of ["hi", "mr", "ta"]) {
  const set = new Set(keys(JSON.parse(readFileSync(`src/messages/${locale}.json`, "utf8"))));
  const missing = en.filter((key) => !set.has(key));
  if (missing.length) {
    console.error(locale, missing);
    process.exit(1);
  }
}
console.warn("i18n ok");
