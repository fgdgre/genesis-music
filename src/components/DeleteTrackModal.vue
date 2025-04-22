<script setup lang="ts">
import type { Track } from "@/types";
import AppModal from "./AppModal.vue";
import TrackForm from "./TrackForm.vue";
import { useTrackStore } from "@/stores/tracks";
import { storeToRefs } from "pinia";
import { deleteTrackAPI } from "@/api";
import BaseButton from "./base/BaseButton.vue";

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
  }
};
</script>

<template>
  <AppModal title="Delete track">
    <p>
      Do you want to delete track with id
      <span class="font-medium">{{ track.id }}</span
      >?
    </p>

    <template #actions>
      <div class="col-span-2 w-full flex gap-2">
        <BaseButton class="w-full" type="button" @click="$emit('close')">
          Cancel
        </BaseButton>
        <BaseButton
          color="red"
          class="w-full"
          type="submit"
          @click="handleDeleteTrack"
        >
          Delete
        </BaseButton>
      </div>
    </template>
  </AppModal>
</template>
