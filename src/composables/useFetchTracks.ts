import type { Track, TracksMeta } from "@/types";
import { ref, toValue, watchEffect, type Ref } from "vue";
import { getTracks } from "@/api/getTracks";

export const useFetchTracks = ({ page }: { page?: Ref<number> | number }) => {
  const tracks = ref<Track[]>();
  const tracksMeta = ref<TracksMeta>();
  const isError = ref<any>(null);
  const isLoading = ref(false);

  const fetchTracks = async () => {
    try {
      isLoading.value = true;

      const { data, error } = await getTracks({ page: toValue(page) || 1 });

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
    fetchTracks();
  });

  const refetchTracks = () => {
    fetchTracks();
  };

  return { tracks, tracksMeta, isError, isLoading, refetchTracks };
};
