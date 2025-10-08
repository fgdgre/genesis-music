<script setup lang="ts">
import AppModal from "./app/AppModal.vue";
import BaseButton from "./base/BaseButton.vue";
import type { Track } from "@/types";
import { useTracksStore } from "@/stores/tracks";
import type { DeepReadonly } from "vue";
import { deleteInfiniteTrackMutation } from "@/entities/tracks/mutations";

const props = defineProps<{
  track: DeepReadonly<Track>;
}>();

const emit = defineEmits<{
  close: [];
}>();

const tracksStore = useTracksStore();
const { mutate } = deleteInfiniteTrackMutation();

const handleDeleteTrack = () => {
  emit("close");

  if (tracksStore.playingTrackId == props.track.id) {
    tracksStore.clearPlayingTrackId();
  }

  mutate(props.track.id);
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
