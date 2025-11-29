<script setup lang="ts">
import type { DeepReadonly } from "vue";
import type { Track } from "~/types";
import { DEFAULT_TRACK_COVER } from "~/consts";

defineProps<{
  track: Track | DeepReadonly<Track>;
  playingTrackId: string | null;
  isPlaying: boolean;
  draggable?: boolean;
}>();

defineEmits<{
  click: [Event];
}>();
</script>

<template>
  <div
    class="grid grid-cols-[auto_1fr_auto] gap-1 p-1 select-none rounded-md hover:bg-foreground/10 transition-colors cursor-pointer w-full"
    @click="(e) => $emit('click', e)"
    :data-track-id="track.id"
    :data-testid="`track-item-${track.id}`"
  >
    <div class="size-10 shrink-0 rounded-md col-start-1 relative select-none">
      <div
        v-if="track.audioFile"
        class="absolute top-[50%] translate-y-[-50%] left-[50%] translate-x-[-50%] text-primary"
      >
        <svg
          v-if="!isPlaying || (isPlaying && playingTrackId !== track.id)"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          class="size-4"
        >
          <path
            fill="currentColor"
            d="M21.409 9.353a2.998 2.998 0 0 1 0 5.294L8.597 21.614C6.534 22.737 4 21.277 4 18.968V5.033c0-2.31 2.534-3.769 4.597-2.648z"
          />
        </svg>

        <svg
          v-else-if="playingTrackId === track.id && isPlaying"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M16 19q-.825 0-1.412-.587T14 17V7q0-.825.588-1.412T16 5t1.413.588T18 7v10q0 .825-.587 1.413T16 19m-8 0q-.825 0-1.412-.587T6 17V7q0-.825.588-1.412T8 5t1.413.588T10 7v10q0 .825-.587 1.413T8 19"
          />
        </svg>
      </div>
      <img
        :src="track.coverImage || DEFAULT_TRACK_COVER"
        class="h-full rounded-md"
      />
    </div>

    <div class="flex gap-4 items-center col-start-2">
      <div class="flex gap-4 w-full">
        <div class="flex flex-col">
          <p
            class="font-medium text-sm"
            :class="[playingTrackId === track.id && 'text-primary']"
            :data-testid="`track-item-${track.id}-title`"
          >
            {{ track.title }}
          </p>
          <p class="text-placeholder text-xs">
            <span :data-testid="`track-item-${track.id}-artist`">
              {{ track.artist }}
            </span>
          </p>
        </div>
      </div>
    </div>

    <BaseButton
      v-if="draggable"
      @click.stop
      transparent
      class="col-start-3 h-full"
    >
      <Icon name="heroicons:bars-2" class="drag-handle shrink-0" />
    </BaseButton>
  </div>
</template>
