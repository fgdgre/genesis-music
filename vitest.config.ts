import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "~": fileURLToPath(new URL("./app", import.meta.url)),
      "@": fileURLToPath(new URL("./app", import.meta.url)),
      "~~": fileURLToPath(new URL(".", import.meta.url)),
      "@@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  server: { port: 3000 },
  test: {
    dir: "./app/tests/unit",
    include: ["**/*.test.ts"],
    environment: "jsdom",
    globals: true,
    css: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      reportsDirectory: "coverage",
    },
  },
});
