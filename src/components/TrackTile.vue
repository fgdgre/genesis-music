<script setup lang="ts">
import type { Track } from "@/types";

defineProps<{
  track: Track;
}>();
</script>

<template>
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
      <!-- @click="handleDeleteTrack(track.id)" -->
      <button class="bg-red-400 text-black px-4 py-3 rounded-md w-fit text-sm">
        Delete
      </button>
      <!-- @click="handleOpenEditTrackModal(track)" -->
      <button
        class="bg-yellow-400 text-black px-4 py-3 rounded-md w-fit text-sm"
      >
        Edit
      </button>
      <!-- @click="handleOpenUploadFileModal(track.id)" -->
      <button
        class="bg-green-400 text-black px-4 py-3 rounded-md w-fit text-sm"
      >
        Upload track file
      </button>
    </div>
  </div>
</template>
