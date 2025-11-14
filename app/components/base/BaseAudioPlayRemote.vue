<script setup lang="ts">
const props = defineProps<{
  currentTrackSourceUrl?: string;
  muted?: boolean;
  isChangingTimeManually?: boolean;
  trackDuration: number;
  currentTime: number;
}>();

const emit = defineEmits<{
  trackEnd: [];
  timeChange: [number];
  durationLoad: [number];
  timeStartsChange: [Event];
  timeEndChange: [number];
}>();

const onSliderInput = (e: Event) => {
  const value = parseFloat((e.target as HTMLInputElement).value);
  // currentTime.value = value; // keep the thumb under the finger
  // if (!props.currentTrackSourceUrl) {
  emit("timeChange", value); // optional live update in mask mode
  // }
};

const onSliderChange = (e: Event) => {
  const value = parseFloat((e.target as HTMLInputElement).value);

  // real audio element present?
  // if (audioPlyerRef.value) {
  //   audioPlyerRef.value.currentTime = value;
  // } else {
  // mask mode -> push to store
  emit("timeChange", value);
  // }
};
</script>

<template>
  <input
    type="range"
    class="flex-1 [&::-webkit-slider-thumb]:scale-0"
    tabindex="-1"
    :max="trackDuration"
    :value="currentTime"
    @input="onSliderInput"
    @change="onSliderChange"
    @pointerdown="(e) => $emit('timeStartsChange', e)"
    @pointerup="(e) => $emit('timeEndChange', parseFloat(e.target!.value))"
    @click.stop
  />
</template>
