import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  ssr: false,
  modules: ["@nuxt/icon", "@vueuse/nuxt", "nuxt-lodash", "@pinia/nuxt", "@nuxt/test-utils/module"],
  css: ["~/assets/app.css"],

  vite: {
    plugins: [tailwindcss()],
  },

  components: [
    {
      path: "~/components/base",
      pathPrefix: false,
      global: true,
      extensions: [".vue"],
    },
    {
      path: "~/components/app",
      pathPrefix: false,
      global: true,
      extensions: [".vue"],
    },
    {
      path: "~/components",
      pathPrefix: false,
      global: true,
      extensions: [".vue"],
    },
  ],

  icon: {
    mode: "svg",
  },

  lodash: {
    prefix: "_",
    prefixSkip: [],
    upperAfterPrefix: false,
  },
});