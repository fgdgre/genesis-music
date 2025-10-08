import type { Track } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { createTrackAPI, deleteTrackAPI, updateTrackAPI } from "./tracks";
import { useTracksToasts } from "@/composables/useTracksToasts";
import { tracksKeys } from "./tracksKeys";
import {
  deleteItemInInfinite,
  prependItemToInfinite,
  updateItemInInfinite,
} from "./utils";

export function createInfiniteTrackMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (track: Track) => createTrackAPI(track),
    onMutate: async (optimisticTrack) => {
      await queryClient.cancelQueries({ queryKey: tracksKeys.all });

      const previous = queryClient.getQueriesData<Track[]>({
        queryKey: tracksKeys.all,
      });

      queryClient.setQueriesData(
        { queryKey: tracksKeys.all },
        prependItemToInfinite(optimisticTrack),
      );

      return { previous: previous[0][1], tempId: optimisticTrack.id };
    },
    onError: (e, variables, ctx) => {
      useTracksToasts().addErrorToast(e);
      queryClient.setQueriesData({ queryKey: tracksKeys.all }, ctx?.previous);
    },
    onSuccess: async (data: Track, variables, ctx) => {
      useTracksToasts().addSuccessToast("create");

      queryClient.setQueriesData(
        { queryKey: tracksKeys.all },
        updateItemInInfinite(ctx.tempId, data),
      );
    },
  });
}

export function updateInfiniteTrackMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (track: Track) => updateTrackAPI(track),
    onMutate: async (optimisticTrack) => {
      await queryClient.cancelQueries({ queryKey: tracksKeys.all });

      const previous = queryClient.getQueriesData<Track[]>({
        queryKey: tracksKeys.all,
      });

      queryClient.setQueriesData(
        { queryKey: tracksKeys.all },
        updateItemInInfinite(optimisticTrack.id, optimisticTrack),
      );

      return { previous: previous[0][1], trackId: optimisticTrack.id };
    },
    onError: (e, variables, ctx) => {
      useTracksToasts().addErrorToast(e);
      queryClient.setQueriesData({ queryKey: tracksKeys.all }, ctx?.previous);
    },
    onSuccess: async (data: Track, variables, ctx) => {
      useTracksToasts().addSuccessToast("update");

      queryClient.setQueriesData(
        { queryKey: tracksKeys.all },
        updateItemInInfinite(ctx.trackId, data),
      );
    },
  });
}
export function deleteInfiniteTrackMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTrackAPI(id),
    onMutate: async (deleteTrackId) => {
      await queryClient.cancelQueries({ queryKey: tracksKeys.all });

      const previous = queryClient.getQueriesData<Track[]>({
        queryKey: tracksKeys.all,
      });

      queryClient.setQueriesData(
        { queryKey: tracksKeys.all },
        deleteItemInInfinite(deleteTrackId),
      );

      return { previous: previous[0][1] };
    },
    onError: (e, variables, ctx) => {
      useTracksToasts().addErrorToast(e);
      queryClient.setQueriesData({ queryKey: tracksKeys.all }, ctx?.previous);
    },
    onSuccess: async (data, variables, ctx) => {
      useTracksToasts().addSuccessToast("delete");
    },
  });
}
