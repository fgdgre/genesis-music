import { postTrack } from "@/api/postTrack";
import type { NewTrack, Track } from "@/types";
import { ref } from "vue";

export const usePostTracks = async (track: NewTrack) => {
  const newTrack = ref<Track | null>(null);
  const isLoading = ref(false);
  const isError = ref<any>(null);

  try {
    isLoading.value = true;

    const { data, error } = await postTrack(track);

    if (error) {
      throw new Error(error);
    }

    if (!error && data) {
      console.log(3, data, error);
      newTrack.value = data;
    }
  } catch (e) {
    console.log(e);
    isError.value = e;
  } finally {
    isLoading.value = false;
  }

  return { newTrack, isLoading, isError };
};
