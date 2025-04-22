<script setup lang="ts">
import AppLoader from "./AppLoader.vue";

defineProps<{
  title: string;
  isLoading: boolean;
}>();
</script>

<template>
  <div class="min-h-15 p-4 border-b border-gray-300 relative">
    <h1 class="text-xl">{{ title }}</h1>

    <AppLoader v-if="isLoading" class="absolute bottom-0 left-0" />
  </div>
</template>
