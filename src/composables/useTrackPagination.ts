import { useTracksStore } from "@/stores/tracks";
import { storeToRefs } from "pinia";
import { ref, watch, watchEffect } from "vue";

export const useTrackPagination = () => {
  const trackStore = useTracksStore();

  const { isError } = storeToRefs(trackStore);

  const currentPage = ref(1);
  const search = ref("");
  const order = ref<"desc" | "asc" | "">("");
  const artist = ref("");
  const sort = ref<"title" | "artist" | "album" | "createdAt" | "">("");
  const genre = ref("");

  watch([search, order, artist, genre], () => {
    currentPage.value = 1;
  });

  watch([isError], () => {
    currentPage.value = 1;

    search.value = "";
    order.value = "";
    artist.value = "";
    genre.value = "";
  });

  watchEffect(() => {
    trackStore.fetchTracks({
      page: currentPage,
      search,
      order,
      artist,
      genre,
      sort,
    });
  });

  return { currentPage, search, order, artist, genre };
};
