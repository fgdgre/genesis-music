import type { Track, TracksMeta } from "@/types";
import { ref, toValue, watchEffect, type Ref } from "vue";
import { fetchTracks } from "@/api/fetchTracks";

export const useFetchTracks = ({ page }: { page?: Ref<number> | number }) => {
  const tracks = ref<Track[]>();
  const tracksMeta = ref<TracksMeta>();
  const isError = ref<any>(null);
  const isLoading = ref(false);

  const handleFetchTracks = async () => {
    try {
      isLoading.value = true;

      isError.value = null;

      const { data, error } = await fetchTracks({ page: toValue(page) || 1 });

      if (error) {
        isError.value = error;
      }

      tracks.value = data.data;
      tracksMeta.value = data.meta;
    } catch (e) {
      console.error(e);
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
