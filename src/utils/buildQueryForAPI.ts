export const buildQueryForAPI = ({
  page,
  search,
  genre,
  artist,
  order,
  sort,
}: {
  page?: number;
  search?: string;
  genre?: string;
  artist?: string;
  order?: "asc" | "desc" | "";
  sort?: "title" | "artist" | "album" | "createdAt" | "";
}) => {
  const params = new URLSearchParams();

  if (page) params.set("page", String(page));
  if (search) params.set("search", search);
  if (genre) params.set("genre", genre);
  if (artist) params.set("artist", artist);
  if (order) params.set("order", order);
  if (sort) params.set("sort", sort);

  return params.toString();
};
