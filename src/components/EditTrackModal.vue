<script setup lang="ts">
import type { Track } from "@/types";
import AppModal from "./app/AppModal.vue";
import TrackForm from "./TrackForm.vue";
import { useTracksStore } from "@/stores/tracks";
import { storeToRefs } from "pinia";
import { editTrackAPI, postTrackAPI } from "@/api";
import { useToast } from "@/stores/toast";
import type { DeepReadonly } from "vue";

defineProps<{
  track: DeepReadonly<Track>;
}>();

const emit = defineEmits<{
  close: [];
}>();

const tracksStore = useTracksStore();
const { tracks } = storeToRefs(tracksStore);

const toastsStore = useToast();

const editTrack = async (track: DeepReadonly<Track>) => {
  // const trackBeforeRequest = tracks.value!.find((t) => t.id === track.id)!;

  tracksStore.updateTrack(track.id, track);

  emit("close");

  if (track.slug) {
    const { data, error } = await editTrackAPI(track);

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
        title: "Track successfully edited",
        color: "green",
        icon: "check",
        duration: 1500,
        showProgress: true,
      });
    }
  } else {
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
