<script setup lang="ts">
import type { Track } from "@/types";
import AppModal from "./AppModal.vue";
import TrackForm from "./TrackForm.vue";
import { ref } from "vue";

defineEmits<{
  submit: [];
  discard: [];
}>();

// const clearFormData = () => {
//   formData.value = {
//     id: "",
//     title: "",
//     album: "",
//     artist: "",
//     genres: [],
//     coverImage: "",
//   };
// };

// const modalErrorMessage = ref("");

// const {
//   newTrack,
//   isError: isSubmittingError,
//   isLoading: isSubmittingProcess,
//   postTrack,
// } = usePostTracks();

// const cleanupModalState = () => {
//   clearFormData();

//   clearErrorMessages();

//   modalErrorMessage.value = "";
// };

const handleDiscardSubmit = () => {};
</script>

<template>
  <AppModal title="Create track">
    <TrackForm />
  </AppModal>
</template>
