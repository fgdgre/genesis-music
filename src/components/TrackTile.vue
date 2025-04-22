<script setup lang="ts">
import type { Track } from "@/types";
import EditTrackModal from "./EditTrackModal.vue";
import { ref } from "vue";
import DeleteTrackModal from "./DeleteTrackModal.vue";
import BaseButton from "./base/BaseButton.vue";
import { DEFAULT_TRACK_COVER } from "@/consts";

defineProps<{
  track: Track;
}>();

const isEditTrackModalOpen = ref(false);
const isDeleteTrackModalOpen = ref(false);
</script>

<template>
  <div class="flex gap-4 items-center">
    <img
      :src="track.coverImage || DEFAULT_TRACK_COVER"
      class="size-20 shrink-0 rounded-md"
    />
    <p>{{ track }}</p>

    <div class="flex gap-2">
      <BaseButton color="red" @click="isDeleteTrackModalOpen = true">
        Delete
      </BaseButton>
      <BaseButton color="yellow" @click="isEditTrackModalOpen = true">
        Edit
      </BaseButton>
      <BaseButton color="green"> Upload track file </BaseButton>
    </div>

    <EditTrackModal
      v-if="isEditTrackModalOpen"
      :initial-data="track"
      @close="isEditTrackModalOpen = false"
    />

    <DeleteTrackModal
      v-if="isDeleteTrackModalOpen"
      :track
      @close="isDeleteTrackModalOpen = false"
    />
  </div>
</template>
