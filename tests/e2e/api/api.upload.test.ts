import { expect } from "@playwright/test";
import { test, intercept } from "../helpers/net";

test.describe("@p0 API: audio upload", () => {
  test("@p0 FormData: browser sets boundary (no manual Content-Type)", async ({ page }) => {
    let contentType: string | undefined;

    await intercept(page, /\/api\/tracks\/([^/]+)\/upload$/, async (route) => {
      contentType = route.request().headers()["content-type"];
      // return success
      await route.fulfill({ status: 201, body: JSON.stringify({ ok: true }) });
    });

    await page.goto("/tracks/new");
    // trigger create track first (if your UI requires the track id before upload)
    // ... or navigate to a track detail page where upload is available

    // choose a file (make sure you include a small mp3 under tests/fixtures/sample.mp3)
    await page.setInputFiles('input[type="file"][accept^="audio"]', "tests/fixtures/sample.mp3");

    // expect browser multipart boundary header
    expect(contentType).toMatch(/^multipart\/form-data; boundary=/);
  });

  test("@p0 server 500 during upload → error toast and no cache pollution", async ({ page }) => {
    await intercept(page, /\/api\/tracks\?page=1/, async (route) => {
      await route.fulfill({ status: 200, body: JSON.stringify({ items: [{ id: "t1", title: "T1" }], total: 1 }) });
    });
    await intercept(page, /\/api\/tracks\/t1\/upload$/, async (route) => {
      await route.fulfill({ status: 500, body: JSON.stringify({ error: "upload failed", statusCode: 500, message: "upload failed" }) });
    });

    await page.goto("/");
    await page.getByRole("row", { name: /T1/ }).getByTestId("upload-audio").click();
    await page.setInputFiles('input[type="file"][accept^="audio"]', "tests/fixtures/sample.mp3");

    await expect(page.getByTestId("toast")).toContainText(/upload failed/i);

    // listing should still be fine (no bad cache entry)
    await expect(page.getByText("T1")).toBeVisible();
  });
});
