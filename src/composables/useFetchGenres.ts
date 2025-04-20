import { onMounted, ref, toValue, watchEffect, type Ref } from "vue";
import { getTrackGenres } from "@/api/getTrackGenres";

export const useFetchGenres = () => {
  const genres = ref();
  const isError = ref<any>(null);
  const isLoading = ref(false);

  const fetchGenres = async () => {
    try {
      isLoading.value = true;

      const { data, error } = await getTrackGenres();

      if (error) {
        isError.value = error;
      }

      genres.value = data;
    } catch (e) {
      console.error(e);
    } finally {
      isLoading.value = false;
    }
  };

  onMounted(() => {
    fetchGenres();
  });

  const refetchGenres = () => {
    fetchGenres();
  };

  return { genres, isError, isLoading, refetchGenres };
};
