import type { QueryParams } from "@/types";

export const buildTrackQuery = (
  page?: number,
  filters?: Partial<QueryParams>,
) => {
  const params = new URLSearchParams();

  if (page) params.set("page", String(page));

  if (filters) {
    if (filters.search) params.set("search", filters.search);
    if (filters.artist) params.set("artist", filters.artist);
    if (filters.order) params.set("order", filters.order);
    if (filters.sort) params.set("sort", filters.sort);
    if (filters.genres?.length) {
      for (const genre of filters.genres) {
        params.append("genres", genre);
      }
    }
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
      const errText = await response.text();
      throw new Error(`Server error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    return { data, error: null };
  } catch (e) {
    console.log(e);
    return { data: null, error: e };
  }
};
