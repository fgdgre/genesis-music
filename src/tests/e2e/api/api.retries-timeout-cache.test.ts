import { expect } from "@playwright/test";
import { test, intercept, fulfillJson, onceCounter } from "../helpers/net";

// NOTE: Your default retry.when = ['network','timeout'] (== no retry on 5xx/429)

test.describe("@p0 API: retries/timeout/cache for GET /api/tracks", () => {
  test("@p0 does NOT retry on 5xx with current defaults", async ({ page }) => {
    const calls = onceCounter();

    await intercept(page, /\/api\/tracks\?/, async (route) => {
      calls.hit();
      await fulfillJson(route, { status: 500, body: { error: "boom", statusCode: 500, message: "boom" } });
    });

    await page.goto("/"); // assumes home loads tracks via fetchTracksAPI

    // Expect your UI to surface HTTP error (HTTP code path)
    await expect(page.getByTestId("error-banner")).toContainText(/boom|error/i);
    expect(calls.get()).toBe(1); // no retry on 5xx with current defaults
  });

  test("@p0 retries on TIMEOUT and succeeds", async ({ page }) => {
    const calls = onceCounter();

    // first call will stall > 8000ms (default timeout), second call succeeds
    await intercept(page, /\/api\/tracks\?page=1/, async (route) => {
      const n = calls.hit();
      if (n === 1) {
        // stall 9s to trigger timeout
        await fulfillJson(route, { delayMs: 9000, status: 200, body: { items: [], total: 0 } });
      } else {
        await fulfillJson(route, { status: 200, body: { items: [{ id: "t1", title: "Hello" }], total: 1 } });
      }
    });

    await page.goto("/");

    // first attempt should time out -> your client maps to TIMEOUT and retries (because retry.when includes 'timeout')
    await expect(page.getByText("Hello")).toBeVisible();
    expect(calls.get()).toBe(2);
  });

  test("@p0 cache: second visit returns from cache (no network hit)", async ({ page }) => {
    const calls = onceCounter();

    await intercept(page, /\/api\/tracks\?page=1&.*$/, async (route) => {
      calls.hit();
      await fulfillJson(route, {
        status: 200,
        body: { items: [{ id: "t2", title: "Cached" }], total: 1 },
      });
    });

    await page.goto("/"); // triggers first GET with schema -> populates cache
    await expect(page.getByText("Cached")).toBeVisible();

    // navigate away and back to re-query same key
    await page.goto("/settings");
    await page.goto("/");

    // give some time for unintended background calls
    await page.waitForTimeout(400);
    expect(calls.get()).toBe(1); // served from cache
  });
});
