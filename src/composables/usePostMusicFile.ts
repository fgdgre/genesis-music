import { postMusicFileAPI } from "@/api/postMusicFileAPI";
import { postTrackAPI } from "@/api/postTrackAPI";
import type { NewTrack, Track } from "@/types";
import { ref } from "vue";

export const usePostMusicFile = () => {
  const data = ref<Track | null>(null);
  const isLoading = ref(false);
  const isError = ref<any>(null);

  const postMusicFile = async (id: string, file: File) => {
    try {
      isLoading.value = true;

      cleanupUsePostState();

      const { data: response, error } = await postMusicFileAPI(id, file);

      console.log(data, error);

      if (error) {
        isError.value = error;
      } else {
        data.value = response;
      }
    } finally {
      isLoading.value = false;
    }
  };

  const cleanupUsePostState = () => {
    isError.value = null;
    data.value = null;
  };

  return { data, isLoading, isError, postMusicFile, cleanupUsePostState };
};
