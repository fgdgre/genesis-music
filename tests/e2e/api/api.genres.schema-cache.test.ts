import { expect } from "@playwright/test";
import { test, intercept, fulfillJson, onceCounter } from "../helpers/net";

test.describe("@p0 API: /api/genres schema + cache", () => {
  test("@p0 ok: array of string cached", async ({ page }) => {
    const hits = onceCounter();
    await intercept(page, /\/api\/genres$/, async (route) => {
      hits.hit();
      await fulfillJson(route, { status: 200, body: ["pop", "rock"] });
    });

    await page.goto("/"); // page that loads genres (filters UI)
    await expect(page.getByTestId("genre-filter")).toBeVisible();

    // open the filters again (re-query)
    await page.getByTestId("open-filters").click();
    await page.getByTestId("close-filters").click();
    await page.getByTestId("open-filters").click();

    await page.waitForTimeout(300);
    expect(hits.get()).toBe(1); // cache hit
  });

  test("@p0 schema fail → error banner", async ({ page }) => {
    await intercept(page, /\/api\/genres$/, async (route) => {
      await fulfillJson(route, { status: 200, body: [{ not: "a string" }] });
    });

    await page.goto("/");
    await expect(page.getByTestId("error-banner")).toContainText("Received data is not supported structure");
  });
});
