<script setup lang="ts">
import { DEFAULT_TRACK_COVER } from "~/consts";
import { fetchTrackAPI } from "~/entities/track";
const { slug } = useRoute().params;

const { data: track, error } = await fetchTrackAPI(slug as string);

const tracksStore = useTracksStore();

const { playingTrackId } = storeToRefs(tracksStore);

const isPlaying = computed(() => playingTrackId.value === track?.id);

const toggleTrack = () => {
  if (track?.audioFile) {
    isPlaying.value
      ? tracksStore.clearPlayingTrackId()
      : tracksStore.setPlayingTrackId(track.id);
  }
};
</script>

<template>
  <div class="flex flex-col items-center p-6 gap-4 max-w-[640px] mx-auto">
    <div class="relative">
      <img
        @click="toggleTrack"
        :src="track?.coverImage || DEFAULT_TRACK_COVER"
        class="size-60 rounded-xl"
      />
      <div
        v-if="track?.audioFile"
        class="absolute top-[50%] translate-y-[-50%] left-[50%] translate-x-[-50%] text-orange-400 pointer-events-none"
      >
        <svg
          v-if="!isPlaying"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          class="size-10"
        >
          <path
            fill="currentColor"
            d="M21.409 9.353a2.998 2.998 0 0 1 0 5.294L8.597 21.614C6.534 22.737 4 21.277 4 18.968V5.033c0-2.31 2.534-3.769 4.597-2.648z"
          />
        </svg>

        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          class="size-10"
        >
          <path
            fill="currentColor"
            d="M16 19q-.825 0-1.412-.587T14 17V7q0-.825.588-1.412T16 5t1.413.588T18 7v10q0 .825-.587 1.413T16 19m-8 0q-.825 0-1.412-.587T6 17V7q0-.825.588-1.412T8 5t1.413.588T10 7v10q0 .825-.587 1.413T8 19"
          />
        </svg>
      </div>
    </div>

    <p class="text-2xl">{{ track?.title }}</p>

    <BaseAudioPlay
      v-if="track?.audioFile"
      class="self-end"
      :trackSource="track.audioFile"
      :trackId="track.id"
    />

    <div class="flex flex-col gap-4">
      <p>
        album - <span class="text-gray-400">{{ track?.album || "N/A" }}</span>
      </p>
      <p>
        artist - <span class="text-gray-400">{{ track?.artist }}</span>
      </p>
      <p>
        genres -
        <span class="text-gray-400">{{ track?.genres.join(", ") }}</span>
      </p>
      <p>
        Created at -
        <span class="text-gray-400">{{
          formatDate(track?.createdAt) || "N/A"
        }}</span>
      </p>
      <p>
        Last update -
        <span class="text-gray-400">{{
          formatDate(track?.updatedAt) || "N/A"
        }}</span>
      </p>
    </div>
  </div>
</template>
