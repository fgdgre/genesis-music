import { onMounted, ref } from "vue";
import { fetchGenresAPI } from "@/api";

export const useFetchGenres = () => {
  const genres = ref<string[] | null>(null);
  const isError = ref<any>(null);
  const isLoading = ref(false);

  const fetchTrackGenres = async () => {
    try {
      isLoading.value = true;

      isError.value = null;

      const { data, error } = await fetchGenresAPI();

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
    fetchTrackGenres();
  });

  return { genres, isError, isLoading };
};
