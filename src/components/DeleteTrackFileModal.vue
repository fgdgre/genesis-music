<script setup lang="ts">
import { deleteTrackFileAPI } from "@/entities/tracks/tracks";
import { useTracksToasts } from "@/composables/useTracksToasts";
import { useTracksStore } from "@/stores/tracks";
import type { Track } from "@/types";
import type { DeepReadonly } from "vue";
import AppModal from "./app/AppModal.vue";
import BaseButton from "./base/BaseButton.vue";
import { deleteFileInfiniteTrackMutation } from "@/entities/tracks/mutations";

const props = defineProps<{
  track: DeepReadonly<Track>;
}>();

const emit = defineEmits<{
  close: [];
}>();

const trackStore = useTracksStore();

const { mutate } = deleteFileInfiniteTrackMutation();

const handleDeleteTrackFile = async () => {
  emit("close");

  if (trackStore.playingTrackId == props.track.id) {
    trackStore.clearPlayingTrackId();
  }

  mutate(props.track.id);
};
</script>

<template>
  <AppModal title="Delete track file">
    <div class="flex flex-col gap-2">
      <p>
        Do you want to delete audio file for this track with id
        <span>{{ track.id }}</span
        >?
      </p>
    </div>

    <template #actions>
      <div class="col-span-2 w-full flex gap-2">
        <BaseButton
          transparent
          class="w-full"
          type="button"
          @click="$emit('close')"
          data-testid="cancel-upload-file"
        >
          Cancel
        </BaseButton>

        <BaseButton
          class="w-full"
          type="submit"
          color="orange"
          @click="handleDeleteTrackFile"
          data-testid="confirm-delete-file"
        >
          Delete
        </BaseButton>
      </div>
    </template>
  </AppModal>
</template>
