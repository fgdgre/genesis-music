<script setup lang="ts">
import { ref, watch } from "vue";
import type { QueryParams } from "@/types";
import { useTrackStore } from "@/stores/tracks";
import { storeToRefs } from "pinia";
import TrackTile from "./TrackTile.vue";

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
fetchTracks();
</script>
<template>
  <!-- error page -------------------------------------------------------------------- -->
  <div
    v-if="isError && !isLoading"
    class="flex flex-col gap-4 justify-center items-center h-full"
  >
    <p class="text-red-400">{{ isError }}</p>
    <button
      class="bg-black rounded-md text-white px-4 py-2"
      @click="fetchTracks"
    >
      Refetch
    </button>
  </div>

  <!-- initial loading -->
  <div
    v-else-if="isLoading && !initialize"
    class="flex flex-col gap-4 justify-center items-center h-full"
  >
    <p>Loading...</p>
  </div>

  <!-- tracks list ------------------------------------------------------------------ -->
  <div v-else class="flex flex-col gap-4 h-full">
    <template v-if="tracks && initialize">
      <div class="flex gap-4 justify-between items-end">
        <div class="flex gap-4 items-end">
          <label class="flex flex-col gap-1">
            Search
            <input
              class="px-4 py-2 border rounded-md"
              placeholder="Title, Artist, Album, Date"
              v-model="queryParams.search"
            />
          </label>

          <!-- <genresSelect> -->
          <label class="flex flex-col gap-1">
            Genres
            <select
              class="px-4 py-2 border rounded-md"
              v-model="queryParams.genre"
            >
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
              v-model="queryParams.artist"
            />
          </label>

          <label class="flex flex-col gap-1">
            Sort
            <select
              class="px-4 py-2 border rounded-md"
              placeholder="Title, Artist, Album, Date"
              v-model="queryParams.sort"
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
              v-model="queryParams.order"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </label>
        </div>

        <button
          @click="isFormModalOpen = true"
          class="bg-black text-white px-4 py-3 rounded-md w-fit text-sm h-min"
        >
          Add track
        </button>
      </div>

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
          <div class="flex gap-4 items-center">
            <img
              :src="
                track.coverImage ||
                'https://community.spotify.com/t5/image/serverpage/image-id/55829iC2AD64ADB887E2A5/image-dimensions/2500?v=v2&px=-1'
              "
              class="size-20 shrink-0 rounded-md"
            />
            <p>{{ track }}</p>

            <div class="flex gap-2">
              <button
                @click="handleDeleteTrack(track.id)"
                class="bg-red-400 text-black px-4 py-3 rounded-md w-fit text-sm"
              >
                Delete
              </button>
              <button
                @click="handleOpenEditTrackModal(track)"
                class="bg-yellow-400 text-black px-4 py-3 rounded-md w-fit text-sm"
              >
                Edit
              </button>
              <button
                @click="handleOpenUploadFileModal(track.id)"
                class="bg-green-400 text-black px-4 py-3 rounded-md w-fit text-sm"
              >
                Upload track file
              </button>
            </div>
          </div>
        </li>
      </ul>

      <div
        v-if="!isLoading && !tracks.length && initialize"
        class="flex flex-col gap-4 justify-center items-center h-full"
      >
        nothing is found
      </div>

      <div
        v-if="tracksMeta?.totalPages && tracks.length"
        class="grid grid-cols-2 gap-4"
      >
        <button
          v-if="currentPage !== 1"
          class="col-start-1 bg-gray-500"
          @click="currentPage--"
        >
          -
        </button>
        <button
          v-if="currentPage < tracksMeta?.totalPages"
          class="col-start-2 bg-gray-500"
          @click="currentPage++"
        >
          +
        </button>
      </div>
    </template>

    <div v-else class="flex flex-col gap-4 justify-center items-center h-full">
      <p>looks like you dont have tracks</p>
      <button
        @click="isFormModalOpen = true"
        class="bg-black text-white px-4 py-3 rounded-md w-fit text-sm"
      >
        Add track
      </button>
    </div>
  </div>
  <!-- </template> -->

  <!-- modal-------------------------------------------------------------------- -->
  <template v-if="isFormModalOpen">
    <div class="fixed top-0 left-0 w-full h-full bg-black/50 z-30"></div>

    <div
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
          <!-- <genresSelect> -->
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
          <!-- </genresSelect> -->
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
  </template>
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
