import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// We don't strictly need a database for this proxy app, but we'll set up a simple 
// schema for potential future features like favorites or watch history.
export const watchHistory = pgTable("watch_history", {
  id: serial("id").primaryKey(),
  movieId: text("movie_id").notNull(),
  title: text("title").notNull(),
  poster: text("poster"),
  detailPath: text("detail_path").notNull(),
  watchedAt: integer("watched_at").notNull(), // timestamp
});

export const insertWatchHistorySchema = createInsertSchema(watchHistory).omit({ id: true });
export type InsertWatchHistory = z.infer<typeof insertWatchHistorySchema>;
export type WatchHistoryItem = typeof watchHistory.$inferSelect;

// --- External API Types ---

export const movieItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  poster: z.string(),
  rating: z.union([z.number(), z.string()]).transform(val => Number(val) || 0),
  year: z.string().optional(),
  type: z.string().optional(), // 'movie' or 'tv'
  genre: z.string().optional(),
  detailPath: z.string(),
});

export type MovieItem = z.infer<typeof movieItemSchema>;

export const apiResponseSchema = z.object({
  success: z.boolean(),
  items: z.array(movieItemSchema),
  page: z.number().optional(),
  hasMore: z.boolean().optional(),
});

export type ApiResponse = z.infer<typeof apiResponseSchema>;

// Detail response might vary, defining a flexible schema based on typical usage
export const movieDetailSchema = movieItemSchema.extend({
  description: z.string().optional(),
  playerUrl: z.string().optional(),
  seasons: z.array(z.object({
    name: z.string(),
    episodes: z.array(z.object({
      episode: z.string(),
      url: z.string(),
    })).optional()
  })).optional(),
});

export type MovieDetail = z.infer<typeof movieDetailSchema>;
