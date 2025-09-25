import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const filtersStore = defineStore("filtersStore", () => {
  const search = ref("");
  const order = ref<"desc" | "asc" | "">("");
  const artist = ref("");
  const genre = ref("");
  const sort = ref<"title" | "artist" | "album" | "createdAt" | "">("");

  const refreshFilters = () => {
    search.value = "";
    order.value = "";
    artist.value = "";
    genre.value = "";
    sort.value = "";
  };

  const filtersEmpty = computed(
    () => !search.value && !artist.value && !genre.value,
  );

  return { search, order, artist, genre, sort, refreshFilters, filtersEmpty };
});
