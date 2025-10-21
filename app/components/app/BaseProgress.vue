<script setup lang="ts">
withDefaults(
  defineProps<{
    infinite?: boolean;
    width?: number;
    color?: "default" | "error" | "secondary" | "success";
  }>(),
  { color: "default" }
);
</script>

<template>
  <div class="w-full overflow-hidden rounded-md bg-transparent h-1">
    <div
      class="h-full"
      :class="[
        infinite && 'animate-indeterminate-bar',
        color === 'success' && 'bg-success',
        color === 'default' && 'bg-black',
        color === 'secondary' && 'bg-secondary',
        color === 'error' && 'bg-error',
      ]"
      :style="{ width: !infinite ? `${width ? width : 0}%` : 'auto' }"
    />
  </div>
</template>

<style>
.animate-indeterminate-bar {
  animation: indeterminate-bar 1.5s cubic-bezier(0.65, 0.815, 0.735, 0.395)
    infinite normal none running;
}

@keyframes indeterminate-bar {
  0% {
    transform: translateX(-50%) scaleX(0.2);
  }

  100% {
    transform: translateX(100%) scaleX(1);
  }
}
</style>
