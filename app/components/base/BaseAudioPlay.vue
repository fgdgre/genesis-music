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
const currentTime = ref(props.currentPlaybackTime || 0);
const trackDuration = ref(0);

const handlePlay = (e: any) => {
  if (!isChangingManually.value) {
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
  // const value = parseFloat((e.target as HTMLInputElement).value);
  // emit("timeChange", value);

  // console.log("timeUpdate");
  isChangingManually.value = true;
};

const onSliderChange = (e: Event) => {
  const value = parseFloat((e.target as HTMLInputElement).value);
  if (audioPlyerRef.value) {
    audioPlyerRef.value.currentTime = value;
  }

  console.log("timeUpdate");
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

watchEffect(() => {
  if (audioPlyerRef.value) {
    audioPlyerRef.value.currentTime = props.currentPlaybackTime;
    currentTime.value = props.currentPlaybackTime;
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
      @loadeddata="(e: any) => trackDuration = e.target?.duration"
      @pause="(e: any) => emit('timeChange', (e.target?.currentTime))"
    ></audio>

    <input
      v-if="audioPlyerRef"
      type="range"
      class="flex-1 translate-all [&::-webkit-slider-thumb]:scale-0 h-1!"
      tabindex="-1"
      :max="trackDuration"
      :value="currentTime"
      @input="onSliderInput"
      @change="onSliderChange"
      @click.stop
    />
  </div>
</template>
