export type Track = {
  id: string;
  title: string;
  artist: string;
  album: string;
  genres: [string];
  slug: string;
  coverImage: string;
  audioFile: string;
  createdAt: Date;
  updatedAt: Date;
};

export type TracksMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type NewTrack = {
  id?: string;
  title: string;
  artist: string;
  album: string;
  genres: string[];
  coverImage: string;
};

export type QueryParams = {
  search: string;
  genres: string[];
  artist: string;
  order: "asc" | "desc" | "";
  sort: "title" | "artist" | "album" | "createdAt";
};
