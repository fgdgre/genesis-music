<script setup lang="ts">
import type { Track } from "@/types";
import AppModal from "./app/AppModal.vue";
import TrackForm from "./TrackForm.vue";
import { useTracksStore } from "@/stores/tracks";
import { postTrackAPI } from "@/api";
import { useToast } from "@/stores/toast";
import type { DeepReadonly } from "vue";

const emit = defineEmits<{
  close: [];
}>();

const tracksStore = useTracksStore();
const toastsStore = useToast();

const handleCreateTrack = async (track: DeepReadonly<Track>) => {
  tracksStore.createTrack(track);

  emit("close");

  const { data, error } = await postTrackAPI(track);

  if (error) {
    if (error.status === 409) {
      toastsStore.addToast({
        title: error.message,
        description: "Edit or delete, because his will not save",
        color: "red",
        icon: "warning",
      });
    } else {
      toastsStore.addToast({
        title: "Something went wrong",
        description: error.message,
        color: "red",
        icon: "warning",
      });
    }
  }

  if (data) {
    tracksStore.updateTrack(track.id, data);

    toastsStore.addToast({
      title: "Track successfully created",
      color: "green",
      icon: "check",
      duration: 1500,
      showProgress: true,
    });
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
