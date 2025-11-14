<script setup lang="ts">
const props = defineProps<{
  playingTrackId?: string | null;
  isPlaying: boolean;
  currentPlaybackTime: number;
  trackDuration: number;
  currentTrackSourceUrl?: string;
  muted?: boolean;
  isChangingTimeManually?: boolean;
}>();

const emit = defineEmits<{
  trackEnd: [];
  timeChange: [number];
  durationLoad: [number];
  timeStartsChange: [Event];
  timeEndChange: [number];
}>();

const audioPlyerRef = useTemplateRef("audioPlyerRef");

// const currentTime = ref(props.currentPlaybackTime || 0);
// const trackDuration = ref(0);

const handlePlay = (e: any) => {
  if (!props.isChangingTimeManually) {
    emit("timeChange", e.target.currentTime);
    // currentTime.value = e.target.currentTime;
  }
};

const onSliderInput = (e: Event) => {
  const value = parseFloat((e.target as HTMLInputElement).value);
  // currentTime.value = value; // keep the thumb under the finger
  // if (!props.currentTrackSourceUrl) {
  //   emit("timeChange", value); // optional live update in mask mode
  // }
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
};

const isPlaying = ref(false);

watchPostEffect(() => {
  if (!audioPlyerRef.value) return;

  if (props.isPlaying) {
    isPlaying.value ? null : audioPlyerRef.value?.play();
  } else {
    isPlaying.value ? audioPlyerRef.value?.pause() : null;
  }
});

watch(
  () => props.isChangingTimeManually,
  () => {
    if (props.isChangingTimeManually) return;
    if (!audioPlyerRef.value) return;

    audioPlyerRef.value.currentTime = props.currentPlaybackTime;
  }
);

const handleDurationLoad = (e: any) => {
  const audioElementDuration = e.target?.duration;

  emit("durationLoad", audioElementDuration);
};

const handleStartPLaying = () => {
  if (props.isPlaying) {
    audioPlyerRef.value?.play();
  }
};

const handleEndPlay = () => {
  emit("trackEnd");
  isPlaying.value = false;
};
</script>

<template>
  <div class="w-full flex h-1">
    <audio
      ref="audioPlyerRef"
      :src="currentTrackSourceUrl"
      @playing="isPlaying = true"
      @canplay="handleStartPLaying"
      @timeupdate="handlePlay"
      @loadeddata="handleDurationLoad"
      @ended="handleEndPlay"
      @pause="isPlaying = false"
    ></audio>

    <BaseAudioPlayRemote :trackDuration :currentTime="currentPlaybackTime" />
    <!-- <input
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
    /> -->
  </div>
</template>
