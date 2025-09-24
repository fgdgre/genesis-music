<script setup lang="ts">
import type { QueryParams } from "@/types";
import { ref } from "vue";
import BaseInput from "./base/BaseInput.vue";
import BaseSelect from "./base/BaseSelect.vue";
import GenresSelect from "./GenresSelect.vue";
import { filtersStore } from "@/stores/filters";
import { storeToRefs } from "pinia";

defineProps<{
  isLoading?: boolean;
}>();

const store = filtersStore();

const { page, search, order, artist, genre, sort } = storeToRefs(store);

const handleUpdateFilters = () => {
  page.value = 1;
};

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
      <BaseInput
        with-debounce
        label="Search"
        placeholder="Title, Artist, Album, Date"
        v-model="search"
        @update:model-value="handleUpdateFilters"
        data-testid="search-input"
      />

      <GenresSelect
        label="Genres"
        placeholder="Select one"
        v-model="genre"
        @update:model-value="handleUpdateFilters"
        class="min-w-[150px]"
        data-testid="filter-genre"
      />

      <BaseInput
        with-debounce
        label="Artist"
        placeholder="Artist name"
        v-model="artist"
        @update:model-value="handleUpdateFilters"
        data-testid="filter-artist"
      />

      <BaseSelect
        label="Sort"
        placeholder="Select one"
        :items="sortSelectItems"
        v-model="sort"
        @update:model-value="handleUpdateFilters"
        class="min-w-[150px]"
        data-testid="sort-select"
      />

      <BaseSelect
        label="Order"
        placeholder="Select one"
        :items="orderSelectItems"
        v-model="order"
        @update:model-value="handleUpdateFilters"
        class="min-w-[150px]"
      />
    </div>
  </div>
</template>
