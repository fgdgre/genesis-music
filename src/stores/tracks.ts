import { defineStore } from "pinia";
import type { QueryParams, Track, TracksMeta } from "@/types";
import { ref, type DeepReadonly } from "vue";
import { readonly, type Ref } from "vue";
import * as api from "@/api";
import { useFetchGenres } from "@/composables/useFetchGenres";

export const useTrackStore = defineStore("tracksStore", () => {
  const initialized = ref(false);
  const tracks = ref<Track[]>([]);
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
      } else {
        tracks.value = data.data;
        tracksMeta.value = data.meta;
      }
    } finally {
      initialized.value = true;
      isLoading.value = false;
    }
  };

  const createTrack = (trackData: DeepReadonly<Track>) => {
    tracks.value?.unshift(trackData as Track);
  };

  const updateTrack = (id: string, newTrack: DeepReadonly<Track>) => {
    tracks.value = tracks.value?.map((t) =>
      t.id === id ? { ...t, ...newTrack } : t,
    ) as Track[];
  };

  const deleteTrack = (id: string) => {
    tracks.value = tracks.value?.filter((t) => t.id !== id);
  };

  return {
    fetchTracks,
    createTrack,
    updateTrack,
    deleteTrack,
    initialized,
    isLoading,
    isError,
    tracks: readonly(tracks),
    tracksMeta,
    tracksGenres,
  };
});
