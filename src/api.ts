import type { Track } from "@/types";
import type { DeepReadonly } from "vue";
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
}) => {
  try {
    const response = await fetch(
      `api/tracks?${buildQueryForAPI({ page, search, genre, artist, order, sort })}`,
    );

    if (!response.ok) {
      const responseError = await response.json();
      throw {
        status: response.status,
        message: responseError.error || "Unknown error",
      };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (e: any) {
    console.error(e);
    return { data: null, error: e };
  }
};

export const deleteTrackAPI = async (id: string) => {
  try {
    const response = await fetch(`api/tracks/${id}`, { method: "DELETE" });

    if (!response.ok) {
      const responseError = await response.json();
      throw {
        status: response.status,
        message: responseError.error || "Unknown error",
      };
    }

    return { data: id, error: null };
  } catch (e: any) {
    console.error(e);
    return { data: null, error: e };
  }
};

export const editTrackAPI = async (track: DeepReadonly<Track>) => {
  try {
    const response = await fetch(`api/tracks/${track.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(track),
    });

    if (!response.ok) {
      const responseError = await response.json();
      throw {
        status: response.status,
        message: responseError.error || "Unknown error",
      };
    } else {
      const data = await response.json();
      return { data, error: null };
    }
  } catch (e: any) {
    console.error(e);
    return { data: null, error: e };
  }
};

export const fetchGenresAPI = async () => {
  try {
    const response = await fetch("api/genres");

    if (!response.ok) {
      const responseError = await response.json();
      throw {
        status: response.status,
        message: responseError.error || "Unknown error",
      };
    }

    const genres = await response.json();
    return { data: genres, error: null };
  } catch (e: any) {
    console.error(e);
    return { data: null, error: e };
  }
};

export const postTrackAPI = async (track: DeepReadonly<Track>) => {
  try {
    const response = await fetch("api/tracks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(track),
    });

    if (!response.ok) {
      const text = await response.json();
      throw { status: response.status, message: text.error || "Unknown error" };
    }

    const data = await response.json();

    return { data, error: null };
  } catch (e: any) {
    console.error(e);
    return { data: null, error: e };
  }
};
