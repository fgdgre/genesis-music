import { infiniteQueryOptions } from "@tanstack/vue-query";
import { toValue, type Ref } from "vue";
import type { QueryParams } from "@/types";
import { fetchTracksAPI } from "./tracks";
import { tracksKeys } from "./tracksKeys";

export function tracksOptions({
  search,
  artist,
  genre,
  order,
  sort,
}: { [K in keyof QueryParams]: Ref<QueryParams[K]> }) {
  return infiniteQueryOptions({
    queryKey: tracksKeys.list({ search, artist, genre, order, sort }),
    initialPageParam: 1,
    queryFn: ({ pageParam = 1, signal }) =>
      fetchTracksAPI({
        page: pageParam,
        search: toValue(search),
        genre: toValue(genre),
        artist: toValue(artist),
        order: toValue(order),
        sort: toValue(sort),
        signal,
      }),
    select: (data) => ({
      data: data.pages.flatMap((p) => p.data) ?? [],
      meta: data.pages[data.pages.length - 1]?.meta,
    }),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.meta;
      return page < totalPages ? page + 1 : undefined;
    },
    staleTime: 2 * 60 * 1000,
  });
}
