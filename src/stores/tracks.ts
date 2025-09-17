import { defineStore } from "pinia";
import type { Track, TracksMeta } from "@/types";
import { ref, type DeepReadonly } from "vue";
import { readonly, type Ref } from "vue";
import { fetchTracksAPI } from "@/entities/tracks";
import { useTracksToasts } from "@/composables/useTracksToasts";

export const useTracksStore = defineStore("tracksStore", () => {
  const { addErrorToast } = useTracksToasts();

  const initialized = ref(false);
  const tracks = ref<Track[]>([]);
  const tracksMeta = ref<TracksMeta | null>(null);
  const isLoading = ref(false);
  const isError = ref(false);
  const errorMessage = ref("");
  const playingTrackId = ref<string | null>(null);

  const setPlayingTrackId = (id: string) => (playingTrackId.value = id);
  const clearPlayingTrackId = () => (playingTrackId.value = null);

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

      const tracksResponse = await fetchTracksAPI({
        page: page.value,
        search: search?.value,
        genre: genre?.value,
        artist: artist?.value,
        order: order?.value,
        sort: sort?.value,
      });

      if (!tracksResponse.ok) {
        setErrorMessage(tracksResponse.error.message);

        page.value = 0;
        if (initialized.value) {
          page.value = 0;
          addErrorToast(tracksResponse.error);
        }
      } else {
        clearErrors();

        tracks.value = tracksResponse.data.data;
        tracksMeta.value = tracksResponse.data.meta;
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
    tracks: readonly(tracks),
    tracksMeta: readonly(tracksMeta),
    initialized: readonly(initialized),
    isLoading: readonly(isLoading),
    isError: readonly(isError),
    errorMessage: readonly(errorMessage),
    playingTrackId: readonly(playingTrackId),
    setPlayingTrackId,
    clearPlayingTrackId,
    fetchTracks,
    createTrack,
    updateTrack,
    deleteTrack,
    setErrorMessage,
    clearErrors,
  };
});
