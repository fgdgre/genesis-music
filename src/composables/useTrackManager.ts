import type { NewTrack, Track } from "@/types";
import type { Ref } from "vue";
import { usePostTracks } from "./usePostTrack";

export const useTrackManager = (tracks: Ref<Track[]>) => {
  // add track logic ----------------------------------------------------------------------
  const {
    newTrack,
    isError: isSubmittingError,
    isLoading: isSubmittingProcess,
    postTrack,
  } = usePostTracks();

  const createTrack = async (trackData: NewTrack) => {
    // const addNewTrack = (track: NewTrack) => {
    tracks.value?.unshift(trackData as Track);

    await postTrack(trackData);

    // isFormModalOpen.value = false;

    // cleanupModalState();
    // };

    // optimistic update --------------------------
    // TODO refactor or rewrite at all
    const oldTrackIndex = tracks.value.findIndex(
      (t) => t.title === trackData.title,
    );

    if (isSubmittingError.value) {
      if (oldTrackIndex !== -1) {
        tracks.value.splice(oldTrackIndex, 1);
      }
      alert(isSubmittingError.value);
    }

    if (newTrack.value) {
      if (oldTrackIndex !== -1) {
        tracks.value.splice(oldTrackIndex, 1, newTrack.value);
      }
    }
  };
  // -----------------------------------------------------------------------------------------------
  const getTrack = async (slug: NewTrack) => {};
  const editTrack = async (trackData: NewTrack) => {};
  const deleteTrack = async (id: NewTrack) => {};

  return { createTrack };
};
