import { expect, test } from "@playwright/test";

async function gotoShare(page: import("@playwright/test").Page, locale: "tr" | "en") {
  await page.addInitScript((loc) => {
    window.localStorage.setItem("vanguard-share-locale", loc);
  }, locale);
  await page.goto("/share");
}

test("landing loads Vanguard hero", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /epic campaign/i })).toBeVisible();
});

test("share hub shows primary actions (TR)", async ({ page }) => {
  await gotoShare(page, "tr");
  await expect(page.getByRole("heading", { name: /Limite yok/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Telefonun paylaşımını aç/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Panoyu yükle ve kanalları aç/i })).toBeVisible();
});

test("share hub shows primary actions (EN)", async ({ page }) => {
  await gotoShare(page, "en");
  await expect(page.getByRole("heading", { name: /No hard cap/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Open native share/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Load clipboard & open channels/i })).toBeVisible();
});

test("locale switch updates batch button label", async ({ page }) => {
  await gotoShare(page, "tr");
  await page.getByRole("button", { name: "English", exact: true }).click();
  await expect(page.getByRole("button", { name: /Load clipboard & open channels/i })).toBeVisible();
});

test("share batch toast, host preview, and loading gate", async ({ page, context }) => {
  const origin = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
  await context.grantPermissions(["clipboard-write", "clipboard-read"], { origin });

  await gotoShare(page, "tr");
  const batch = page.getByRole("button", { name: /Panoyu yükle ve kanalları aç/i });
  await batch.click();

  await expect(page.getByRole("dialog")).toBeVisible({ timeout: 3000 });
  const hostPreview = page.getByTestId("share-batch-host-preview");
  await expect(hostPreview).toContainText("instagram.com");
  await expect(hostPreview).toContainText("whatsapp.com");

  await page.getByRole("button", { name: /Panoya yaz ve sekmeleri aç/i }).click();
  await expect(page.getByText("Paket gönderildi")).toBeVisible({ timeout: 6000 });
});

test("EN batch dialog submit", async ({ page, context }) => {
  const origin = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
  await context.grantPermissions(["clipboard-write", "clipboard-read"], { origin });

  await gotoShare(page, "en");
  await page.getByRole("button", { name: /Load clipboard & open channels/i }).click();
  await expect(page.getByRole("dialog")).toBeVisible({ timeout: 3000 });
  await page.getByRole("button", { name: /Write clipboard & open tabs/i }).click();
  await expect(page.getByText("Package sent")).toBeVisible({ timeout: 8000 });
});

test("share batch copies assembled text to clipboard", async ({ page, context }) => {
  const origin = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
  await context.grantPermissions(["clipboard-write", "clipboard-read"], { origin });

  const marker = `E2E_CLIPBOARD_${Date.now()}`;
  await gotoShare(page, "tr");
  await page.getByTestId("share-main-text").fill(marker);

  await page.getByRole("button", { name: /Panoyu yükle ve kanalları aç/i }).click();
  await page.getByRole("button", { name: /Panoya yaz ve sekmeleri aç/i }).click();
  await expect(page.getByText("Paket gönderildi")).toBeVisible({ timeout: 8000 });

  const clip = await page.evaluate(() => navigator.clipboard.readText());
  expect(clip).toContain(marker);
});

test("query prefill sets main text", async ({ page }) => {
  await page.goto("/share?text=Hello%20from%20query");
  await expect(page.getByTestId("share-main-text")).toHaveValue("Hello from query");
});
