<script setup lang="ts">
import BaseButton from "../base/BaseButton.vue";

defineProps<{
  errorMessage?: string;
  isLoading?: boolean;
}>();

defineEmits<{
  refetch: [];
}>();
</script>

<template>
  <div class="flex flex-col gap-4 justify-center items-center h-full">
    <p class="text-error">{{ errorMessage || "Something went wrong" }}</p>
    <BaseButton @click="$emit('refetch')" :isLoading> Refetch </BaseButton>
  </div>
</template>
