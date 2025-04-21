<script setup lang="ts">
import { ref, watch } from "vue";
import { useFetchTracks } from "./composables/useFetchTracks";
import type { NewTrack, QueryParams, Track } from "./types";
import { usePostTracks } from "./composables/usePostTrack";
import { useFetchGenres } from "./composables/useFetchGenres";
import { useDeleteTrack } from "./composables/useDeleteTrack";
import { useEditTrack } from "./composables/useEditTrack";

// pagination -----------------------------------------------------------------------
const currentPage = ref(1);
// --------------------------------------------------------------------------------------

// /filtering/search ----------------------------------------------------------------
const queryParams = ref<QueryParams>({
  search: "",
  genres: [],
  artist: "",
  order: "",
  sort: "createdAt",
});
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

// modal logix ------------------------------------------------------------------------------------------------------------

// add new track ----------------------------------------------------------------------
const isFormModalOpen = ref(false);

const formData = ref<NewTrack>({
  id: "",
  title: "",
  artist: "",
  album: "",
  genres: [],
  coverImage: "",
});

const oldFormDataValue = ref();

const clearFormData = () => {
  formData.value = {
    id: "",
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
  postTrack,
} = usePostTracks();

const cleanupModalState = () => {
  oldFormDataValue.value = { ...formData.value };

  clearFormData();

  modalErrorMessage.value = "";
};

const handleSubmit = () => {
  if (formData.value.id) {
    handleEditTrack(formData.value);
  } else {
    formData.value.id = self.crypto.randomUUID();
    addNewTrack(formData.value);
  }
};

const addNewTrack = (track: NewTrack) => {
  tracks.value?.unshift(track as Track);

  postTrack(track);

  isFormModalOpen.value = false;

  cleanupModalState();
};

// optimistic update --------------------------
// TODO refactor or rewrite at all
watch([newTrack, isSubmittingError], () => {
  if (tracks.value) {
    const oldTrackIndex = tracks.value.findIndex(
      (t) => t.id === oldFormDataValue.value.id,
    );

    if (isSubmittingError.value) {
      if (oldTrackIndex !== -1) {
        tracks.value.splice(oldTrackIndex, 1);
      }
      alert(isSubmittingError.value);
    }

    if (newTrack.value) {
      if (oldTrackIndex !== -1) {
        tracks.value.splice(oldTrackIndex, 1, newTrack.value);
      }
    }
  }
});
// ------------------------------------------

const handleDiscardSubmit = () => {
  isFormModalOpen.value = false;

  cleanupModalState();
};
// --------------------------------------------------------------------------------------

// delete track ---------------------------------------------------------------------------
const deleteTrackFromList = (id: string) => {
  if (tracks.value) {
    const index = tracks.value.findIndex((t) => t.id === id);
    return tracks.value.splice(index, 1)[0];
  }
};

const deletedTrack = ref();

const { isError: isErrorWhileDeleting, deleteTrack } = useDeleteTrack();

const handleDeleteTrack = (id: string) => {
  console.log("deleting", id);

  deleteTrack(id);

  deletedTrack.value = deleteTrackFromList(id);
  console.log(deletedTrack.value);
};

watch([isErrorWhileDeleting], () => {
  if (isErrorWhileDeleting.value) {
    alert(isErrorWhileDeleting.value);
    tracks.value?.unshift(deletedTrack.value);
  }
});

// Edit track ---------------------------------------------------------------------------
// get track from bd -------------------------------------------------
// const {
//   trackToEdit,
//   isError: isErrorWhileEdit,
//   getTrack,
// } = useFetchTrackByTitle();

// watch([trackToEdit, isErrorWhileEdit], () => {
//   if (isErrorWhileEdit.value) {
//     alert(isErrorWhileEdit.value);
//   }

//   if (trackToEdit.value) {
//     prefillModalData(trackToEdit.value);
//     console.log(formData.value);

//     isFormModalOpen.value = true;
//   }
// });
// get track from bd -------------------------------------------------

const replaceOldTrack = (newTrack: NewTrack) => {
  if (tracks.value) {
    const oldTrackIndex = tracks.value.findIndex((t) => t.id === newTrack.id);

    if (oldTrackIndex !== -1) {
      tracks.value?.splice(oldTrackIndex, 1, newTrack as Track);
    }
  }
};

const prefillModalData = (track: Track) => {
  formData.value.id = track.id;
  formData.value.title = track.title;
  formData.value.album = track.album;
  formData.value.artist = track.artist;
  formData.value.genres = track.genres;
  formData.value.coverImage = track.coverImage;
};

const handleOpenEditTrackModal = (id: string) => {
  const trackToEdit = tracks.value?.find((t) => t.id === id);
  if (trackToEdit) {
    prefillModalData(trackToEdit);
    isFormModalOpen.value = true;
  }
};

const {
  editedTrack,
  editTrack,
  isError: isErrorWhileEditing,
  isLoading: isEditingProcessing,
} = useEditTrack();

const handleEditTrack = (track: NewTrack) => {
  replaceOldTrack(track);

  editTrack(track);

  isFormModalOpen.value = false;

  cleanupModalState();
};

watch([editedTrack, isErrorWhileEditing], () => {
  if (isErrorWhileEditing.value) {
    alert(isErrorWhileEditing.value);
  }

  if (editedTrack.value) {
    replaceOldTrack(editedTrack.value);
  }
});
// modal logic ------------------------------------------------------------------------------------------------------------------------
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
                  v-model="queryParams.genres"
                  multiple
                >
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
                  @click="handleOpenEditTrackModal(track.id)"
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
          <!-- <genresSelect> -->
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
          <!-- </genresSelect> -->
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
</template>
