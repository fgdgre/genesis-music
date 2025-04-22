<script setup lang="ts">
import { useTrackStore } from "@/stores/tracks";
import type { QueryParams } from "@/types";
import { ref } from "vue";
import BaseInput from "./BaseInput.vue";

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

      <!-- <genresSelect> -->
      <label class="flex flex-col gap-1">
        Genres
        <select
          class="px-4 py-2 border rounded-md"
          v-model="queryParams.genre"
          @change="$emit('filtersChanged', queryParams)"
        >
          <option value=""></option>
          <option v-for="genre in tracksGenres" :value="genre">
            {{ genre }}
          </option>
        </select>
      </label>
      <!-- </genresSelect> -->
      <BaseInput
        label="Artist"
        placeholder="Artist name"
        v-model="queryParams.artist"
        @update:model-value="$emit('filtersChanged', queryParams)"
      />

      <label class="flex flex-col gap-1">
        <select
          class="px-4 py-2 border rounded-md"
          placeholder="Title, Artist, Album, Date"
          v-model="queryParams.sort"
          @change="$emit('filtersChanged', queryParams)"
        >
          <option value=""></option>
          <option value="title">Title</option>
          <option value="artist">Artist</option>
          <option value="album">Album</option>
          <option value="createdAt">Created At</option>
        </select>
      </label>

      <label class="flex flex-col gap-1">
        Order
        <select
          class="px-4 py-2 border rounded-md"
          placeholder="Title, Artist, Album, Date"
          v-model="queryParams.order"
          @change="$emit('filtersChanged', queryParams)"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </label>
    </div>
  </div>
</template>
