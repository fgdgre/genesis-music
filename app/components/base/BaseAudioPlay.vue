<script setup lang="ts">
import { useTracksStore } from "@/stores/tracks";
import { storeToRefs } from "pinia";
import { ref, useTemplateRef, watch } from "vue";

const props = defineProps<{
  trackSource: string;
  trackId: string;
}>();

const BASE_URL = import.meta.env.VITE_BASE_URL;

const tracksStore = useTracksStore();

const { playingTrackId } = storeToRefs(tracksStore);

const audioPlyerRef = useTemplateRef("audioPlyerRef");

watch(playingTrackId, () => {
  if (playingTrackId.value === props.trackId) {
    audioPlyerRef.value?.play();
  } else {
    audioPlyerRef.value?.pause();
  }
});

const currentTime = ref(0);
const isChangingManually = ref(false);

const handlePlay = (e: any) => {
  if (!isChangingManually.value) {
    currentTime.value = e.target.currentTime;
  }

  if (
    audioPlyerRef.value &&
    currentTime.value >= audioPlyerRef.value.duration
  ) {
    tracksStore.clearPlayingTrackId();

    audioPlyerRef.value.currentTime = 0;
  }
};

const onSliderInput = (e: Event) => {
  const value = parseFloat((e.target as HTMLInputElement).value);
  currentTime.value = value;
  isChangingManually.value = true;
};

const onSliderChange = (e: Event) => {
  const value = parseFloat((e.target as HTMLInputElement).value);
  if (audioPlyerRef.value) {
    audioPlyerRef.value.currentTime = value;
  }
  isChangingManually.value = false;
};
</script>

<template>
  <div class="w-full">
    <audio
      :src="BASE_URL + `/api/files/${trackSource}`"
      preload="metadata"
      ref="audioPlyerRef"
      @timeupdate="handlePlay"
    ></audio>

    <input
      v-if="audioPlyerRef"
      type="range"
      class="w-full transition-all duration-300 ease-linear"
      :step="0.1"
      :max="audioPlyerRef?.duration"
      :value="currentTime"
      @input="onSliderInput"
      @change="onSliderChange"
      @click.stop
    />
  </div>
</template>
