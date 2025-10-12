<script setup lang="ts">
import { DEFAULT_TRACK_COVER } from "~/consts";
import Track from "../Track.vue";

const playbackStore = usePlaybackStore();

const {
  currentTrackInfo,
  currentTrackSourceUrl,
  playingTrackId,
  isPlaying,
  currentPlaybackTime,
} = storeToRefs(playbackStore);

const handleTogglePlay = () => {
  playbackStore.setPlayingTrackId(currentTrackInfo.value!.id);
};
</script>

<template>
  <Teleport to="body" v-if="playingTrackId">
    <div
      class="fixed bottom-6 right-6 bg-gray-100 grid grid-cols-[auto_1fr] grid-rows-[auto_auto] gap-1 rounded-md border border-gray-400 p-1 select-none"
      @click="handleTogglePlay"
    >
      <div
        class="size-20 shrink-0 rounded-md col-start-1 row-span-2 relative select-none"
      >
        <img
          :src="currentTrackInfo?.coverImage || DEFAULT_TRACK_COVER"
          class="h-full rounded-md"
        />
      </div>

      <div class="flex gap-4 items-center col-start-2 row-start-1">
        <div class="flex gap-4 w-full">
          <div class="flex flex-col">
            <p class="font-medium">
              {{ currentTrackInfo?.title }}
            </p>
            <p class="text-gray-400 text-xs">
              {{ currentTrackInfo?.artist }}
            </p>
          </div>
        </div>

        <div class="flex gap-2 items-center h-full">
          <BaseButton transparent square @click.stop="playbackStore.prevTrack">
            <Icon name="mage:previous-fill" class="size-4" />
          </BaseButton>
          <BaseButton transparent square @click.stop="playbackStore.nextTrack">
            <Icon name="mage:next-fill" class="size-4" />
          </BaseButton>
          <BaseButton
            transparent
            square
            @click.stop="playbackStore.togglePlayTrack()"
          >
            <Icon v-if="isPlaying" name="mage:pause" class="size-4" />
            <Icon v-else name="mage:play" class="size-4" />
          </BaseButton>
        </div>
      </div>

      <BaseAudioPlay
        :key="currentTrackSourceUrl"
        :track-source="currentTrackSourceUrl"
        :playing-track-id
        :current-playback-time
        :is-playing
        :current-track-source-url
        @time-change="playbackStore.changePlaybackTime"
        @track-end="playbackStore.nextTrack"
      />
    </div>
  </Teleport>
</template>
