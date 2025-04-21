import { postTrack } from "@/api/postTrack";
import type { NewTrack, Track } from "@/types";
import { ref } from "vue";

export const usePostTracks = () => {
  const newTrack = ref<Track | null>(null);
  const isLoading = ref(false);
  const isError = ref<any>(null);

  const handlePostTrack = async (track: NewTrack) => {
    try {
      isLoading.value = true;

      cleanupUsePostState();

      const { data, error } = await postTrack(track);

      if (error) {
        isError.value = error;
      } else {
        newTrack.value = data;
      }
    } finally {
      isLoading.value = false;
    }
  };

  const cleanupUsePostState = () => {
    isError.value = null;
    newTrack.value = null;
  };

  return { newTrack, isLoading, isError, handlePostTrack, cleanupUsePostState };
};
