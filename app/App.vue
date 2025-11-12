<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useToast } from "./stores/toast";

const store = useToast();
const { toasts } = storeToRefs(store);

const tracksStore = useTracksStore();
const { initialized, tracks, isError } = storeToRefs(tracksStore);

const playbackStore = usePlaybackStore();
const {
  currentTrackInfo,
  currentTrackSourceUrl,
  playingTrackId,
  isPlaying,
  currentPlaybackTime,
  isChangingTimeManually,
  loopingMode,
  isShuffle,
  queueListVisible,
  usedNavigationDirection,
} = storeToRefs(playbackStore);

const isTracksPlayerShow = computed(
  () =>
    initialized.value &&
    tracks.value.length &&
    !isError.value &&
    playingTrackId.value
);
</script>

<template>
  <div class="flex flex-col h-[100dvh] w-full overflow-hidden">
    <!-- TODO: maybe also refactor to pure component and smart wrapper for make app.vue as simple as possible -->
    <BaseToastsGroup :toasts @close-toast="(id) => store.removeToast(id)" />

    <BaseAudioPlay
      class="max-md:absolute max-md:bottom-0 max-md:left-0"
      :key="currentTrackSourceUrl"
      :playing-track-id
      :current-playback-time
      :is-playing
      :current-track-source-url
      @time-change="playbackStore.changePlaybackTime"
      @track-end="playbackStore.nextTrack"
      @duration-load="playbackStore.updateCurrentTrackDuration"
      v-model="isChangingTimeManually"
    />

    <div class="flex flex-col flex-1 overflow-hidden">
      <AppHeader />

      <div
        class="grid grid-cols-[1fr_auto] w-full overflow-hidden flex-1 p-2"
        :class="[isTracksPlayerShow && 'pb-[66px]']"
      >
        <NuxtPage />

        <QueueList class="ml-2" />
      </div>

      <TracksPlayer v-if="isTracksPlayerShow" />
    </div>
  </div>
</template>
