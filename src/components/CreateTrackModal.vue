<script setup lang="ts">
import type { Track } from "@/types";
import AppModal from "./app/AppModal.vue";
import TrackForm from "./TrackForm.vue";
import { useTracksStore } from "@/stores/tracks";
import { postTrackAPI } from "@/api";
import type { DeepReadonly } from "vue";
import { useTracksToasts } from "@/composables/useTracksToasts";
import { storeToRefs } from "pinia";

const emit = defineEmits<{
  close: [];
}>();

const tracksStore = useTracksStore();

const { addErrorToast, addSuccessToast } = useTracksToasts();

const handleCreateTrack = async (newTrack: DeepReadonly<Track>) => {
  emit("close");

  tracksStore.createTrack(newTrack);

  const { data, error } = await postTrackAPI(newTrack);

  if (error) {
    tracksStore.addNotSubmittedTrack(newTrack);

    addErrorToast(error);
  }

  if (data) {
    tracksStore.updateTrack(newTrack.id, data);

    addSuccessToast("create");
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
