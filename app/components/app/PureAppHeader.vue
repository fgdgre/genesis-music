<script setup lang="ts">
import BaseProgress from "./BaseProgress.vue";

defineProps<{
  title: string;
  isLoading: boolean;
}>();
</script>

<template>
  <div class="min-h-15 p-4 relative shadow-sm">
    <div class="flex items-center justify-between">
      <h1 class="text-xl" data-testid="tracks-header">{{ title }}</h1>

      <slot name="action" />
    </div>
    <BaseProgress
      v-if="isLoading"
      infinite
      class="absolute bottom-0 left-0"
      data-testid="loading-indicator"
      :data-loading="true"
    />
  </div>
</template>
