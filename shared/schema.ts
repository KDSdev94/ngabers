import { z } from "zod";

// We'll use Firestore for watch history.
export const watchHistorySchema = z.object({
  id: z.string(),
  movieId: z.string(),
  title: z.string(),
  poster: z.string().nullable(),
  detailPath: z.string(),
  watchedAt: z.number(), // timestamp
});

export const insertWatchHistorySchema = watchHistorySchema.omit({ id: true });
export type InsertWatchHistory = z.infer<typeof insertWatchHistorySchema>;
export type WatchHistoryItem = z.infer<typeof watchHistorySchema>;


// --- External API Types ---

export const movieItemSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(val => String(val)),
  title: z.string(),
  poster: z.string().nullish().transform(val => val || ""),
  rating: z.union([z.number(), z.string(), z.null()]).transform(val => Number(val) || 0),
  year: z.string().nullish().transform(val => val || ""),
  type: z.string().nullish().transform(val => val || "movie"), // 'movie' or 'tv'
  genre: z.string().nullish().transform(val => val || ""),
  detailPath: z.string(),
});

export type MovieItem = z.infer<typeof movieItemSchema>;

export const apiResponseSchema = z.object({
  success: z.boolean().default(true),
  items: z.array(movieItemSchema).default([]),
  page: z.number().nullish().transform(val => val || 1),
  hasMore: z.boolean().nullish().transform(val => !!val),
});

export type ApiResponse = z.infer<typeof apiResponseSchema>;

// Detail response might vary, defining a flexible schema based on typical usage
// Anime API returns: { season: 1, episodes: [{ episode: 1, title: "Episode 1", playerUrl: "..." }] }
// Movie API returns: { name: "Season 1", episodes: [{ episode: "Episode 1", url: "..." }] }
export const movieDetailSchema = movieItemSchema.extend({
  description: z.string().nullish().transform(val => val || ""),
  playerUrl: z.string().nullish().transform(val => val || ""),
  totalSeasons: z.number().nullish().transform(val => val || 0),
  seasons: z.array(z.object({
    // Support both 'name' (string) and 'season' (number) from API
    name: z.string().nullish().transform(val => val || ""),
    season: z.union([z.string(), z.number()]).nullish().transform(val => val != null ? String(val) : ""),
    totalEpisodes: z.number().nullish().transform(val => val || 0),
    episodes: z.array(z.object({
      // Support both number and string for episode field
      episode: z.union([z.string(), z.number()]).nullish().transform(val => val != null ? String(val) : "Episode"),
      title: z.string().nullish().transform(val => val || ""),
      cover: z.string().nullish().transform(val => val || ""),
      // Support both 'url' and 'playerUrl' for video source
      url: z.string().nullish().transform(val => val || ""),
      playerUrl: z.string().nullish().transform(val => val || ""),
    })).nullish().transform(val => val || [])
  })).nullish().transform(val => val || []),
});

export type MovieDetail = z.infer<typeof movieDetailSchema>;
