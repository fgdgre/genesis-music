import { postTrackAPI } from "@/api/postTrackAPI";
import type { NewTrack, Track } from "@/types";
import { ref } from "vue";

export const usePostTracks = () => {
  const newTrack = ref<Track | null>(null);
  const isLoading = ref(false);
  const isError = ref<any>(null);

  const postTrack = async (track: NewTrack) => {
    try {
      isLoading.value = true;

      cleanupUsePostState();

      const { data, error } = await postTrackAPI(track);

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

  return { newTrack, isLoading, isError, postTrack, cleanupUsePostState };
};
