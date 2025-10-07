import { queryOptions } from "@tanstack/vue-query";
import { fetchGenresAPI } from "./genres";

export function genresOptions() {
  return queryOptions({
    queryKey: ["genres"],
    queryFn: fetchGenresAPI,
    select: (data) =>
      data?.map((genre: string) => ({
        label: genre,
        value: genre.toLowerCase(),
      })),
    staleTime: "static",
  });
}
