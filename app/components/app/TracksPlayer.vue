<script setup lang="ts">
import { DEFAULT_TRACK_COVER } from "~/consts";

const tracksStore = useTracksStore();
const { initialized, tracks, isError } = storeToRefs(tracksStore);

const playbackStore = usePlaybackStore();

const {
  currentTrackInfo,
  currentTrackSourceUrl,
  playingTrackId,
  isPlaying,
  currentPlaybackTime,
  loopingMode,
  isShuffle,
  queueListVisible,
} = storeToRefs(playbackStore);

const isInteractive = (el: Element | null) => {
  if (!el) return false;
  return !!el.closest(
    "[data-control], input, textarea, select, " +
      '[contenteditable=""], [contenteditable="true"], ' +
      '[role="textbox"], [role="combobox"], [role="listbox"]'
  );
};

function handleKeyboardShortcut(e: KeyboardEvent) {
  if (e.isComposing) return;

  const target = e.target as Element | null;
  if (isInteractive(target)) return;

  const ctrlLike = e.ctrlKey || e.metaKey;

  if (e.code === "Space") {
    e.preventDefault();
    e.stopPropagation();
    playbackStore.togglePlayTrack();
    return;
  }

  if (e.code === "ArrowRight" && ctrlLike && !e.altKey && !e.shiftKey) {
    e.preventDefault();
    e.stopPropagation();
    playbackStore.nextTrack();
    return;
  }

  if (e.code === "ArrowLeft" && ctrlLike && !e.altKey && !e.shiftKey) {
    e.preventDefault();
    e.stopPropagation();
    playbackStore.prevTrack();
    return;
  }
}

onMounted(() => {
  document.addEventListener("keyup", handleKeyboardShortcut, { capture: true });
});
onUnmounted(() => {
  document.removeEventListener("keyup", handleKeyboardShortcut, {
    capture: true,
  });
});
</script>

<template>
  <div
    v-if="initialized && tracks.length && !isError && playingTrackId"
    class="w-full grid max-xs:grid-cols-[1fr_auto] min-xs:grid-cols-[35%_1fr_35%] max-md:gap-x-2 gap-x-4 p-1 items-center select-none bg-transparent max-sm:gap-y-1 h-min relative max-md:pb-1.5"
  >
    <div class="flex gap-1">
      <img
        :src="currentTrackInfo?.coverImage || DEFAULT_TRACK_COVER"
        class="size-12 object-cover rounded-md relative select-none"
      />

      <div class="flex gap-4 items-center col-start-2">
        <div class="flex gap-4">
          <div class="flex flex-col">
            <p class="font-medium text-xs">
              {{ currentTrackInfo?.title }}
            </p>
            <p class="text-placeholder text-[12px]">
              {{ currentTrackInfo?.artist }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col max-xs:items-end max-xs:pr-4 items-center">
      <div class="flex items-center max-md:gap-1">
        <BaseButton
          class="max-md:p-1 h-min"
          transparent
          square
          @click.stop="playbackStore.prevTrack"
        >
          <Icon name="mage:previous-fill" class="max-md:size-3.5 size-4" />
        </BaseButton>
        <BaseButton
          class="max-md:p-1 h-min"
          transparent
          square
          @click.stop="playbackStore.togglePlayTrack()"
        >
          <Icon
            v-if="isPlaying"
            name="mage:pause"
            class="max-md:size-3.5 size-4"
          />
          <Icon v-else name="mage:play" class="max-md:size-3.5 size-4" />
        </BaseButton>
        <BaseButton
          class="max-md:p-1 h-min"
          transparent
          square
          @click.stop="playbackStore.nextTrack"
        >
          <Icon name="mage:next-fill" class="max-md:size-3.5 size-4" />
        </BaseButton>
      </div>

      <BaseAudioPlay
        class="max-md:absolute max-md:bottom-0 max-md:left-0"
        :key="currentTrackSourceUrl"
        :track-source="currentTrackSourceUrl"
        :playing-track-id
        :current-playback-time
        :is-playing
        :current-track-source-url
        @time-change="playbackStore.changePlaybackTime"
        @track-end="playbackStore.nextTrack"
      />
    </div>

    <div class="col-start-3 row-start-1 flex justify-end max-xs:hidden">
      <BaseButton @click.stop="playbackStore.changeLoopMode" transparent square>
        <div class="relative">
          <Icon
            name="heroicons:arrow-path-rounded-square"
            class="fill-black size-5"
            :class="[
              (loopingMode === 'loopPlaylist' || loopingMode === 'loopTrack') &&
                'text-orange-400',
            ]"
          />
          <div
            v-if="loopingMode === 'loopTrack'"
            class="absolute top-0 right-0 translate-x-[50%] -translate-y-[50%] text-orange-400"
          >
            1
          </div>
        </div>
      </BaseButton>
      <BaseButton transparent square>
        <Icon
          name="heroicons:arrows-right-left-solid"
          :class="[isShuffle ? 'text-orange-400' : 'text-black']"
          @click.stop="playbackStore.toggleShuffle"
        />
      </BaseButton>
      <BaseButton transparent square @click="">
        <Icon
          name="material-symbols-light:queue-music-rounded"
          @click.stop="playbackStore.toggleQueueListVisibility"
          class="size-5"
          :class="[queueListVisible ? 'text-orange-400' : 'text-black']"
        />
      </BaseButton>
    </div>
  </div>
</template>
