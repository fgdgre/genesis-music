import { expect } from "@playwright/test";
import { test, intercept, fulfillJson } from "../helpers/net";

test.describe("@p0 API: schema & invalidation", () => {
  test('@p0 schema fail → UI shows "Received data is not supported structure"', async ({ page }) => {
    // respond with wrong shape for fetchTracksAPI
    await intercept(page, /\/api\/tracks\?/, async (route) => {
      await fulfillJson(route, { status: 200, body: { wrong: true } });
    });

    await page.goto("/");
    await expect(page.getByTestId("error-banner")).toContainText("Received data is not supported structure");
  });

  test('@p0 POST /api/tracks invalidates "tracks" queries', async ({ page }) => {
    // 1) first list load (to warm cache)
    await intercept(page, /\/api\/tracks\?page=1/, async (route) => {
      await fulfillJson(route, { status: 200, body: { items: [], total: 0 } });
    });

    // 2) POST create track
    await intercept(page, /\/api\/tracks$/, async (route) => {
      // echo back created
      const req = route.request();
      const body = JSON.parse(req.postData() || "{}");
      await fulfillJson(route, { status: 201, body: { ...body, id: "server-123" } });
    });

    // 3) Subsequent GET should be re-fetched (cache invalidated)
    let getHits = 0;
    await intercept(page, /\/api\/tracks\?page=1/, async (route) => {
      getHits++;
      await fulfillJson(route, {
        status: 200,
        body: { items: [{ id: "server-123", title: "New One" }], total: 1 },
      });
    });

    await page.goto("/");
    await page.getByTestId("add-track").click();
    await page.fill('[name="title"]', "New One");
    await page.click('[data-testid="save-track"]');

    await expect(page.getByText("New One")).toBeVisible();
    expect(getHits).toBe(1); // not served from cache after mutation
  });

  test('@p0 PUT/DELETE also invalidate "tracks"', async ({ page }) => {
    // seed list
    await intercept(page, /\/api\/tracks\?page=1/, async (route) => {
      await fulfillJson(route, { status: 200, body: { items: [{ id: "tX", title: "Edit Me" }], total: 1 } });
    });

    // PUT
    await intercept(page, /\/api\/tracks\/tX$/, async (route) => {
      const body = JSON.parse(route.request().postData()!);
      await fulfillJson(route, { status: 200, body });
    });

    // DELETE
    await intercept(page, /\/api\/tracks\/tX$/, async (route) => {
      if (route.request().method() === "DELETE") {
        await fulfillJson(route, { status: 204, body: {} });
      } else {
        await route.fallback();
      }
    });

    // re-fetch after edits/deletes
    let hits = 0;
    await intercept(page, /\/api\/tracks\?page=1/, async (route) => {
      hits++;
      await fulfillJson(route, { status: 200, body: { items: [], total: 0 } });
    });

    await page.goto("/");

    // update
    await page
      .getByRole("row", { name: /Edit Me/ })
      .getByTestId("edit-track")
      .click();
    await page.fill('[name="title"]', "Edited");
    await page.click('[data-testid="save-track"]');

    // delete
    await page
      .getByRole("row", { name: /Edited|Edit Me/ })
      .getByTestId("delete-track")
      .click();
    await page.getByRole("button", { name: /confirm/i }).click();

    expect(hits).toBeGreaterThanOrEqual(1);
  });
});
