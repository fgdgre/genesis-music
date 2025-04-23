<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import { useTracksStore } from "@/stores/tracks";
import { storeToRefs } from "pinia";
import Track from "./Track.vue";
import AppPagination from "./app/AppPagination.vue";
import AppHeader from "./app/AppHeader.vue";
import TracksFilters from "./TracksFilters.vue";
import AppErrorPage from "./app/AppErrorPage.vue";
import CreateTrackModal from "./CreateTrackModal.vue";
import AppEmptyScreen from "./app/AppEmptyScreen.vue";
import BaseButton from "./base/BaseButton.vue";
import { useTracksPaginationStore } from "@/stores/pagination";

// tracks --------------------------------------------------------------------------
const tracksStore = useTracksStore();
const { isLoading, isError, initialized, tracks, tracksMeta } =
  storeToRefs(tracksStore);
// pagination -----------------------------------------------------------------------
const paginationStore = useTracksPaginationStore();
const { page, search, order, artist, genre, sort } =
  storeToRefs(paginationStore);
// --------------------------------------------------------------------------------------

// get tracks --------------------------------------------------------------------------
const fetchTracks = () => {
  tracksStore.fetchTracks({
    page: page,
    search,
    order,
    artist,
    genre,
    sort,
  });
};

watchEffect(fetchTracks);

const noFiltersSelected = computed(
  () => !search.value && !artist.value && !genre.value && page.value === 1,
);

// create track--------------------------------------------------------
const isCreateTrackModalOpen = ref(false);
</script>

<template>
  <AppHeader title="Tracks page" :is-loading="isLoading && !initialized" />
  <main v-if="initialized" class="flex flex-col h-[calc(100svh-61px)] p-6">
    <!-- error page -------------------------------------------------------------------- -->
    <AppErrorPage v-if="isError && !initialized" @refetch="fetchTracks" />

    <!-- initial empty screen -->
    <AppEmptyScreen
      v-else-if="noFiltersSelected && !isLoading && tracks?.length === 0"
      @create-track="isCreateTrackModalOpen = true"
    />

    <!-- tracks list ------------------------------------------------------------------ -->
    <div v-else class="flex flex-col gap-4 flex-1 max-h-full">
      <div class="flex gap-4 justify-between items-end">
        <TracksFilters />

        <BaseButton @click="isCreateTrackModalOpen = true">
          Add track
        </BaseButton>
      </div>

      <!-- track list loading -->
      <div
        v-if="isLoading"
        class="flex flex-col gap-4 justify-center items-center h-full"
      >
        <p>Loading...</p>
      </div>

      <ul
        v-else-if="tracks.length"
        class="flex-1 flex flex-col overflow-auto gap-4"
      >
        <li v-for="track in tracks">
          <Track :track />
        </li>
      </ul>

      <div
        v-else
        class="flex flex-col gap-4 justify-center items-center h-full"
      >
        nothing is found
      </div>

      <AppPagination
        v-if="tracksMeta?.totalPages && tracks.length"
        v-model="page"
        :total-pages="tracksMeta.totalPages"
      />
    </div>
  </main>

  <!-- create modal-------------------------------------------------------------------- -->
  <CreateTrackModal
    v-if="isCreateTrackModalOpen"
    @close="isCreateTrackModalOpen = false"
  />
</template>
