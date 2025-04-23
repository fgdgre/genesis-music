<script setup lang="ts">
import type { Track } from "@/types";
import AppModal from "./app/AppModal.vue";
import TrackForm from "./TrackForm.vue";
import { useTracksStore } from "@/stores/tracks";
import { editTrackAPI, postTrackAPI } from "@/api";
import type { DeepReadonly } from "vue";
import { useTracksToasts } from "@/composables/useTracksToasts";
import { storeToRefs } from "pinia";

defineProps<{
  track: DeepReadonly<Track>;
}>();

const emit = defineEmits<{
  close: [];
}>();

const tracksStore = useTracksStore();
const { notSubmittedTracks } = storeToRefs(tracksStore);

const { addErrorToast, addSuccessToast } = useTracksToasts();

const editTrack = async (updatedTrack: DeepReadonly<Track>) => {
  emit("close");

  const isExisting = Boolean(updatedTrack.slug);
  const isTitleChanged = updatedTrack.title !== updatedTrack.slug;

  tracksStore.updateTrack(updatedTrack.id, updatedTrack);

  let response;
  let toastType: "create" | "edit" = "edit";

  if (isExisting) {
    if (isTitleChanged) {
      response = await editTrackAPI(updatedTrack);
    } else {
      tracksStore.deleteNotSubmittedTrack(updatedTrack.id);

      if (!notSubmittedTracks.value.length) {
        tracksStore.isError = false;
      }

      addSuccessToast("edit");
      return;
    }
  } else {
    response = await postTrackAPI(updatedTrack);
    toastType = "create";
  }

  if (response?.error) {
    tracksStore.isError = true;

    tracksStore.addNotSubmittedTrack(updatedTrack);

    addErrorToast(response.error);
    return;
  }

  if (response?.data) {
    tracksStore.deleteNotSubmittedTrack(updatedTrack.id);

    if (!notSubmittedTracks.value.length) {
      tracksStore.isError = false;
    }

    tracksStore.updateTrack(updatedTrack.id, response.data);

    addSuccessToast(toastType);
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
