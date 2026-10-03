import { defineConfig } from "@playwright/test";

const webServer = {
  command: "npm run setup && node scripts/start-standalone.mjs",
  url: "http://127.0.0.1:3000/api/health",
  reuseExistingServer: !process.env.CI,
  timeout: 180_000,
};

export default defineConfig({
  testDir: "./tests/a11y",
  timeout: 60_000,
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL: process.env.APP_URL ?? "http://127.0.0.1:3000",
  },
  webServer,
  projects: [{ name: "a11y" }],
});
