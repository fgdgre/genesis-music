import { apiClient, TracksResponseSchema } from "@/shared/api";
import { filtersStore } from "@/stores/filters";
import type { Track } from "@/types";
import { useQuery } from "@tanstack/vue-query";
import type { DeepReadonly, Ref } from "vue";

export const fetchTracksAPI = ({
  page,
  search,
  genre,
  artist,
  order,
  sort,
}: {
  page: Ref<number>;
  search?: Ref<string>;
  genre?: Ref<string>;
  artist?: Ref<string>;
  order?: Ref<"asc" | "desc" | "">;
  sort?: Ref<"title" | "artist" | "album" | "createdAt" | "">;
}) => {
  const res = useQuery({
    queryKey: ["tracks", page, search, genre, artist, order, sort],
    queryFn: async ({ signal }) => {
      await apiClient.get("api/tracks", {
        schema: TracksResponseSchema,
        query: { page, search, genre, artist, order, sort },
        signal,
      });
    },
  });
};

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
