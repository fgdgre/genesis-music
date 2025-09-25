<script setup lang="ts">
import {
  computed,
  onMounted,
  onUnmounted,
  ref,
  toRef,
  useTemplateRef,
  watch,
} from "vue";
import { useTracksStore } from "@/stores/tracks";
import { storeToRefs } from "pinia";
import Track from "./Track.vue";
import AppHeader from "./app/AppHeader.vue";
import TracksFilters from "./TracksFilters.vue";
import AppErrorPage from "./app/AppErrorPage.vue";
import CreateTrackModal from "./CreateTrackModal.vue";
import AppEmptyScreen from "./app/AppEmptyScreen.vue";
import BaseButton from "./base/BaseButton.vue";
import { filtersStore } from "@/stores/filters";
import { useInfiniteScroll } from "@vueuse/core";
import FetchMoreButton from "./app/FetchMoreButton.vue";

const tracksStore = useTracksStore();

const { isLoading, isError, errorMessage, initialized, tracks, tracksMeta } =
  storeToRefs(tracksStore);

const store = filtersStore();

const { page, search, order, artist, genre, sort } = storeToRefs(store);

const isCreateTrackModalOpen = ref(false);

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

const handleFetchNextPage = () => {
  if (!tracksMeta.value) return;
  if (tracksMeta.value.page === tracksMeta.value.totalPages) return;

  tracksStore.fetchTracks({
    page: toRef(page.value + 1),
    search,
    order,
    artist,
    genre,
    sort,
  });
};

const filtersEmpty = computed(
  () => !search.value && !artist.value && !genre.value && page.value === 1,
);

const initializedWithEmptyTracks = computed(
  () => filtersEmpty.value && tracks.value?.length === 0,
);

watch(
  [search, order, artist, genre, sort],
  () => {
    tracksStore.clearPlayingTrackId();

    fetchTracks();
  },
  { immediate: true },
);

const tracksListRef = useTemplateRef("tracksList");
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
      <div class="flex gap-4 justify-between items-end px-6 pt-4">
        <TracksFilters />

        <BaseButton
          @click="isCreateTrackModalOpen = true"
          data-testid="create-track-button"
        >
          Add track
        </BaseButton>
      </div>

      <!-- <div
        v-if="isLoading"
        class="flex flex-col gap-4 justify-center items-center h-full"
        data-testid="loading-tracks"
        :data-loading="true"
      >
        <p>Loading...</p>
      </div> -->

      <ul
        v-if="tracks.length"
        class="flex-1 flex flex-col overflow-auto gap-2 px-6 pr-2.5 pb-10"
        ref="tracksList"
      >
        <li v-for="(track, index) in tracks">
          <Track :track />
        </li>

        <FetchMoreButton
          @click="handleFetchNextPage"
          @in-viewport="handleFetchNextPage"
        />
      </ul>

      <div
        v-else
        class="flex flex-col gap-4 justify-center items-center h-full"
      >
        Nothing is found
      </div>

      <!-- <AppPagination
        v-if="tracksMeta?.totalPages && tracks.length"
        class="px-2 pb-2"
        v-model="page"
        :total-pages="tracksMeta.totalPages"
        :is-loading="isLoading"
      /> -->
    </div>
  </main>

  <CreateTrackModal
    v-if="isCreateTrackModalOpen"
    @close="isCreateTrackModalOpen = false"
  />
</template>
