<script setup lang="ts">
import type { Track } from "@/types";
import AppModal from "./app/AppModal.vue";
import TrackForm from "./TrackForm.vue";
import { useTracksStore } from "@/stores/tracks";
import { postTrackAPI } from "@/api";
import { useToast } from "@/stores/toast";
import type { DeepReadonly } from "vue";
import { useNotification } from "@/composables/useNotifications";

const emit = defineEmits<{
  close: [];
}>();

const tracksStore = useTracksStore();

const notificationStore = useNotification();
const { setErrorToast, setSuccessToast } = notificationStore;

const handleCreateTrack = async (track: DeepReadonly<Track>) => {
  emit("close");

  tracksStore.createTrack(track);

  const { data, error } = await postTrackAPI(track);

  if (error) {
    setErrorToast(error);
  }

  if (data) {
    tracksStore.updateTrack(track.id, data);

    setSuccessToast("create");
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
