<script setup lang="ts">
import { useId, useTemplateRef, onMounted } from "vue";

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<{
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  isLoading?: boolean;
  errorMessage?: string;
  modelValue?: string | number;
  errorMessageTestid?: string;
  withDebounce?: boolean;
  autoFocus?: boolean;
}>();

const emit = defineEmits<{
  focus: [Event];
  blur: [Event];
  click: [Event];
  "update:modelValue": [string];
}>();

let debounceTimeout: any;

const updateModelValue = (value: string) => {
  if (props.withDebounce) {
    clearTimeout(debounceTimeout);

    debounceTimeout = setTimeout(() => {
      emit("update:modelValue", value);
    }, 300);
  } else {
    emit("update:modelValue", value);
  }
};

const id = useId();

const inputFieldRef = useTemplateRef("inputFieldRef");

defineExpose({
  inputFieldRef,
});

onMounted(() => {
  if (inputFieldRef.value && props.autoFocus) {
    inputFieldRef.value.focus();
  }
});
</script>

<template>
  <div
    class="flex flex-col relative w-full"
    :class="[disabled && 'opacity-70 select-none']"
  >
    <label
      v-if="label"
      :for="id"
      class="flex text-sm font-medium leading-none text-foreground select-none mb-1"
      :class="[Boolean(errorMessage) && 'text-red-400']"
    >
      {{ label }}
    </label>

    <input
      :id
      :aria-invalid="Boolean(errorMessage)"
      :aria-describedby="errorMessage"
      data-control
      v-bind="$attrs"
      class="px-3 py-1 bg-transparent rounded-md border border-border text-base md:text-sm font-normal placeholder:text-placeholder focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border-focus text-foreground w-full h-9"
      :class="[
        (disabled || isLoading) && 'cursor-not-allowed select-none',
        Boolean(errorMessage) &&
          'border-red-400 text-red-400 placeholder:text-red-300 focus-visible:ring-red-400',
      ]"
      ref="inputFieldRef"
      :placeholder
      :value="modelValue"
      :disabled="disabled || isLoading"
      :aria-disabled="disabled || isLoading"
      @focus="$emit('focus', $event)"
      @blur="$emit('blur', $event)"
      @input="updateModelValue(($event.target as HTMLInputElement).value)"
    />

    <p
      v-if="errorMessage"
      class="text-red-400 text-xs mt-1"
      :data-testid="errorMessageTestid"
    >
      {{ errorMessage }}
    </p>
  </div>
</template>
