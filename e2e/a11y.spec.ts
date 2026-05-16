import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("accessibility smoke", () => {
  test("share page has no serious axe violations", async ({ page }) => {
    await page.goto("/share");
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    const serious = results.violations.filter((v: { impact?: string }) => v.impact === "serious" || v.impact === "critical");
    expect(serious).toEqual([]);
  });

  test("home page has no critical axe violations", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page }).withTags(["wcag2a"]).analyze();
    const critical = results.violations.filter((v: { impact?: string }) => v.impact === "critical");
    expect(critical).toEqual([]);
  });
});
