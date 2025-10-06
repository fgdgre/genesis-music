import { defineStore, storeToRefs } from "pinia";
import type { Track, TracksDTO, TracksMeta } from "@/types";
import { ref, toValue, watchEffect } from "vue";
import { readonly } from "vue";
import { fetchTracksAPI } from "@/entities/tracks";
import { useTracksToasts } from "@/composables/useTracksToasts";
import { useInfiniteQuery } from "@tanstack/vue-query";
import { filtersStore } from "./filters";

export const useTracksStore = defineStore("tracksStore", () => {
  const store = filtersStore();
  const { search, genre, artist, order, sort } = storeToRefs(store);
  const { addErrorToast } = useTracksToasts();

  const initialized = ref(false);
  const tracks = ref<Track[]>([]);
  const tracksMeta = ref<TracksMeta | null>(null);
  const isError = ref(false);
  const errorMessage = ref("");
  const isLoading = ref(false);
  const playingTrackId = ref<string | null>(null);

  const setPlayingTrackId = (id: string) => (playingTrackId.value = id);
  const clearPlayingTrackId = () => (playingTrackId.value = null);

  // const clearErrors = () => {
  //   isError.value = false;
  //   errorMessage.value = "";
  // };

  // const setErrorMessage = (message: string) => {
  //   isError.value = true;
  //   errorMessage.value = message;
  // };

  const handleFetchTracks = async ({
    pageParam = 1,
    signal,
  }: {
    signal: AbortSignal;
    pageParam: number;
  }) => {
    try {
      const data = await fetchTracksAPI({
        page: pageParam,
        search: toValue(search),
        genre: toValue(genre),
        artist: toValue(artist),
        order: toValue(order),
        sort: toValue(sort),
        signal,
      });

      return data;
    } catch (e) {
      addErrorToast(e);
    }
  };
  const {
    data,
    error: tracksError,
    isError: isTracksError,
    isLoading: isTracksLoading,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["tracks", search, genre, artist, order, sort],
    initialPageParam: 1,
    queryFn: handleFetchTracks,
    select: (data) => ({
      data: data.pages.flatMap((p) => p.data) ?? [],
      meta: data.pages[data.pages.length - 1]?.meta,
    }),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.meta;
      return page < totalPages ? page + 1 : undefined;
    },
  });

  watchEffect(() => {
    tracks.value = data.value?.data ?? [];
    tracksMeta.value = data.value?.meta;
    isError.value = isTracksError.value;
    errorMessage.value = tracksError.value?.message || "";
    isLoading.value = isTracksLoading.value;

    initialized.value = true;
  });

  // const createTrack = (trackData: DeepReadonly<Track>) => {
  //   tracks.value?.unshift(trackData as Track);
  // };

  // const updateTrack = (id: string, newTrack: DeepReadonly<Track>) => {
  //   tracks.value = tracks.value?.map((t) =>
  //     t.id === id ? { ...t, ...newTrack } : t,
  //   ) as Track[];
  // };

  // const deleteTrack = (id: string) => {
  //   tracks.value = tracks.value?.filter((t) => t.id !== id);
  // };

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
