<script setup lang="ts">
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
    <button
      class="bg-black rounded-md text-white px-4 py-2"
      @click="$emit('refetch')"
    >
      Refetch
    </button>
  </div>
</template>
