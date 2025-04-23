<script setup lang="ts">
import BaseButton from "../base/BaseButton.vue";

defineProps<{
  totalPages: number;
  isLoading: boolean;
}>();

const currentPage = defineModel<number>({ default: 1 });
</script>

<template>
  <div class="grid grid-cols-2 gap-4" data-testid="pagination">
    <BaseButton
      v-if="currentPage !== 1"
      class="w-full col-start-1"
      @click="currentPage--"
      data-testid="pagination-next"
      :disabled="isLoading"
    >
      -
    </BaseButton>
    <BaseButton
      v-if="currentPage < totalPages"
      class="w-full col-start-2"
      @click="currentPage++"
      data-testid="pagination-prev"
      :disabled="isLoading"
    >
      +
    </BaseButton>
  </div>
</template>
