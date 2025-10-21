<script setup lang="ts">
import AppModal from "./app/AppModal.vue";
import BaseButton from "./base/BaseButton.vue";
import { useTracksToasts } from "@/composables/useTracksToasts";
import { ref, type DeepReadonly } from "vue";
import { MAX_FILES_SIZE } from "@/consts";
import { postTrackFileAPI } from "@/entities/tracks";
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
  if (!["audio/mpeg", "audio/wav"].includes(file.type)) {
    trackFileInputErrorMessage.value = "File should be in MP3 or WAV format";
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

    const { data, error } = await postTrackFileAPI(
      props.track.id,
      trackFile.value
    );

    if (error) {
      addErrorToast(error);
      return;
    }

    if (data) {
      addSuccessToast("uploadFile");

      useTracksStore().updateTrack(props.track.id, data);
    }
  }
};
</script>

<template>
  <AppModal title="Upload track file">
    <div class="flex flex-col gap-2">
      <p class="text-placeholder">Please upload audio file for this track</p>

      <div>
        <input
          type="file"
          accept="audio/*"
          placeholder="Upload your file here"
          @change="onFileChange"
          class="px-3 py-1 bg-transparent rounded-md border border-border text-base md:text-sm font-normal placeholder:text-placeholder focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border-focus text-foreground w-full h-9"
          :class="[
            Boolean(trackFileInputErrorMessage) &&
              'border-error text-error placeholder:text-red-300 focus-visible:ring-error',
          ]"
        />

        <p v-if="trackFileInputErrorMessage" class="text-error text-xs mt-1">
          {{ trackFileInputErrorMessage }}
        </p>
      </div>
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
          @click="handleUploadTrackFile"
          data-testid="confirm-upload-file"
        >
          Upload
        </BaseButton>
      </div>
    </template>
  </AppModal>
</template>
