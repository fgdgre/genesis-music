import { defineStore } from "pinia";
import type { Track } from "@/types";
import { ref } from "vue";
import type { Ref } from "vue";
import { useFetchTracks } from "./useFetchTracks";

export const useTrackManager = defineStore("tracksStore", () => {
  const tracks = ref<Track[]>();
  const isLoading = ref(false);
  const error = ref(false);

  const fetchTracks = async ({
    page,
    filters,
  }: {
    page: number;
    filters: {};
  }) => {
    const {
      tracks: data,
      isLoading: fetchTrackLoading,
      isError,
      tracksMeta,
      refetchTracks,
    } = useFetchTracks({ page });
    isLoading.value = fetchTrackLoading.value;

    if (isError.value) {
      error.value = isError.value;
    } else {
      tracks.value = data.value as Track[];
    }
  };

  const createTrack = async (trackData: Track) => {};
  const editTrack = async (trackData: Track) => {};
  const deleteTrack = async (id: Track) => {};

  return { fetchTracks, createTrack };
});
