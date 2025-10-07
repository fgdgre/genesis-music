import { defineStore, storeToRefs } from "pinia";
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

  const errorMessage = ref("");
  const playingTrackId = ref<string | null>(null);

  const setPlayingTrackId = (id: string) => (playingTrackId.value = id);
  const clearPlayingTrackId = () => (playingTrackId.value = null);

  const {
    data,
    error,
    isError,
    isLoading,
    fetchNextPage,
    refetch,
    hasNextPage,
  } = useInfiniteQuery(tracksOptions({ search, genre, artist, order, sort }));

  // TODO GLOBAL: mutations for CRUD + invalidations
  // TODO: error notification
  watchEffect(() => {
    errorMessage.value = error.value?.message || "";
  });

  return {
    tracks: data,
    isLoading: readonly(isLoading),
    isError: readonly(isError),
    errorMessage: readonly(errorMessage),
    playingTrackId: readonly(playingTrackId),
    hasNextPage,
    setPlayingTrackId,
    clearPlayingTrackId,
    fetchNextPage,
    refetch,
    // createTrack, // TODO
    // updateTrack, // TODO
    // deleteTrack, // TODO
  };
});
