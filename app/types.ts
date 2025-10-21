export type Track = {
  id: string;
  title: string;
  artist: string;
  album: string;
  genres: string[];
  slug?: string;
  coverImage: string;
  audioFile?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type TracksMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type QueryParams = {
  search: string;
  genre: string;
  artist: string;
  order: "asc" | "desc" | "";
  sort: "title" | "artist" | "album" | "createdAt" | "";
};

export type Toast = {
  id: string;
  title: string;
  description?: string;
  color?: "error" | "success";
  icon?: "check" | "warning";
  duration?: number;
  showProgress?: boolean;
};

export type DropdownItem = {
  label: string;
  value: string;
};

export type TracksResponse = {
  data: Track[];
  meta: TracksMeta;
};

export type TracksFilters = {
  page: number;
  search?: string;
  genre?: string;
  artist?: string;
  order?: "asc" | "desc" | "";
  sort?: "title" | "artist" | "album" | "createdAt" | "";
};
