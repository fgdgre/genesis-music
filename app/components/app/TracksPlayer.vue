<script setup lang="ts">
import { DEFAULT_TRACK_COVER, DESKTOP_LAYOUT_PIXELS } from "~/consts";

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
  usedNavigationDirection,
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

const currentTrackModalShow = ref(false);
const { width } = useWindowSize();
const isMobileScreen = computed(() => width.value < DESKTOP_LAYOUT_PIXELS);

const handleOpenTrackModal = () => {
  if (!isMobileScreen.value || currentTrackModalShow.value) return;
  currentTrackModalShow.value = true;
};

const handleCloseTrackModal = () => {
  if (!isMobileScreen.value || !currentTrackModalShow.value) return;
  currentTrackModalShow.value = false;
};

watch(isMobileScreen, () => {
  if (!isMobileScreen.value) currentTrackModalShow.value = false;
});

const animationEnterTransitionValue = computed(() =>
  usedNavigationDirection.value === "forward" ? "150%" : "-150%"
);
const animationLeaveTransitionValue = computed(() =>
  usedNavigationDirection.value === "forward" ? "-150%" : "150%"
);
</script>

<template>
  <div
    v-if="initialized && tracks.length && !isError && playingTrackId"
    class="w-full items-center select-none h-full"
    :class="[
      currentTrackModalShow
        ? 'fixed bottom-0 left-0 flex flex-col h-full bg-neutral-300 p-1 pb-1.5 flex-1 max-h-[100svh]'
        : 'grid max-xs:grid-cols-[1fr_auto] min-xs:grid-cols-[35%_1fr_35%] max-md:gap-x-2 gap-x-4 h-min relative max-sm:gap-y-1 max-md:pb-1.5 bg-transparent p-1',
    ]"
    @click="handleOpenTrackModal"
  >
    <div
      v-if="currentTrackModalShow"
      class="flex gap-4 justify-between w-full items-center"
    >
      <BaseButton square transparent @click.stop="handleCloseTrackModal">
        <Icon name="heroicons:chevron-down" class="size-5" />
      </BaseButton>
      <p>Current playing</p>
      <NuxtLink
        class="size-9 flex items-center justify-center"
        :to="`/${currentTrackInfo?.slug}`"
      >
        <Icon name="material-symbols:more-horiz" class="size-5" />
      </NuxtLink>
    </div>

    <div
      class="flex gap-1 flex-1"
      :class="[
        currentTrackModalShow
          ? 'flex-col items-center w-full pt-5 flex-1 max-w-[400px] relative overflow-hidden'
          : 'overflow-hidden',
      ]"
    >
      <!-- <Transition name="cover-image-animation"> -->
      <!-- <div class="flex w-full" :key="currentTrackSourceUrl"> -->
      <div
        :class="[
          currentTrackModalShow
            ? 'h-full flex-1 w-full flex items-center justify-center relative overflow-hidden'
            : 'overflow-hidden relative',
        ]"
      >
        <Transition name="cover-image-animation">
          <img
            :key="currentTrackSourceUrl"
            :src="currentTrackInfo?.coverImage || DEFAULT_TRACK_COVER"
            class="object-contain rounded-md relative select-none aspect-square"
            :class="[
              currentTrackModalShow
                ? 'max-w-full max-h-full h-min w-full'
                : 'size-12',
            ]"
          />
        </Transition>
      </div>

      <div
        :class="[
          currentTrackModalShow ? 'w-full pt-5' : 'flex gap-4 items-center',
        ]"
      >
        <div class="flex gap-4">
          <div class="flex flex-col">
            <p
              :class="[
                currentTrackModalShow
                  ? 'font-medium text-xl'
                  : 'font-medium text-xs',
              ]"
            >
              {{ currentTrackInfo?.title }}
            </p>
            <p
              class="text-placeholder"
              :class="[
                currentTrackModalShow ? 'font-medium text-sm' : 'text-[12px]',
              ]"
            >
              {{ currentTrackInfo?.artist }}
            </p>
          </div>
        </div>
      </div>
      <!-- </div> -->
      <!-- </Transition> -->
    </div>
    <div
      class="flex flex-col items-center"
      :class="[
        currentTrackModalShow
          ? 'gap-8 w-full justify-center pt-5 max-w-[300px]'
          : 'max-xs:pr-4 max-xs:items-end',
      ]"
    >
      <div
        class="flex items-center"
        :class="[currentTrackModalShow ? 'order-[10] gap-5' : 'max-md:gap-1']"
      >
        <BaseButton
          class="max-md:p-1 h-min"
          transparent
          square
          @click.stop="playbackStore.prevTrack"
        >
          <Icon
            name="mage:previous-fill"
            :class="[
              currentTrackModalShow ? 'size-7' : 'max-md:size-3.5 size-4',
            ]"
          />
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
            :class="[
              currentTrackModalShow ? 'size-7' : 'max-md:size-3.5 size-4',
            ]"
          />
          <Icon
            v-else
            name="mage:play"
            :class="[
              currentTrackModalShow ? 'size-7' : 'max-md:size-3.5 size-4',
            ]"
          />
        </BaseButton>
        <BaseButton
          class="max-md:p-1 h-min"
          transparent
          square
          @click.stop="playbackStore.nextTrack"
        >
          <Icon
            name="mage:next-fill"
            :class="[
              currentTrackModalShow ? 'size-7' : 'max-md:size-3.5 size-4',
            ]"
          />
        </BaseButton>
      </div>

      <BaseAudioPlay
        :class="[
          currentTrackModalShow
            ? ''
            : 'max-md:absolute max-md:bottom-0 max-md:left-0',
        ]"
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

    <div
      class="flex w-full justify-end"
      :class="[
        currentTrackModalShow
          ? 'min-h-[48px] items-center'
          : 'col-start-3 row-start-1 max-xs:hidden items-end',
      ]"
    >
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
      <BaseButton
        transparent
        square
        @click.stop="playbackStore.toggleQueueListVisibility"
      >
        <Icon
          name="material-symbols-light:queue-music-rounded"
          class="size-5"
          :class="[queueListVisible ? 'text-orange-400' : 'text-black']"
        />
      </BaseButton>
    </div>
  </div>
</template>

<style scoped>
.cover-image-animation-enter-active {
  transition: all 0.3s ease-out;
}
.cover-image-animation-leave-active {
  transition: all 0.3s ease-out;
  position: absolute;
}

.cover-image-animation-enter-from {
  transform: translateX(v-bind(animationEnterTransitionValue));
}

.cover-image-animation-leave-to {
  transform: translateX(v-bind(animationLeaveTransitionValue));
}
</style>
