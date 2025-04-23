<script setup lang="ts">
import type { Track } from "@/types";
import AppModal from "./app/AppModal.vue";
import TrackForm from "./TrackForm.vue";
import { useTracksStore } from "@/stores/tracks";
import { editTrackAPI, postTrackAPI } from "@/api";
import type { DeepReadonly } from "vue";
import { useNotification } from "@/composables/useNotifications";

const { setErrorToast, setSuccessToast } = useNotification();

defineProps<{
  track: DeepReadonly<Track>;
}>();

const emit = defineEmits<{
  close: [];
}>();

const tracksStore = useTracksStore();

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
      setSuccessToast("edit");
      return;
    }
  } else {
    response = await postTrackAPI(updatedTrack);
    toastType = "create";
  }

  if (response?.error) {
    setErrorToast(response.error);
    return;
  }

  if (response?.data) {
    tracksStore.updateTrack(updatedTrack.id, response.data);
    setSuccessToast(toastType);
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
