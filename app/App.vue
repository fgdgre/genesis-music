<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useToast } from "./stores/toast";

const store = useToast();
const { toasts } = storeToRefs(store);
</script>

<template>
  <div>
    <NuxtPage />

    <BaseToastsGroup :toasts @close-toast="(id) => store.removeToast(id)" />
    <TracksPlayer />
  </div>
</template>
