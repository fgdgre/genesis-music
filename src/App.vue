<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useToast } from "./stores/toast";
import BaseToastsGroup from "./components/base/toast/BaseToastsGroup.vue";
import TracksPage from "./components/TracksPage.vue";
import { VueQueryDevtools } from "@tanstack/vue-query-devtools";

const store = useToast();
const { toasts } = storeToRefs(store);
</script>

<template>
  <!-- <Suspense> -->
  <VueQueryDevtools />

  <!-- <div> -->
  <TracksPage />

  <BaseToastsGroup :toasts @close-toast="(id) => store.removeToast(id)" />
  <!-- </div> -->
  <!-- </Suspense> -->
</template>
