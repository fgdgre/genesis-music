// vite.config.ts
import { fileURLToPath, URL } from "node:url";
// ⬇️ use Vitest’s helpers here
import { defineConfig, configDefaults } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [vue(), vueDevTools(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: { port: 3000 },

  // Vitest config
  test: {
    dir: "./tests",
    include: ["**/*.{test,spec}.{ts,tsx,js,jsx}"],
    exclude: [...configDefaults.exclude, "playwright/**", "e2e/**", "dist/**"],
    environment: "jsdom",
    globals: true,
    css: true,
    // setupFiles: ["./tests/setup.ts"],
  },
});
