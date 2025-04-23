import { defineStore } from "pinia";
import type { QueryParams, Track, TracksMeta } from "@/types";
import { ref, type DeepReadonly } from "vue";
import { readonly, type Ref } from "vue";
import * as api from "@/api";
import { useFetchGenres } from "@/composables/useFetchGenres";
import { useToast } from "./toast";

export const useTrackStore = defineStore("tracksStore", () => {
  const toastStore = useToast();

  const initialized = ref(false);
  const tracks = ref<Track[]>([]);
  const tracksMeta = ref<TracksMeta | null>(null);
  const isLoading = ref(false);
  const isError = ref(false);

  const counter = ref(0);

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

      if (error || counter.value === 1) {
        if (initialized.value) {
          toastStore.addToast({
            title: "Something went wrong",
            description: "Error while fetching tracks",
            color: "red",
          });
        }
        isError.value = true;
      } else {
        tracks.value = data.data;
        tracksMeta.value = data.meta;
      }
    } finally {
      initialized.value = true;
      isLoading.value = false;
      counter.value++;
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
    tracksMeta: readonly(tracksMeta),
  };
});
