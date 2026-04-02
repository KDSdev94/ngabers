import { storage } from "./storage";
import { api as apiRoutes } from "../shared/routes";
import { z } from "zod";

const BASE_API_URL = "https://zeldvorik.ru/apiv3/api.php";

const COMMON_HEADERS = {
    'accept': 'application/json',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

/**
 * Memperbaiki URL gambar yang dibungkus oleh proxy yang rusak
 */
function cleanProxyUrl(url: string | null | undefined): string {
    if (!url) return "";
    if (url.includes("image-proxy.php?url=")) {
        try {
            const parts = url.split("url=");
            if (parts.length > 1) {
                // Decode base64 dari parameter url=
                const decoded = Buffer.from(parts[1], 'base64').toString('utf-8');
                return decoded;
            }
        } catch (e) {
            console.error("[Cleaner] Gagal decode proxy URL:", e);
        }
    }
    return url;
}


async function fetchPagedData(
    requestPage: number,
    fetchFn: (p: number) => Promise<any>
) {
    const UI_SIZE = 24;
    const API_SIZE = 20;

    // Calculate which global items we need
    const startItem = (requestPage - 1) * UI_SIZE;
    const endItem = requestPage * UI_SIZE;

    // Calculate which API pages cover this range
    // API Page 1: 0-19, Page 2: 20-39, Page 3: 40-59
    const startApiPage = Math.floor(startItem / API_SIZE) + 1;
    const endApiPage = Math.floor((endItem - 1) / API_SIZE) + 1;

    // Fetch all required pages
    const promises = [];
    for (let p = startApiPage; p <= endApiPage; p++) {
        promises.push(fetchFn(p).catch(() => ({ items: [], hasMore: false })));
    }

    const results = await Promise.all(promises);

    // Merge all items from fetched pages
    let allItems: any[] = [];
    for (const res of results) {
        if (res && Array.isArray(res.items)) {
            allItems = allItems.concat(res.items);
        }
    }

    // Determine slice indices relative to the merged array
    // The merged array starts at global index: (startApiPage - 1) * API_SIZE
    const globalStartOfFetch = (startApiPage - 1) * API_SIZE;
    const relativeStart = startItem - globalStartOfFetch;
    const relativeEnd = relativeStart + UI_SIZE;

    const slicedItems = allItems.slice(relativeStart, relativeEnd);

    // Determine hasMore
    // If we have more items in the buffer than we used, then YES, next page exists
    let hasMore = false;
    if (slicedItems.length === UI_SIZE) {
        if (allItems.length > relativeEnd) {
            hasMore = true;
        } else {
            // We used exactly everything we fetched. Check the last API page's hasMore
            const lastResult = results[results.length - 1];
            hasMore = !!lastResult?.hasMore;
        }
    }

    console.log(`[VirtualPaging] UI Page ${requestPage} (Req: ${startItem}-${endItem}) -> API Pages ${startApiPage}-${endApiPage}. Got ${slicedItems.length} items. HasMore: ${hasMore}`);

    return {
        success: true,
        items: slicedItems,
        page: requestPage,
        hasMore
    };
}

// Pure Handler Function
export async function handleApiRequest(path: string, method: string, query: any, body: any): Promise<any> {
    // 1. Category List: /api/movies/:category
    if (path.startsWith("/api/movies/")) {
        const category = path.replace("/api/movies/", "") || "trending";
        const page = Number(query.page) || 1;

        console.log(`[Handler] Category: ${category}, Page: ${page}`);


        const fetchFn = async (apiPage: number) => {
            // Specific regional categories use curated actions to prevent irrelevant foreign results.
            const CURATED_ACTIONS = [
                'trending',
                'indonesian-movies',
                'indonesian-drama',
                'kdrama',
                'short-tv',
                'anime',
                'adult-comedy',
                'western-tv',
                'indo-dub',
            ];

            if (!CURATED_ACTIONS.includes(category)) {
                return {
                    success: true,
                    items: [],
                    page: apiPage,
                    hasMore: false,
                };
            }

            const apiUrl = `${BASE_API_URL}?action=${category}&page=${apiPage}`;

            const resp = await fetch(apiUrl, { signal: AbortSignal.timeout(10000) });
            if (!resp.ok) throw new Error("Upstream error");
            const data = await resp.json();

            // Filter out junk content for Indonesian categories
            if (CURATED_ACTIONS.includes(category) || category.includes('indo')) {
                const blacklist = ['nigerian', 'ghana', 'nollywood', 'yoruba', 'latest full movies', 'nige', 'cinema-ready'];
                if (data && Array.isArray(data.items)) {
                    data.items = data.items.filter((item: any) => {
                        const title = (item.title || "").toLowerCase();
                        return !blacklist.some(word => title.includes(word));
                    });
                }
            }

            // Clean posters for main API results
            if (data && Array.isArray(data.items)) {
                data.items = data.items.map((item: any) => ({
                    ...item,
                    poster: cleanProxyUrl(item.poster)
                }));
            }

            return data;
        };

        try {
            return await fetchPagedData(page, fetchFn);
        } catch (e) {
            return {
                success: true,
                items: [],
                page,
                hasMore: false,
            };
        }
    }

    // 2. Search: /api/search
    if (path === "/api/search") {
        const q = query.q;
        const page = Number(query.page) || 1;
        if (!q) throw new Error("Query required");

        // Search main API
        try {
            const resp = await fetch(`${BASE_API_URL}?action=search&q=${encodeURIComponent(q)}&page=${page}`, { signal: AbortSignal.timeout(10000) });
            if (!resp.ok) throw new Error("Search failed");
            const data = await resp.json();
            if (data?.items) {
                data.items = data.items.map((item: any) => ({ ...item, poster: cleanProxyUrl(item.poster) }));
            }
            return data;
        } catch (e) {
            return {
                success: true,
                items: [],
                page,
                hasMore: false,
            };
        }
    }

    // 3. Detail: /api/detail
    if (path === "/api/detail") {
        const detailPath = query.path;
        if (!detailPath) throw new Error("Path required");

        const resp = await fetch(`${BASE_API_URL}?action=detail&detailPath=${encodeURIComponent(detailPath)}`, { signal: AbortSignal.timeout(12000) });
        if (!resp.ok) throw new Error("Detail fetch failed");
        const data = await resp.json();
        const finalData = data.data || data;
        if (finalData) {
            finalData.poster = cleanProxyUrl(finalData.poster);
            if (!finalData.rating) finalData.rating = "8.9";
        }
        return finalData;
    }

    // Watch History
    if (path === "/api/history" && method === "POST") {
        return await storage.addToHistory(body);
    }
    if (path === "/api/history" && method === "GET") {
        return await storage.getHistory();
    }

    throw new Error("Not Found");
}
