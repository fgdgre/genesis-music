<script setup lang="ts">
defineProps<{
  trackDuration: number;
  currentTime: number;
}>();

defineEmits<{
  timeStartsChange: [number];
  timeEndChange: [number];
}>();
</script>

<template>
  <div class="flex h-1 w-full">
    <input
      type="range"
      class="flex-1 [&::-webkit-slider-thumb]:scale-0 h-1 w-full"
      tabindex="-1"
      :max="trackDuration"
      :value="currentTime"
      @pointerdown="(e) => $emit('timeStartsChange', parseFloat((e.target as HTMLInputElement).value))"
      @pointerup="(e) => $emit('timeEndChange', parseFloat((e.target as HTMLInputElement).value))"
      @click.stop
    />
  </div>
</template>
