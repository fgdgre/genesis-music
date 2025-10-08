import type { Track } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { createTrackAPI, updateTrackAPI } from "./tracks";
import { useTracksToasts } from "@/composables/useTracksToasts";
import { tracksKeys } from "./tracksKeys";
import type { DeepReadonly } from "vue";
import { prependItemToInfinite, updateItemInInfinite } from "./utils";

export function createTrackMutation() {
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

export function updateTrackMutation() {
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

      return { previous: previous[0][1] };
    },
    onError: (e, variables, ctx) => {
      useTracksToasts().addErrorToast(e);
      queryClient.setQueriesData({ queryKey: tracksKeys.all }, ctx?.previous);
    },
    onSuccess: async (data: Track, variables, ctx) => {
      useTracksToasts().addSuccessToast("update");

      queryClient.setQueriesData(
        { queryKey: tracksKeys.all },
        updateItemInInfinite(data.id, data),
      );
    },
  });
}
