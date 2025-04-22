<script setup lang="ts">
import { ref, watch } from "vue";
import type { QueryParams } from "@/types";
import { useTrackStore } from "@/stores/tracks";
import { storeToRefs } from "pinia";
import TrackTile from "./TrackTile.vue";
import AppPagination from "./app/AppPagination.vue";
import AppHeader from "./app/AppHeader.vue";
import TracksFilters from "./TracksFilters.vue";
import AppErrorPage from "./app/AppErrorPage.vue";
import CreateTrackModal from "./CreateTrackModal.vue";
import BaseBaseButton from "./base/BaseButton.vue";
import BaseButton from "./base/BaseButton.vue";
import AppEmptyScreen from "./app/AppEmptyScreen.vue";

// /filtering/search ----------------------------------------------------------------
const queryParams = ref<QueryParams>({
  search: "",
  genre: "",
  artist: "",
  order: "",
  sort: "",
});
// --------------------------------------------------------------------------------------

// pagination -----------------------------------------------------------------------
const currentPage = ref(1);
// --------------------------------------------------------------------------------------

// store ----------------------------------------------------------------------------
const tracksStore = useTrackStore();

const { isLoading, isError, initialize, tracks, tracksMeta } =
  storeToRefs(tracksStore);

// get tracks --------------------------------------------------------------------------
const fetchTracks = () => {
  tracksStore.fetchTracks({ page: currentPage, filters: queryParams });
};

const handleFiltersChanged = (filters: QueryParams) => {
  currentPage.value = 1;

  queryParams.value = filters;

  fetchTracks();
};

watch(
  [currentPage],
  () => {
    fetchTracks();
  },
  { immediate: true },
);

// create track--------------------------------------------------------
const isCreateTrackModalOpen = ref(false);
</script>
<template>
  <AppHeader title="Tracks page" :is-loading="isLoading && !initialize" />

  <main class="flex flex-col h-[calc(100svh-61px)] p-6">
    <!-- error page -------------------------------------------------------------------- -->
    <AppErrorPage v-if="isError && !isLoading" @refetch="fetchTracks" />

    <!-- tracks list ------------------------------------------------------------------ -->
    <div
      v-if="!isError && initialize"
      class="flex flex-col gap-4 flex-1 max-h-full"
    >
      <template v-if="tracks && initialize">
        <div class="flex gap-4 justify-between items-end">
          <TracksFilters @filters-changed="handleFiltersChanged" />

          <BaseBaseButton @click="isCreateTrackModalOpen = true">
            Add track
          </BaseBaseButton>
        </div>

        <!-- track list loading -->
        <div
          v-if="isLoading && initialize"
          class="flex flex-col gap-4 justify-center items-center h-full"
        >
          <p>Loading...</p>
        </div>

        <ul
          v-if="!isLoading && tracks.length"
          class="flex-1 flex flex-col overflow-auto gap-4"
        >
          <li v-for="track in tracks">
            <TrackTile :track />
          </li>
        </ul>

        <div
          v-if="!isLoading && !tracks.length && initialize"
          class="flex flex-col gap-4 justify-center items-center h-full"
        >
          nothing is found
        </div>

        <AppPagination
          v-if="tracksMeta?.totalPages && tracks.length"
          v-model="currentPage"
          :total-pages="tracksMeta.totalPages"
        />
      </template>

      <!-- initial empty screen -->

      <AppEmptyScreen
        v-if="!tracks && initialize"
        @create-track="isCreateTrackModalOpen = true"
      />
    </div>
  </main>

  <!-- create modal-------------------------------------------------------------------- -->
  <CreateTrackModal
    v-if="isCreateTrackModalOpen"
    @close="isCreateTrackModalOpen = false"
  />

  <!-- upload file modal -->
  <!-- <template v-if="isUploadFileModalOpen">
    <div class="fixed top-0 left-0 w-full h-full bg-black/50 z-30"></div>

    <div
      class="fixed top-[50%] translate-y-[-50%] left-[50%] translate-x-[-50%] w-full h-full flex items-center justify-center z-30"
    >
      <div
        class="max-w-[400px] max-h-[500px] bg-white rounded-md flex flex-col gap-5 p-6"
      >
        <p>Upload your file with music for this track</p>
        <label>
          file
          <input type="file" accept="audio/*" @change="onFileChange" />
        </label>
        <div class="col-span-2 w-full flex gap-2">
          <BaseButton
            class="flex-1"
            type="BaseButton"
            @click="isUploadFileModalOpen = false"
          >
            Cancel
          </BaseButton>
          <BaseButton
            class="bg-black text-white flex-1"
            type="submit"
            @click="handleUploadTrackFile"
          >
            {{
              isSubmittingProcess || isEditingProcessing
                ? "Submitting..."
                : "Submit"
            }}
          </BaseButton>
        </div>
      </div>
    </div>
  </template> -->
</template>
