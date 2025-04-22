import { editTrackAPI } from "@/api/editTrackAPI";
import type { NewTrack, Track } from "@/types";
import { ref } from "vue";

export const useEditTrack = () => {
  const editedTrack = ref<Track | null>(null);
  const isLoading = ref(false);
  const isError = ref<any>(null);

  const editTrack = async (track: NewTrack) => {
    try {
      isLoading.value = true;

      cleanupUseEditState();

      const { data, error } = await editTrackAPI(track);

      if (error) {
        isError.value = "error";
      } else {
        editedTrack.value = data;
      }
    } finally {
      isLoading.value = false;
    }
  };

  const cleanupUseEditState = () => {
    isError.value = null;
    editedTrack.value = null;
  };

  return { editedTrack, isLoading, isError, editTrack, cleanupUseEditState };
};
