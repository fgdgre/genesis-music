import { defineStore } from "pinia";
import type { Track, TracksMeta, TracksResponse } from "@/types";
import { ref, type DeepReadonly } from "vue";
import { readonly } from "vue";
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

  const setTracks = (data: TracksResponse) => {
    if (data.meta.page > 1) {
      tracks.value = [...tracks.value, ...data.data];
    } else {
      tracks.value = data.data;
    }
  };

  const fetchTracks = async ({
    page,
    search,
    genre,
    artist,
    order,
    sort,
  }: {
    page: number;
    search?: string;
    genre?: string;
    artist?: string;
    order?: "asc" | "desc" | "";
    sort?: "title" | "artist" | "album" | "createdAt" | "";
  }) => {
    try {
      isLoading.value = true;

      const { ok, data, error, res } = await fetchTracksAPI({
        page,
        search,
        genre,
        artist,
        order,
        sort,
      });

      console.log({ ok, data, error, res });

      if (!ok) {
        setErrorMessage(error.message);

        if (initialized.value) {
          addErrorToast(error);
        }
      } else if (data) {
        clearErrors();

        setTracks(data);
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
      t.id === id ? { ...t, ...newTrack } : t
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
