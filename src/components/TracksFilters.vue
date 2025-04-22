<script setup lang="ts">
import { useFetchGenres } from "@/composables/useFetchGenres";

// defineEmits<{
//   filtersChanged: [];
// }>();

const search = defineModel<string>("search");
const genre = defineModel<string>("genre");
const sort = defineModel<string>("sort");
const order = defineModel<string>("order");
const artist = defineModel<string>("artist");

const { genres } = useFetchGenres();
</script>

<template>
  <div class="flex gap-4">
    <div class="flex gap-4 items-end">
      <label class="flex flex-col gap-1">
        Search
        <input
          class="px-4 py-2 border rounded-md"
          placeholder="Title, Artist, Album, Date"
          v-model="search"
        />
      </label>

      <!-- <genresSelect> -->
      <label class="flex flex-col gap-1">
        Genres
        <select class="px-4 py-2 border rounded-md" v-model="genre">
          <option value=""></option>
          <option v-for="genre in genres" :value="genre">
            {{ genre }}
          </option>
        </select>
      </label>
      <!-- </genresSelect> -->
      <label class="flex flex-col gap-1">
        Artist
        <input
          class="px-4 py-2 border rounded-md"
          placeholder="Artist name"
          v-model="artist"
        />
      </label>

      <label class="flex flex-col gap-1">
        Sort
        <select
          class="px-4 py-2 border rounded-md"
          placeholder="Title, Artist, Album, Date"
          v-model="sort"
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
          v-model="order"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </label>
    </div>
  </div>
</template>
