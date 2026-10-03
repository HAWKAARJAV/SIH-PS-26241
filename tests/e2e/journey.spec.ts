import { expect, test } from "@playwright/test";

test("home and health", async ({ page, request }) => {
  const health = await request.get("/api/health");
  expect(health.ok()).toBeTruthy();
  await page.goto("/en");
  await expect(page.getByRole("heading", { name: /Skills that/i })).toBeVisible();
  await expect(page.getByText("not an official government portal")).toBeVisible();
});

test("explore trades", async ({ page }) => {
  await page.goto("/en/explore");
  await expect(page.getByRole("heading", { name: /Explore trades/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Electrician/i })).toBeVisible();
});

test("design gallery", async ({ page }) => {
  await page.goto("/en/design");
  await expect(page.getByRole("heading", { name: /Warm Clay/i })).toBeVisible();
});

test("family room quick chip", async ({ page }) => {
  await page.goto("/en/room");
  await page.getByRole("button", { name: /How much can they earn/i }).click();
  await expect(page.getByText(/Disha|दिशा|AI guide/i).first()).toBeVisible({ timeout: 15000 });
});

test("demo hub launches persona room", async ({ page }) => {
  await page.goto("/en/demo");
  await page.getByRole("button", { name: /Sunita & Ravi/i }).click();
  await expect(page).toHaveURL(/\/hi\/room/, { timeout: 15_000 });
  const session = await page.evaluate(() => localStorage.getItem("nourish.session"));
  expect(session).toBeTruthy();
});
