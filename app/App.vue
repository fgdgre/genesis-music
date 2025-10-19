<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useToast } from "./stores/toast";

const store = useToast();
const { toasts } = storeToRefs(store);
</script>

<template>
  <div class="flex flex-col h-full max-h-[100svh] w-full overflow-hidden">
    <!-- TODO: maybe also refactor to pure component and smart wrapper for make app.vue as simple as possible -->
    <BaseToastsGroup :toasts @close-toast="(id) => store.removeToast(id)" />

    <div class="flex flex-col flex-1 overflow-hidden max-h-full m-2">
      <AppHeader />

      <div
        class="grid grid-cols-[1fr_auto] grid-rows-[1fr_auto] w-full overflow-hidden flex-1"
      >
        <NuxtPage />

        <QueueList class="ml-2" />

        <TracksPlayer class="row-start-2 col-span-full" />
      </div>
    </div>
  </div>
</template>
