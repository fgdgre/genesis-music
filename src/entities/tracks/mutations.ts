import type { Track } from "@/types";
import { QueryClient, useMutation } from "@tanstack/vue-query";
import type { DeepReadonly } from "vue";
import { postTrackAPI } from "./tracks";
import { useTracksToasts } from "@/composables/useTracksToasts";
import { tracksKeys } from "./tracksKeys";

const queryClient = new QueryClient();
export function addTrackMutation() {
  return useMutation({
    mutationFn: (track: Track | DeepReadonly<Track>) => postTrackAPI(track),
    onMutate: async (optimisticTrack, context) => {
      // await context.client.cancelQueries({ queryKey: ["todos"] });
      // context.client.setQueryData(["tracks"], (old: any) => [
      //   optimisticTrack,
      //   ...old?.pages.data,
      // ]);
      // Return a result with the optimistic todo
      // return { optimisticTrack };
    },
    onError: (e) => {
      console.log(e);
      useTracksToasts().addErrorToast(e);
    },
    onSuccess: (d) => {
      console.log(d);
      useTracksToasts().addSuccessToast("create");
      queryClient.invalidateQueries({ queryKey: tracksKeys.collections() });
    },
  });
}
