<script setup lang="ts">
import type { Track } from "@/types";
import { ref } from "vue";
import * as z from "zod";

const formData = ref<Track>({
  id: "",
  title: "",
  artist: "",
  album: "",
  genres: [],
  coverImage: "",
});

const emit = defineEmits<{
  submit: [Track];
  discard: [];
}>();

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

  formData.value.id = self.crypto.randomUUID();
  emit("submit", formData.value);
};
</script>

<template>
  <div>
    <!-- <p v-if="modalErrorMessage" class="text-red-400">
      {{ modalErrorMessage }}
    </p> -->
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
        <button class="flex-1" type="button" @click="$emit('discard')">
          Cancel
        </button>
        <button class="bg-black text-white flex-1" type="submit">Submit</button>
      </div>
    </form>
  </div>
</template>
