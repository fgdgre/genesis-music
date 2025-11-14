<script setup lang="ts">
const props = defineProps<{
  playingTrackId?: string | null;
  isPlaying: boolean;
  currentPlaybackTime: number;
  trackDuration: number;
  currentTrackSourceUrl?: string;
  muted?: boolean;
  isChangingTimeManually?: boolean;
  controls?: boolean;
}>();

const emit = defineEmits<{
  trackEnd: [];
  timeChange: [number];
  durationLoad: [number];
  timeStartsChange: [number];
  timeEndChange: [number];
}>();

const audioPlyerRef = useTemplateRef("audioPlyerRef");

const handlePlay = (e: any) => {
  if (!props.isChangingTimeManually) {
    emit("timeChange", e.target.currentTime);
  }
};

const canPlay = ref(false);

watch([() => props.isPlaying, canPlay, audioPlyerRef], () => {
  if (!audioPlyerRef.value) return;

  if (props.isPlaying) {
    canPlay.value ? audioPlyerRef.value?.play() : null;
  } else {
    audioPlyerRef.value?.pause();
  }
});

watch([() => props.isChangingTimeManually, () => props.isPlaying], () => {
  if (props.isChangingTimeManually) return;
  if (!audioPlyerRef.value) return;

  audioPlyerRef.value.currentTime = props.currentPlaybackTime;
});

onMounted(() => {
  if (!audioPlyerRef.value) return;

  audioPlyerRef.value.currentTime = props.currentPlaybackTime;
});

const handleDurationLoad = (e: any) => {
  const audioElementDuration = e.target?.duration;

  emit("durationLoad", audioElementDuration);
};

const handleStartPLaying = () => {
  canPlay.value = true;

  if (props.isPlaying) {
    audioPlyerRef.value?.play();
  }
};

const handleEndPlay = () => {
  emit("trackEnd");
  audioPlyerRef.value?.pause();
  canPlay.value = false;
};
</script>

<template>
  <div :class="[controls ? 'w-full flex h-1' : 'hidden']">
    <audio
      ref="audioPlyerRef"
      :src="currentTrackSourceUrl"
      @canplay="handleStartPLaying"
      @timeupdate="handlePlay"
      @loadeddata="handleDurationLoad"
      @ended="handleEndPlay"
    ></audio>

    <BaseAudioPlayRemote
      v-if="controls"
      :trackDuration
      :current-time="currentPlaybackTime"
      @time-starts-change="(e) => $emit('timeStartsChange', e)"
      @time-end-change="(e) => $emit('timeEndChange', e)"
    />
  </div>
</template>
