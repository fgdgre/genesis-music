import type { Track, TracksMeta } from "@/types";
import { ref, toValue, watchEffect, type Ref } from "vue";
import { fetchTracksAPI } from "@/api/fetchTracksAPI";

export const useFetchTracks = ({ page }: { page?: Ref<number> | number }) => {
  const tracks = ref<Track[] | null>(null);
  const tracksMeta = ref<TracksMeta | null>(null);
  const isError = ref<any>(null);
  const isLoading = ref(false);

  const fetchTracks = async () => {
    try {
      isLoading.value = true;

      isError.value = null;

      const { data, error } = await fetchTracksAPI({
        page: toValue(page) || 1,
      });

      if (error) {
        isError.value = error;
      } else {
        tracks.value = data.data;
        tracksMeta.value = data.meta;
      }
    } finally {
      isLoading.value = false;
    }
  };

  watchEffect(() => {
    fetchTracks();
  });

  const refetchTracks = () => {
    fetchTracks();
  };

  return { tracks, tracksMeta, isError, isLoading, refetchTracks };
};
