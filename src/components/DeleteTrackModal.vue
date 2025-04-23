<script setup lang="ts">
import AppModal from "./AppModal.vue";
import BaseButton from "./base/BaseButton.vue";
import type { Track } from "@/types";
import { useTrackStore } from "@/stores/tracks";
import { storeToRefs } from "pinia";
import { deleteTrackAPI } from "@/api";
import { useToast } from "@/stores/toast";

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
    useToast().addToast({
      title: "Something went wrong",
      description: error,
      color: "red",
      icon: "warning",
    });
    tracksStore.createTrack(oldTrack);
  }

  if (data) {
    useToast().addToast({
      title: "Track successfully deleted",
      color: "green",
      icon: "check",
    });
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
        <BaseButton
          transparent
          class="w-full"
          type="button"
          @click="$emit('close')"
        >
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
