import * as z from "zod";

export const TrackSchema = z.object({
  title: z.string(),
  artist: z.string(),
  album: z.string(),
  genres: z.array(z.string()),
  coverImage: z
    .string()
    .trim()
    .refine((val) => val === "" || z.string().url().safeParse(val).success, {
      message: "Invalid URL",
    })
    .optional(),
});

export const TracksResponseSchema = z.object({
  data: z.array(TrackSchema),
  meta: z.object({
    total: z.number(),
    page: z.number(),
    totalPages: z.number(),
  }),
});

export type TracksResponseT = z.infer<typeof TracksResponseSchema>;
