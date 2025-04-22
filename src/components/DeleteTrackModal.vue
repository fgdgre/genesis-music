<script setup lang="ts">
import type { Track } from "@/types";
import AppModal from "./AppModal.vue";
import TrackForm from "./TrackForm.vue";
import { useTrackStore } from "@/stores/tracks";
import { storeToRefs } from "pinia";
import { deleteTrackAPI } from "@/api";

const props = defineProps<{
  track: Track;
}>();

const emit = defineEmits<{
  close: [];
}>();

const tracksStore = useTrackStore();
const { tracks } = storeToRefs(tracksStore);

const handleDeleteTrack = async () => {
  const oldTrack = tracks.value!.find((t) => t.id === props.track.id)!;

  tracksStore.deleteTrack(props.track.id);

  emit("close");

  const { data, error } = await deleteTrackAPI(props.track.id);

  if (error) {
    alert(error);
    tracksStore.createTrack(oldTrack);
  }

  if (data) {
    alert("Track successfully deleted");
    // tracksStore.updateTrack(track.id, data);
  }
};
</script>

<template>
  <AppModal title="Delete track">
    <p>Do you want to delete track with id {{ track.id }}?</p>

    <template #actions>
      <div class="col-span-2 w-full flex gap-2">
        <button class="flex-1" type="button" @click="$emit('close')">
          Cancel
        </button>
        <button class="bg-red-400 text-black flex-1" @click="handleDeleteTrack">
          Delete
        </button>
      </div>
    </template>
  </AppModal>
</template>
