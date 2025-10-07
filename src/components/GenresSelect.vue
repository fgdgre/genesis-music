<script setup lang="ts">
import { genresOptions } from "@/entities/genres";
import BaseSelect from "./base/BaseSelect.vue";
import { useQuery } from "@tanstack/vue-query";

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

const { data: genresItems, isLoading } = useQuery(genresOptions());
</script>

<template>
  <BaseSelect
    :items="genresItems"
    v-model="genre"
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
