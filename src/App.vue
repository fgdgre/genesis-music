<script setup lang="ts">
import { ref } from "vue";
import { useFetchTracks } from "./composables/useFetchTracks";
import type { NewTrack } from "./types";
import { usePostTracks } from "./composables/usePostTrack";
import { useFetchGenres } from "./composables/useFetchGenres";

// pagination/filtering ----------------------------------------------------------------
const currentPage = ref(1);
// --------------------------------------------------------------------------------------

// get tracks --------------------------------------------------------------------------
const { tracks, tracksMeta, isLoading, isError, refetchTracks } =
  useFetchTracks({
    page: currentPage,
  });
// --------------------------------------------------------------------------------------

// genres -------------------------------------------------------------------------------
const { genres } = useFetchGenres();
// -------------------------------------------------------------------------------------

// add new track ----------------------------------------------------------------------
const isFormModalOpen = ref(false);

const formData = ref<NewTrack>({
  title: "",
  artist: "",
  album: "",
  genres: [],
  coverImage: "",
});

const clearFormData = () => {
  formData.value = {
    title: "",
    artist: "",
    album: "",
    genres: [],
    coverImage: "",
  };
};

const modalErrorMessage = ref("");

const {
  newTrack,
  isError: isSubmittingError,
  isLoading: isSubmittingProcess,
  handlePostTrack,
  cleanUpState,
} = usePostTracks(formData.value);

const cleanupModalState = () => {
  clearFormData();
  cleanUpState();
  modalErrorMessage.value = "";
};

const handleSubmit = async () => {
  await handlePostTrack(formData.value);

  if (isSubmittingError.value) {
    modalErrorMessage.value = isSubmittingError.value;
  }

  if (!isSubmittingError.value && newTrack.value) {
    tracks.value?.unshift(newTrack.value);

    isFormModalOpen.value = false;

    cleanupModalState();
  }
};

const handleDiscardSubmit = () => {
  isFormModalOpen.value = false;

  cleanupModalState();
};
// --------------------------------------------------------------------------------------

// delete track ---------------------------------------------------------------------------
const handleDeleteTrack = (id: string) => {
  console.log("deleting", id);
};

// Edit track ---------------------------------------------------------------------------
const handleEditTrack = (id: string) => {
  console.log("editting", id);
};
</script>

<template>
  <main class="flex flex-col h-full w-full p-6">
    <!-- error page -------------------------------------------------------------------- -->
    <div
      v-if="isError && !isLoading"
      class="flex flex-col gap-4 justify-center items-center h-full"
    >
      <p class="text-red-400">{{ isError }}</p>
      <button
        class="bg-black rounded-md text-white px-4 py-2"
        @click="refetchTracks"
      >
        Refetch
      </button>
    </div>

    <!-- tracks list ------------------------------------------------------------------ -->
    <template v-else>
      <div
        v-if="isLoading"
        class="flex flex-col gap-4 justify-center items-center h-full"
      >
        <p>Loading...</p>
      </div>

      <div v-else class="flex flex-col gap-4 h-full">
        <template v-if="tracks?.length">
          <button
            @click="isFormModalOpen = true"
            class="bg-black text-white px-4 py-3 rounded-md w-fit text-sm"
          >
            Add track
          </button>

          <ul class="flex-1 flex flex-col overflow-auto">
            <li v-for="track in tracks">
              <div>{{ track }}</div>

              <div class="flex gap-2">
                <button
                  @click="handleDeleteTrack(track.id)"
                  class="bg-red-400 text-black px-4 py-3 rounded-md w-fit text-sm"
                >
                  Delete
                </button>
                <button
                  @click="handleEditTrack(track.id)"
                  class="bg-yellow-400 text-black px-4 py-3 rounded-md w-fit text-sm"
                >
                  Edit
                </button>
              </div>
            </li>
          </ul>

          <div v-if="tracksMeta?.totalPages" class="grid grid-cols-2 gap-4">
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

        <div
          v-else
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
    </template>
    <!-- ------------------------------------------------------------------ -->
  </main>

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
              v-model="formData.title"
            />
          </label>
          <label class="flex flex-col gap-1">
            Artist
            <input
              class="px-4 py-2 border rounded-md"
              v-model="formData.artist"
            />
          </label>
          <label class="flex flex-col gap-1">
            Album
            <input
              class="px-4 py-2 border rounded-md"
              v-model="formData.album"
            />
          </label>
          <label class="flex flex-col gap-1">
            Genres
            <select
              class="px-4 py-2 border rounded-md"
              v-model="formData.genres"
              multiple
            >
              <option v-for="genre in genres" :value="genre">
                {{ genre }}
              </option>
            </select>
          </label>
          <label class="flex flex-col gap-1">
            Cover image
            <input
              class="px-4 py-2 border rounded-md"
              v-model="formData.coverImage"
            />
          </label>

          <div class="col-span-2 w-full flex gap-2">
            <button class="flex-1" type="button" @click="handleDiscardSubmit">
              Cancel
            </button>
            <button class="bg-black text-white flex-1" type="submit">
              {{ isSubmittingProcess ? "Submitting..." : "Submit" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </template>
  <!-- modal-------------------------------------------------------------------- -->
</template>
