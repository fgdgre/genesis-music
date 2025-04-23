<script setup lang="ts">
import type { Track } from "@/types";
import AppModal from "./app/AppModal.vue";
import TrackForm from "./TrackForm.vue";
import { useTracksStore } from "@/stores/tracks";
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

const toastsStore = useToast();

const editTrack = async (updatedTrack: DeepReadonly<Track>) => {
  console.log(updatedTrack);
  tracksStore.updateTrack(updatedTrack.id, updatedTrack);

  emit("close");

  if (updatedTrack.slug) {
    if (updatedTrack.title !== updatedTrack.slug) {
      const { data, error } = await editTrackAPI(updatedTrack);

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
        tracksStore.updateTrack(updatedTrack.id, data);

        toastsStore.addToast({
          title: "Track successfully edited",
          color: "green",
          icon: "check",
          duration: 1500,
          showProgress: true,
        });
      }
    } else {
      toastsStore.addToast({
        title: "Track successfully created",
        color: "green",
        icon: "check",
        duration: 1500,
        showProgress: true,
      });
    }
  } else {
    emit("close");

    const { data, error } = await postTrackAPI(updatedTrack);

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
      tracksStore.updateTrack(updatedTrack.id, data);

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
