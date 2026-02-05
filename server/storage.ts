import { db } from "./firebase";
import {
  type InsertWatchHistory,
  type WatchHistoryItem
} from "@shared/schema";

export interface IStorage {
  addToHistory(item: InsertWatchHistory): Promise<WatchHistoryItem>;
  getHistory(): Promise<WatchHistoryItem[]>;
}

export class FirestoreStorage implements IStorage {
  private collection = db.collection("watch_history");

  async addToHistory(item: InsertWatchHistory): Promise<WatchHistoryItem> {
    const docRef = await this.collection.add({
      ...item,
      watchedAt: item.watchedAt || Math.floor(Date.now() / 1000)
    });
    const doc = await docRef.get();
    const data = doc.data()!;
    return {
      id: doc.id,
      ...data
    } as any;
  }

  async getHistory(): Promise<WatchHistoryItem[]> {
    const snapshot = await this.collection.orderBy("watchedAt", "desc").limit(50).get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any;
  }
}

export const storage = new FirestoreStorage();

console.log(`[Storage] Initialized with Firestore storage`);

