<script setup lang="ts">
import type { Track } from "@/types";
import EditTrackModal from "./EditTrackModal.vue";
import { computed, ref, type DeepReadonly } from "vue";
import DeleteTrackModal from "./DeleteTrackModal.vue";
import BaseButton from "./base/BaseButton.vue";
import { DEFAULT_TRACK_COVER } from "@/consts";
import { useTracksStore } from "@/stores/tracks";
import { storeToRefs } from "pinia";
import UploadTrackFileModal from "./UploadTrackFileModal.vue";
import BaseAudioPlay from "./base/BaseAudioPlay.vue";
import DeleteTrackFileModal from "./DeleteTrackFileModal.vue";

const props = defineProps<{
  track: DeepReadonly<Track>;
}>();

const tracksStore = useTracksStore();

const { playingTrackId } = storeToRefs(tracksStore);

const isPlaying = computed(() => playingTrackId.value === props.track.id);

const isEditTrackModalOpen = ref(false);
const isDeleteTrackModalOpen = ref(false);
const isUploadTrackFileModalOpen = ref(false);
const isDeleteTrackFileModal = ref(false);

const toggleTrack = () => {
  if (props.track.audioFile) {
    isPlaying.value
      ? tracksStore.clearPlayingTrackId()
      : tracksStore.setPlayingTrackId(props.track.id);
  }
};
</script>

<template>
  <div
    class="grid grid-cols-[auto_1fr] grid-rows-[auto_auto] gap-1 rounded-md border border-gray-400 p-1 select-none"
    :class="[
      track.audioFile && 'hover:bg-gray-100 transition-colors cursor-pointer',
    ]"
    @click="toggleTrack"
    :data-track-id="track.id"
    :data-testid="`track-item-${track.id}`"
  >
    <div
      class="size-20 shrink-0 rounded-md col-start-1 row-span-2 relative select-none"
    >
      <div
        v-if="track.audioFile"
        class="absolute top-[50%] translate-y-[-50%] left-[50%] translate-x-[-50%] text-orange-400"
      >
        <svg
          v-if="!isPlaying"
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
          <p class="font-medium" :data-testid="`track-item-${track.id}-title`">
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

      <div class="flex gap-2 items-center h-full">
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
          <Icon name="material-symbols:more-horiz" class="size-5 shrink-0" />
        </NuxtLink>
      </div>
    </div>

    <BaseAudioPlay
      v-if="track.audioFile"
      class="self-end"
      :trackSource="track.audioFile"
      :trackId="track.id"
    />
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

  <DeleteTrackFileModal
    v-if="isDeleteTrackFileModal"
    :track
    @close="isDeleteTrackFileModal = false"
  />
</template>
