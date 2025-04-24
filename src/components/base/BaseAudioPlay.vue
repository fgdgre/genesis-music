<script setup lang="ts">
import { useTracksStore } from "@/stores/tracks";
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";
import { watchEffect } from "vue";
import BaseInput from "./BaseInput.vue";

const props = defineProps<{
  trackSource: string;
  trackId: string;
}>();

const tracksStore = useTracksStore();

const { trackRefs } = storeToRefs(tracksStore);

const trackFile = ref<any>(null);

watchEffect(() => {
  if (trackRefs.value[props.trackId]) {
    trackFile.value = trackRefs.value[props.trackId];
  }
});

const currentTime = ref(0);
const isChangingManually = ref(false);

const handlePlay = (e: any) => {
  if (!isChangingManually.value) {
    currentTime.value = e.target.currentTime;
  }

  if (currentTime.value >= trackFile.value.duration) {
    tracksStore.handlePauseTrack(props.trackId);
  }
};

const onSliderInput = (e: Event) => {
  const value = parseFloat((e.target as HTMLInputElement).value);
  currentTime.value = value;
  isChangingManually.value = true;
};

const onSliderChange = (e: Event) => {
  const value = parseFloat((e.target as HTMLInputElement).value);
  if (trackFile.value) {
    trackFile.value.currentTime = value;
  }
  isChangingManually.value = false;
};
</script>

<template>
  <div class="w-full">
    <audio
      :src="`/api/files/${trackSource}`"
      preload="metadata"
      :ref="
        (el) => tracksStore.addTrackAudioRef(trackId, el as HTMLAudioElement)
      "
      @timeupdate="handlePlay"
    ></audio>

    <input
      v-if="trackFile"
      type="range"
      class="w-full transition-all duration-300 ease-linear"
      :step="0.1"
      :max="trackFile.duration"
      :value="currentTime"
      @input="onSliderInput"
      @change="onSliderChange"
      @click.stop
    />
  </div>
</template>
