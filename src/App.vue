<script setup lang="ts">
import { storeToRefs } from "pinia";
import BaseToastsGroup from "./components/base/toast/BaseToastsGroup.vue";
import TracksPage from "./components/TracksPage.vue";
import { useToast } from "./stores/toast";
// --------------------------------------------------------------------------------------

// // genres -------------------------------------------------------------------------------
// const { genres } = useFetchGenres();

// // modal logic ------------------------------------------------------------------------------------------------------------
// // add new track ----------------------------------------------------------------------
// const isFormModalOpen = ref(false);

// const formData = ref<Track>({
//   id: "",
//   title: "",
//   artist: "",
//   album: "",
//   genres: [],
//   coverImage: "",
// });

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

// // validation -----------------------------------------------------------------------------------------------------------
// const schema = z.object({
//   title: z.string().trim().nonempty({ message: "Title is required field" }),
//   artist: z.string().trim().nonempty({ message: "Artist is required field" }),
//   album: z.string().trim().nonempty({ message: "Album is required field" }),
//   genres: z.array(z.string()).nonempty({ message: "Genres is required field" }),
//   coverImage: z
//     .string()
//     .trim()
//     .refine((val) => val === "" || z.string().url().safeParse(val).success, {
//       message: "Invalid URL",
//     })
//     .optional(),
// });

// const validateForm = (formData: Track, schema: z.Schema<Partial<Track>>) => {
//   return schema.safeParse(formData);
// };

// const errorMessages = ref({
//   title: "",
//   artist: "",
//   album: "",
//   genres: "",
//   coverImage: "",
// });

// const clearErrorMessages = () => {
//   errorMessages.value = {
//     title: "",
//     artist: "",
//     album: "",
//     genres: "",
//     coverImage: "",
//   };
// };

// const setErrors = (error: z.ZodError) => {
//   clearErrorMessages();

//   for (const fieldKey in error.formErrors.fieldErrors) {
//     if (error.formErrors.fieldErrors?.[fieldKey]?.length) {
//       errorMessages.value[fieldKey as keyof typeof errorMessages.value] =
//         error.formErrors.fieldErrors[fieldKey]?.[0];
//     }
//   }
// };

// // ----------------------------------------------------------------------------------------------------------------------------------

// const handleSubmit = () => {
//   const { error } = validateForm(formData.value, schema);

//   if (error) {
//     setErrors(error);
//     return;
//   }

//   if (formData.value.id) {
//     handleEditTrack(formData.value);
//   } else {
//     formData.value.id = self.crypto.randomUUID();
//     addNewTrack(formData.value);
//   }
// };

// const addNewTrack = async (track: Track) => {
//   const oldId = formData.value.id;

//   tracks.value?.unshift(track as Track);

//   isFormModalOpen.value = false;

//   cleanupModalState();

//   await postTrack(track);

//   if (isSubmittingError.value) {
//     deleteTrackFromList(oldId);
//     alert(isSubmittingError.value);
//   }

//   if (newTrack.value) {
//     updateTrack(oldId, newTrack.value);
//   }
// };

// const handleDiscardSubmit = () => {
//   isFormModalOpen.value = false;

//   cleanupModalState();
// };
// // --------------------------------------------------------------------------------------

// // delete track ---------------------------------------------------------------------------
// const deleteTrackFromList = (id: string) => {
//   if (tracks.value) {
//     let removedTrack;

//     tracks.value = tracks.value.filter((t) => {
//       if (t.id === id) {
//         removedTrack = t;
//         return;
//       }
//       return t;
//     });

//     return removedTrack;
//   }
// };

// const deletedTrack = ref();

// const { isError: isErrorWhileDeleting, deleteTrack } = useDeleteTrack();

// const handleDeleteTrack = async (id: string) => {
//   deletedTrack.value = deleteTrackFromList(id);

//   await deleteTrack(id);

//   if (isErrorWhileDeleting.value) {
//     alert(isErrorWhileDeleting.value);
//     tracks.value?.unshift(deletedTrack.value);
//   }
// };
// // Edit track ---------------------------------------------------------------------------

// const updateTrack = (id: string, newTrack: Track) => {
//   tracks.value = tracks.value?.map((t) =>
//     t.id === id ? { ...t, ...newTrack } : t,
//   ) as Track[];
// };

// const prefillModalData = (track: Track) => {
//   formData.value.id = track.id;
//   formData.value.title = track.title;
//   formData.value.album = track.album;
//   formData.value.artist = track.artist;
//   formData.value.genres = track.genres;
//   formData.value.coverImage = track.coverImage;
// };

// const handleOpenEditTrackModal = (trackToEdit: Track) => {
//   prefillModalData(trackToEdit);
//   isFormModalOpen.value = true;
// };

// const {
//   editedTrack,
//   editTrack,
//   isError: isErrorWhileEditing,
//   isLoading: isEditingProcessing,
// } = useEditTrack();

// const handleEditTrack = async (track: Track) => {
//   const oldTrack = tracks.value!.find((t) => t.id === track.id)!;

//   updateTrack(track.id, track);

//   isFormModalOpen.value = false;

//   cleanupModalState();

//   await editTrack(track);

//   if (isErrorWhileEditing.value) {
//     alert(isErrorWhileEditing.value);
//     updateTrack(track.id, oldTrack);
//   }

//   if (editedTrack.value) {
//     updateTrack(track.id, editedTrack.value);
//   }
// };

// // UploadTrackFile -----------------------------------------------------------------------------------------
// const isUploadFileModalOpen = ref(false);

// const { data, postMusicFile } = usePostMusicFile();

// const handleOpenUploadFileModal = (id: string) => {
//   isUploadFileModalOpen.value = true;
//   formData.value.id = id;
// };

// const uploadedFile = ref();

// function onFileChange(e: Event) {
//   const file = (e.target as HTMLInputElement).files?.[0];
//   if (file) {
//     uploadedFile.value = file;
//     console.log(uploadedFile.value);
//   }
// }

// const handleUploadTrackFile = async () => {
//   isUploadFileModalOpen.value = false;

//   await postMusicFile(formData.value.id, uploadedFile.value);
// };

const store = useToast();
const { toasts } = storeToRefs(store);
</script>

<template>
  <TracksPage />

  <BaseToastsGroup :toasts @close-toast="(id) => store.removeToast(id)" />
</template>
