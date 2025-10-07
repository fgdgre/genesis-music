import type { Track } from "@/types";
import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/vue-query";
import { postTrackAPI } from "./tracks";
import { useTracksToasts } from "@/composables/useTracksToasts";
import { tracksKeys } from "./tracksKeys";

type TracksPage = {
  data: Track[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

const prependOptimisticToInfinite =
  (optimisticTrack: Track) => (old?: InfiniteData<TracksPage>) => {
    if (!old) {
      return {
        pages: [
          {
            data: [optimisticTrack],
            meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
          },
        ],
        pageParams: [1],
      } as InfiniteData<TracksPage>;
    }

    // Prepend into the first page
    const first = old.pages[0];
    const updatedFirst: TracksPage = {
      ...first,
      data: [optimisticTrack, ...(first?.data ?? [])],
      meta: {
        ...first.meta,
        total: (first.meta?.total ?? 0) + 1,
      },
    };

    return {
      ...old,
      pages: old.pages.map((p, i) => (i === 0 ? updatedFirst : p)),
    };
  };

function replaceTempInInfinite(tempId: string, real: Track) {
  return (old?: InfiniteData<TracksPage>) => {
    if (!old) return old;
    return {
      ...old,
      pages: old.pages.map((p) => ({
        ...p,
        data: p.data.map((t) => (t.id === tempId ? real : t)),
      })),
    };
  };
}

export function addTrackMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (track: Track) => postTrackAPI(track),
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
    onSuccess: async (data, variables, ctx) => {
      useTracksToasts().addSuccessToast("create");

      queryClient.setQueriesData(
        { queryKey: tracksKeys.all },
        replaceTempInInfinite(ctx.tempId, data),
      );
    },
  });
}
