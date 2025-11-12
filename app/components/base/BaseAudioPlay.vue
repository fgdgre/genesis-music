<script setup lang="ts">
const props = defineProps<{
  playingTrackId?: string | null;
  isPlaying: boolean;
  currentPlaybackTime: number;
  duration?: number;
  currentTrackSourceUrl?: string;
  muted?: boolean;
  isChangingTimeManually?: boolean;
}>();

const emit = defineEmits<{
  trackEnd: [];
  timeChange: [number];
  durationLoad: [number];
  timeStartsChange: [Event];
}>();

const isChangingTimeManually = defineModel<boolean>({ default: false });

const audioPlyerRef = useTemplateRef("audioPlyerRef");

const currentTime = ref(props.currentPlaybackTime || 0);
const trackDuration = ref(0);

const handlePlay = (e: any) => {
  if (!isChangingTimeManually.value) {
    emit("timeChange", e.target.currentTime);
    currentTime.value = e.target.currentTime;
  }

  if (
    audioPlyerRef.value &&
    audioPlyerRef.value.duration &&
    Math.round(props.currentPlaybackTime) >=
      Math.round(audioPlyerRef.value.duration)
  ) {
    console.log("trackEnd");
    emit("trackEnd");
  }
};

const onSliderInput = (e: Event) => {
  const value = parseFloat((e.target as HTMLInputElement).value);
  isChangingTimeManually.value = true;
  currentTime.value = value; // keep the thumb under the finger
  if (!props.currentTrackSourceUrl) {
    emit("timeChange", value); // optional live update in mask mode
  }
};

const onSliderChange = (e: Event) => {
  const value = parseFloat((e.target as HTMLInputElement).value);

  // real audio element present?
  if (audioPlyerRef.value) {
    audioPlyerRef.value.currentTime = value;
  } else {
    // mask mode -> push to store
    emit("timeChange", value);
  }

  isChangingTimeManually.value = false;
};

watchPostEffect(() => {
  if (props.isPlaying) {
    audioPlyerRef.value?.play();
  } else {
    audioPlyerRef.value?.pause();
  }
});

onMounted(() => {
  if (audioPlyerRef.value) {
    audioPlyerRef.value.currentTime = props.currentPlaybackTime;
  }
});

watchEffect(() => {
  if (isChangingTimeManually.value) return; // hands off while dragging

  if (props.currentTrackSourceUrl) {
    if (audioPlyerRef.value && !props.isPlaying) {
      audioPlyerRef.value.currentTime = props.currentPlaybackTime;
      currentTime.value = props.currentPlaybackTime;
    }
  } else {
    currentTime.value = props.currentPlaybackTime;
    trackDuration.value = props.duration || 0;
  }
});

const handleDurationLoad = (e: any) => {
  const audioElementDuration = e.target?.duration;
  trackDuration.value = audioElementDuration;
  emit("durationLoad", audioElementDuration);
};
</script>

<template>
  <div class="w-full flex h-1">
    <audio
      v-if="currentTrackSourceUrl"
      :muted
      :src="currentTrackSourceUrl"
      preload="auto"
      ref="audioPlyerRef"
      @timeupdate="handlePlay"
      @loadeddata="handleDurationLoad"
      @pause="(e: any) => emit('timeChange', (e.target?.currentTime))"
    ></audio>

    <!-- v-if="audioPlyerRef" -->
    <input
      type="range"
      class="flex-1 [&::-webkit-slider-thumb]:scale-0"
      tabindex="-1"
      :max="trackDuration"
      :value="currentTime"
      @input="onSliderInput"
      @change="onSliderChange"
      @pointerdown="(e) => $emit('timeStartsChange', e)"
      @pointerup="(e) => $emit('timeChange', parseFloat(e.target!.value))"
      @click.stop
    />
  </div>
</template>
