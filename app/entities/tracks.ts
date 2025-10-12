import {
  apiClient,
  invalidateAll,
  invalidateQuery,
  TracksResponseSchema,
} from "@/shared/api";
import type { Track, TracksResponse } from "@/types";
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
  await apiClient.get<TracksResponse>("api/tracks", {
    schema: TracksResponseSchema,
    query: { page, search, genre, artist, order, sort },
  });

export const postTrackAPI = async (track: Track | DeepReadonly<Track>) => {
  const res = await apiClient.post<Track>("api/tracks", {
    body: track,
  });

  if (res.ok) {
    invalidateAll("tracks");
    useFiltersStore().refreshFilters();
  }

  return res;
};

export const deleteTrackAPI = async (id: string) => {
  const res = await apiClient.delete<void>(`api/tracks/${id}`);

  if (res.ok) {
    invalidateAll("tracks");
  }

  return res;
};

export const editTrackAPI = async (track: Track | DeepReadonly<Track>) => {
  const res = await apiClient.put<Track>(`api/tracks/${track.id}`, {
    body: track,
  });

  if (res.ok) {
    invalidateAll("tracks");
    invalidateQuery(`api/tracks/${res.data!.slug}`);
  }

  return res;
};

export const postTrackFileAPI = async (id: string, file: any) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await apiClient.post<Track>(`api/tracks/${id}/upload`, {
    body: formData,
  });

  if (res.ok) {
    invalidateAll("tracks");
  }

  return res;
};

export const deleteTrackFileAPI = async (id: string) => {
  const res = await apiClient.delete<Track>(`api/tracks/${id}/file`);

  if (res.ok) {
    invalidateAll("tracks");
  }

  return res;
};
