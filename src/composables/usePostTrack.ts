import { postTrack } from "@/api/postTrack";
import type { NewTrack } from "@/types";
import { ref, watchEffect } from "vue";

type APITrack = {
  id: number;
  titles: string;
  artists: string;
  albums: string;
  genres: string[];
  slugs: string;
  coverImages: string;
  createdAt: Date;
  updatedAt: Date;
};

export const usePostTracks = async (track: NewTrack) => {
  const newTrack = ref<APITrack | null>(null);
  const isLoading = ref(false);
  const isError = ref<any>(null);

  // const postNewTrack = async () => {
  try {
    isLoading.value = true;

    const { data, error } = await postTrack(track);

    console.log(1, data, error);
    if (error) {
      console.log(2, data, error);
      throw new Error(error);
    }

    if (!error && data) {
      console.log(3, data, error);
      newTrack.value = data;
    }
  } catch (e) {
    // console.log(e);
    isError.value = e;
    console.log(4, isError.value);
  } finally {
    isLoading.value = false;
  }
  // };

  // postNewTrack();

  return { newTrack, isLoading, isError };
};
