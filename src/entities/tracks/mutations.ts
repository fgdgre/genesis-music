import type { Track } from "@/types";
import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/vue-query";
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

      const previous = queryClient.getQueryData<Track[]>(tracksKeys.all);

      queryClient.setQueriesData(
        { queryKey: tracksKeys.all },
        prependOptimisticToInfinite(optimisticTrack),
      );

      return { previous, tempId: optimisticTrack.id };
    },
    onError: (e) => {
      useTracksToasts().addErrorToast(e);
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
