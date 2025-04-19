export type Track = {
  id: "string";
  title: "string";
  artist: "string";
  album: "string";
  genres: ["string"];
  slug: "string";
  coverImage: "string";
  audioFile: "string";
  createdAt: "string";
  updatedAt: "string";
};

export type TracksAPI = {
  data: Track[];
  meta: {
    total: 0;
    page: 0;
    limit: 0;
    totalPages: 0;
  };
};

export type NewTrack = {
  title: "string";
  artist: "string";
  album: "string";
  genres: ["string"];
  coverImage: "string";
};
