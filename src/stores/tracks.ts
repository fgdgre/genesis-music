import { defineStore } from "pinia";
import type { Track, TracksMeta } from "@/types";
import { ref, watchEffect, type DeepReadonly } from "vue";
import { readonly, type Ref } from "vue";
import * as api from "@/api";
import { useTracksToasts } from "@/composables/useTracksToasts";

export const useTracksStore = defineStore("tracksStore", () => {
  const { addErrorToast } = useTracksToasts();

  const initialized = ref(false);
  const tracks = ref<Track[]>([]);
  const tracksMeta = ref<TracksMeta | null>(null);
  const isLoading = ref(false);
  const isError = ref(false);
  const errorMessage = ref("");
  const conunt = ref(0);

  // not submitted tracks logic ------------------------------------
  const notSubmittedTracks = ref<Track[]>([]);

  const addNotSubmittedTrack = (trackData: DeepReadonly<Track>) => {
    notSubmittedTracks.value?.push(trackData as Track);
  };

  const deleteNotSubmittedTrack = (id: string) => {
    notSubmittedTracks.value = notSubmittedTracks.value?.filter(
      (t) => t.id !== id,
    );
  };
  // ---------------------------------------------------------------

  const clearErrors = () => {
    isError.value = false;
    errorMessage.value = "";
  };

  const setErrorMessage = (message: string) => {
    isError.value = true;
    errorMessage.value = message;
  };

  const fetchTracks = async ({
    page,
    search,
    genre,
    artist,
    order,
    sort,
  }: {
    page: Ref<number>;
    search?: Ref<string>;
    genre?: Ref<string>;
    artist?: Ref<string>;
    order?: Ref<"asc" | "desc" | "">;
    sort?: Ref<"title" | "artist" | "album" | "createdAt" | "">;
  }) => {
    try {
      isLoading.value = true;

      const { data, error } = await api.fetchTracksAPI({
        page: page.value,
        search: search?.value,
        genre: genre?.value,
        artist: artist?.value,
        order: order?.value,
        sort: sort?.value,
      });

      if (error) {
        setErrorMessage(error.message);

        if (initialized.value) {
          addErrorToast(error);
        }
      } else {
        clearErrors();

        tracks.value = data.data;
        tracksMeta.value = data.meta;
      }
    } finally {
      initialized.value = true;
      isLoading.value = false;
      conunt.value++;
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
    tracks: readonly(tracks),
    tracksMeta: readonly(tracksMeta),
    initialized: readonly(initialized),
    isLoading: readonly(isLoading),
    isError: readonly(isError),
    errorMessage: readonly(errorMessage),
    // not submitted
    notSubmittedTracks: readonly(notSubmittedTracks),
    // -------------
    fetchTracks,
    createTrack,
    updateTrack,
    deleteTrack,
    setErrorMessage,
    clearErrors,
    // not submitted
    addNotSubmittedTrack,
    deleteNotSubmittedTrack,
  };
});
