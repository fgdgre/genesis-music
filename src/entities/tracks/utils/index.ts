import type { infiniteTracksPage, Track } from "@/types";
import type { InfiniteData } from "@tanstack/vue-query";
import type { DeepReadonly } from "vue";

export const prependOptimisticToInfinite =
  (optimisticTrack: Track | DeepReadonly<Track>) =>
  (old?: InfiniteData<infiniteTracksPage>) => {
    if (!old) {
      return {
        pages: [
          {
            data: [optimisticTrack],
            meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
          },
        ],
        pageParams: [1],
      } as InfiniteData<infiniteTracksPage>;
    }

    // Prepend into the first page
    const first = old.pages[0];
    const updatedFirst: infiniteTracksPage = {
      ...first,
      data: [optimisticTrack as Track, ...(first?.data ?? [])],
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

type InfiniteTracksPage = {
  data: ReadonlyArray<Track>;
  meta: { total: number; page: number; limit: number; totalPages: number };
};

export function replaceTempInInfinite<TPageParam = unknown>(
  tempId: string,
  real: Track,
) {
  return (
    old?: InfiniteData<InfiniteTracksPage, TPageParam>,
  ): InfiniteData<InfiniteTracksPage, TPageParam> | undefined => {
    if (!old) return old;

    return {
      ...old,
      pages: old.pages.map((p) => ({
        ...p,
        // keep the same readonly element type as p.data
        data: p.data.map((t) => (t.id === tempId ? real : t)) as typeof p.data,
      })) as typeof old.pages,
    };
  };
}
