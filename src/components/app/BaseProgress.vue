<script setup lang="ts">
withDefaults(
  defineProps<{
    infinite?: boolean;
    width?: number;
    color?: "default" | "red" | "yellow" | "green";
  }>(),
  { color: "default" },
);
</script>

<template>
  <div class="w-full overflow-hidden rounded-md bg-transparent h-1">
    <div
      class="h-full"
      :class="[
        infinite && 'animate-indeterminate-bar',
        color === 'green' && 'bg-green-400',
        color === 'default' && 'bg-black',
        color === 'yellow' && 'bg-yellow-400',
        color === 'red' && 'bg-red-400',
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
