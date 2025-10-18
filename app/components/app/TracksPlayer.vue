<script setup lang="ts">
import { DEFAULT_TRACK_COVER } from "~/consts";

const playbackStore = usePlaybackStore();

const {
  currentTrackInfo,
  currentTrackSourceUrl,
  playingTrackId,
  isPlaying,
  currentPlaybackTime,
  loopingMode,
  isShuffle,
  queueListVisible,
} = storeToRefs(playbackStore);
</script>

<template>
  <Teleport to="body" v-if="playingTrackId">
    <div
      class="fixed left-0 bottom-0 w-full bg-white grid grid-cols-[160px_1fr_160px] gap-x-4 p-1 select-none shadow-[0_0_1.5px_0_#181818]"
    >
      <div class="flex gap-1 row-span-2">
        <img
          :src="currentTrackInfo?.coverImage || DEFAULT_TRACK_COVER"
          class="h-full size-15 shrink-0 rounded-md relative select-none"
        />

        <div class="flex gap-4 items-center col-start-2">
          <div class="flex gap-4">
            <div class="flex flex-col">
              <p class="font-medium">
                {{ currentTrackInfo?.title }}
              </p>
              <p class="text-gray-400 text-xs">
                {{ currentTrackInfo?.artist }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div class="flex items-center col-start-2 justify-self-center">
          <BaseButton transparent square @click.stop="playbackStore.prevTrack">
            <Icon name="mage:previous-fill" class="size-4" />
          </BaseButton>
          <BaseButton
            transparent
            square
            @click.stop="playbackStore.togglePlayTrack()"
          >
            <Icon v-if="isPlaying" name="mage:pause" class="size-4" />
            <Icon v-else name="mage:play" class="size-4" />
          </BaseButton>
          <BaseButton transparent square @click.stop="playbackStore.nextTrack">
            <Icon name="mage:next-fill" class="size-4" />
          </BaseButton>
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

      <div class="col-start-3 flex">
        <BaseButton
          @click.stop="playbackStore.changeLoopMode"
          transparent
          square
        >
          <div class="relative">
            <Icon
              name="heroicons:arrow-path-rounded-square"
              class="fill-black size-5"
              :class="[
                (loopingMode === 'loopPlaylist' ||
                  loopingMode === 'loopTrack') &&
                  'text-orange-400',
              ]"
            />
            <div
              v-if="loopingMode === 'loopTrack'"
              class="absolute top-0 right-0 translate-x-[50%] -translate-y-[50%] text-orange-400"
            >
              1
            </div>
          </div>
        </BaseButton>
        <BaseButton transparent square>
          <Icon
            name="heroicons:arrows-right-left-solid"
            :class="[isShuffle ? 'text-orange-400' : 'text-black']"
            @click.stop="playbackStore.toggleShuffle"
          />
        </BaseButton>
        <BaseButton transparent square @click="">
          <Icon
            name="material-symbols-light:queue-music-rounded"
            @click.stop="playbackStore.toggleQueueListVisibility"
            class="size-5"
            :class="[queueListVisible ? 'text-orange-400' : 'text-black']"
          />
        </BaseButton>
      </div>
    </div>
  </Teleport>
</template>
