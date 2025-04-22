<script setup lang="ts">
import { ref, watch, watchEffect } from "vue";
import type { QueryParams } from "@/types";
import { useTrackStore } from "@/stores/tracks";
import { storeToRefs } from "pinia";
import TrackTile from "./TrackTile.vue";
import AppPagination from "./app/AppPagination.vue";
import AppHeader from "./app/AppHeader.vue";
import TracksFilters from "./TracksFilters.vue";
import AppErrorPage from "./app/AppErrorPage.vue";
import CreateTrackModal from "./CreateTrackModal.vue";

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

watch(
  queryParams,
  () => {
    currentPage.value = 1;
  },
  { deep: true },
);
// --------------------------------------------------------------------------------------

// store ----------------------------------------------------------------------------
const tracksStore = useTrackStore();

const { isLoading, isError, initialize, tracks, tracksMeta } =
  storeToRefs(tracksStore);

const fetchTracks = () => {
  tracksStore.fetchTracks({ page: currentPage, filters: queryParams });
};

// get tracks --------------------------------------------------------------------------
watch(
  [queryParams],
  () => {
    fetchTracks();
  },
  { deep: true, immediate: true },
);

const isCreateTrackFormModalOpen = ref(false);
</script>
<template>
  <AppHeader title="Tracks page" :is-loading="isLoading && !initialize" />

  <main class="flex flex-col h-full w-full p-6">
    <!-- error page -------------------------------------------------------------------- -->

    <AppErrorPage v-if="isError && !isLoading" @refetch="fetchTracks" />

    <!-- tracks list ------------------------------------------------------------------ -->
    <div v-if="!isError" class="flex flex-col gap-4 h-full">
      <template v-if="tracks && initialize">
        <div class="flex gap-4 justify-between items-end">
          <TracksFilters
            v-model:search="queryParams.search"
            v-model:sort="queryParams.sort"
            v-model:genre="queryParams.genre"
            v-model:artist="queryParams.artist"
            v-model:order="queryParams.order"
          />
          <button
            @click="isCreateTrackFormModalOpen = true"
            class="bg-black text-white px-4 py-3 rounded-md w-fit text-sm h-min"
          >
            Add track
          </button>
        </div>

        <!-- track list loading -->
        <div
          v-if="isLoading"
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
      <div
        v-if="initialize && !isError && !isError && !tracks?.length"
        class="flex flex-col gap-4 justify-center items-center h-full"
      >
        <p>looks like you dont have tracks</p>
        <button
          @click="isFormModalOpen = true"
          class="bg-black text-white px-4 py-3 rounded-md w-fit text-sm"
        >
          Add track
        </button>
      </div>
    </div>
  </main>

  <!-- modal-------------------------------------------------------------------- -->
  <CreateTrackModal v-if="isCreateTrackFormModalOpen" />
  <!-- <div
      class="fixed top-[50%] translate-y-[-50%] left-[50%] translate-x-[-50%] w-full h-full flex items-center justify-center z-30"
    >
      <div class="max-w-[400px] max-h-[500px] bg-white rounded-md">
        <p v-if="modalErrorMessage" class="text-red-400">
          {{ modalErrorMessage }}
        </p>
        <form @submit.prevent="handleSubmit" class="grid grid-cols-2 gap-4 p-6">
          <label class="flex flex-col gap-1">
            Title
            <input
              class="px-4 py-2 border rounded-md"
              :class="[errorMessages.title && 'border-red-400']"
              v-model="formData.title"
            />
            <p v-if="errorMessages.title" class="text-red-400">
              {{ errorMessages.title }}
            </p>
          </label>
          <label class="flex flex-col gap-1">
            Artist
            <input
              class="px-4 py-2 border rounded-md"
              :class="[errorMessages.artist && 'border-red-400']"
              v-model="formData.artist"
            />
            <p v-if="errorMessages.artist" class="text-red-400">
              {{ errorMessages.artist }}
            </p>
          </label>
          <label class="flex flex-col gap-1">
            Album
            <input
              class="px-4 py-2 border rounded-md"
              :class="[errorMessages.album && 'border-red-400']"
              v-model="formData.album"
            />
            <p v-if="errorMessages.album" class="text-red-400">
              {{ errorMessages.album }}
            </p>
          </label>
          <label class="flex flex-col gap-1">
            Genres
            <select
              class="px-4 py-2 border rounded-md"
              :class="[errorMessages.genres && 'border-red-400']"
              v-model="formData.genres"
              multiple
            >
              <option v-for="genre in genres" :value="genre">
                {{ genre }}
              </option>
            </select>
            <p v-if="errorMessages.genres" class="text-red-400">
              {{ errorMessages.genres }}
            </p>
          </label>
          <label class="flex flex-col gap-1">
            Cover image
            <input
              class="px-4 py-2 border rounded-md"
              :class="[errorMessages.coverImage && 'border-red-400']"
              v-model="formData.coverImage"
            />
            <p v-if="errorMessages.coverImage" class="text-red-400">
              {{ errorMessages.coverImage }}
            </p>
          </label>

          <div class="col-span-2 w-full flex gap-2">
            <button class="flex-1" type="button" @click="handleDiscardSubmit">
              Cancel
            </button>
            <button class="bg-black text-white flex-1" type="submit">
              {{
                isSubmittingProcess || isEditingProcessing
                  ? "Submitting..."
                  : "Submit"
              }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </template> -->
  <!-- modal-------------------------------------------------------------------- -->

  <!-- upload file modal -->
  <template v-if="isUploadFileModalOpen">
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
          <button
            class="flex-1"
            type="button"
            @click="isUploadFileModalOpen = false"
          >
            Cancel
          </button>
          <button
            class="bg-black text-white flex-1"
            type="submit"
            @click="handleUploadTrackFile"
          >
            {{
              isSubmittingProcess || isEditingProcessing
                ? "Submitting..."
                : "Submit"
            }}
          </button>
        </div>
      </div>
    </div>
  </template>
</template>
