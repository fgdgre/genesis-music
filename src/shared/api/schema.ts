import Track from "@/components/Track.vue";
import * as z from "zod";

export const TrackSchema = z.object({
  id: z.string(),
  title: z.string(),
  artist: z.string(),
  album: z.string(),
  genres: z.array(z.string()),
  coverImage: z.string().url().or(z.string().startsWith("data:")),
});

export const TracksResponseSchema = z.object({
  data: z.array(Track),
  meta: z.object({
    total: z.number(),
    page: z.number(),
    totalPages: z.number(),
  }),
});

export type TracksResponseT = z.infer<typeof TracksResponseSchema>;
