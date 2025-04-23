<script setup lang="ts">
import type { QueryParams } from "@/types";
import BaseInput from "./base/BaseInput.vue";
import BaseSelect from "./base/BaseSelect.vue";
import GenresSelect from "./GenresSelect.vue";
import { useTracksPaginationStore } from "@/stores/pagination";
import { storeToRefs } from "pinia";

defineEmits<{
  filtersChanged: [QueryParams];
}>();

const paginationStore = useTracksPaginationStore();
const { search, order, artist, genre, sort } = storeToRefs(paginationStore);

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
        label="Search"
        placeholder="Title, Artist, Album, Date"
        v-model="search"
      />

      <GenresSelect
        label="Genres"
        placeholder="Select one"
        v-model="genre"
        class="min-w-[150px]"
      />

      <BaseInput label="Artist" placeholder="Artist name" v-model="artist" />

      <BaseSelect
        label="Sort"
        placeholder="Select one"
        :items="sortSelectItems"
        v-model="sort"
        class="min-w-[150px]"
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
