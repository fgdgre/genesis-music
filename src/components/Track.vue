<script setup lang="ts">
import type { Track } from "@/types";
import EditTrackModal from "./EditTrackModal.vue";
import {
  computed,
  ref,
  useTemplateRef,
  watch,
  watchEffect,
  type DeepReadonly,
} from "vue";
import DeleteTrackModal from "./DeleteTrackModal.vue";
import BaseButton from "./base/BaseButton.vue";
import { DEFAULT_TRACK_COVER } from "@/consts";
import { useTracksStore } from "@/stores/tracks";
import { storeToRefs } from "pinia";
import UploadTrackFileModal from "./UploadTrackFileModal.vue";

const props = defineProps<{
  track: DeepReadonly<Track>;
}>();

const tracksStore = useTracksStore();
const { notSubmittedTracks, currentAudioElementId } = storeToRefs(tracksStore);

const isTrackSubmitted = computed(
  () => !notSubmittedTracks.value.find((t) => t.id === props.track.id),
);

const isTrackHaveIncorrectTitle = computed(
  () =>
    props.track.title.trim().toLowerCase().replace(/\s+/g, "-") !==
      props.track.slug && !isTrackSubmitted.value,
);

const isTrackPlay = computed(
  () => currentAudioElementId.value === props.track.id,
);

const isEditTrackModalOpen = ref(false);
const isDeleteTrackModalOpen = ref(false);
const isUploadTrackFileModalOpen = ref(false);

const handlePlayTrack = () => {
  tracksStore.handlePlayTrack(props.track.id);
};

const handlePauseTrack = () => {
  tracksStore.handlePauseTrack(props.track.id);
};
</script>

<template>
  <div
    class="grid grid-cols-[auto_1fr] grid-rows-[auto_auto] gap-1 rounded-md cursor-pointer border p-1"
    @click="handlePlayTrack"
    :data-testid="`track-item-${track.id}`"
  >
    <div class="size-20 shrink-0 rounded-md col-start-1 row-span-2 relative">
      <div
        class="absolute top-[50%] translate-y-[-50%] left-[50%] translate-x-[-50%] text-orange-400"
      >
        <svg
          v-if="!isTrackPlay"
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
          v-else
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
            class="font-medium"
            :class="isTrackHaveIncorrectTitle && 'text-red-400'"
            :data-testid="`track-item-${track.id}-title`"
          >
            {{ track.title }}
          </p>
          <p class="text-gray-400 text-xs">
            <span :data-testid="`track-item-${track.id}-artist`">
              {{ track.artist }}
            </span>
            -
            <span>{{ track.album }}</span>
          </p>
        </div>

        <div class="max-w-full overflow-hidden">
          Genres:
          <span class="truncate" v-for="(genre, index) in track.genres">
            {{ `${genre}${index !== track.genres.length - 1 ? ", " : ""}` }}
          </span>
        </div>
      </div>

      <div class="flex gap-2">
        <BaseButton
          color="red"
          square
          @click="isDeleteTrackModalOpen = true"
          :data-testid="`delete-track-${track.id}`"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-6 shrink-0"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
            />
          </svg>
        </BaseButton>
        <BaseButton
          color="yellow"
          square
          @click="isEditTrackModalOpen = true"
          :data-testid="`edit-track-${track.id}`"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-6 shrink-0"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
            />
          </svg>
        </BaseButton>
        <BaseButton
          v-if="isTrackSubmitted"
          color="green"
          square
          :data-testid="`upload-track-${track.id}`"
          @click="isUploadTrackFileModalOpen = true"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            class="size-6 shrink-0"
          >
            <path
              fill="currentColor"
              d="M11 14.825V18q0 .425.288.713T12 19t.713-.288T13 18v-3.175l.9.9q.15.15.338.225t.375.063t.362-.088t.325-.225q.275-.3.288-.7t-.288-.7l-2.6-2.6q-.15-.15-.325-.212T12 11.425t-.375.063t-.325.212l-2.6 2.6q-.3.3-.287.7t.312.7q.3.275.7.288t.7-.288zM6 22q-.825 0-1.412-.587T4 20V4q0-.825.588-1.412T6 2h7.175q.4 0 .763.15t.637.425l4.85 4.85q.275.275.425.638t.15.762V20q0 .825-.587 1.413T18 22zm7-14V4H6v16h12V9h-4q-.425 0-.712-.288T13 8M6 4v5zv16z"
            />
          </svg>
        </BaseButton>
      </div>
    </div>

    <audio
      :ref="
        (el) => tracksStore.addTrackAudioRef(track.id, el as HTMLAudioElement)
      "
      class="h-[25px] w-full col-start-2 row-start-2 col-span-full"
      controls
      @play="handlePlayTrack"
      @pause="handlePauseTrack"
      src="music/Heartbeat-Childish-Gambino.m4a"
    ></audio>
  </div>

  <EditTrackModal
    v-if="isEditTrackModalOpen"
    :track
    @close="isEditTrackModalOpen = false"
  />

  <DeleteTrackModal
    v-if="isDeleteTrackModalOpen"
    :track
    @close="isDeleteTrackModalOpen = false"
  />

  <UploadTrackFileModal
    v-if="isUploadTrackFileModalOpen"
    :track
    @close="isUploadTrackFileModalOpen = false"
  />
</template>
