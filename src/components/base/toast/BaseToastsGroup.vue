<template>
  <Teleport to="body">
    <TransitionGroup
      tag="ul"
      name="toasts"
      class="fixed top-[14px] right-[14px] w-[calc(100%-32px)] max-w-[420px] z-20"
    >
      <li
        v-for="toast in toasts"
        :key="toast.id"
        class="w-full [&:not(:first-child)]:mt-[10px]"
      >
        <BaseToast
          :title="toast.title"
          :description="toast.description"
          :icon="toast.icon"
          :color="toast.color"
          :duration="toast.duration"
          :show-progress="toast.showProgress"
          @close="closeToast(toast.id)"
        />
      </li>
    </TransitionGroup>
  </Teleport>
</template>

<script setup lang="ts">
import { TransitionGroup } from "vue";
import type { Toast } from "@/types";
import BaseToast from "./BaseToast.vue";

defineProps<{
  toasts: Toast[];
}>();

const emit = defineEmits<{
  closeToast: [id: string];
}>();

const closeToast = (id: string) => {
  emit("closeToast", id);
};
</script>

<style>
.toasts-move,
.toasts-leave-active,
.toasts-enter-active {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}

.toasts-enter-from,
.toasts-leave-to {
  opacity: 0;
  transform: translate(0, -30px);
}

.toasts-leave-active {
  position: absolute;
}
</style>
