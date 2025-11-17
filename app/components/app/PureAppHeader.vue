<script setup lang="ts">
import BaseProgress from "./BaseProgress.vue";

defineProps<{
  title: string;
  isLoading: boolean;
  back?: string;
}>();
</script>

<template>
  <div class="min-h-15 p-2 relative shadow-sm">
    <div
      class="grid grid-cols-[0.5fr_1fr_0.5fr] min-md:grid-cols-[0.3fr_1fr_0.3fr] items-center h-full"
    >
      <div v-if="back">
        <NuxtLink :to="back" class="flex items-center gap-2 text-placeholder">
          <Icon name="heroicons:chevron-left" />
          Back
        </NuxtLink>
      </div>
      <!-- :class="[back ? 'mx-auto' : 'min-md:mx-auto']" -->
      <h1 class="text-xl col-start-2 mx-auto" data-testid="tracks-header">
        {{ title }}
      </h1>

      <div class="col-start-3 place-items-end">
        <slot name="action" />
      </div>
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
