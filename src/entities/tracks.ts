import { apiClient } from "@/shared/api";
import { TracksResponseSchema } from "@/shared/api";
import { invalidateQuery } from "@/shared/api/api";
import { filtersStore } from "@/stores/filters";
import type { Track } from "@/types";
import type { DeepReadonly } from "vue";

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
  await apiClient.get("api/tracks", {
    schema: TracksResponseSchema,
    query: { page, search, genre, artist, order, sort },
  });

export const postTrackAPI = async (track: Track | DeepReadonly<Track>) => {
  const res = await apiClient.post("api/tracks", {
    body: track,
  });

  if (res.ok) {
    invalidateQuery((queryKey: string) => !queryKey.includes("tracks"));
    filtersStore().refreshFilters();
  }

  return res;
};

export const deleteTrackAPI = async (id: string) =>
  await apiClient.delete(`api/tracks/${id}`);

export const editTrackAPI = async (track: Track | DeepReadonly<Track>) =>
  await apiClient.put(`api/tracks/${track.id}`, {
    body: track,
  });

export const postTrackFileAPI = async (id: string, file: any) => {
  const formData = new FormData();
  formData.append("file", file);

  return await apiClient.post(`api/tracks/${id}/upload`, {
    headers: {},
    body: formData,
  });
};

export const deleteTrackFileAPI = async (id: string) =>
  await apiClient.delete(`api/tracks/${id}/file`);
