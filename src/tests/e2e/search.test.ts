import type { QueryParams, Track, TracksMeta } from "@/types";
import { test, expect } from "@playwright/test";
import {
  filterSort,
  itemsLocator,
  makeTracks,
  scrollListOrWindow,
  waitForTracksGet,
} from "./helpers";

const APP_URL = "http://localhost:3000/tracks";

/** ===== The test ===== */
test("infinite scroll over tracks (frontend-only, deterministic)", async ({
  page,
}) => {
  const ALL = makeTracks(53, "tracks");

  // 1) prove we intercept & capture page-1 limit
  let firstLimitResolve!: (n: number) => void;
  const firstLimitP = new Promise<number>((r) => (firstLimitResolve = r));
  let interceptCount = 0;

  await page.route("**/api/tracks**", async (route) => {
    interceptCount++;
    const url = new URL(route.request().url());
    const pageNum = Number(url.searchParams.get("page") ?? "1");
    const limit = Number(url.searchParams.get("limit") ?? "20");
    if (pageNum === 1) firstLimitResolve(limit);

    const qp = {
      search: url.searchParams.get("search") ?? undefined,
      genre: url.searchParams.get("genre") ?? undefined,
      artist: url.searchParams.get("artist") ?? undefined,
      order: (url.searchParams.get("order") as any) ?? undefined,
      sort: (url.searchParams.get("sort") as any) ?? undefined,
    };

    const filtered = filterSort(ALL, qp);
    const total = filtered.length;
    const start = (pageNum - 1) * limit;
    const slice = filtered.slice(start, start + limit);
    const totalPages = Math.max(1, Math.ceil(total / limit));

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: slice,
        meta: { total, page: pageNum, limit, totalPages },
      }),
    });
  });

  await page.goto("http://localhost:3000/tracks");

  // 2) wait for the first GET /api/tracks to finish (ensures list has rendered)
  await page.waitForResponse(
    (resp) =>
      resp.url().includes("/api/tracks") && resp.request().method() === "GET",
  );

  // 3) pick the list
  const list = page.getByTestId("tracks-list");

  // 3a) If your cards are NOT direct children, match descendants:
  // prefer direct children if that’s true in your DOM
  let items = list.locator(":scope > [data-track-id]");
  if ((await items.count()) === 0) {
    // fallback: anywhere inside the list (handles wrappers like ul>li>div)
    items = list.locator("[data-track-id]");
  }

  // sanity logs if still zero
  if ((await items.count()) === 0) {
    const children = await list.evaluate((el) =>
      Array.from(el.children).map((c: any, i) => ({
        i,
        tag: c.tagName.toLowerCase(),
        testid: c.getAttribute("data-testid"),
        trackId: c.getAttribute("data-track-id"),
        class: c.className,
      })),
    );
    console.table(children);
    console.warn("Intercept hits:", interceptCount);
  }

  const firstLimit = await firstLimitP;

  // 4) First page should equal the actual requested limit
  await expect(items).toHaveCount(firstLimit);

  // 5) Trigger second page — scroll the correct element
  // If infinite scroll is on the LIST (overflow: auto), scroll the list.
  await list.evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  // If it’s on window, use the next line instead:
  // await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

  await page.waitForResponse(
    (resp) =>
      resp.url().includes("/api/tracks") && resp.request().method() === "GET",
  );
  await expect(items).toHaveCount(firstLimit * 2);

  // 6) Final page
  await list.evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  await page.waitForResponse(
    (resp) =>
      resp.url().includes("/api/tracks") && resp.request().method() === "GET",
  );
  await expect(items).toHaveCount(53);
});
test("keeps working after search change (reset + keeps infinite scroll)", async ({
  page,
}) => {
  // Big catalog so we can reach page 3
  const ALL = makeTracks(200, "tracks");

  // Capture page-1 limit
  let resolveFirstLimit!: (n: number) => void;
  const firstLimitP = new Promise<number>((r) => (resolveFirstLimit = r));

  await page.route("**/api/tracks**", async (route) => {
    const url = new URL(route.request().url());
    const pageNum = Number(url.searchParams.get("page") ?? "1");
    const limit = Number(url.searchParams.get("limit") ?? "20");
    if (pageNum === 1) resolveFirstLimit(limit);

    const qp: QueryParams = {
      search: url.searchParams.get("search") ?? undefined,
      genre: url.searchParams.get("genre") ?? undefined,
      artist: url.searchParams.get("artist") ?? undefined,
      order: (url.searchParams.get("order") as any) ?? undefined,
      sort: (url.searchParams.get("sort") as any) ?? undefined,
    };

    const filtered = filterSort(ALL, qp);
    const total = filtered.length;
    const start = (pageNum - 1) * limit;
    const slice = filtered.slice(start, start + limit);
    const totalPages = Math.max(1, Math.ceil(total / limit));

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: slice,
        meta: { total, page: pageNum, limit, totalPages } as TracksMeta,
      }),
    });
  });

  await page.goto(APP_URL);

  const firstLimit = await firstLimitP;
  const items = itemsLocator(page);

  // Page 1
  await waitForTracksGet(page);
  await expect(items).toHaveCount(firstLimit);

  // Page 2
  await scrollListOrWindow(page);
  await waitForTracksGet(page);
  await expect(items).toHaveCount(firstLimit * 2);

  // Page 3
  await scrollListOrWindow(page);
  await waitForTracksGet(page);
  await expect(items).toHaveCount(firstLimit * 3);

  // Type a search that yields a couple of pages.
  // With our factory titles "Track <i> tracks", "Track 1" matches many.
  const search = page.getByTestId("search-input");
  await search.fill("Track 1");
  // your BaseInput has debounce; just wait for the next GET
  await waitForTracksGet(page);

  // After search: should reset to page 1 of filtered set
  await expect(items).toHaveCount(firstLimit);

  // Keep scrolling -> should load next filtered page
  await scrollListOrWindow(page);
  await waitForTracksGet(page);
  await expect(items).toHaveCount(firstLimit * 2);
});

