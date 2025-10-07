<script setup lang="ts">
import type { Track } from "@/types";
import AppModal from "./app/AppModal.vue";
import TrackForm from "./TrackForm.vue";
import { useTracksStore } from "@/stores/tracks";
import { postTrackAPI } from "@/entities/tracks/tracks";
import type { DeepReadonly } from "vue";
import { useTracksToasts } from "@/composables/useTracksToasts";
import { addTrackMutation } from "@/entities/tracks";
import { QueryClient } from "@tanstack/vue-query";

const emit = defineEmits<{
  close: [];
}>();

const tracksStore = useTracksStore();

const { addErrorToast, addSuccessToast } = useTracksToasts();

// const client = new QueryClient();
const { mutate } = addTrackMutation();
const handleCreateTrack = async (newTrack: DeepReadonly<Track>) => {
  emit("close");

  tracksStore.clearPlayingTrackId();

  mutate(newTrack);

  // if (error) {
  //   tracksStore.deleteTrack(newTrack.id);

  //   addErrorToast(error);
  //   return;
  // }

  // if (data) {
  //   tracksStore.updateTrack(newTrack.id, data);

  //   addSuccessToast("create");
  // }
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
