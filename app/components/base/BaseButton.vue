<script setup lang="ts">
withDefaults(
  defineProps<{
    color?: "red" | "black" | "yellow" | "green" | "orange" | "gray";
    disabled?: boolean;
    transparent?: boolean;
    type?: "button" | "submit";
    isLoading?: boolean;
    square?: boolean;
  }>(),
  {
    type: "button",
    color: "black",
  }
);

defineEmits<{
  click: [Event];
}>();
</script>

<template>
  <button
    class="flex gap-x-[5px] items-center justify-center rounded-md w-fit select-none transition-colors pointer-events-auto font-medium text-sm cursor-pointer h-9"
    :class="[
      color === 'red' && 'bg-red-400 text-[#18181b] hover:bg-red-400/80',
      color === 'orange' && 'bg-orange-400 text-black hover:bg-orange-400/80',
      color === 'black' && 'bg-black text-white hover:bg-black/80',
      color === 'yellow' && 'bg-yellow-400 text-black hover:bg-yellow-400/80',
      color === 'green' && 'bg-green-400 text-black hover:bg-green-400/80',
      color === 'gray' && 'bg-gray-500 text-white hover:bg-gray-400/80',
      transparent && 'bg-transparent !text-black hover:bg-transparent',
      square ? 'p-2' : 'px-4 py-2',
      (disabled || isLoading) && 'opacity-70',
    ]"
    :disabled="disabled || isLoading"
    :aria-disabled="disabled || isLoading"
    :type
    @click="(e) => $emit('click', e)"
  >
    <svg
      v-if="isLoading"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="animate-spin text-inherit"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>

    <slot />
  </button>
</template>
