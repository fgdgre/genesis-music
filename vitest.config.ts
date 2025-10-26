import { defineVitestConfig } from "@nuxt/test-utils/config";
import { fileURLToPath } from "node:url";

export default defineVitestConfig({
  test: {
    environment: "nuxt",
    globals: true,
    pool: "forks",
    dir: "./app/tests/unit",
    include: ["**/*.test.ts"],
    environmentOptions: {
      nuxt: {
        rootDir: fileURLToPath(new URL("./", import.meta.url)),
      },
    },
  },
});
