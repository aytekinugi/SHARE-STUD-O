import { test, expect } from "@playwright/test";

const email = process.env.PLAYWRIGHT_TEST_EMAIL;
const password = process.env.PLAYWRIGHT_TEST_PASSWORD;

test.describe("auth share flow", () => {
  test.skip(!email || !password, "Set PLAYWRIGHT_TEST_EMAIL and PLAYWRIGHT_TEST_PASSWORD");

  test("login and open share studio", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill(email!);
    await page.getByLabel(/password/i).fill(password!);
    await page.getByRole("button", { name: /sign in|giriş/i }).click();
    await page.waitForURL(/\/dashboard/);
    await page.goto("/share");
    await expect(page.getByTestId("share-main-text")).toBeVisible();
  });
});
