import { defineStore, storeToRefs } from "pinia";
import type { Track, TracksMeta } from "@/types";
import { ref, watchEffect } from "vue";
import { readonly } from "vue";
import { useTracksToasts } from "@/composables/useTracksToasts";
import { useInfiniteQuery } from "@tanstack/vue-query";
import { useFiltersStore } from "./filters";
import { tracksOptions } from "@/entities/tracks";

export const useTracksStore = defineStore("tracksStore", () => {
  const filterStore = useFiltersStore();
  const { search, genre, artist, order, sort } = storeToRefs(filterStore);
  const { addErrorToast } = useTracksToasts();

  const initialized = ref(false);
  const errorMessage = ref("");
  const tracks = ref<Track[]>([]);
  const tracksMeta = ref<TracksMeta | null>(null);
  const playingTrackId = ref<string | null>(null);

  const setPlayingTrackId = (id: string) => (playingTrackId.value = id);
  const clearPlayingTrackId = () => (playingTrackId.value = null);

  const { data, error, isError, isLoading, fetchNextPage, refetch } =
    useInfiniteQuery(tracksOptions({ search, genre, artist, order, sort }));

  watchEffect(() => {
    tracks.value = data.value?.data ?? [];
    tracksMeta.value = data.value?.meta;
    errorMessage.value = error.value?.message || "";

    initialized.value = true; // ???????
  });

  return {
    tracks: readonly(tracks),
    tracksMeta: readonly(tracksMeta),
    initialized: readonly(initialized),
    isLoading: readonly(isLoading),
    isError: readonly(isError),
    errorMessage: readonly(errorMessage),
    playingTrackId: readonly(playingTrackId),
    setPlayingTrackId,
    clearPlayingTrackId,
    fetchNextPage,
    refetch,
    // createTrack,
    // updateTrack,
    // deleteTrack,
    // setErrorMessage,
    // clearErrors,
  };
});
