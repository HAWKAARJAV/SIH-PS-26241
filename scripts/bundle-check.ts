import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { gzipSync } from "zlib";
import { join } from "path";

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}
const files = walk(".next/static/chunks").filter((f) => f.endsWith(".js"));
if (files.length === 0) {
  console.error("No client chunks found. Run the build first.");
  process.exit(1);
}
const gzip = files.map((file) => gzipSync(readFileSync(file)).length);
const largest = Math.max(...gzip);
const budget = 350 * 1024;
if (largest > budget) {
  console.error(`Largest chunk ${largest} exceeds ${budget}`);
  process.exit(1);
}
console.warn(`bundle ok, largest gzipped chunk ${largest}`);
