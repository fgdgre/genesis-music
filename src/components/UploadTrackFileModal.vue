<script setup lang="ts">
import AppModal from "./app/AppModal.vue";
import BaseButton from "./base/BaseButton.vue";
import BaseInput from "./base/BaseInput.vue";
import { useTracksToasts } from "@/composables/useTracksToasts";
import { ref, type DeepReadonly } from "vue";
import { MAX_FILES_SIZE } from "@/consts";
import { postTrackFileAPI } from "@/api";
import type { Track } from "@/types";
import { useTracksStore } from "@/stores/tracks";

const props = defineProps<{
  track: DeepReadonly<Track>;
}>();

const emit = defineEmits<{
  close: [];
}>();

const { addErrorToast, addSuccessToast } = useTracksToasts();

const trackFileInputErrorMessage = ref("");

const trackFile = ref<File>();

const onFileChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) {
    trackFile.value = file;
    validateUploadedFile(file);
  }
};

const validateUploadedFile = (file?: File) => {
  if (!file) {
    trackFileInputErrorMessage.value = "This is required field";
    return;
  }
  if (!file.type.includes("audio")) {
    trackFileInputErrorMessage.value = "File should be with audio format";
    return;
  }
  if (file.size > MAX_FILES_SIZE) {
    trackFileInputErrorMessage.value = "File is too big";
    return;
  }
  trackFileInputErrorMessage.value = "";
};

const handleUploadTrackFile = async () => {
  validateUploadedFile(trackFile.value);
  if (
    trackFile.value &&
    props.track.slug &&
    !trackFileInputErrorMessage.value
  ) {
    emit("close");

    const formData = new FormData();
    formData.append("file", trackFile.value);

    const { data, error } = await postTrackFileAPI(props.track.id, formData);

    if (error) {
      addErrorToast(error);
      return;
    }

    if (data) {
      addSuccessToast("delete");

      useTracksStore().updateTrack(props.track.id, data);
    }
  }
};
</script>

<template>
  <AppModal title="Upload track file" data-testid="confirm-dialog">
    <div class="flex flex-col gap-2">
      <p class="text-gray-400">Please upload audio file for this track</p>

      <BaseInput
        type="file"
        accept="audio/*"
        @change="onFileChange"
        placeholder="Upload your file here"
        :error-message="trackFileInputErrorMessage"
      />
    </div>

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
