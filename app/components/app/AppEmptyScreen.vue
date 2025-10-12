<script setup lang="ts">
import BaseButton from "../base/BaseButton.vue";

defineProps<{
  message?: string;
}>();

defineEmits<{
  createTrack: [];
}>();
</script>

<template>
  <div class="flex flex-col gap-4 justify-center items-center h-full">
    <p>{{ message || "Looks like you don't have tracks" }}</p>
    <BaseButton @click="$emit('createTrack')"> Add track </BaseButton>
  </div>
</template>
