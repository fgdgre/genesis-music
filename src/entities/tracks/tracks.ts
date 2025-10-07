import { apiClient, TracksResponseSchema } from "@/shared/api";
import type { Track, TracksMeta } from "@/types";
import type { DeepReadonly, Ref } from "vue";

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
  await apiClient.get("api/tracks", {
    schema: TracksResponseSchema,
    query: { page, search, genre, artist, order, sort },
    signal,
  });

// export const postTrackAPI = async (track: Track | DeepReadonly<Track>) => {
//   const res = await apiClient.post("api/tracks", {
//     body: track,
//   });

//   if (res.ok) {
//     invalidateAll("tracks");
//     filtersStore().refreshFilters();
//   }

//   return res;
// };

// export const deleteTrackAPI = async (id: string) => {
//   const res = await apiClient.delete(`api/tracks/${id}`);

//   if (res.ok) {
//     invalidateAll("tracks");
//   }

//   return res;
// };

// export const editTrackAPI = async (track: Track | DeepReadonly<Track>) => {
//   const res = await apiClient.put(`api/tracks/${track.id}`, {
//     body: track,
//   });

//   if (res.ok) {
//     invalidateAll("tracks");
//   }

//   return res;
// };

// export const postTrackFileAPI = async (id: string, file: any) => {
//   const formData = new FormData();
//   formData.append("file", file);

//   const res = await apiClient.post(`api/tracks/${id}/upload`, {
//     body: formData,
//   });

//   if (res.ok) {
//     invalidateAll("tracks");
//   }

//   return res;
// };

// export const deleteTrackFileAPI = async (id: string) => {
//   const res = await apiClient.delete(`api/tracks/${id}/file`);

//   if (res.ok) {
//     invalidateAll("tracks");
//   }

//   return res;
// };
export const postTrackAPI = async (track: Track | DeepReadonly<Track>) => {
  // const res = await apiClient.post("api/tracks", {
  //   body: track,
  // });
  // if (res.ok) {
  //   invalidateAll("tracks");
  //   filtersStore().refreshFilters();
  // }
  // return res;
};

export const deleteTrackAPI = async (id: string) => {
  // const res = await apiClient.delete(`api/tracks/${id}`);
  // if (res.ok) {
  //   invalidateAll("tracks");
  // }
  // return res;
};

export const editTrackAPI = async (track: Track | DeepReadonly<Track>) => {
  // const res = await apiClient.put(`api/tracks/${track.id}`, {
  //   body: track,
  // });
  // if (res.ok) {
  //   invalidateAll("tracks");
  // }
  // return res;
};

export const postTrackFileAPI = async (id: string, file: any) => {
  // const formData = new FormData();
  // formData.append("file", file);
  // const res = await apiClient.post(`api/tracks/${id}/upload`, {
  //   body: formData,
  // });
  // if (res.ok) {
  //   invalidateAll("tracks");
  // }
  // return res;
};

export const deleteTrackFileAPI = async (id: string) => {
  // const res = await apiClient.delete(`api/tracks/${id}/file`);
  // if (res.ok) {
  //   invalidateAll("tracks");
  // }
  // return res;
};
