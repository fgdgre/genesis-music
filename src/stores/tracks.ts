import { defineStore } from "pinia";
import type { QueryParams, Track, TracksMeta } from "@/types";
import { ref } from "vue";
import type { readonly, Ref } from "vue";
import * as api from "@/api";
import { useFetchGenres } from "@/composables/useFetchGenres";

export const useTrackStore = defineStore("tracksStore", () => {
  const initialize = ref(false);
  const tracks = ref<Track[]>();
  const tracksMeta = ref<TracksMeta | null>(null);
  // TODO fix
  const { genres: tracksGenres } = useFetchGenres();
  const isLoading = ref(false);
  const isError = ref(false);

  const fetchTracks = async ({
    page,
    filters,
  }: {
    page: Ref<number>;
    filters: Ref<QueryParams>;
  }) => {
    try {
      isLoading.value = true;

      isError.value = false;

      const { data, error } = await api.fetchTracksAPI({
        page: page.value,
        filters: filters.value,
      });

      if (error) {
        isError.value = true;
        // useToast().addToast()
      } else {
        tracks.value = data.data;
        tracksMeta.value = data.meta;
        initialize.value = true;
      }
    } finally {
      isLoading.value = false;
    }
  };

  const createTrack = async (trackData: Track) => {
    tracks.value?.unshift(trackData);
  };

  const updateTrack = (id: string, newTrack: Track) => {
    tracks.value = tracks.value?.map((t) =>
      t.id === id ? { ...t, ...newTrack } : t,
    ) as Track[];
  };

  const deleteTrack = async (id: string) => {
    tracks.value = tracks.value?.filter((t) => t.id !== id);
  };

  return {
    fetchTracks,
    createTrack,
    updateTrack,
    deleteTrack,
    initialize,
    isLoading,
    isError,
    tracks,
    tracksMeta,
    tracksGenres,
  };
});
