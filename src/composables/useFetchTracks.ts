import type { Track, TracksMeta } from "@/types";
import { ref, toValue, watchEffect, type Ref } from "vue";
import { fetchTracks } from "@/api/fetchTracks";

export const useFetchTracks = ({ page }: { page?: Ref<number> | number }) => {
  const tracks = ref<Track[] | null>(null);
  const tracksMeta = ref<TracksMeta | null>(null);
  const isError = ref<any>(null);
  const isLoading = ref(false);

  const handleFetchTracks = async () => {
    try {
      isLoading.value = true;

      isError.value = null;

      const { data, error } = await fetchTracks({ page: toValue(page) || 1 });

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
    handleFetchTracks();
  });

  const refetchTracks = () => {
    handleFetchTracks();
  };

  return { tracks, tracksMeta, isError, isLoading, refetchTracks };
};
