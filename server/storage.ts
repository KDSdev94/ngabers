import { db } from "./db";
import {
  watchHistory,
  type InsertWatchHistory,
  type WatchHistoryItem
} from "@shared/schema";

export interface IStorage {
  addToHistory(item: InsertWatchHistory): Promise<WatchHistoryItem>;
}

export class MemStorage implements IStorage {
  private history: Map<number, WatchHistoryItem>;
  private currentId: number;

  constructor() {
    this.history = new Map();
    this.currentId = 1;
  }

  async addToHistory(item: InsertWatchHistory): Promise<WatchHistoryItem> {
    const entry: WatchHistoryItem = {
      ...item,
      id: this.currentId++,
      poster: item.poster ?? null
    };
    this.history.set(entry.id, entry);
    return entry;
  }
}

export class DatabaseStorage implements IStorage {
  async addToHistory(item: InsertWatchHistory): Promise<WatchHistoryItem> {
    if (!db) throw new Error("Database not initialized");
    const [entry] = await db.insert(watchHistory).values(item).returning();
    return entry;
  }
}

// Choose storage based on availability of database
export const storage = db ? new DatabaseStorage() : new MemStorage();

console.log(`[Storage] Initialized with ${db ? "PostgreSQL" : "In-Memory"} storage`);
