import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "src/tests/e2e",
  testMatch: "/**/*.test.ts",
  outputDir: "./tests/e2e/test-results",
  fullyParallel: true,
  use: {
    baseURL: "http://localhost:3000",
    deviceScaleFactor: 5,
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
  },
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
});
