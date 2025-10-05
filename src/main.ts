import "./assets/app.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import { VueQueryPlugin } from "@tanstack/vue-query";

const pinia = createPinia();
createApp(App).use(pinia).use(VueQueryPlugin).mount("#app");
