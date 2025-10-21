<script setup lang="ts">
import { useTimestamp } from "@vueuse/core";
import { computed } from "vue";
import BaseButton from "../BaseButton.vue";
import BaseProgress from "@/components/app/BaseProgress.vue";

const props = defineProps<{
  title: string;
  description?: string;
  icon?: "check" | "warning";
  color?: "default" | "error" | "secondary" | "success";
  closable?: boolean;
  duration?: number;
  showProgress?: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const currentTimestamp = useTimestamp();
const startTime = currentTimestamp.value;

if (props.duration) {
  setTimeout(() => {
    emit("close");
  }, props.duration);
}

const width = computed(() => {
  const elapsed = currentTimestamp.value - startTime;
  const progress = Math.max(0, 1 - elapsed / (props.duration! - 100));
  return progress * 100;
});
</script>

<template>
  <div
    class="items-start w-full rounded-lg border p-4 border-gray-300 gap-x-[10px] shadow-sm relative overflow-hidden"
    :class="[
      Boolean(icon) ? 'icon-toast-message-layout' : 'toast-message-layout',
      color === 'error' ? 'bg-error' : 'bg-white',
    ]"
    data-testid="toast-item"
  >
    <div v-if="icon">
      <svg
        v-if="icon === 'check'"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="size-6"
        :class="[color === 'success' ? 'text-success' : 'text-black']"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="m4.5 12.75 6 6 9-13.5"
        />
      </svg>

      <svg
        v-if="icon === 'warning'"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="size-6"
        :class="[color === 'success' ? 'text-success' : 'text-black']"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
        />
      </svg>
    </div>

    <h5 class="font-medium tracking-tight text-sm text-black">
      {{ title }}
    </h5>

    <BaseButton transparent class="!p-0.5 w-fit h-fit" @click="$emit('close')">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="size-4"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M6 18 18 6M6 6l12 12"
        />
      </svg>
    </BaseButton>

    <p
      v-if="description"
      class="text-sm col-end-[-1] row-start-2 text-black"
      :class="[Boolean(icon) ? 'col-start-2' : 'col-start-1']"
    >
      {{ description }}
    </p>
    <BaseProgress
      v-if="duration && showProgress"
      :width
      :color
      class="absolute bottom-0"
    />
  </div>
</template>

<style>
.toast-message-layout {
  display: grid;
  grid-template-columns: 1fr auto;
}
.icon-toast-message-layout {
  display: grid;
  grid-template-columns: auto 1fr auto;
}
</style>
