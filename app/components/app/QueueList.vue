<script setup lang="ts">
import { DEFAULT_TRACK_COVER } from "~/consts";
import BaseButton from "../base/BaseButton.vue";

const playbackStore = usePlaybackStore();

const { queueListVisible, queue, playingTrackId, isPlaying } =
  storeToRefs(playbackStore);

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
    v-if="queueListVisible"
    class="flex flex-col overflow-hidden bg-neutral-300 rounded-md"
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
    <ul class="flex flex-col flex-1 overflow-y-auto w-full gap-2 px-2 pb-2">
      <li v-for="track in queue" class="w-full break-all">
        <div
          class="grid grid-cols-[auto_1fr] grid-rows-[auto_auto] gap-1 rounded-md border border-gray-400 p-1 select-none"
          :class="[
            track.audioFile &&
              'hover:bg-gray-100 transition-colors cursor-pointer',
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

            <!-- <div class="flex gap-2 items-center h-full">
            <BaseButton
              color="red"
              square
              @click.stop="isDeleteTrackModalOpen = true"
              :data-testid="`delete-track-${track.id}`"
            >
              <Icon name="heroicons:trash" class="size-6" />
            </BaseButton>
            <BaseButton
              color="yellow"
              square
              @click.stop="isEditTrackModalOpen = true"
              :data-testid="`edit-track-${track.id}`"
            >
              <Icon name="heroicons:pencil-square" class="size-6" />
            </BaseButton>
            <BaseButton
              v-if="!track.audioFile"
              color="green"
              square
              :data-testid="`upload-track-${track.id}`"
              @click.stop="isUploadTrackFileModalOpen = true"
            >
              <Icon
                name="material-symbols:upload-file-outline-rounded"
                class="size-6"
              />
            </BaseButton>
            <BaseButton
              v-else
              color="orange"
              square
              :data-testid="`delete-track-${track.id}`"
              @click.stop="isDeleteTrackFileModal = true"
              class="w-10!"
            >
              <Icon
                name="streamline:file-delete-alternate"
                class="size-5 shrink-0"
              />
            </BaseButton>
            <NuxtLink
              class="flex gap-x-[5px] items-center justify-center rounded-md w-fit select-none transition-colors pointer-events-auto font-medium text-sm cursor-pointer h-9 bg-gray-500 text-white hover:bg-gray-400/80 p-2"
              :data-testid="`info-track-${track.id}`"
              @click.stop
              :to="`/${track.slug}`"
            >
              <Icon
                name="material-symbols:more-horiz"
                class="size-5 shrink-0"
              />
            </NuxtLink>
          </div> -->
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>
