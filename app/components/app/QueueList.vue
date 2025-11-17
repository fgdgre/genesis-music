<script setup lang="ts">
import { DEFAULT_TRACK_COVER, DESKTOP_LAYOUT_PIXELS } from "~/consts";
import BaseButton from "../base/BaseButton.vue";
import { TransitionGroup } from "vue";
import {
  useSortable,
  type UseSortableOptions,
} from "@vueuse/integrations/useSortable";
import { cloneDeep } from "lodash";
import type { Track } from "~/types";

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
        // DOM element we are hovering over
        const related = evt.related as HTMLElement | null;
        if (!related) return;

        // All <li> elements inside this <ul>
        const children = Array.from(evt.from.children) as HTMLElement[];
        const relatedIndex = children.indexOf(related);

        // If we're trying to insert BEFORE the first item, block it
        if (relatedIndex === 0 && !evt.willInsertAfter) {
          return false; // cancel this move
        }
      },
      onUpdate: (options: UseSortableOptions) => {
        playbackStore.moveTrackInQueue(options.oldIndex, options.newIndex);
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
        <TransitionGroup
          v-else
          tag="ul"
          name="list-animation"
          class="flex flex-col flex-1 overflow-y-auto scrollbar-thin scrollbar-muted w-full pb-2 relative"
          ref="queueListRef"
        >
          <li
            v-for="(track, index) in queue"
            :key="track.id"
            class="w-full break-all px-2 flex justify-between"
            :class="
              index === 0 && 'sticky top-0 z-10 bg-neutral-300 current-playing'
            "
          >
            <div
              class="grid grid-cols-[auto_1fr_auto] gap-1 p-1 select-none rounded-md hover:bg-foreground/10 transition-colors cursor-pointer w-full"
              @click="() => handleTogglePlay(track.id)"
              :data-track-id="track.id"
              :data-testid="`track-item-${track.id}`"
            >
              <div
                class="size-10 shrink-0 rounded-md col-start-1 relative select-none"
              >
                <div
                  v-if="track.audioFile"
                  class="absolute top-[50%] translate-y-[-50%] left-[50%] translate-x-[-50%] text-primary"
                >
                  <svg
                    v-if="
                      !isPlaying || (isPlaying && playingTrackId !== track.id)
                    "
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    class="size-4"
                  >
                    <path
                      fill="currentColor"
                      d="M21.409 9.353a2.998 2.998 0 0 1 0 5.294L8.597 21.614C6.534 22.737 4 21.277 4 18.968V5.033c0-2.31 2.534-3.769 4.597-2.648z"
                    />
                  </svg>

                  <svg
                    v-else-if="playingTrackId === track.id && isPlaying"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M16 19q-.825 0-1.412-.587T14 17V7q0-.825.588-1.412T16 5t1.413.588T18 7v10q0 .825-.587 1.413T16 19m-8 0q-.825 0-1.412-.587T6 17V7q0-.825.588-1.412T8 5t1.413.588T10 7v10q0 .825-.587 1.413T8 19"
                    />
                  </svg>
                </div>
                <img
                  :src="track.coverImage || DEFAULT_TRACK_COVER"
                  class="h-full rounded-md"
                />
              </div>

              <div class="flex gap-4 items-center col-start-2">
                <div class="flex gap-4 w-full">
                  <div class="flex flex-col">
                    <p
                      class="font-medium text-sm"
                      :class="[playingTrackId === track.id && 'text-primary']"
                      :data-testid="`track-item-${track.id}-title`"
                    >
                      {{ track.title }}
                    </p>
                    <p class="text-placeholder text-xs">
                      <span :data-testid="`track-item-${track.id}-artist`">
                        {{ track.artist }}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <BaseButton
                v-if="index > 0"
                @click.stop
                transparent
                class="col-start-3 h-full"
              >
                <Icon name="heroicons:bars-2" class="drag-handle shrink-0" />
              </BaseButton>
            </div>
          </li>
        </TransitionGroup>
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
}

.list-animation-enter-from,
.list-animation-leave-to {
  opacity: 0;
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
