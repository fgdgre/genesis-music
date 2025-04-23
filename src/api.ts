import type { QueryParams, Track } from "@/types";
import type { DeepReadonly } from "vue";

const buildTrackQuery = (page?: number, filters?: Partial<QueryParams>) => {
  const params = new URLSearchParams();

  if (page) params.set("page", String(page));

  if (filters) {
    if (filters.search) params.set("search", filters.search);
    if (filters.artist) params.set("artist", filters.artist);
    if (filters.order) params.set("order", filters.order);
    if (filters.sort) params.set("sort", filters.sort);
    if (filters.genre) params.set("genre", filters.genre);
  }

  return params.toString(); // only query string
};

export const fetchTracksAPI = async ({
  page,
  filters,
}: {
  page: number;
  filters: QueryParams;
}) => {
  try {
    const response = await fetch(
      `api/tracks?${buildTrackQuery(page, filters)}`,
    );

    if (!response.ok) {
      // TODO: fix
      const errText = await response.text();
      throw new Error(`Server error: ${response.status} - ${errText}`);
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
      // TODO: fix
      throw new Error(`Server error: ${response.status} - ${response}`);
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
      // TODO: fix
      const errorMessage =
        response.status === 409
          ? "Track with this title already exists"
          : "Something went wrong";
      throw new Error(`${response.status} - ${errorMessage}`);
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
      // TODO: fix
      const errText = await response.text();
      throw new Error(`Server error: ${response.status} - ${errText}`);
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
      const errorMessage =
        response.status === 409
          ? "Track with this title already exists"
          : "Something went wrong";
      throw new Error(`${response.status} - ${errorMessage}`);
    }

    const data = await response.json();

    return { data, error: null };
  } catch (e: any) {
    console.error(e);
    return { data: null, error: e };
  }
};
