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
      class="flex text-sm font-medium leading-none select-none mb-1"
      :class="[Boolean(errorMessage) ? 'text-error' : 'text-foreground']"
    >
      {{ label }}
    </label>

    <input
      :id
      :aria-invalid="Boolean(errorMessage)"
      :aria-describedby="errorMessage"
      data-control
      v-bind="$attrs"
      class="px-3 py-1 bg-transparent rounded-md border text-base md:text-sm font-normal w-full h-9 input-shadow focus-visible:outline-none focus-visible:ring"
      :class="[
        (disabled || isLoading) && 'cursor-not-allowed select-none',
        Boolean(errorMessage)
          ? 'border-error text-error placeholder:text-error/70 focus-visible:ring-error'
          : 'border-border placeholder:text-placeholder focus-visible:ring-border-focus text-foreground',
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
      class="text-error text-xs mt-1"
      :data-testid="errorMessageTestid"
    >
      {{ errorMessage }}
    </p>
  </div>
</template>
