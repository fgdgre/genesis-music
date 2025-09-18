<script setup lang="ts">
import type { Track } from "@/types";
import type { DeepReadonly } from "vue";
import AppModal from "./app/AppModal.vue";
import TrackForm from "./TrackForm.vue";
import { useTracksStore } from "@/stores/tracks";
import { editTrackAPI } from "@/entities/tracks";
import { useTracksToasts } from "@/composables/useTracksToasts";

const props = defineProps<{
  track: DeepReadonly<Track>;
}>();

const emit = defineEmits<{
  close: [];
}>();

const tracksStore = useTracksStore();

const { addErrorToast, addSuccessToast } = useTracksToasts();

const editTrack = async (updatedTrack: DeepReadonly<Track>) => {
  emit("close");

  tracksStore.updateTrack(updatedTrack.id, updatedTrack);

  const { data, error } = await editTrackAPI(updatedTrack);

  if (error) {
    tracksStore.updateTrack(updatedTrack.id, props.track);

    addErrorToast(error);
    return;
  }

  if (data) {
    tracksStore.updateTrack(updatedTrack.id, data);

    addSuccessToast("edit");
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
