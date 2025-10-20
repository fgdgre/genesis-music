<script setup lang="ts">
const props = defineProps<{
  trackSource: string;
  playingTrackId?: string | null;
  isPlaying: boolean;
  currentPlaybackTime: number;
  currentTrackSourceUrl: string;
}>();

const emit = defineEmits<{
  trackEnd: [];
  timeChange: [number];
}>();

const audioPlyerRef = useTemplateRef("audioPlyerRef");

const isChangingManually = ref(false);

const handlePlay = (e: any) => {
  if (!isChangingManually.value) {
    emit("timeChange", e.target.currentTime);
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
  emit("timeChange", value);
  isChangingManually.value = true;
};

const onSliderChange = (e: Event) => {
  const value = parseFloat((e.target as HTMLInputElement).value);
  if (audioPlyerRef.value) {
    audioPlyerRef.value.currentTime = value;
  }
  isChangingManually.value = false;
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

// TODOOOOOOOOOOOOOOOO
watch([() => props.isPlaying, () => props.currentPlaybackTime], () => {
  if (audioPlyerRef.value && !props.isPlaying) {
    audioPlyerRef.value.currentTime = props.currentPlaybackTime;
  }
});
</script>

<template>
  <div class="w-full h-min flex">
    <audio
      :src="currentTrackSourceUrl"
      preload="metadata"
      ref="audioPlyerRef"
      @timeupdate="handlePlay"
    ></audio>

    <input
      v-if="audioPlyerRef"
      type="range"
      class="w-full transition-all duration-300 ease-linear [&::-webkit-slider-thumb]:scale-0 h-1!"
      :step="0.1"
      :max="audioPlyerRef?.duration"
      :value="currentPlaybackTime"
      @input="onSliderInput"
      @change="onSliderChange"
      @click.stop
    />
  </div>
</template>
