<script setup lang="ts">
import BaseButton from "../base/BaseButton.vue";

defineProps<{
  errorMessage?: string;
}>();

defineEmits<{
  refetch: [];
}>();
</script>

<template>
  <div class="flex flex-col gap-4 justify-center items-center h-full">
    <p class="text-red-400">{{ errorMessage || "Something went wrong" }}</p>
    <BaseButton @click="$emit('refetch')"> Refetch </BaseButton>
  </div>
</template>
