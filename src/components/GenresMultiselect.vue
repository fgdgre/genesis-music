<script setup lang="ts">
import BaseMultiselect from "./base/BaseMultiselect.vue";
import { useQuery } from "@tanstack/vue-query";
import { genresOptions } from "@/entities/genres";

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
  "update:modelValue": string[];
  blur: [Event];
}>();

const genres = defineModel<string[]>({ required: true });

const { data: genresItems, isLoading } = useQuery(genresOptions());
</script>

<template>
  <BaseMultiselect
    :items="genresItems"
    v-model="genres"
    @blur="(e) => $emit('blur', e)"
    :error-message="errorMessage"
    :empty-message="emptyMessage"
    :is-empty="genresItems?.length === 0 && !isLoading"
    :label
    :placeholder
    :trigger-testid
    :error-message-testid
    :is-loading
  />
</template>
