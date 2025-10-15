import { cloneDeep } from "lodash";
import { defineStore } from "pinia";
import type { Track } from "~/types";

export const usePlaybackStore = defineStore("playbackStore", () => {
  const tracksStore = useTracksStore();
  const { tracks, hasNextPage } = storeToRefs(tracksStore);
  const queueModalShow = ref(false);
  const isShuffle = useLocalStorage("isShuffle", false);
  const loopingMode = useLocalStorage<"noLoop" | "loopPlaylist" | "loopTrack">(
    "loopingMode",
    "noLoop"
  );
  const isPlaying = ref(false);
  const currentPlaybackTime = useLocalStorage("currentPlaybackTime", 0);

  const playingTrackId = useLocalStorage<string | null>("playingTrackId", null);

  const tracksWithAudioFiles = computed(() =>
    tracks.value?.filter((t) => t.audioFile)
  );

  const toggleQueueModal = () => {
    queueModalShow.value = !queueModalShow.value;
  };

  const globalQueue = ref<Track[]>(
    (cloneDeep(tracksWithAudioFiles.value) as Track[]) || []
  );

  watch(tracksWithAudioFiles, () => {
    globalQueue.value =
      (cloneDeep(tracksWithAudioFiles.value) as Track[]) || [];
  });

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

  const hasNextTrack = computed(
    () => !!globalQueue.value[globalPlayingTrackIndex.value + 1]
  );

  const hasPrevTrack = computed(() => {
    if (
      globalPlayingTrackIndex.value === 0 &&
      loopingMode.value === "loopPlaylist"
    ) {
      return false; // TODO
    }

    return globalPlayingTrackIndex.value > 0;
  });

  const currentQueue = computed<Track[]>(() =>
    globalQueue.value.slice(
      globalPlayingTrackIndex.value,
      globalQueue.value.length
    )
  );

  const setPlayingTrackId = (id: string) => {
    playingTrackId.value = id;
    currentPlaybackTime.value = 0;
    isPlaying.value = true;
  };

  const clearPlayingTrackId = () => (playingTrackId.value = null);

  const nextTrack = () => {
    if (loopingMode.value === "loopTrack") {
      currentPlaybackTime.value = 0;
      isPlaying.value = false;
      isPlaying.value = true;
      return;
    }

    if (
      !hasNextTrack.value &&
      !hasNextPage.value &&
      loopingMode.value === "loopPlaylist"
    ) {
      setPlayingTrackId(globalQueue.value[0]!.id);
      return;
    }

    const id = globalQueue.value[globalPlayingTrackIndex.value + 1]?.id;

    if (!id) {
      currentPlaybackTime.value = 0;
      isPlaying.value = false;
    } else {
      setPlayingTrackId(id);
    }
  };

  const prevTrack = () => {
    if (!hasPrevTrack.value && loopingMode.value === "loopPlaylist") {
      // setPlayingTrackId(globalQueue.value[globalQueue.value.length - 1]!.id);
      return; // TODO
    }

    if (loopingMode.value === "loopTrack") {
      if (currentPlaybackTime.value < 3) {
        loopingMode.value = "loopPlaylist";
      } else {
        setPlayingTrackId(globalQueue.value[0]!.id);
      }
    }

    const id = globalQueue.value[globalPlayingTrackIndex.value - 1]?.id;

    isPlaying.value = false;
    currentPlaybackTime.value = 0;

    if (!id) return;
    playingTrackId.value = id;
  };

  const toggleShuffle = () => {
    if (isShuffle.value) {
      isShuffle.value = false;

      globalQueue.value =
        (cloneDeep(tracksWithAudioFiles.value) as Track[]) || [];
    } else {
      isShuffle.value = true;

      globalQueue.value = cloneDeep(shuffleArray(globalQueue.value));
    }

    playingTrackId.value = globalQueue.value[0]!.id;
  };

  const changeLoopMode = () => {
    if (loopingMode.value === "noLoop") {
      loopingMode.value = "loopPlaylist";
    } else if (loopingMode.value === "loopPlaylist") {
      loopingMode.value = "loopTrack";
    } else {
      loopingMode.value = "noLoop";
    }
  };

  const changePlaybackTime = (time: number) => {
    currentPlaybackTime.value = time;
  };

  const togglePlayTrack = () => {
    isPlaying.value = !isPlaying.value;
  };

  watchEffect(() => {
    if (
      (globalPlayingTrackIndex.value === -1 && playingTrackId.value != null) ||
      (!hasNextTrack.value && hasNextPage.value)
    ) {
      console.log("fetch next trackkkkkkkssssss");
      tracksStore.fetchNextPage();
    }
  });

  return {
    playingTrackId: readonly(playingTrackId),
    queue: readonly(currentQueue),
    isPlaying: readonly(isPlaying),
    isShuffle: readonly(isShuffle),
    loopingMode: readonly(loopingMode),
    currentPlaybackTime: readonly(currentPlaybackTime),
    currentTrackSourceUrl: readonly(currentTrackSourceUrl),
    currentTrackInfo: readonly(currentTrackInfo),
    queueModalShow: readonly(queueModalShow),
    toggleQueueModal,
    togglePlayTrack,
    hasNextPage,
    changePlaybackTime,
    setPlayingTrackId,
    clearPlayingTrackId,
    hasNextTrack,
    hasPrevTrack,
    nextTrack,
    prevTrack,
    toggleShuffle,
    changeLoopMode,
  };
});
