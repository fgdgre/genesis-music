import type { Track } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { postTrackAPI } from "./tracks";
import { useTracksToasts } from "@/composables/useTracksToasts";
import { tracksKeys } from "./tracksKeys";
import type { DeepReadonly } from "vue";
import { prependOptimisticToInfinite, replaceTempInInfinite } from "./utils";

export function addTrackMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (track: Track | DeepReadonly<Track>) => postTrackAPI(track),
    onMutate: async (optimisticTrack) => {
      await queryClient.cancelQueries({ queryKey: tracksKeys.all });

      const previous = queryClient.getQueriesData<Track[]>({
        queryKey: tracksKeys.all,
      });
      console.log(previous[0][1]);

      queryClient.setQueriesData(
        { queryKey: tracksKeys.all },
        prependOptimisticToInfinite(optimisticTrack),
      );

      return { previous: previous[0][1], tempId: optimisticTrack.id };
    },
    onError: (e, variables, ctx) => {
      console.log(11);
      useTracksToasts().addErrorToast(e);
      console.log(ctx?.previous);
      queryClient.setQueriesData({ queryKey: tracksKeys.all }, ctx?.previous);
    },
    onSuccess: async (data: Track, variables, ctx) => {
      useTracksToasts().addSuccessToast("create");

      queryClient.setQueriesData(
        { queryKey: tracksKeys.all },
        replaceTempInInfinite(ctx.tempId, data),
      );
    },
  });
}
