<script setup lang="ts">
import { ref } from "vue";
import { useFetchTracks } from "./composables/useFetchTracks";
import TrackList from "./components/TrackList.vue";
import TrackForm from "./components/TrackForm.vue";
import type { NewTrack } from "./types";

const page = ref(1);

const { data, loading, error } = useFetchTracks({ page });
const modalOpen = ref(false);

const handleAddNewTrack = (track: NewTrack) => {
  console.log(track);
};
</script>

<template>
  <main class="flex flex-col h-full w-full">
    <div
      v-if="error"
      class="flex flex-col gap-4 justify-center items-center h-full"
    >
      <p class="text-red-400">{{ error }}</p>
      <button class="bg-black rounded-md text-white px-4 py-2" @click="">
        Refetch
      </button>
    </div>

    <template v-else>
      <button @click="modalOpen = true">Add track</button>
      <TrackList
        :tracks="data?.data"
        v-model="page"
        :total-pages="data?.meta.totalPages"
        :loading
      />
    </template>
  </main>

  <TrackForm
    v-if="modalOpen"
    @close="modalOpen = false"
    @submit="handleAddNewTrack"
  />
</template>
