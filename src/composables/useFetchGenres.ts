import { onMounted, ref } from "vue";
import { fetchTrackGenres } from "@/api/fetchTrackGenres";

export const useFetchGenres = () => {
  const genres = ref<string[] | null>(null);
  const isError = ref<any>(null);
  const isLoading = ref(false);

  const handleFetchTrackGenres = async () => {
    try {
      isLoading.value = true;

      isError.value = null;

      const { data, error } = await fetchTrackGenres();

      if (error) {
        genres.value = null;
        isError.value = error;
      } else {
        genres.value = data;
        isError.value = null;
      }
    } finally {
      isLoading.value = false;
    }
  };

  onMounted(() => {
    handleFetchTrackGenres();
  });

  return { genres, isError, isLoading };
};
