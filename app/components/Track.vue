<script setup lang="ts">
import type { Track } from "@/types";
import { DEFAULT_TRACK_COVER } from "@/consts";
import { storeToRefs } from "pinia";
import type { DeepReadonly } from "vue";

const props = defineProps<{
  track: DeepReadonly<Track>;
}>();

const playbackStore = usePlaybackStore();

const { isPlaying, playingTrackId } = storeToRefs(playbackStore);

const isEditTrackModalOpen = ref(false);
const isDeleteTrackModalOpen = ref(false);
const isUploadTrackFileModalOpen = ref(false);
const isDeleteTrackFileModal = ref(false);

const actionsItems = computed(() => {
  const initialActions = [
    { label: "Edit", value: "edit", icon: "heroicons:pencil-square" },
    { label: "Delete", value: "delete", icon: "heroicons:trash" },
    {
      label: "Detailed info",
      value: "detailedInfo",
      icon: "material-symbols:more-horiz",
    },
  ];

  return props.track.audioFile
    ? [
        ...initialActions,
        {
          label: "Delete Audio File",
          value: "deleteAudioFile",
          icon: "streamline:file-delete-alternate",
        },
      ]
    : [
        ...initialActions,
        {
          label: "Upload Audio File",
          value: "uploadAudioFile",
          icon: "material-symbols:upload-file-outline-rounded",
        },
      ];
});

const handleTrackAction = (action: string) => {
  switch (action) {
    case "edit": {
      isEditTrackModalOpen.value = true;
      break;
    }
    case "delete": {
      isDeleteTrackModalOpen.value = true;
      break;
    }
    case "detailedInfo": {
      navigateTo(`/${props.track.slug}`);
      break;
    }
    case "deleteAudioFile": {
      isDeleteTrackFileModal.value = true;
      break;
    }
    case "uploadAudioFile": {
      isUploadTrackFileModalOpen.value = true;
      break;
    }
  }
};

const handleTogglePlay = () => {
  if (!props.track.audioFile) return;

  if (props.track.id === playingTrackId.value) {
    playbackStore.togglePlayTrack();
  } else {
    playbackStore.setPlayingTrackId(props.track.id);
  }
};

const actionsMenuRef = useTemplateRef("actionsMenuRef");
</script>

<template>
  <div
    class="grid grid-cols-[auto_1fr] grid-rows-1 gap-1 rounded-md p-1 select-none w-full"
    :class="[
      track.audioFile &&
        !actionsMenuRef?.isTrackMenuOpen &&
        'hover:bg-foreground/10 transition-colors cursor-pointer',
      actionsMenuRef?.isTrackMenuOpen && 'bg-foreground/20 cursor-default',
    ]"
    @click="handleTogglePlay"
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

    <div class="flex gap-4 items-center col-start-2 row-start-1">
      <div class="flex gap-4 w-full items-start">
        <div class="flex flex-col">
          <p
            class="font-medium text-sm"
            :data-testid="`track-item-${track.id}-title`"
            :class="[playingTrackId === track.id && 'text-primary']"
          >
            {{ track.title }}
          </p>
          <p class="text-placeholder text-[12px]">
            <span :data-testid="`track-item-${track.id}-artist`">
              {{ track.artist }}
            </span>
            -
            <span class="text-[12px]">{{ track.album }}</span>
          </p>
        </div>

        <div class="max-w-full overflow-hidden text-xs pt-1">
          Genres:
          <span class="truncate" v-for="(genre, index) in track.genres">
            {{ `${genre}${index !== track.genres.length - 1 ? ", " : ""}` }}
          </span>
        </div>
      </div>

      <BaseDropdownMenu
        :items="actionsItems"
        @select="(i) => handleTrackAction(i.value)"
        menuAlign="end"
        ref="actionsMenuRef"
      >
        <Icon name="material-symbols:more-horiz" class="flex w-full" />
      </BaseDropdownMenu>
    </div>
  </div>

  <EditTrackModal
    v-if="isEditTrackModalOpen"
    :track
    @close="isEditTrackModalOpen = false"
  />

  <DeleteTrackModal
    v-if="isDeleteTrackModalOpen"
    :track
    @close="isDeleteTrackModalOpen = false"
  />

  <UploadTrackFileModal
    v-if="isUploadTrackFileModalOpen"
    :track
    @close="isUploadTrackFileModalOpen = false"
  />

  <DeleteTrackFileModal
    v-if="isDeleteTrackFileModal"
    :track
    @close="isDeleteTrackFileModal = false"
  />
</template>
