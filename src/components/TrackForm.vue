<script setup lang="ts">
import type { Track } from "@/types";
import { ref, type DeepReadonly } from "vue";
import * as z from "zod";
import BaseInput from "./base/BaseInput.vue";
import BaseButton from "./base/BaseButton.vue";
import GenresMultiselect from "./GenresMultiselect.vue";

const props = defineProps<{
  initialData?: DeepReadonly<Track>;
}>();

const emit = defineEmits<{
  submit: [DeepReadonly<Track>];
  discard: [];
}>();

const formData = ref<Track>({
  id: props.initialData?.id || "",
  title: props.initialData?.title || "",
  artist: props.initialData?.artist || "",
  album: props.initialData?.album || "",
  genres: props.initialData?.genres?.length
    ? props.initialData?.genres.map((genre) => genre.toLowerCase())
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
    <form
      @submit.prevent="handleSubmit"
      class="grid grid-cols-2 gap-4"
      data-testid="track-form"
    >
      <BaseInput
        label="Title"
        :error-message="errorMessages.title"
        v-model="formData.title"
        data-testid="input-title"
        error-message-testid="error-title"
      />
      <BaseInput
        label="Artist"
        :error-message="errorMessages.artist"
        v-model="formData.artist"
        data-testid="input-artist"
        error-message-testid="error-artist"
      />
      <BaseInput
        label="Album"
        :error-message="errorMessages.album"
        v-model="formData.album"
        data-testid="input-album"
        error-message-testid="error-album"
      />

      <BaseInput
        label="Cover Image"
        :error-message="errorMessages.coverImage"
        v-model="formData.coverImage"
        data-testid="input-cover-image"
        error-message-testid="error-cover-image"
      />

      <GenresMultiselect
        label="Genres"
        placeholder="Select multiple"
        :error-message="errorMessages.genres"
        v-model="formData.genres"
        class="col-span-2"
        trigger-testid="genre-selector"
        error-message-testid="error-genre-selector"
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
        <BaseButton class="w-full" type="submit" data-testid="submit-button">
          Submit
        </BaseButton>
      </div>
    </form>
  </div>
</template>
