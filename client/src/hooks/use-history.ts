import { useState, useEffect } from "react";

export interface HistoryItem {
    id: string;
    title: string;
    poster: string;
    watchedAt: number;
    path?: string;
    epTitle?: string;
}

const STORAGE_KEY = "stream_zone_watch_history";
const MAX_HISTORY = 50;

export function useHistory() {
    const [history, setHistory] = useState<HistoryItem[]>([]);

    // Load history from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setHistory(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse history", e);
            }
        }
    }, []);

    const addToHistory = (item: Omit<HistoryItem, "watchedAt">) => {
        const newHistory = [
            { ...item, watchedAt: Date.now() },
            ...history.filter((i) => i.id !== item.id), // Remove if exists to move to top
        ].slice(0, MAX_HISTORY);

        setHistory(newHistory);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    };

    const removeFromHistory = (id: string) => {
        const newHistory = history.filter((i) => i.id !== id);
        setHistory(newHistory);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    };

    const clearHistory = () => {
        setHistory([]);
        localStorage.removeItem(STORAGE_KEY);
    };

    return {
        history,
        addToHistory,
        removeFromHistory,
        clearHistory,
    };
}
