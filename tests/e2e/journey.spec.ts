import { expect, test } from "@playwright/test";

test("home and health", async ({ page, request }) => {
  const health = await request.get("/api/health");
  expect(health.ok()).toBeTruthy();
  await page.goto("/en");
  await expect(page.getByRole("heading", { name: /Skills that/i })).toBeVisible();
  await expect(page.getByText("not an official government portal")).toBeVisible();
});
