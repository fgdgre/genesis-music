import { apiClient } from "@/shared/api";
import { buildQueryForAPI } from "@/utils/buildQueryForAPI";
import { TracksResponseSchema } from "@/shared/api";
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
  await apiClient.get(
    `api/tracks?${buildQueryForAPI({ page, search, genre, artist, order, sort })}`,
    { schema: TracksResponseSchema },
  );

export const postTrackAPI = async (track: Track | DeepReadonly<Track>) =>
  await apiClient.post("api/tracks", {
    headers: {
      "Content-Type": "application/json",
    },
    body: track,
  });

export const deleteTrackAPI = async (id: string) =>
  await apiClient.delete(`api/tracks/${id}`);

export const editTrackAPI = async (track: Track | DeepReadonly<Track>) =>
  await apiClient.put(`api/tracks/${track.id}`, {
    headers: {
      "Content-Type": "application/json",
    },
    body: track,
  });

export const postTrackFileAPI = async (id: string, file: any) => {
  const formData = new FormData();
  formData.append("file", file);

  return await apiClient.post(`api/tracks/${id}/upload`, {
    body: formData,
    bodySerialize: false,
  });
};

export const deleteTrackFileAPI = async (id: string) =>
  await apiClient.delete(`api/tracks/${id}/file`);
