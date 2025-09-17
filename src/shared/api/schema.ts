import { z } from "zod";

export const Track = z.object({
  id: z.string(),
  title: z.string(),
  artist: z.string(),
  album: z.string(),
  genres: z.array(z.string()),
  coverImage: z.string().url().or(z.string().startsWith("data:")),
});

export const TracksResponse = z.object({
  data: z.array(Track),
  meta: z.object({
    total: z.number(),
    page: z.number(),
    totalPages: z.number(),
  }),
});

export type TracksResponseT = z.infer<typeof TracksResponse>;
