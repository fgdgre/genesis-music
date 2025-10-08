<script setup lang="ts">
import type { Track } from "@/types";
import type { DeepReadonly } from "vue";
import AppModal from "./app/AppModal.vue";
import TrackForm from "./TrackForm.vue";
import { updateInfiniteTrackMutation } from "@/entities/tracks";

defineProps<{
  track: DeepReadonly<Track>;
}>();

const emit = defineEmits<{
  close: [];
}>();

const { mutate } = updateInfiniteTrackMutation();

const editTrack = (updatedTrack: Track) => {
  emit("close");

  mutate(updatedTrack);
};
</script>

<template>
  <AppModal title="Edit track">
    <TrackForm
      @submit="(track) => editTrack(track)"
      @discard="$emit('close')"
      :initial-data="track"
    />
  </AppModal>
</template>
