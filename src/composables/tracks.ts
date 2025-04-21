import { defineStore } from "pinia";
import type { Track } from "@/types";
import { ref } from "vue";
import type { Ref } from "vue";
import { useFetchTracks } from "./useFetchTracks";

export const useTrackManager = defineStore("tracksStore", () => {
  const tracks = ref<Track[]>();
  const isLoading = ref(false);
  const error = ref(false);

  const fetchTracks = async () => {};

  const createTrack = async (trackData: Track) => {
    tracks.value?.unshift(trackData);
  };

  const updateTrack = (id: string, newTrack: Track) => {
    tracks.value = tracks.value?.map((t) =>
      t.id === id ? { ...t, ...newTrack } : t,
    ) as Track[];
  };
  const deleteTrack = async (id: string) => {
    tracks.value = tracks.value?.filter((t) => t.id !== id);
  };

  return { fetchTracks, createTrack, updateTrack, deleteTrack };
});
