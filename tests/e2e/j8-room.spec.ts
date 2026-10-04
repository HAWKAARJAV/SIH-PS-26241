import { expect, test } from "@playwright/test";

test("two browsers share one family room", async ({ browser }) => {
  const a = await browser.newContext();
  const b = await browser.newContext();
  const pageA = await a.newPage();
  const pageB = await b.newPage();
  await pageA.goto("/en/demo");
  await pageA.getByRole("button", { name: /Sunita & Ravi/i }).click();
  await expect(pageA).toHaveURL(/\/hi\/room/, { timeout: 20_000 });
  const code = (await pageA.getByText(/^\d{6}$/).first().textContent())?.trim() ?? "";
  expect(code).toMatch(/^\d{6}$/);
  await pageB.goto(`/en/room/join/${code}`);
  await pageB.getByRole("button", { name: "Learner" }).click();
  await expect(pageB.getByRole("heading", { name: /Household decision/i })).toBeVisible({ timeout: 15_000 });
  await pageA.getByRole("button", { name: "Parent" }).click();
  const box = pageA.getByLabel(/Say the worry|चिंता/i);
  await box.fill("Papa yahin hai");
  await pageA.getByRole("button", { name: /Send|भेजें/i }).click();
  await expect(pageB.getByText("Papa yahin hai")).toBeVisible({ timeout: 8_000 });
  await a.close();
  await b.close();
});
