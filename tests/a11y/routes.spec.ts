import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("landing has no critical axe violations", async ({ page }) => {
  await page.goto("/en");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((v) => v.impact === "critical")).toEqual([]);
});
