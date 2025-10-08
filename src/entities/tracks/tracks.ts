import { apiClient, TracksResponseSchema } from "@/shared/api";
import type { Track, TracksDTO } from "@/types";
import type { DeepReadonly } from "vue";

export const fetchTracksAPI = async ({
  page,
  search,
  genre,
  artist,
  order,
  sort,
  signal,
}: {
  page: number;
  search?: string;
  genre?: string;
  artist?: string;
  order?: "asc" | "desc" | "";
  sort?: "title" | "artist" | "album" | "createdAt" | "";
  signal?: AbortSignal;
}) =>
  await apiClient.get<TracksDTO>("api/tracks", {
    schema: TracksResponseSchema,
    query: { page, search, genre, artist, order, sort },
    signal,
  });

export const createTrackAPI = async (track: Track | DeepReadonly<Track>) =>
  await apiClient.post<Track>("api/tracks1", {
    body: track,
  });

export const deleteTrackAPI = async (id: string) =>
  await apiClient.delete<void>(`api/tracks/${id}`);

export const updateTrackAPI = async (track: Track | DeepReadonly<Track>) =>
  await apiClient.put<Track>(`api/tracks/${track.id}`, {
    body: track,
  });

export const postTrackFileAPI = async (id: string, file: any) => {
  const formData = new FormData();
  formData.append("file", file);

  return await apiClient.post<Track>(`api/tracks/${id}/upload`, {
    body: formData,
  });
};

export const deleteTrackFileAPI = async (id: string) =>
  await apiClient.delete<Track>(`api/tracks/${id}/file`);
