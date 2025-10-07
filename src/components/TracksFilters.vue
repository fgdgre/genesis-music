<script setup lang="ts">
import BaseInput from "./base/BaseInput.vue";
import BaseSelect from "./base/BaseSelect.vue";
import GenresSelect from "./GenresSelect.vue";
import { useFiltersStore } from "@/stores/filters";
import { storeToRefs } from "pinia";

defineProps<{
  isLoading?: boolean;
}>();

const filtersStore = useFiltersStore();

const { search, order, artist, genre, sort } = storeToRefs(filtersStore);

const sortSelectItems = [
  { label: "Artist", value: "artist" },
  { label: "Album", value: "album" },
  { label: "Created At", value: "createdAt" },
];

const orderSelectItems = [
  { label: "Ascending", value: "asc" },
  { label: "Descending", value: "desc" },
];
</script>

<template>
  <div class="flex gap-4">
    <div class="flex gap-4 items-end">
      <!-- with-debounce -->
      <BaseInput
        label="Search"
        placeholder="Title, Artist, Album, Date"
        v-model="search"
        data-testid="search-input"
      />

      <GenresSelect
        label="Genres"
        placeholder="Select one"
        v-model="genre"
        class="min-w-[150px]"
        data-testid="filter-genre"
      />

      <BaseInput
        with-debounce
        label="Artist"
        placeholder="Artist name"
        v-model="artist"
        data-testid="filter-artist"
      />

      <BaseSelect
        label="Sort"
        placeholder="Select one"
        :items="sortSelectItems"
        v-model="sort"
        class="min-w-[150px]"
        data-testid="sort-select"
      />

      <BaseSelect
        label="Order"
        placeholder="Select one"
        :items="orderSelectItems"
        v-model="order"
        class="min-w-[150px]"
      />
    </div>
  </div>
</template>
