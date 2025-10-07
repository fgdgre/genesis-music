<script setup lang="ts">
import type { Track } from "@/types";
import AppModal from "./app/AppModal.vue";
import TrackForm from "./TrackForm.vue";
import { useTracksStore } from "@/stores/tracks";
import type { DeepReadonly } from "vue";
import { addTrackMutation } from "@/entities/tracks";

const emit = defineEmits<{
  close: [];
}>();

const tracksStore = useTracksStore();

const { mutate } = addTrackMutation();
const handleCreateTrack = async (newTrack: DeepReadonly<Track>) => {
  emit("close");

  tracksStore.clearPlayingTrackId();

  mutate(newTrack);
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
