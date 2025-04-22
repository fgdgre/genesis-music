<script setup lang="ts">
import BaseButton from "../BaseButton.vue";

defineProps<{
  totalPages: number;
}>();

const currentPage = defineModel<number>({ default: 1 });
</script>

<template>
  <div class="grid grid-cols-2 gap-4">
    <BaseButton
      v-if="currentPage !== 1"
      class="w-full col-start-1"
      @click="currentPage--"
    >
      -
    </BaseButton>
    <BaseButton
      v-if="currentPage < totalPages"
      class="w-full col-start-2"
      @click="currentPage++"
    >
      +
    </BaseButton>
  </div>
</template>
