import { test as base } from "@playwright/test";

export type Json = Record<string, any> | any[];

export async function fulfillJson(route, { status = 200, headers = {}, body = {} as Json, delayMs = 0 }) {
  if (delayMs) await new Promise((r) => setTimeout(r, delayMs));
  await route.fulfill({
    status,
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

export function onceCounter() {
  let n = 0;
  return {
    hit: () => ++n,
    get: () => n,
    reset: () => (n = 0),
  };
}

export async function intercept(page, url: RegExp | string, handler: Parameters<typeof page.route>[1]) {
  await page.route(url, handler);
}

export const test = base.extend<{}>({
  // room for per-test fixtures later (auth storageState, etc.)
});