/* ========================================================================== *
   Case 2:
   While scrolling, the request fails; a toast shows the reason,
   and the page (item count) does not increase.
 * ========================================================================== */
test("invalid response on scroll shows toast-error and does not increase items", async ({
  page,
}) => {
  const ALL = makeTracks(60, "tracks"); // enough for multiple pages

  // capture page-1 limit from the real request
  let resolveFirstLimit!: (n: number) => void;
  const firstLimitP = new Promise<number>((r) => (resolveFirstLimit = r));

  // induce schema failure on page 2 by returning wrong shape
  const ERROR_PAGE = 2;

  await page.route("**/api/tracks**", async (route) => {
    const url = new URL(route.request().url());
    const pageNum = Number(url.searchParams.get("page") ?? "1");
    const limit = Number(url.searchParams.get("limit") ?? "20");
    if (pageNum === 1) resolveFirstLimit(limit);

    if (pageNum === ERROR_PAGE) {
      // Return a 200 with an invalid body to trip TracksResponseSchema
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: null, meta: null }), // <- invalid shape
      });
      return;
    }

    const qp: QueryParams = {
      search: url.searchParams.get("search") ?? undefined,
      genre: url.searchParams.get("genre") ?? undefined,
      artist: url.searchParams.get("artist") ?? undefined,
      order: (url.searchParams.get("order") as any) ?? undefined,
      sort: (url.searchParams.get("sort") as any) ?? undefined,
    };

    const filtered = filterSort(ALL, qp);
    const total = filtered.length;
    const start = (pageNum - 1) * limit;
    const slice = filtered.slice(start, start + limit);
    const totalPages = Math.max(1, Math.ceil(total / limit));

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: slice,
        meta: { total, page: pageNum, limit, totalPages } as TracksMeta,
      }),
    });
  });

  await page.goto(APP_URL);

  const firstLimit = await firstLimitP;
  const items = itemsLocator(page);

  // First page renders
  await waitForTracksGet(page);
  await expect(items).toHaveCount(firstLimit);

  // Try to load Page 2 -> we return invalid shape (schema error)
  await scrollListOrWindow(page);
  await waitForTracksGet(page); // the app did receive a response (but schema fails in client)

  // Item count MUST NOT increase
  await expect(items).toHaveCount(firstLimit);

  // Assert toast container and the red toast exist
  const toastContainer = page.getByTestId("toast-container");
  await expect(toastContainer).toBeVisible();

  const toastError = page.getByTestId("toast-error"); // parent li has this id
  await expect(toastError).toBeVisible();

  // Your app’s message includes "not supported structure" / "Invalid input"
  await expect(toastError).toContainText(
    /(not supported structure|invalid input)/i,
  );

  // Ensure no retries secretly added items
  await page.waitForTimeout(200);
  await expect(items).toHaveCount(firstLimit);
});
