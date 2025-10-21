<script setup lang="ts">
import { DEFAULT_TRACK_COVER } from "~/consts";
import BaseButton from "../base/BaseButton.vue";
import { TransitionGroup } from "vue";

const playbackStore = usePlaybackStore();
const tracksStore = useTracksStore();

const { queueListVisible, queue, playingTrackId, isPlaying } =
  storeToRefs(playbackStore);
const { tracks, initialized, isError } = storeToRefs(tracksStore);

const handleTogglePlay = (trackId: string) => {
  if (trackId === playingTrackId.value) {
    playbackStore.togglePlayTrack();
  } else {
    playbackStore.setPlayingTrackId(trackId);
  }
};
</script>

<template>
  <div
    v-if="initialized && !isError && queueListVisible"
    class="flex flex-col overflow-hidden bg-neutral-300 rounded-md min-w-[300px]"
  >
    <div class="flex justify-between gap-4 px-2 pt-1">
      <p class="text-xl">Queue</p>

      <BaseButton
        @click="playbackStore.toggleQueueListVisibility"
        transparent
        square
      >
        <Icon name="heroicons:x-mark" />
      </BaseButton>
    </div>
    <div v-if="!queue.length" class="flex flex-1 items-center justify-center">
      <p>Queue are empty</p>
    </div>
    <TransitionGroup
      v-else
      tag="ul"
      class="flex flex-col flex-1 overflow-y-auto w-full gap-2 pb-2 relative"
    >
      <li
        v-for="(track, index) in queue"
        :key="track.id"
        class="w-full break-all px-2"
        :class="index === 0 && 'sticky top-0 z-10 bg-neutral-300'"
      >
        <div
          class="grid grid-cols-[auto_1fr] grid-rows-[auto_auto] gap-1 rounded-md border border-gray-400 p-1 select-none"
          :class="[
            track.audioFile &&
              'hover:bg-gray-100 transition-colors cursor-pointer',
            index === 0 && 'shadow-sm',
          ]"
          @click="() => handleTogglePlay(track.id)"
          :data-track-id="track.id"
          :data-testid="`track-item-${track.id}`"
        >
          <div
            class="size-10 shrink-0 rounded-md col-start-1 row-span-2 relative select-none"
          >
            <div
              v-if="track.audioFile"
              class="absolute top-[50%] translate-y-[-50%] left-[50%] translate-x-[-50%] text-orange-400"
            >
              <svg
                v-if="!isPlaying || (isPlaying && playingTrackId !== track.id)"
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

          <div class="flex gap-4 items-center col-start-2 row-start-1">
            <div class="flex gap-4 w-full">
              <div class="flex flex-col">
                <p
                  class="font-medium text-sm"
                  :class="[playingTrackId === track.id && 'text-orange-400']"
                  :data-testid="`track-item-${track.id}-title`"
                >
                  {{ track.title }}
                </p>
                <p class="text-gray-400 text-xs">
                  <span :data-testid="`track-item-${track.id}-artist`">
                    {{ track.artist }}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </li>
    </TransitionGroup>
  </div>
</template>

<style>
.v-move,
.v-enter-active,
.v-leave-active {
  transition: all 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}

.v-leave-active {
  position: absolute;
}
</style>
