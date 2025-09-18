import { apiClient } from "@/shared/api";
import { buildQueryForAPI } from "@/utils/buildQueryForAPI";
import { TracksResponseSchema } from "@/shared/api";

export const fetchTracksAPI = async ({
  page,
  search,
  genre,
  artist,
  order,
  sort,
}: {
  page: number;
  search?: string;
  genre?: string;
  artist?: string;
  order?: "asc" | "desc" | "";
  sort?: "title" | "artist" | "album" | "createdAt" | "";
}) =>
  await apiClient.get(
    `api/tracks?${buildQueryForAPI({ page, search, genre, artist, order, sort })}`,
    { schema: TracksResponseSchema },
  );
