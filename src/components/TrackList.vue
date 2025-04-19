<script setup lang="ts">
import type { Track } from "@/types";
import TrackTile from "./TrackTile.vue";

defineProps<{
  loading?: boolean;
  tracks?: Track[];
  totalPages?: number;
}>();

const currentPage = defineModel<number>({ default: 1 });
</script>
<template>
  <div v-if="tracks?.length && !loading" class="flex flex-col gap-4 h-full">
    <ul class="flex-1 flex flex-col">
      <TrackTile v-for="track in tracks" :track />
    </ul>

    <div v-if="totalPages" class="grid grid-cols-2 gap-4">
      <button
        v-if="currentPage !== 1"
        class="col-start-1 bg-gray-500"
        @click="currentPage--"
      >
        -
      </button>
      <button
        v-if="currentPage < totalPages"
        class="col-start-2 bg-gray-500"
        @click="currentPage++"
      >
        +
      </button>
    </div>
  </div>

  <div v-else-if="loading">
    <p>Loading...</p>
  </div>

  <div v-else></div>
</template>
