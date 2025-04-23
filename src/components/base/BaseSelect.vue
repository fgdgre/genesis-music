<template>
  <DropdownMenuRoot v-model:open="isDropdownOpen" :modal="false">
    <div class="h-min" data-testid="dropdown-menu-wrapper" v-bind="$attrs">
      <p
        v-if="label"
        class="flex text-sm font-medium leading-none text-foreground select-none mb-1"
        :class="[Boolean(errorMessage) && 'text-red-400']"
      >
        {{ label }}
      </p>

      <DropdownMenuTrigger
        class="w-full px-3 py-1 flex items-center justify-between border rounded-md select-none text-sm gap-2 min-w-[75px] cursor-pointer overflow-hidden focus-visible:outline-none focus-visible:ring focus-visible:ring-black h-9"
        :class="[
          Boolean(errorMessage) &&
            'border-red-400 text-red-400 placeholder:text-red-400/70 focus-visible:ring-red-400',
          disabled && 'opacity-70',
        ]"
        :disabled
        :aria-invalid="Boolean(errorMessage)"
        :aria-describedby="errorMessage"
        data-testid="dropdown-menu-trigger"
        @click="isDropdownOpen = !isDropdownOpen"
      >
        <div
          v-if="placeholder && !selected"
          data-testid="multiselect-placeholder"
          class="text-gray-400 flex gap-2"
          :class="[Boolean(errorMessage) && 'text-red-300']"
        >
          <p>{{ placeholder }}</p>
        </div>

        <div
          v-if="selected"
          class="flex items-center gap-2 text-foreground overflow-hidden flex-1"
          data-testid="multiselect-selected-item"
        >
          {{ currentItem?.label }}

          <BaseButton
            @click.stop="clearSelectedItem"
            transparent
            class="w-min h-min !p-0.5 ml-auto"
          >
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
        </div>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-5 p-0.5 transition-transform shrink-0 ml-auto"
          :class="[isDropdownOpen ? 'rotate-[-180deg]' : 'rotate-0']"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m19.5 8.25-7.5 7.5-7.5-7.5"
          />
        </svg>
      </DropdownMenuTrigger>

      <p
        v-if="errorMessage"
        class="text-red-400 text-xs mt-1"
        data-testid="multiselect-error-message"
      >
        {{ errorMessage }}
      </p>

      <DropdownMenuPortal>
        <DropdownMenuContent
          @interact-outside="(e) => $emit('blur', e)"
          :side-offset="5"
          class="flex flex-col bg-modal shadow-sm text-foreground border border-border rounded-md select-none p-1 z-40 bg-white w-[var(--radix-dropdown-menu-trigger-width)] min-w-max max-h-[150px] overflow-auto"
          :class="isLoading && 'p-0'"
          data-testid="dropdown-menu-content"
        >
          <template v-if="!(isEmpty || isLoading)">
            <DropdownMenuItem
              v-for="(item, i) in items"
              :key="item.label"
              :data-testid="'dropdown-menu-item' + '-' + i"
              class="[&:not(:first-child)]:mt-1 flex items-center text-sm rounded-md cursor-pointer w-full text-foreground px-2 py-1.5 gap-2 select-none hover:bg-gray-200"
              @click="selectItem(item)"
            >
              <div class="flex items-center gap-3">
                <p>
                  {{ item.label }}
                </p>
              </div>

              <div
                v-if="currentItem?.value === item.value"
                class="flex items-center justify-center min-w-4 ml-auto"
              >
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
                    d="m4.5 12.75 6 6 9-13.5"
                  />
                </svg>
              </div>
            </DropdownMenuItem>
          </template>
          <template v-else>
            <div
              v-if="isEmpty"
              class="flex items-center justify-center gap-2 text-center p-3 flex-1 text-sm"
            >
              {{ emptyMessage || "No items" }}
            </div>

            <div
              v-if="isLoading"
              class="flex items-center justify-center gap-2 text-center p-3 flex-1 text-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="animate-spin text-inherit size-4"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              {{ loadingMessage || "Loading items" }}
            </div>
          </template>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </div>
  </DropdownMenuRoot>
</template>

<script lang="ts" setup>
import type { DropdownItem } from "@/types";
import { computed, ref } from "vue";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from "radix-vue";
import BaseButton from "./BaseButton.vue";

const props = defineProps<{
  label?: string;
  items?: DropdownItem[];
  placeholder?: string;
  isLoading?: boolean;
  loadingMessage?: string;
  disabled?: boolean;
  errorMessage?: string;
  menuStretch?: boolean;
  emptyMessage?: string;
  isEmpty?: boolean;
}>();

defineEmits<{
  "update:modelValue": [string];
  blur: [Event];
}>();

const selected = defineModel<string>();

const clearSelectedItem = () => {
  isDropdownOpen.value = false;
  selected.value = "";
};

const currentItem = computed(() =>
  props.items?.find((i) => i.value === selected.value),
);

const isDropdownOpen = ref(false);

const selectItem = (item: DropdownItem) => {
  isDropdownOpen.value = false;
  selected.value = item.value;
};
</script>

<style scoped>
:deep(div[data-radix-menu-content][data-state="open"]) {
  animation: dropdownAppear 0.15s ease;
}

@keyframes dropdownAppear {
  0% {
    opacity: 0.5;
    transform: scale(0.9);
  }

  100% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
