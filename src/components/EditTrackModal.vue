<script setup lang="ts">
import type { Track } from "@/types";
import AppModal from "./app/AppModal.vue";
import TrackForm from "./TrackForm.vue";
import { useTracksStore } from "@/stores/tracks";
import { editTrackAPI, postTrackAPI } from "@/api";
import { useToast } from "@/stores/toast";
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

const toastsStore = useToast();

const editTrack = async (updatedTrack: DeepReadonly<Track>) => {
  tracksStore.updateTrack(updatedTrack.id, updatedTrack);

  emit("close");

  if (updatedTrack.slug) {
    if (updatedTrack.title !== updatedTrack.slug) {
      const { data, error } = await editTrackAPI(updatedTrack);

      if (error) {
        setErrorToast(error);
      }

      if (data) {
        tracksStore.updateTrack(updatedTrack.id, data);

        setSuccessToast("edit");
      }
    } else {
      setSuccessToast("edit");
    }
  } else {
    emit("close");

    const { data, error } = await postTrackAPI(updatedTrack);

    if (error) {
      setErrorToast(error);
    }

    if (data) {
      tracksStore.updateTrack(updatedTrack.id, data);

      setSuccessToast("create");
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
