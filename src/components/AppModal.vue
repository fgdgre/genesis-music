<script setup lang="ts">
import BaseButton from "./base/BaseButton.vue";

defineProps<{
  title?: string;
}>();

defineEmits<{
  close: [];
}>();
</script>

<template>
  <div
    class="fixed top-0 left-0 w-full h-full bg-black/50 z-30"
    @click="$emit('close')"
  ></div>

  <div
    class="fixed top-[50%] translate-y-[-50%] left-[50%] translate-x-[-50%] w-full h-full flex items-center justify-center z-30"
  >
    <div
      class="flex flex-col max-w-[400px] max-h-[500px] bg-white rounded-md p-4 gap-4"
    >
      <p class="text-lg">
        {{ title }}
      </p>

      <div>
        <slot></slot>
      </div>

      <div class="flex gap-4" v-if="$slots.actions">
        <slot name="actions"></slot>
      </div>
    </div>
  </div>
</template>
