<script setup lang="ts">
import AppModal from "./app/AppModal.vue";
import BaseButton from "./base/BaseButton.vue";
import type { Track } from "@/types";
import { useTracksStore } from "@/stores/tracks";
import { storeToRefs } from "pinia";
import { deleteTrackAPI } from "@/api";
import { useToast } from "@/stores/toast";
import type { DeepReadonly } from "vue";

const props = defineProps<{
  track: DeepReadonly<Track>;
}>();

const emit = defineEmits<{
  close: [];
}>();

const tracksStore = useTracksStore();
const { tracks } = storeToRefs(tracksStore);

const toastsStore = useToast();

const handleDeleteTrack = async () => {
  const trackBeforeRequest = tracks.value!.find(
    (t) => t.id === props.track.id,
  )!;

  tracksStore.deleteTrack(props.track.id);

  emit("close");

  if (trackBeforeRequest.slug) {
    const { data, error } = await deleteTrackAPI(props.track.id);

    if (error) {
      toastsStore.addToast({
        title: "Something went wrong",
        description: error,
        color: "red",
        icon: "warning",
      });

      tracksStore.createTrack(trackBeforeRequest);
    }

    if (data) {
      toastsStore.addToast({
        title: "Track successfully deleted",
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
  <AppModal title="Delete track" data-testid="confirm-dialog">
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
          data-testid="cancel-delete"
        >
          Cancel
        </BaseButton>
        <BaseButton
          color="red"
          class="w-full"
          type="submit"
          @click="handleDeleteTrack"
          data-testid="confirm-delete"
        >
          Delete
        </BaseButton>
      </div>
    </template>
  </AppModal>
</template>
