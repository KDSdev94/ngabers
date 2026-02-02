import { db } from "./db";
import {
  watchHistory,
  type InsertWatchHistory,
  type WatchHistoryItem
} from "@shared/schema";

export interface IStorage {
  // We can add history features later
  addToHistory(item: InsertWatchHistory): Promise<WatchHistoryItem>;
}

export class DatabaseStorage implements IStorage {
  async addToHistory(item: InsertWatchHistory): Promise<WatchHistoryItem> {
    const [entry] = await db.insert(watchHistory).values(item).returning();
    return entry;
  }
}

export const storage = new DatabaseStorage();
