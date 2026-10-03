import { cpSync, existsSync, mkdirSync, readFileSync } from "fs";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const standalone = path.join(root, ".next/standalone");
const serverJs = path.join(standalone, "server.js");

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return {};
  const out = {};
  for (const line of readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

if (!existsSync(serverJs)) {
  console.error("Missing .next/standalone/server.js — run npm run build first.");
  process.exit(1);
}

if (existsSync(path.join(root, "public"))) {
  cpSync(path.join(root, "public"), path.join(standalone, "public"), { recursive: true });
}
const staticSrc = path.join(root, ".next/static");
const staticDest = path.join(standalone, ".next/static");
if (existsSync(staticSrc)) {
  mkdirSync(path.dirname(staticDest), { recursive: true });
  cpSync(staticSrc, staticDest, { recursive: true });
}

const prismaDir = path.join(standalone, "prisma");
mkdirSync(prismaDir, { recursive: true });
const dbSrc = path.join(root, "prisma/dev.db");
const dbDest = path.join(prismaDir, "dev.db");
if (existsSync(dbSrc)) {
  cpSync(dbSrc, dbDest);
}

const fileEnv = loadEnvFile(path.join(root, ".env"));
const port = process.env.PORT ?? "3000";
const env = {
  ...fileEnv,
  ...process.env,
  PORT: port,
  HOSTNAME: "0.0.0.0",
  DATABASE_URL: `file:${dbDest}`,
};

const child = spawn("node", ["server.js"], { cwd: standalone, env, stdio: "inherit" });
child.on("exit", (code) => process.exit(code ?? 0));
