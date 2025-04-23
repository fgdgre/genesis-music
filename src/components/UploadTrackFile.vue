<script setup lang="ts">
import AppModal from "./app/AppModal.vue";
import BaseButton from "./base/BaseButton.vue";
import BaseInput from "./base/BaseInput.vue";
import { useTracksToasts } from "@/composables/useTracksToasts";
import { ref } from "vue";

const emit = defineEmits<{
  close: [];
}>();

const { addErrorToast, addSuccessToast } = useTracksToasts();

const trackFile = ref<File>();

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) {
    trackFile.value = file;
    console.log(trackFile.value);
    console.log(trackFile.value);
  }
}

const handleUploadTrackFile = async () => {
  emit("close");

  // const { data, error } = await postTrackFile(props.track.id, trackFile.value);

  // if (error) {
  //   tracksStore.isError = true;

  //   tracksStore.createTrack(props.track);

  //   addErrorToast(error);
  // }

  // if (data) {
  //   tracksStore.deleteNotSubmittedTrack(props.track.id);

  //   if (!notSubmittedTracks.value.length) {
  //     tracksStore.isError = false;
  //   }

  //   addSuccessToast("delete");
  // }
  // }
};
</script>

<template>
  <AppModal title="Upload track file" data-testid="confirm-dialog">
    <p>Please upload audio file for this track</p>

    <BaseInput type="file" accept="audio/*" @change="onFileChange" />

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
          class="w-full"
          type="submit"
          @click="handleUploadTrackFile"
          data-testid="confirm-delete"
        >
          Upload
        </BaseButton>
      </div>
    </template>
  </AppModal>
</template>
