import { cloneDeep } from "lodash";
import { defineStore } from "pinia";
import type { Track } from "~/types";

export const usePlaybackStore = defineStore("playbackStore", () => {
  const tracksStore = useTracksStore();
  const { tracks, tracksMeta } = storeToRefs(tracksStore);

  const isShuffle = useLocalStorage("isShuffle", false);
  const isLooping = useLocalStorage("isLooping", false);
  const isPlaying = ref(false);
  const currentPlaybackTime = useLocalStorage("currentPlaybackTime", 0);

  const playingTrackId = useLocalStorage<string | null>("playingTrackId", null);

  const tracksWithAudioFiles = computed(() =>
    tracks.value?.filter((t) => t.audioFile)
  );

  const globalQueue = ref<Track[]>(
    (cloneDeep(tracksWithAudioFiles.value) as Track[]) || []
  );

  watch(
    tracksWithAudioFiles,
    () =>
      (globalQueue.value =
        (cloneDeep(tracksWithAudioFiles.value) as Track[]) || [])
  );

  const globalPlayingTrackIndex = computed(() =>
    globalQueue.value.findIndex((t) => t.id === playingTrackId.value)
  );

  const currentTrackInfo = computed(
    () => globalQueue.value[globalPlayingTrackIndex.value]
  );

  const currentTrackSourceUrl = computed(
    () =>
      import.meta.env.VITE_BASE_URL +
      `/api/files/${
        globalQueue.value[globalPlayingTrackIndex.value]?.audioFile
      }`
  );

  const hasNextTrack = computed(() => {
    const idx = globalPlayingTrackIndex.value ?? -1;
    const len = globalQueue.value?.length ?? 0;

    const hasNextInQueue = idx >= 0 && idx + 1 < len - 2;
    const hasMorePages =
      !!tracksMeta.value && tracksMeta.value.page < tracksMeta.value.totalPages;

    return hasNextInQueue || hasMorePages;
  });

  const hasPrevTrack = computed(() => globalPlayingTrackIndex.value > 0);

  const currentQueue = computed<Track[]>(() =>
    globalQueue.value.slice(globalPlayingTrackIndex.value, -1)
  );

  const setPlayingTrackId = (id: string) => {
    playingTrackId.value = id;
    currentPlaybackTime.value = 0;
    isPlaying.value = true;
  };
  const clearPlayingTrackId = () => (playingTrackId.value = null);

  const nextTrack = () => {
    const id = currentQueue.value[globalPlayingTrackIndex.value + 1]?.id;

    if (!hasNextTrack.value && isLooping.value) {
      playingTrackId.value = globalQueue.value[0]!.id;
      isPlaying.value = true;
      currentPlaybackTime.value = 0;
    }

    if (!id) return;

    isPlaying.value = true;
    currentPlaybackTime.value = 0;
    playingTrackId.value = id;
  };

  const prevTrack = () => {
    const id = globalQueue.value[globalPlayingTrackIndex.value - 1]?.id;

    if (!id) return;

    isPlaying.value = true;
    currentPlaybackTime.value = 0;
    playingTrackId.value = id;
  };

  const toggleShuffle = () => {
    if (isShuffle.value) {
      isShuffle.value = false;

      globalQueue.value =
        (cloneDeep(tracksWithAudioFiles.value) as Track[]) || [];
    }
    if (!isShuffle.value) {
      isShuffle.value = true;

      globalQueue.value = cloneDeep(shuffleArray(globalQueue.value));
    }
  };

  const toggleLoop = () => {
    if (isLooping.value) {
      isLooping.value = false;
    }
    if (!isLooping.value) {
      isLooping.value = true;
    }
  };

  const changePlaybackTime = (time: number) => {
    currentPlaybackTime.value = time;
  };

  const togglePlayTrack = () => {
    isPlaying.value = !isPlaying.value;
  };

  watchEffect(() => {
    console.log("tracksWithAudioFiles:");
    console.log(tracksWithAudioFiles.value);
    console.log("globalQueue:");
    console.log(globalQueue.value);
    console.log(`globalPlayingTrackIndex: ${globalPlayingTrackIndex.value}`);
    console.log("currentQueue:");
    console.log(currentQueue.value);
  });

  watchEffect(() => {
    if (globalPlayingTrackIndex.value === -1 || !hasNextTrack.value) {
      console.log(2);
      tracksStore.fetchNextPage();
    }
  });

  return {
    playingTrackId: readonly(playingTrackId),
    queue: readonly(currentQueue),
    isPlaying: readonly(isPlaying),
    isShuffle: readonly(isShuffle),
    isLooping: readonly(isLooping),
    currentPlaybackTime: readonly(currentPlaybackTime),
    currentTrackSourceUrl: readonly(currentTrackSourceUrl),
    currentTrackInfo: readonly(currentTrackInfo),
    togglePlayTrack,
    changePlaybackTime,
    setPlayingTrackId,
    clearPlayingTrackId,
    hasNextTrack,
    hasPrevTrack,
    nextTrack,
    prevTrack,
    toggleShuffle,
    toggleLoop,
  };
});
