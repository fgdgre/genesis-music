import { api } from "@/shared/api/client";
import { buildQueryForAPI } from "@/utils/buildQueryForAPI";

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
  await api.get(
    `api/tracks?${buildQueryForAPI({ page, search, genre, artist, order, sort })}`,
  );
