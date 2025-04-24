<script setup lang="ts">
import { computed, ref, useTemplateRef, watch, watchEffect } from "vue";
import type { QueryParams } from "@/types";
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

const tracksStore = useTracksStore();

const { isLoading, isError, errorMessage, initialized, tracks, tracksMeta } =
  storeToRefs(tracksStore);

const isCreateTrackModalOpen = ref(false);

const search = ref("");
const order = ref<"desc" | "asc" | "">("");
const artist = ref("");
const genre = ref("");
const sort = ref<"title" | "artist" | "album" | "createdAt" | "">("");

const page = ref(1);

const fetchTracks = () => {
  tracksStore.fetchTracks({
    page,
    search,
    order,
    artist,
    genre,
    sort,
  });
};

const handleFiltersChanged = (filters: QueryParams) => {
  page.value = 1;

  search.value = filters.search;
  order.value = filters.order;
  artist.value = filters.artist;
  genre.value = filters.genre;
  sort.value = filters.sort;

  fetchTracks();
};

watch(
  page,
  () => {
    fetchTracks();
  },
  { immediate: true },
);

const filtersEmpty = computed(
  () => !search.value && !artist.value && !genre.value && page.value === 1,
);

const initializedWithEmptyTracks = computed(
  () => filtersEmpty.value && tracks.value?.length === 0,
);
</script>

<template>
  <AppHeader title="Tracks page" :is-loading="isLoading && !initialized" />

  <main v-if="initialized" class="flex flex-col h-[calc(100svh-61px)]">
    <AppErrorPage
      v-if="initializedWithEmptyTracks && isError"
      :error-message="errorMessage"
      @refetch="fetchTracks"
      :is-loading="isLoading"
    />

    <AppEmptyScreen
      v-else-if="initializedWithEmptyTracks && !isLoading"
      @create-track="isCreateTrackModalOpen = true"
    />

    <div v-else class="flex flex-col gap-4 flex-1 max-h-full">
      <div class="flex gap-4 justify-between items-end px-6 pt-6">
        <TracksFilters @filters-changed="handleFiltersChanged" />

        <BaseButton
          @click="isCreateTrackModalOpen = true"
          data-testid="create-track-button"
        >
          Add track
        </BaseButton>
      </div>

      <div
        v-if="isLoading"
        class="flex flex-col gap-4 justify-center items-center h-full"
        data-testid="loading-tracks"
        :data-loading="true"
      >
        <p>Loading...</p>
      </div>

      <ul
        v-else-if="tracks.length"
        class="flex-1 flex flex-col overflow-auto gap-4 px-6"
      >
        <li v-for="track in tracks">
          <Track :track />
        </li>
      </ul>

      <div
        v-else
        class="flex flex-col gap-4 justify-center items-center h-full"
      >
        Nothing is found
      </div>

      <AppPagination
        v-if="tracksMeta?.totalPages && tracks.length"
        class="px-2 pb-2"
        v-model="page"
        :total-pages="tracksMeta.totalPages"
        :is-loading="isLoading"
      />
    </div>
  </main>

  <CreateTrackModal
    v-if="isCreateTrackModalOpen"
    @close="isCreateTrackModalOpen = false"
  />
</template>
