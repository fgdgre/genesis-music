import { defineStore } from "pinia";
import { ref } from "vue";

export const filtersStore = defineStore("filtersStore", () => {
  const search = ref("");
  const order = ref<"desc" | "asc" | "">("");
  const artist = ref("");
  const genre = ref("");
  const sort = ref<"title" | "artist" | "album" | "createdAt" | "">("");

  // const page = ref(1);

  const refreshFilters = () => {
    search.value = "";
    order.value = "";
    artist.value = "";
    genre.value = "";
    sort.value = "";
    // page.value = 1;
  };

  return { search, order, artist, genre, sort, refreshFilters };
});
