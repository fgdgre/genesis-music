<script setup lang="ts">
import { computed, ref, useTemplateRef, watch } from "vue";
import { useTracksStore } from "@/stores/tracks";
import { storeToRefs } from "pinia";

const tracksStore = useTracksStore();

const { isLoading, isError, errorMessage, initialized, tracks, tracksMeta } =
  storeToRefs(tracksStore);

const filtersStore = useFiltersStore();

const { search, order, artist, genre, sort, filtersEmpty } =
  storeToRefs(filtersStore);

const playbackStore = usePlaybackStore();

const { queueListVisible } = storeToRefs(playbackStore);

const isCreateTrackModalOpen = ref(false);

const fetchTracks = () => {
  tracksStore.fetchTracks({
    page: filtersEmpty.value ? tracksMeta.value?.page || 1 : 1,
    search: search.value,
    order: order.value,
    artist: artist.value,
    genre: genre.value,
    sort: sort.value,
  });
};

const initializedWithEmptyTracks = computed(
  () =>
    filtersEmpty.value &&
    tracksMeta.value?.page === 1 &&
    tracks.value?.length === 0
);

const tracksListRef = useTemplateRef("tracksList");

watch(
  [search, order, artist, genre, sort],
  () => {
    tracksListRef.value?.scroll({
      behavior: "instant",
      top: 0,
    });

    fetchTracks();
  },
  { immediate: true }
);
</script>

<template>
  <AppHeader title="Tracks page" :is-loading="isLoading" />

  <main
    v-if="initialized"
    class="flex flex-col h-[calc(100svh-61px)] w-full overflow-hidden"
  >
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

    <div
      v-else
      class="flex flex-1 max-h-full translate-all w-full overflow-hidden"
    >
      <div class="flex flex-col gap-4 flex-1 max-h-full pb-20">
        <div class="flex gap-4 justify-between items-end px-4 pt-4">
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
            !tracks.length &&
            filtersEmpty &&
            tracksMeta?.page === 1
          "
          class="flex flex-col gap-4 justify-center items-center h-full"
          data-testid="loading-tracks"
          :data-loading="true"
        >
          <p>Loading...</p>
        </div>

        <div
          v-else-if="tracks.length"
          class="flex flex-1 gap-4 w-full overflow-hidden"
        >
          <ul
            class="flex-4 flex flex-col overflow-auto gap-2 pl-4 pr-2.5"
            data-testid="tracks-list"
            ref="tracksList"
          >
            <li v-for="track in tracks">
              <Track :track />
            </li>

            <FetchMoreButton
              v-if="tracksMeta?.page && tracksMeta.page < tracksMeta.totalPages"
              :disabled="isLoading"
              @click="tracksStore.fetchNextPage"
              @in-viewport="tracksStore.fetchNextPage"
            />
          </ul>

          <QueueList v-if="queueListVisible" class="pr-2" />
        </div>

        <div
          v-else
          class="flex flex-col gap-4 justify-center items-center h-full"
        >
          Nothing is found
        </div>
      </div>
    </div>
  </main>

  <CreateTrackModal
    v-if="isCreateTrackModalOpen"
    @close="isCreateTrackModalOpen = false"
  />
</template>
