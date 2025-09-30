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

test("infinite scroll over tracks (frontend-only, deterministic)", async ({
  page,
}) => {
  const ALL = makeTracks(53, "tracks");

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

  await page.waitForResponse(
    (resp) =>
      resp.url().includes("/api/tracks") && resp.request().method() === "GET",
  );

  const list = page.getByTestId("tracks-list");

  let items = list.locator(":scope > [data-track-id]");
  if ((await items.count()) === 0) {
    items = list.locator("[data-track-id]");
  }

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

  await expect(items).toHaveCount(firstLimit);

  await list.evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });

  await page.waitForResponse(
    (resp) =>
      resp.url().includes("/api/tracks") && resp.request().method() === "GET",
  );
  await expect(items).toHaveCount(firstLimit * 2);

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
  const ALL = makeTracks(200, "tracks");

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

  await waitForTracksGet(page);
  await expect(items).toHaveCount(firstLimit);

  await scrollListOrWindow(page);
  await waitForTracksGet(page);
  await expect(items).toHaveCount(firstLimit * 2);

  await scrollListOrWindow(page);
  await waitForTracksGet(page);
  await expect(items).toHaveCount(firstLimit * 3);

  const search = page.getByTestId("search-input");
  await search.fill("Track 1");
  await waitForTracksGet(page);

  await expect(items).toHaveCount(firstLimit);

  await scrollListOrWindow(page);
  await waitForTracksGet(page);
  await expect(items).toHaveCount(firstLimit * 2);
});

test("invalid response on scroll shows toast-error and does not increase items", async ({
  page,
}) => {
  const ALL = makeTracks(60, "tracks");

  let resolveFirstLimit!: (n: number) => void;
  const firstLimitP = new Promise<number>((r) => (resolveFirstLimit = r));

  const ERROR_PAGE = 2;

  await page.route("**/api/tracks**", async (route) => {
    const url = new URL(route.request().url());
    const pageNum = Number(url.searchParams.get("page") ?? "1");
    const limit = Number(url.searchParams.get("limit") ?? "20");
    if (pageNum === 1) resolveFirstLimit(limit);

    if (pageNum === ERROR_PAGE) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: null, meta: null }),
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

  await waitForTracksGet(page);
  await expect(items).toHaveCount(firstLimit);

  await scrollListOrWindow(page);
  await waitForTracksGet(page);

  await expect(items).toHaveCount(firstLimit);

  const toastContainer = page.getByTestId("toast-container");
  await expect(toastContainer).toBeVisible();

  const toastError = page.getByTestId("toast-error");
  await expect(toastError).toBeVisible();

  await expect(toastError).toContainText(
    /(not supported structure|invalid input)/i,
  );

  await page.waitForTimeout(200);
  await expect(items).toHaveCount(firstLimit);
});
