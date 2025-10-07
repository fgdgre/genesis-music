<script setup lang="ts">
import { computed, ref, useTemplateRef, watch } from "vue";
import { useTracksStore } from "@/stores/tracks";
import { useFiltersStore } from "@/stores/filters";
import { storeToRefs } from "pinia";
import Track from "./Track.vue";
import AppHeader from "./app/AppHeader.vue";
import TracksFilters from "./TracksFilters.vue";
import AppErrorPage from "./app/AppErrorPage.vue";
import CreateTrackModal from "./CreateTrackModal.vue";
import AppEmptyScreen from "./app/AppEmptyScreen.vue";
import BaseButton from "./base/BaseButton.vue";
import FetchMoreButton from "./app/FetchMoreButton.vue";

const tracksStore = useTracksStore();
const filtersStore = useFiltersStore();

const { isLoading, isError, errorMessage, tracks, initialized, hasNextPage } =
  storeToRefs(tracksStore);

const { search, order, artist, genre, sort, filtersEmpty } =
  storeToRefs(filtersStore);

const isCreateTrackModalOpen = ref(false);

const initializedWithEmptyTracks = computed(
  () =>
    initialized.value &&
    filtersEmpty.value &&
    tracks.value?.meta.page === 1 &&
    tracks.value?.data.length === 0,
);

const tracksListRef = useTemplateRef("tracksList");

watch(
  [search, order, artist, genre, sort],
  () => {
    tracksListRef.value?.scroll({
      behavior: "instant",
      top: 0,
    });
  },
  { immediate: true },
);
</script>

<template>
  <AppHeader title="Tracks page" :is-loading="isLoading" />
  <main class="flex flex-col h-[calc(100svh-61px)]">
    <AppErrorPage
      v-if="initializedWithEmptyTracks && isError"
      :error-message="errorMessage"
      @refetch="tracksStore.refetch"
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

      <div
        v-if="
          isLoading &&
          !tracks?.data.length &&
          filtersEmpty &&
          (tracks?.meta.page || 1) === 1
        "
        class="flex flex-col gap-4 justify-center items-center h-full"
        data-testid="loading-tracks"
        :data-loading="true"
      >
        <p>Loading...</p>
      </div>

      <ul
        v-else-if="tracks?.data.length"
        class="flex-1 flex flex-col overflow-auto gap-2 px-6 pr-2.5 pb-10"
        data-testid="tracks-list"
        ref="tracksList"
      >
        <li v-for="track in tracks.data">
          <Track :track />
        </li>

        <!-- tracks?.meta.page && tracks?.meta.page < tracks?.meta.totalPages -->
        <FetchMoreButton
          v-if="hasNextPage"
          :disabled="isLoading"
          @click="() => tracksStore.fetchNextPage"
          @in-viewport="tracksStore.fetchNextPage"
        />
      </ul>

      <div
        v-else
        class="flex flex-col gap-4 justify-center items-center h-full"
      >
        Nothing is found
      </div>
    </div>
  </main>

  <CreateTrackModal
    v-if="isCreateTrackModalOpen"
    @close="isCreateTrackModalOpen = false"
  />
</template>
