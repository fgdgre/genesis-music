<script setup lang="ts">
import { onMounted, onUnmounted, useTemplateRef } from "vue";

const emit = defineEmits<{
  click: [Event];
  inViewport: [];
}>();

const fetchMoreButtonRef = useTemplateRef("fetchMoreButton");

const handleCheckVisibility = (
  entries: IntersectionObserverEntry[],
  observer: IntersectionObserver,
) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      emit("inViewport");
    }
  }
};

const observer = new IntersectionObserver(handleCheckVisibility, {
  root: null,
  threshold: 0,
});

onMounted(() => {
  if (!fetchMoreButtonRef.value) return;
  observer.observe(fetchMoreButtonRef.value);
});

onUnmounted(() => {
  observer.disconnect();
});
</script>

<template>
  <button
    @click="(e) => $emit('click', e)"
    class="mx-auto mt-5 bg-black rounded-md text-white select-none px-4 py-2 disabled:opacity-50 cursor-pointer"
    ref="fetchMoreButton"
  >
    Fetch more
  </button>
</template>
