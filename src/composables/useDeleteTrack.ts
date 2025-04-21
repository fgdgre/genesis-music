import { deleteTrackAPI } from "@/api/deleteTrackAPI";
import { ref } from "vue";

export const useDeleteTrack = () => {
  const deletedTrackId = ref<any>();
  const isError = ref<any>();
  const isLoading = ref<boolean>(false);

  const deleteTrack = async (id: string) => {
    try {
      isLoading.value = true;

      cleanupUseDeleteState();

      const { data, error } = await deleteTrackAPI(id);

      if (error) {
        isError.value = error;
      } else {
        deletedTrackId.value = data;
      }
    } finally {
      isLoading.value = false;
    }
  };

  const cleanupUseDeleteState = () => {
    isError.value = null;
    deletedTrackId.value = null;
  };

  return {
    deletedTrackId,
    isLoading,
    isError,
    deleteTrack,
    cleanupUseDeleteState,
  };
};
