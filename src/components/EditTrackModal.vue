<script setup lang="ts">
import type { Track } from "@/types";
import AppModal from "./AppModal.vue";
import TrackForm from "./TrackForm.vue";
import { useTrackStore } from "@/stores/tracks";
import { storeToRefs } from "pinia";
import { editTrackAPI } from "@/api";

defineProps<{
  initialData: Track;
}>();

const emit = defineEmits<{
  close: [];
}>();

const tracksStore = useTrackStore();
const { tracks } = storeToRefs(tracksStore);

const editTrack = async (track: Track) => {
  const oldTrack = tracks.value!.find((t) => t.id === track.id)!;

  tracksStore.updateTrack(track.id, track);

  emit("close");

  const { data, error } = await editTrackAPI(track);

  if (error) {
    alert(error);
    tracksStore.updateTrack(track.id, oldTrack);
  }

  if (data) {
    tracksStore.updateTrack(track.id, data);
  }
};
</script>

<template>
  <AppModal title="Edit track">
    <TrackForm
      @submit="(track) => editTrack(track)"
      @discard="$emit('close')"
      :initial-data="initialData"
    />
  </AppModal>
</template>
