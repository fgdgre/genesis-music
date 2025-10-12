<script setup lang="ts">
import { ref, watchEffect } from "vue";
import BaseSelect from "./base/BaseSelect.vue";
import { fetchGenresAPI } from "@/entities/genres";
import type { DropdownItem } from "@/types";

defineProps<{
  label?: string;
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
  errorMessage?: string;
  emptyMessage?: string;
  triggerTestid?: string;
  errorMessageTestid?: string;
}>();

const emit = defineEmits<{
  select: string;
  "update:modelValue": string;
  blur: [Event];
}>();

const genre = defineModel<string>({ required: true });

const { data: genresItems } = await fetchGenresAPI();

const trackGenresItems = ref<DropdownItem[]>([]);

watchEffect(() => {
  if (genresItems) {
    trackGenresItems.value = genresItems.map((genre: string) => ({
      label: genre,
      value: genre.toLowerCase(),
    }));
  }
});
</script>

<template>
  <!-- :is-loading="isLoading" -->
  <!-- :is-empty="trackGenresItems?.length === 0 && !isLoading" -->
  <BaseSelect
    :items="trackGenresItems"
    v-model="genre"
    @blur="(e) => $emit('blur', e)"
    :error-message="errorMessage"
    :empty-message="emptyMessage"
    :is-empty="trackGenresItems?.length === 0"
    :label
    :placeholder
    :trigger-testid
    :error-message-testid
  />
</template>
