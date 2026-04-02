// Vercel Serverless Function - Self-contained API Handler
// This file must be standalone and cannot import from ../server/

/**
 * Base URL: https://zeldvorik.ru/apiv3/api.php
 * 📚 Daftar Endpoint
 * Semua endpoint tersedia melalui parameter action
 * 
 * 1. Trending Content: action=trending
 * 2. Film Indonesia: action=indonesian-movies
 * 3. Drama Indonesia: action=indonesian-drama
 * 4. K-Drama: action=kdrama
 * 5. Short TV: action=short-tv
 * 6. Anime: action=anime
 * 7. Search: action=search&q=keyword
 * 8. Detail Content: action=detail&detailPath=PATH
 */
const BASE_API_URL = "https://zeldvorik.ru/apiv3/api.php";

const COMMON_HEADERS = {
    'accept': 'application/json',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

// Main API Handler
async function handleApiRequest(path: string, method: string, query: any, body: any): Promise<any> {
    // 1. Category List: /api/movies/:category
    if (path.startsWith("/api/movies/")) {
        const category = path.replace("/api/movies/", "") || "trending";
        const page = query.page || 1;

        console.log(`[Handler] Category: ${category}, Page: ${page}`);

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
                page: Number(page),
                hasMore: false,
            };
        }

        const apiUrl = `${BASE_API_URL}?action=${category}&page=${page}`;

        try {
            const resp = await fetch(apiUrl, { signal: AbortSignal.timeout(10000) });
            if (!resp.ok) throw new Error("Upstream error");
            const data = await resp.json();

            if (CURATED_ACTIONS.includes(category) || category.includes('indo')) {
                const blacklist = ['nigerian', 'ghana', 'nollywood', 'yoruba', 'latest full movies', 'nige', 'cinema-ready'];
                if (data && Array.isArray(data.items)) {
                    data.items = data.items.filter((item: any) => {
                        const title = (item.title || "").toLowerCase();
                        return !blacklist.some(word => title.includes(word));
                    });
                }
            }
            return data;
        } catch (e) {
            return {
                success: true,
                items: [],
                page: Number(page),
                hasMore: false,
            };
        }
    }

    // 2. Search: /api/search
    if (path === "/api/search") {
        const q = query.q;
        const page = Number(query.page) || 1;
        if (!q) throw new Error("Query required");
        try {
            const resp = await fetch(`${BASE_API_URL}?action=search&q=${encodeURIComponent(q)}&page=${page}`, { signal: AbortSignal.timeout(10000) });
            if (!resp.ok) throw new Error("Search failed");
            return await resp.json();
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
            // Ensure ID and detailPath exist for schema validation
            if (!finalData.id) finalData.id = detailPath.split('/').pop() || Math.random().toString(36).substring(7);
            if (!finalData.detailPath) finalData.detailPath = detailPath;

            // Fallbacks for metadata
            if (!finalData.rating) finalData.rating = "8.9";


            // Aggressive Country/Region mapping
            if (finalData.area && !finalData.country) finalData.country = finalData.area;
            if (finalData.region && !finalData.country) finalData.country = finalData.region;
        }
        return finalData;
    }

    // History endpoints - not supported in serverless (would need database)
    if (path === "/api/history") {
        return { success: true, items: [] };
    }

    throw new Error("Not Found");
}

// Vercel Serverless Function Export
export default async function handler(req: any, res: any) {
    const { method, url } = req;
    const urlParts = new URL(url || '', `http://${req.headers.host}`);
    const path = urlParts.pathname;
    const query = Object.fromEntries(urlParts.searchParams);
    const body = req.body;

    console.log(`[Vercel API] ${method} ${path}`);

    try {
        const response = await handleApiRequest(path, method || 'GET', query, body);
        res.status(200).json(response);
    } catch (error: any) {
        console.error('[Vercel API Error]', error);
        res.status(error?.status || 500).json({
            message: error?.message || 'Internal Server Error',
            success: false
        });
    }
}
