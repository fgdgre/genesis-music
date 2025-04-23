<script setup lang="ts">
import type { Track } from "@/types";
import EditTrackModal from "./EditTrackModal.vue";
import { computed, ref, type DeepReadonly } from "vue";
import DeleteTrackModal from "./DeleteTrackModal.vue";
import BaseButton from "./base/BaseButton.vue";
import { DEFAULT_TRACK_COVER } from "@/consts";
import { useTracksStore } from "@/stores/tracks";
import { storeToRefs } from "pinia";

const props = defineProps<{
  track: DeepReadonly<Track>;
}>();

const tracksStore = useTracksStore();
const { isError } = storeToRefs(tracksStore);

const isTrackHaveIncorrectTitle = computed(
  () =>
    props.track.title.trim().toLowerCase().replace(/\s+/g, "-") !==
      props.track.slug && isError.value,
);

const isEditTrackModalOpen = ref(false);
const isDeleteTrackModalOpen = ref(false);
</script>

<template>
  <div class="flex gap-4 items-center" :data-testid="`track-item-${track.id}`">
    <img
      :src="track.coverImage || DEFAULT_TRACK_COVER"
      class="size-20 shrink-0 rounded-md"
    />
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
        @click="isDeleteTrackModalOpen = true"
        :data-testid="`delete-track-${track.id}`"
      >
        Delete
      </BaseButton>
      <BaseButton
        color="yellow"
        @click="isEditTrackModalOpen = true"
        :data-testid="`edit-track-${track.id}`"
      >
        Edit
      </BaseButton>
      <BaseButton
        color="green"
        :data-testid="`upload-track-${track.id}`"
        v-if="track.slug"
      >
        Upload track file
      </BaseButton>
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
  </div>
</template>
