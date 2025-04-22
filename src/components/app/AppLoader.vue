<script setup lang="ts"></script>
<template>
  <div
    data-testid="supa-progress"
    class="w-full overflow-hidden rounded-md bg-transparent h-1"
  >
    <div class="h-full bg-black animate-indeterminate-bar" />
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
