import { storage } from "./storage";
import { api as apiRoutes } from "../shared/routes";
import { z } from "zod";

const BASE_API_URL = "https://foodcash.com.br/sistema/apiv4/api.php";
const DRAMA_BOX_API_URL = "https://db.hafizhibnusyam.my.id/api";
const BOTRAIKI_API_URL = "https://dramabox.botraiki.biz/api";

const COMMON_HEADERS = {
    'accept': 'application/json',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

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

async function fetchFromDramaBox(endpoint: string, page: number = 1) {
    const url = `${DRAMA_BOX_API_URL}${endpoint}?page=${page}`;
    try {
        const response = await fetch(url, { headers: COMMON_HEADERS, signal: AbortSignal.timeout(15000) });
        if (!response.ok) throw new Error(`Drama Box API error: ${response.statusText}`);
        const data = await response.json();
        const itemsList = data.data || [];
        return {
            success: true,
            items: itemsList.map((item: any) => ({
                id: `db-${item.id}`,
                title: item.title,
                poster: item.cover_image,
                rating: Number((9.0 + (Math.random() * 0.8)).toFixed(1)),
                year: "",
                type: "tv",
                genre: item.tags?.join(", ") || "",
                detailPath: `db-${item.id}`
            })),
            page: data.meta?.pagination?.page || page,
            hasMore: data.meta?.pagination?.has_more || false
        };
    } catch (err) {
        console.error(`[DramaBox] Fetch Error:`, err);
        throw err;
    }
}

async function fetchDramaBoxDetail(id: string) {
    const detailUrl = `${DRAMA_BOX_API_URL}/dramas/${id}`;
    const chaptersUrl = `${DRAMA_BOX_API_URL}/chapters/video?book_id=${id}`;
    try {
        const detailRes = await fetch(detailUrl, { headers: COMMON_HEADERS });
        if (!detailRes.ok) throw new Error(`Drama Box Detail error: ${detailRes.statusText}`);
        const detailData = await detailRes.json();
        const drama = detailData.data || {};

        const chaptersRes = await fetch(chaptersUrl, {
            method: 'POST',
            headers: { ...COMMON_HEADERS, 'Content-Type': 'application/json' }
        });

        let episodes = [];
        if (chaptersRes.ok) {
            const chaptersData = await chaptersRes.json();
            const epList = chaptersData.data || (Array.isArray(chaptersData) ? chaptersData : []);
            if (chaptersData.extras && Array.isArray(chaptersData.extras)) epList.push(...chaptersData.extras);

            episodes = epList.map((chap: any, idx: number) => {
                let videoUrl = "";
                if (Array.isArray(chap.stream_url)) videoUrl = chap.stream_url[0]?.url || "";
                else if (typeof chap.stream_url === 'string') videoUrl = chap.stream_url.trim();
                if (!videoUrl) videoUrl = chap.url || chap.video_url || chap.playerUrl || "";
                const epIndex = chap.chapter_index || (idx + 1).toString();
                return {
                    episode: epIndex,
                    title: chap.title || `Episode ${epIndex}`,
                    url: videoUrl,
                    playerUrl: videoUrl,
                    cover: chap.cover || drama.cover_image || ""
                };
            });
            episodes.sort((a: any, b: any) => parseInt(a.episode) - parseInt(b.episode));
        }

        let finalRating = 8.5;
        const apiScore = parseFloat(drama.score || drama.rating);
        if (!isNaN(apiScore) && apiScore > 0) finalRating = apiScore;
        else {
            const idNum = parseInt(id.slice(-3)) || 0;
            finalRating = 8.8 + (idNum % 10) / 10;
        }

        return {
            id: `db-${drama.id || id}`,
            title: drama.title || "DramaBox Drama",
            poster: drama.cover_image || "",
            description: drama.introduction || "No description available.",
            genre: drama.tags?.join(", ") || drama.genre || "",
            type: "tv",
            rating: Number(finalRating.toFixed(1)),
            year: drama.year || (new Date().getFullYear()).toString(),
            detailPath: `db-${drama.id || id}`,
            seasons: [{ name: "Season 1", season: "1", episodes: episodes }]
        };
    } catch (err) {
        console.error(`[DramaBox] Critical mapping error for ${id}:`, err);
        return {
            id: `db-${id}`,
            title: "Title Unavailable",
            poster: "",
            description: "Failed to load drama details.",
            genre: "",
            type: "tv",
            rating: 8.5,
            year: "2024",
            detailPath: `db-${id}`,
            seasons: []
        };
    }
}

async function fetchFromBotraiki(endpoint: string, page: number = 1) {
    const url = `${BOTRAIKI_API_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}page=${page}`;
    try {
        const response = await fetch(url, { headers: COMMON_HEADERS, signal: AbortSignal.timeout(15000) });
        if (!response.ok) throw new Error(`Botraiki API error: ${response.statusText}`);
        const data = await response.json();
        const itemsList = Array.isArray(data) ? data : (data.data || data.rankList || data.suggestList || []);
        return {
            success: true,
            items: itemsList.map((item: any) => {
                let rating = item.score ? parseFloat(item.score) : (item.rankVo?.hotCode ? 8.5 + (Math.min(parseFloat(item.rankVo.hotCode) || 0, 1000) / 1000) * 1.3 : 8.8 + (Math.random() * 0.7));
                return {
                    id: `bt-${item.bookId || item.id}`,
                    title: item.bookName || item.title,
                    poster: item.coverWap || item.cover || item.bookCover,
                    rating: Number(rating.toFixed(1)),
                    year: item.shelfTime?.split(' ')[0]?.split('-')[0] || "",
                    type: "tv",
                    genre: item.tags?.join(", ") || item.tagNames?.join(", ") || "",
                    detailPath: `bt-${item.bookId || item.id}`,
                };
            }),
            page: page,
            hasMore: itemsList.length >= 15
        };
    } catch (err) {
        console.error(`[Botraiki] Fetch Error:`, err);
        throw err;
    }
}

async function fetchBotraikiDetail(bookId: string) {
    const episodesUrl = `${BOTRAIKI_API_URL}/episodes?bookId=${bookId}`;
    try {
        let bookInfo: any = null;
        try {
            const detailRes = await fetch(`${BOTRAIKI_API_URL}/detail?bookId=${bookId}`, { headers: COMMON_HEADERS, signal: AbortSignal.timeout(10000) });
            if (detailRes.ok) {
                const detailData = await detailRes.json();
                if (detailData.data && detailData.data.bookId) bookInfo = detailData.data;
            }
        } catch (e) { }

        if (!bookInfo) {
            const endpoints = ['/trending', '/latest', '/for-you', '/dubbed?classify=terpopuler', '/random'];
            for (const ep of endpoints) {
                try {
                    const res = await fetch(`${BOTRAIKI_API_URL}${ep}`, { headers: COMMON_HEADERS, signal: AbortSignal.timeout(8000) });
                    if (res.ok) {
                        const data = await res.json();
                        const items = Array.isArray(data) ? data : (data.data || []);
                        const found = items.find((item: any) => item.bookId === bookId);
                        if (found) { bookInfo = found; break; }
                    }
                } catch (e) { }
            }
        }

        if (!bookInfo) bookInfo = { bookId, bookName: `Drama #${bookId}`, introduction: "Loading content from DramaBox..." };

        let episodes: any[] = [];
        try {
            const episodesRes = await fetch(episodesUrl, { headers: COMMON_HEADERS, signal: AbortSignal.timeout(90000) });
            if (episodesRes.ok) {
                const episodesData = await episodesRes.json();
                const epList = Array.isArray(episodesData) ? episodesData : (episodesData.data || []);
                episodes = epList.map((ep: any, idx: number) => {
                    let videoUrl = "";
                    if (ep.cdnList?.[0]?.videoPathList?.[0]) {
                        const cdn = ep.cdnList[0];
                        const v = cdn.videoPathList.find((v: any) => v.isDefault === 1) || cdn.videoPathList.find((v: any) => v.quality === 720) || cdn.videoPathList[0];
                        videoUrl = v.videoPath;
                    }
                    if (!videoUrl) videoUrl = ep.videoUrl || ep.video_url || "";
                    const episodeNum = typeof ep.chapterIndex === 'number' ? ep.chapterIndex + 1 : idx + 1;
                    return { episode: episodeNum.toString(), title: ep.chapterName || `Episode ${episodeNum}`, url: videoUrl, playerUrl: videoUrl };
                });
            }
        } catch (epErr) { }

        let rating = bookInfo.score ? parseFloat(bookInfo.score) : (bookInfo.rankVo?.hotCode ? 8.5 + (Math.min(parseFloat(bookInfo.rankVo.hotCode) || 0, 1000) / 1000) * 1.3 : 8.8 + (Math.random() * 0.7));

        return {
            id: `bt-${bookInfo.bookId || bookId}`,
            title: bookInfo.bookName || bookInfo.title || "Unknown Title",
            poster: bookInfo.coverWap || bookInfo.cover || bookInfo.bookCover || "",
            description: bookInfo.introduction || "",
            genre: bookInfo.tags?.join(", ") || "",
            type: "tv",
            rating: Number(rating.toFixed(1)),
            year: bookInfo.shelfTime?.split(' ')[0]?.split('-')[0] || "",
            detailPath: `bt-${bookInfo.bookId || bookId}`,
            seasons: episodes.length > 0 ? [{ name: "Season 1", season: "1", episodes: episodes }] : [],
        };
    } catch (err) {
        console.error(`[Botraiki] Detail Error:`, err);
        throw err;
    }
}

// Pure Handler Function
export async function handleApiRequest(path: string, method: string, query: any, body: any): Promise<any> {
    // 1. Category List: /api/movies/:category
    if (path.startsWith("/api/movies/")) {
        const category = path.replace("/api/movies/", "") || "trending";
        const page = Number(query.page) || 1;

        console.log(`[Handler] Category: ${category}, Page: ${page}`);

        const fetchFn = async (apiPage: number) => {
            if (category.startsWith('drama-box')) {
                let endpoint = '/dramas';
                if (category === 'drama-box-trending') endpoint = '/dramas/trending';
                else if (category === 'drama-box-indo') endpoint = '/dramas/indo';
                else if (category === 'drama-box-must-sees') endpoint = '/dramas/must-sees';
                else if (category === 'drama-box-hidden-gems') endpoint = '/dramas/hidden-gems';
                return await fetchFromDramaBox(endpoint, apiPage);
            }

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
                'indo-dub'
            ];
            let apiUrl: string;

            if (CURATED_ACTIONS.includes(category)) {
                apiUrl = `${BASE_API_URL}?action=${category}&page=${apiPage}`;
            } else if (category.startsWith('genre-')) {
                apiUrl = `${BASE_API_URL}?action=search&q=${encodeURIComponent(category.replace('genre-', ''))}&page=${apiPage}`;
            } else {
                // broad search for everything else (anime, etc.)
                apiUrl = `${BASE_API_URL}?action=search&q=${encodeURIComponent(category.replace(/-/g, ' '))}&page=${apiPage}`;
            }

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
            return data;
        };

        try {
            return await fetchPagedData(page, fetchFn);
        } catch (e) {
            // Fallbacks
            if (category === 'trending') return await fetchFromDramaBox('/dramas/trending', Number(page));
            if (category === 'short-tv' || category === 'indonesian-movies') return await fetchFromDramaBox('/dramas', Number(page));
            return await fetchFromBotraiki('/for-you', Number(page));
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
            return await fetchFromBotraiki(`/search?query=${encodeURIComponent(q)}`, page);
        }
    }

    // 3. Detail: /api/detail
    if (path === "/api/detail") {
        const detailPath = query.path;
        if (!detailPath) throw new Error("Path required");
        if (detailPath.startsWith('db-')) return await fetchDramaBoxDetail(detailPath.replace('db-', ''));
        if (detailPath.startsWith('bt-')) return await fetchBotraikiDetail(detailPath.replace('bt-', ''));

        const resp = await fetch(`${BASE_API_URL}?action=detail&detailPath=${encodeURIComponent(detailPath)}`, { signal: AbortSignal.timeout(12000) });
        if (!resp.ok) throw new Error("Detail fetch failed");
        const data = await resp.json();
        const finalData = data.data || data;
        if (finalData && !finalData.rating) finalData.rating = "8.9";
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
