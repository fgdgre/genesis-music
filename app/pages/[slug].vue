<script setup lang="ts">
import { DEFAULT_TRACK_COVER } from "~/consts";
import { fetchTrackAPI } from "~/entities/track";

definePageMeta({
  title: "Track info",
});

const { slug } = useRoute().params;

const { data: track, error } = await fetchTrackAPI(slug as string);

const playbackStore = usePlaybackStore();

const { playingTrackId } = storeToRefs(playbackStore);

const isPlaying = computed(() => playingTrackId.value === track?.id);
</script>

<template>
  <div class="flex flex-col items-center p-6 gap-4 max-w-[640px] mx-auto">
    <img
      :src="track?.coverImage || DEFAULT_TRACK_COVER"
      class="size-60 rounded-xl"
    />

    <p class="text-2xl">{{ track?.title }}</p>

    <div class="flex flex-col gap-4">
      <p>
        album -
        <span class="text-placeholder">{{ track?.album || "N/A" }}</span>
      </p>
      <p>
        artist - <span class="text-placeholder">{{ track?.artist }}</span>
      </p>
      <p>
        genres -
        <span class="text-placeholder">{{ track?.genres.join(", ") }}</span>
      </p>
      <p>
        Created at -
        <span class="text-placeholder">{{
          formatDate(track?.createdAt) || "N/A"
        }}</span>
      </p>
      <p>
        Last update -
        <span class="text-placeholder">{{
          formatDate(track?.updatedAt) || "N/A"
        }}</span>
      </p>
    </div>
  </div>
</template>
