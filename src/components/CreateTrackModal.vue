<script setup lang="ts">
import type { Track } from "@/types";
import AppModal from "./AppModal.vue";
import TrackForm from "./TrackForm.vue";
import { useTrackStore } from "@/stores/tracks";
import { postTrackAPI } from "@/api";
import { useToast } from "@/stores/toast";

const emit = defineEmits<{
  close: [];
}>();

const tracksStore = useTrackStore();

const toastsStore = useToast();

const handleCreateTrack = async (track: Track) => {
  tracksStore.createTrack(track);

  emit("close");

  const { data, error } = await postTrackAPI(track);

  if (error) {
    tracksStore.deleteTrack(track.id);

    toastsStore.addToast({
      title: "Something went wrong",
      description: error,
      color: "red",
      icon: "warning",
    });
  }

  if (data) {
    tracksStore.updateTrack(track.id, data);

    toastsStore.addToast({
      title: "Track successfully created",
      color: "green",
      icon: "check",
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
