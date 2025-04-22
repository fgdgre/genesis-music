<script setup lang="ts">
import { useTrackStore } from "@/stores/tracks";
import type { Track } from "@/types";
import { ref } from "vue";
import * as z from "zod";
import BaseInput from "./base/BaseInput.vue";
import BaseButton from "./base/BaseButton.vue";

const props = defineProps<{
  initialData?: Track;
}>();

const emit = defineEmits<{
  submit: [Track];
  discard: [];
}>();

const { tracksGenres } = useTrackStore();

const formData = ref<Track>({
  id: props.initialData?.id || "",
  title: props.initialData?.title || "",
  artist: props.initialData?.artist || "",
  album: props.initialData?.album || "",
  genres: props.initialData?.genres?.length
    ? [...props.initialData?.genres]
    : [],
  coverImage: props.initialData?.coverImage || "",
});

// validation -----------------------------------------------------------------------------------------------------------
const schema = z.object({
  title: z.string().trim().nonempty({ message: "Title is required field" }),
  artist: z.string().trim().nonempty({ message: "Artist is required field" }),
  album: z.string().trim().nonempty({ message: "Album is required field" }),
  genres: z.array(z.string()).nonempty({ message: "Genres is required field" }),
  coverImage: z
    .string()
    .trim()
    .refine((val) => val === "" || z.string().url().safeParse(val).success, {
      message: "Invalid URL",
    })
    .optional(),
});

const validateForm = (formData: Track, schema: z.Schema<Partial<Track>>) => {
  return schema.safeParse(formData);
};

const errorMessages = ref({
  title: "",
  artist: "",
  album: "",
  genres: "",
  coverImage: "",
});

const clearErrorMessages = () => {
  errorMessages.value = {
    title: "",
    artist: "",
    album: "",
    genres: "",
    coverImage: "",
  };
};

const setErrors = (error: z.ZodError) => {
  clearErrorMessages();

  for (const fieldKey in error.formErrors.fieldErrors) {
    if (error.formErrors.fieldErrors?.[fieldKey]?.length) {
      errorMessages.value[fieldKey as keyof typeof errorMessages.value] =
        error.formErrors.fieldErrors[fieldKey]?.[0];
    }
  }
};
// ----------------------------------------------------------------------------------------------------------------------------------

const handleSubmit = () => {
  const { error } = validateForm(formData.value, schema);

  if (error) {
    setErrors(error);
    return;
  }

  if (!formData.value.id) {
    formData.value.id = self.crypto.randomUUID();
  }

  emit("submit", formData.value);
};
</script>

<template>
  <div>
    <form @submit.prevent="handleSubmit" class="grid grid-cols-2 gap-4">
      <BaseInput
        label="Title"
        :error-message="errorMessages.title"
        v-model="formData.title"
      />
      <BaseInput
        label="Artist"
        :error-message="errorMessages.artist"
        v-model="formData.artist"
      />
      <BaseInput
        label="Album"
        :error-message="errorMessages.album"
        v-model="formData.album"
      />

      <!-- <genresSelect> -->
      <label class="flex flex-col gap-1">
        Genres
        <select
          class="px-4 py-2 border rounded-md"
          :class="[errorMessages.genres && 'border-red-400']"
          v-model="formData.genres"
          multiple
        >
          <option v-for="genre in tracksGenres" :value="genre">
            {{ genre }}
          </option>
        </select>
        <p v-if="errorMessages.genres" class="text-red-400">
          {{ errorMessages.genres }}
        </p>
      </label>
      <BaseInput
        label="Cover Image"
        :error-message="errorMessages.coverImage"
        v-model="formData.coverImage"
      />

      <div class="col-span-2 w-full flex gap-2">
        <BaseButton
          transparent
          class="w-full"
          type="button"
          @click="$emit('discard')"
        >
          Cancel
        </BaseButton>
        <BaseButton class="w-full" type="submit"> Submit </BaseButton>
      </div>
    </form>
  </div>
</template>
