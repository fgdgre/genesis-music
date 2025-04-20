export type Track = {
  id: string;
  title: string;
  artist: string;
  album: string;
  genres: [string];
  slug: string;
  coverImage: string;
  audioFile: string;
  createdAt: string;
  updatedAt: string;
};

export type TracksMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type NewTrack = {
  title: string;
  artist: string;
  album: string;
  genres: string[];
  coverImage: string;
};
