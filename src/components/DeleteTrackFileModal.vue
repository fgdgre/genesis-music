<script setup lang="ts">
import { deleteTrackFileAPI } from "@/entities/tracks";
import { useTracksToasts } from "@/composables/useTracksToasts";
import { useTracksStore } from "@/stores/tracks";
import type { Track } from "@/types";
import type { DeepReadonly } from "vue";
import AppModal from "./app/AppModal.vue";
import BaseButton from "./base/BaseButton.vue";

const props = defineProps<{
  track: DeepReadonly<Track>;
}>();

const emit = defineEmits<{
  close: [];
}>();

// TODO rewrite this to vue query
const handleDeleteTrackFile = async () => {
  emit("close");

  useTracksStore().clearPlayingTrackId();

  useTracksStore().updateTrack(props.track.id, {
    ...props.track,
    audioFile: undefined,
  });

  const { data, error } = await deleteTrackFileAPI(props.track.id);

  if (error) {
    useTracksToasts().addErrorToast(error);
    useTracksStore().updateTrack(props.track.id, props.track);
  }

  if (data) {
    useTracksToasts().addSuccessToast("deleteFile");
  }
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
