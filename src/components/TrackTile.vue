<script setup lang="ts">
import type { Track } from "@/types";
import EditTrackModal from "./EditTrackModal.vue";
import { ref } from "vue";
import DeleteTrackModal from "./DeleteTrackModal.vue";
import BaseButton from "./BaseButton.vue";

defineProps<{
  track: Track;
}>();

const isEditTrackModalOpen = ref(false);
const isDeleteTrackModalOpen = ref(false);
</script>

<template>
  <div class="flex gap-4 items-center">
    <img
      :src="
        track.coverImage ||
        'https://community.spotify.com/t5/image/serverpage/image-id/55829iC2AD64ADB887E2A5/image-dimensions/2500?v=v2&px=-1'
      "
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
