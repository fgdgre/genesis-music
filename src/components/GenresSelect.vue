<script setup lang="ts">
import { ref, watchEffect } from "vue";
import BaseSelect from "./base/BaseSelect.vue";
import { useFetchGenres } from "@/composables/useFetchGenres";
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

defineEmits<{
  "update:modelValue": [string[]];
  blur: [Event];
}>();

const genres = defineModel<string>({ required: true });

const { genres: genresItems, isLoading } = useFetchGenres();

const trackGenresItems = ref<DropdownItem[]>([]);

watchEffect(() => {
  if (genresItems.value) {
    trackGenresItems.value = genresItems.value.map((genre: string) => ({
      label: genre,
      value: genre.toLowerCase(),
    }));
  }
});
</script>

<template>
  <BaseSelect
    :items="trackGenresItems"
    v-model="genres"
    @update:modelValue="(v) => $emit('update:modelValue', v)"
    @blur="(e) => $emit('blur', e)"
    :error-message="errorMessage"
    :empty-message="emptyMessage"
    :is-loading="isLoading"
    :is-empty="trackGenresItems?.length === 0 && !isLoading"
    :label
    :placeholder
    :trigger-testid
    :error-message-testid
  />
</template>
