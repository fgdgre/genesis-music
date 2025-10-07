import "./assets/app.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";

import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const pinia = createPinia();
createApp(App).use(pinia).use(VueQueryPlugin, { queryClient }).mount("#app");
