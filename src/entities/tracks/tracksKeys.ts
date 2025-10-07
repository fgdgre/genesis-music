import type { QueryParams } from "@/types";
import type { Ref } from "vue";

export const tracksKeys = {
  all: ["tracks"] as const,
  collections: () => [...tracksKeys.all, "collection"] as const,
  list: (filters: { [K in keyof QueryParams]: Ref<QueryParams[K]> }) =>
    [...tracksKeys.collections(), filters] as const,
  // tracks: () => [...tracksKeys.all, "track"] as const,
  // track: (id: string) => [...tracksKeys.tracks(), id] as const,
};
