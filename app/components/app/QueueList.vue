<script setup lang="ts">
import { DEFAULT_TRACK_COVER, DESKTOP_LAYOUT_PIXELS } from "~/consts";
import BaseButton from "../base/BaseButton.vue";
import { TransitionGroup } from "vue";
import {
  useSortable,
  type UseSortableOptions,
} from "@vueuse/integrations/useSortable";

defineOptions({
  inheritAttrs: false,
});

const playbackStore = usePlaybackStore();
const tracksStore = useTracksStore();

const {
  queueListVisible,
  queue,
  playingTrackId,
  isPlaying,
  isShuffle,
  loopingMode,
  globalQueue,
  currentTrackInfo,
  userQueue,
} = storeToRefs(playbackStore);
const { initialized, isError } = storeToRefs(tracksStore);

const handleTogglePlay = (trackId: string) => {
  if (trackId === playingTrackId.value) {
    playbackStore.togglePlayTrack();
  } else {
    playbackStore.setPlayingTrackIdFromQueue(trackId);
  }
};

const { width } = useWindowSize();
const isMobileScreen = computed(() => width.value < DESKTOP_LAYOUT_PIXELS);

const queueListRef = useTemplateRef("queueListRef");

watch(
  queueListRef,
  (el) => {
    if (!el) return;
    useSortable(el, globalQueue, {
      animation: 175,
      handle: ".drag-handle",
      ghostClass: "sortable-ghost",
      chosenClass: "sortable-chosen",
      filter: ".current-playing",
      preventOnFilter: false,
      onMove(evt: UseSortableOptions) {
        const related = evt.related as HTMLElement | null;
        if (!related) return;

        const children = Array.from(evt.from.children) as HTMLElement[];
        const relatedIndex = children.indexOf(related);

        if (relatedIndex === 0 && !evt.willInsertAfter) {
          return false;
        }
      },
      onUpdate: (options: UseSortableOptions) => {
        playbackStore.moveTrackInQueue(
          options.oldIndex + 1, // bc slice(1) for the current track
          options.newIndex + 1 //
        );
      },
    });
  },
  { immediate: true }
);
</script>

<template>
  <!-- TODO: Make all animations with single Transition element -->
  <Transition name="backdrop">
    <div
      v-if="initialized && !isError && queueListVisible && isMobileScreen"
      class="fixed top-0 left-0 w-full h-full bg-black/50 z-30"
      @click="playbackStore.toggleQueueListVisibility"
    ></div>
  </Transition>

  <Transition :name="isMobileScreen ? 'slide-up' : ''">
    <Teleport
      v-if="initialized && !isError && queueListVisible"
      to="body"
      :disabled="!isMobileScreen"
    >
      <div
        v-bind="$attrs"
        class="flex flex-col overflow-hidden bg-neutral-300 rounded-md min-w-[300px]"
        :class="[
          isMobileScreen
            ? 'fixed left-0 bottom-0 w-full h-[75%] m-0! z-40'
            : '',
        ]"
      >
        <div class="flex justify-between gap-4 px-2 pt-2">
          <p class="text-xl">Queue</p>

          <BaseButton
            @click="playbackStore.toggleQueueListVisibility"
            transparent
            square
          >
            <Icon name="heroicons:x-mark" />
          </BaseButton>
        </div>
        <div
          v-if="!queue.length"
          class="flex flex-1 items-center justify-center"
        >
          <p>Queue are empty</p>
        </div>

        <div
          v-else
          class="overflow-y-auto scrollbar-thin scrollbar-muted flex flex-col flex-1 relative"
        >
          <div
            v-if="currentTrackInfo"
            class="px-2 sticky top-0 z-10 bg-neutral-300 shadow-xs"
          >
            <p>Current Track</p>
            <QueueListTrack
              :track="currentTrackInfo"
              :is-playing
              :playing-track-id
              @click="handleTogglePlay(playingTrackId!)"
            />
          </div>

          <div v-if="userQueue.length" class="px-2">
            <p>Next in queue</p>
            <TransitionGroup
              tag="ul"
              name="list-animation"
              class="flex flex-col flex-1 w-full relative"
              ref="queueListRef"
            >
              <li
                v-for="(track, index) in userQueue"
                :key="track.id"
                class="w-full break-all flex justify-between"
              >
                <QueueListTrack
                  :track="track"
                  :is-playing
                  :playing-track-id
                  @click="handleTogglePlay(track.id)"
                />
              </li>
            </TransitionGroup>
          </div>

          <p class="px-2">Next from current queue</p>
          <TransitionGroup
            tag="ul"
            name="list-animation"
            class="flex flex-col flex-1 w-full pb-2 relative"
            ref="queueListRef"
          >
            <li
              v-for="(track, index) in queue.slice(1)"
              :key="track.id"
              class="w-full break-all px-2 flex justify-between"
            >
              <QueueListTrack
                :track
                :draggable="index > 0"
                :is-playing
                :playing-track-id
                @click="handleTogglePlay(track.id)"
              />
            </li>
          </TransitionGroup>
        </div>

        <!-- PlaybackActions -->
        <div v-if="isMobileScreen" class="flex w-full">
          <BaseButton
            @click.stop="playbackStore.changeLoopMode"
            transparent
            square
            class="w-full"
          >
            <div class="relative">
              <Icon
                name="heroicons:arrow-path-rounded-square"
                class="fill-black size-5"
                :class="[
                  (loopingMode === 'loopPlaylist' ||
                    loopingMode === 'loopTrack') &&
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
          <BaseButton transparent square class="w-full">
            <Icon
              name="heroicons:arrows-right-left-solid"
              :class="[isShuffle ? 'text-orange-400' : 'text-black']"
              @click.stop="playbackStore.toggleShuffle"
            />
          </BaseButton>
        </div>
      </div>
    </Teleport>
  </Transition>
</template>

<style>
/* list-animation */
.list-animation-move,
.list-animation-enter-active,
.list-animation-leave-active {
  transition: all 0.5s ease;
  /* transition: all 0.3s ease; */
}

.list-animation-enter-from,
.list-animation-leave-to {
  opacity: 0;
  transform: translateY(-150%);
  z-index: 1;
}

.list-animation-leave-active {
  position: absolute;
}
/* slide-up */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
.slide-up-enter-to,
.slide-up-leave-from {
  transform: translateY(0);
}
/* backdrop */
.backdrop-enter-active,
.backdrop-leave-active {
  transition: all 0.2s ease;
}

.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}
.backdrop-enter-to,
.backdrop-leave-from {
  opacity: 1;
}

.sortable-chosen {
  background-color: gray;
}

.sortable-ghost {
  opacity: 0;
}

html.dragging,
html.dragging * {
  cursor: grabbing !important;
}

.sortable-chosen,
.sortable-ghost,
.drag-handle {
  will-change: transform;
}
</style>
