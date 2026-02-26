/**
 * Watch Progress Utility
 * Menyimpan dan membaca progress menonton dari localStorage
 */

const STORAGE_KEY = "ngabers_watch_progress";

export interface WatchEntry {
    url: string;               // Episode/movie URL (key)
    minutes: number;           // Menit terakhir ditonton (estimasi)
    durationMinutes?: number;  // Estimasi durasi total (jika diketahui)
    watchedAt: number;         // Timestamp terakhir ditonton
    completed: boolean;        // Sudah selesai ditonton (>= 80%)
}

type ProgressMap = Record<string, WatchEntry>;

function getAll(): ProgressMap {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

function saveAll(map: ProgressMap): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    } catch {
        // Storage full or disabled, fail silently
    }
}

/** Normalize URL sebagai key (hapus protokol, trailing slash, fragment) */
export function normalizeUrl(url: string): string {
    try {
        return decodeURIComponent(url)
            .replace(/^https?:\/\//, "")
            .replace(/\/+$/, "")
            .split("#")[0];
    } catch {
        return url;
    }
}

/** Menyimpan / update progress menonton */
export function saveProgress(url: string, minutes: number, completed = false): void {
    const key = normalizeUrl(url);
    const all = getAll();
    const prev = all[key];

    all[key] = {
        url,
        minutes,
        watchedAt: Date.now(),
        completed: completed || (prev?.completed ?? false),
    };

    saveAll(all);
}

/** Tandai episode sebagai selesai ditonton */
export function markCompleted(url: string): void {
    const key = normalizeUrl(url);
    const all = getAll();
    const prev = all[key];

    all[key] = {
        url,
        minutes: prev?.minutes ?? 0,
        watchedAt: Date.now(),
        completed: true,
    };

    saveAll(all);
}

/** Ambil progress untuk satu URL */
export function getProgress(url: string): WatchEntry | null {
    const key = normalizeUrl(url);
    return getAll()[key] ?? null;
}

/** Format menit ke "X mnt" atau "Xj Ymnt" */
export function formatMinutes(minutes: number): string {
    if (minutes < 60) return `${Math.round(minutes)} mnt`;
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    return m > 0 ? `${h}j ${m}mnt` : `${h}j`;
}
