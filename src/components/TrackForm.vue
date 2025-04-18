<script setup lang="ts">
import type { Track } from "@/types";

type NewTrack = {
  title: "string";
  artist: "string";
  album: "string";
  genres: ["string"];
  coverImage: "string";
};

defineProps<{
  initialData?: Track;
}>();

defineEmits<{
  submit: [NewTrack];
  close: [];
}>();

const handleSubmit = () => {};
</script>

<template>
  <div class="fixed top-0 left-0 w-full h-full bg-black/50 z-30"></div>

  <div
    class="fixed top-[50%] translate-y-[-50%] left-[50%] translate-x-[-50%] w-full h-full flex items-center justify-center z-30"
  >
    <div class="max-w-[400px] max-h-[500px] bg-white rounded-md">
      <form @submit.prevent="handleSubmit" class="grid grid-cols-2 gap-4 p-6">
        <input class="px-4 py-2 border rounded-md" />
        <input class="px-4 py-2 border rounded-md" />
        <input class="px-4 py-2 border rounded-md" />
        <select class="px-4 py-2 border rounded-md"></select>
        <input class="px-4 py-2 border rounded-md" />

        <div class="col-span-2 w-full flex gap-2">
          <button class="flex-1" type="button">Cancel</button>
          <button class="bg-black text-white flex-1" type="submit">
            Submit
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
