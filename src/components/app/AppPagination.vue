<script setup lang="ts">
defineProps<{
  totalPages: number;
}>();

const currentPage = defineModel<number>({ default: 1 });
</script>

<template>
  <div class="grid grid-cols-2 gap-4">
    <button
      v-if="currentPage !== 1"
      class="col-start-1 bg-gray-500"
      @click="currentPage--"
    >
      -
    </button>
    <button
      v-if="currentPage < totalPages"
      class="col-start-2 bg-gray-500"
      @click="currentPage++"
    >
      +
    </button>
  </div>
</template>
