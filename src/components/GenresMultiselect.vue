<script setup lang="ts">
import type { DropdownItem } from "@/types";
import BaseMultiselect from "./base/BaseMultiselect.vue";
import { fetchGenresAPI } from "@/api";
import { ref, watchEffect } from "vue";

defineProps<{
  label?: string;
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
  errorMessage?: string;
  emptyMessage?: string;
}>();

defineEmits<{
  "update:modelValue": [string[]];
  blur: [Event];
}>();

const genres = defineModel<string[]>({ required: true });

const trackGenresItems = ref([]);
const isLoading = ref(false);

const fetchTackGenres = async () => {
  try {
    isLoading.value = true;

    const { data: genres } = await fetchGenresAPI();

    trackGenresItems.value = genres?.map((genre: string) => ({
      label: genre,
      value: genre.toLowerCase(),
    }));
  } finally {
    isLoading.value = false;
  }
};

watchEffect(() => {
  fetchTackGenres();
});
</script>

<template>
  <BaseMultiselect
    :items="trackGenresItems"
    v-model="genres"
    @update:modelValue="(v) => $emit('update:modelValue', v)"
    @blur="(e) => $emit('blur', e)"
    :error-message="errorMessage"
    :empty-message="emptyMessage"
    :is-empty="trackGenresItems?.length === 0 && !isLoading"
    :is-loading="isLoading"
    :label
    :placeholder
  />
</template>
