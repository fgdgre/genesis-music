import { useTracksStore } from "@/stores/tracks";
import { defineStore, storeToRefs } from "pinia";
import { ref, watch } from "vue";

export const useTracksPaginationStore = defineStore(
  "useTracksPaginationStore",
  () => {
    const trackStore = useTracksStore();

    const { isError } = storeToRefs(trackStore);

    const page = ref(1);
    const search = ref("");
    const order = ref<"desc" | "asc" | "">("");
    const artist = ref("");
    const sort = ref<"title" | "artist" | "album" | "createdAt" | "">("");
    const genre = ref("");

    watch([search, order, artist, genre, sort], () => {
      page.value = 1;
    });

    watch([isError], () => {
      page.value = 1;

      search.value = "";
      order.value = "";
      artist.value = "";
      genre.value = "";
    });

    return { page, search, order, artist, genre, sort };
  },
);
