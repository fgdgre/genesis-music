<script setup lang="ts">
import type { Track } from "@/types";
import AppModal from "./AppModal.vue";
import TrackForm from "./TrackForm.vue";
import { useTrackStore } from "@/stores/tracks";
import { postTrackAPI } from "@/api";

const emit = defineEmits<{
  close: [];
}>();

const tracksStore = useTrackStore();

const handleCreateTrack = async (track: Track) => {
  tracksStore.createTrack(track);

  emit("close");

  const { data, error } = await postTrackAPI(track);

  if (error) {
    tracksStore.deleteTrack(track.id);
    alert(error);
  }

  if (data) {
    tracksStore.updateTrack(track.id, data);
  }
};
</script>

<template>
  <AppModal title="Create track">
    <TrackForm
      @submit="(track) => handleCreateTrack(track)"
      @discard="$emit('close')"
    />
  </AppModal>
</template>
