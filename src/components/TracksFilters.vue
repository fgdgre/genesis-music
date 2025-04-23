<script setup lang="ts">
import { useTrackStore } from "@/stores/tracks";
import type { QueryParams } from "@/types";
import { ref } from "vue";
import BaseInput from "./base/BaseInput.vue";
import BaseSelect from "./base/BaseSelect.vue";

defineEmits<{
  filtersChanged: [QueryParams];
}>();

const queryParams = ref<QueryParams>({
  search: "",
  genre: "",
  artist: "",
  order: "",
  sort: "",
});

const { tracksGenres } = useTrackStore();

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
        v-model="queryParams.search"
        @update:model-value="$emit('filtersChanged', queryParams)"
      />

      <BaseSelect
        label="Genres"
        placeholder="Select one"
        :items="
          tracksGenres!.map((genre) => ({
            label: genre,
            value: genre.toLocaleLowerCase(),
          }))
        "
        v-model="queryParams.genre"
        @update:model-value="$emit('filtersChanged', queryParams)"
        class="min-w-[150px]"
      />

      <BaseInput
        label="Artist"
        placeholder="Artist name"
        v-model="queryParams.artist"
        @update:model-value="$emit('filtersChanged', queryParams)"
      />

      <BaseSelect
        label="Sort"
        placeholder="Select one"
        :items="sortSelectItems"
        v-model="queryParams.sort"
        @update:model-value="$emit('filtersChanged', queryParams)"
        class="min-w-[150px]"
      />

      <BaseSelect
        label="Order"
        placeholder="Select one"
        :items="orderSelectItems"
        v-model="queryParams.order"
        @update:model-value="$emit('filtersChanged', queryParams)"
        class="min-w-[150px]"
      />
    </div>
  </div>
</template>
