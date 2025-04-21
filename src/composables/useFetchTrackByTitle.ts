import { fetchTrackByTitleAPI } from "@/api/fetchTrackByTitleAPI";
import type { Track } from "@/types";
import { ref } from "vue";

export const useFetchTrackByTitle = () => {
  const trackToEdit = ref<Track | null>(null);
  const isError = ref<any>();
  const isLoading = ref<boolean>(false);

  const getTrack = async (title: string) => {
    try {
      isLoading.value = true;

      cleanupUseEditState();

      const { data, error } = await fetchTrackByTitleAPI(title);

      if (error) {
        isError.value = error;
      } else {
        const res = await data;

        trackToEdit.value = res;
      }
    } finally {
      isLoading.value = false;
    }
  };

  const cleanupUseEditState = () => {
    isError.value = null;
    trackToEdit.value = null;
  };

  return {
    trackToEdit,
    isLoading,
    isError,
    getTrack,
    cleanupUseEditState,
  };
};
