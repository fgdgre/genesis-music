import { apiClient } from "~/shared/api";
import type { Track } from "~/types";

export const fetchTrackAPI = async (slug: string) =>
  await apiClient.get<Track>(`/api/tracks/${slug}`);
