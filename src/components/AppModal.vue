<script setup lang="ts">
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
    <div class="p-4 flex gap-4 justify-between">
      <p>
        {{ title }}
      </p>
      <button @click="$emit('close')" class="p-4">x</button>
    </div>

    <div class="max-w-[400px] max-h-[500px] bg-white rounded-md p-4">
      <slot></slot>
    </div>

    <div class="p-4 flex gap-4">
      <slot name="actions"></slot>
    </div>
  </div>
</template>
