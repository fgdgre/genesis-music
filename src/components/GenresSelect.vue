<script setup lang="ts">
import { fetchGenresAPI } from "@/api";
import { ref, watchEffect } from "vue";
import BaseSelect from "./base/BaseSelect.vue";

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
  <BaseSelect
    :items="trackGenresItems"
    v-model="genres"
    @update:modelValue="(v) => $emit('update:modelValue', v)"
    @blur="(e) => $emit('blur', e)"
    :error-message="errorMessage"
    :is-loading="isLoading"
    :is-empty="trackGenresItems?.length === 0 && !isLoading"
    :label
    :placeholder
    :trigger-testid
    :error-message-testid
  />
</template>
