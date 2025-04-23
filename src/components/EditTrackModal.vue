<script setup lang="ts">
import type { Track } from "@/types";
import AppModal from "./AppModal.vue";
import TrackForm from "./TrackForm.vue";
import { useTrackStore } from "@/stores/tracks";
import { storeToRefs } from "pinia";
import { editTrackAPI } from "@/api";
import { useToast } from "@/stores/toast";
import type { DeepReadonly } from "vue";

defineProps<{
  track: DeepReadonly<Track>;
}>();

const emit = defineEmits<{
  close: [];
}>();

const tracksStore = useTrackStore();
const { tracks } = storeToRefs(tracksStore);

const toastsStore = useToast();

const editTrack = async (track: DeepReadonly<Track>) => {
  const oldTrack = tracks.value!.find((t) => t.id === track.id)!;

  tracksStore.updateTrack(track.id, track);

  emit("close");

  const { data, error } = await editTrackAPI(track);

  if (error) {
    tracksStore.updateTrack(track.id, oldTrack);

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
      title: "Track successfully edited",
      color: "green",
      icon: "check",
      duration: 1500,
      showProgress: true,
    });
  }
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
