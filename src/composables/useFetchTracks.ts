import type { TracksAPI } from "@/types";
import { ref, toValue, watchEffect, type Ref } from "vue";

export function useFetchTracks({ page }: { page?: Ref<number> | number }) {
  const data = ref<TracksAPI | null>(null);
  const error = ref<any>(null);
  const loading = ref(false);

  watchEffect(async () => {
    try {
      loading.value = true;

      console.log(1);
      const response = await fetch(`api/tracks?page=${toValue(page)}`);

      if (response.status !== 200) {
        throw new Error("Something vent wrong");
      }

      data.value = await response.json();
    } catch (e) {
      console.error(e);
      error.value = e;
    } finally {
      loading.value = false;
    }
  });

  return { data, error, loading };
}
