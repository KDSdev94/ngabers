// Vercel Serverless Function - Self-contained API Handler
// This file must be standalone and cannot import from ../server/

const BASE_API_URL = "https://zeldvorik.ru/apiv3/api.php";
const DRAMA_BOX_API_URL = "https://db.hafizhibnusyam.my.id/api";
const BOTRAIKI_API_URL = "https://dramabox.botraiki.biz/api";

const COMMON_HEADERS = {
    'accept': 'application/json',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

// Helper Functions
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

// Main API Handler
async function handleApiRequest(path: string, method: string, query: any, body: any): Promise<any> {
    // 1. Category List: /api/movies/:category
    if (path.startsWith("/api/movies/")) {
        const category = path.replace("/api/movies/", "") || "trending";
        const page = query.page || 1;

        console.log(`[Handler] Category: ${category}, Page: ${page}`);

        if (category.startsWith('drama-box')) {
            let endpoint = '/dramas';
            if (category === 'drama-box-trending') endpoint = '/dramas/trending';
            else if (category === 'drama-box-indo') endpoint = '/dramas/indo';
            else if (category === 'drama-box-must-sees') endpoint = '/dramas/must-sees';
            else if (category === 'drama-box-hidden-gems') endpoint = '/dramas/hidden-gems';
            return await fetchFromDramaBox(endpoint, Number(page));
        }

        const CURATED_ACTIONS = ['trending', 'indonesian-movies', 'indonesian-drama', 'indo-dub'];
        let apiUrl: string;

        if (CURATED_ACTIONS.includes(category)) {
            apiUrl = `${BASE_API_URL}?action=${category}&page=${page}`;
        } else if (category.startsWith('genre-')) {
            apiUrl = `${BASE_API_URL}?action=search&q=${encodeURIComponent(category.replace('genre-', ''))}&page=${page}`;
        } else {
            apiUrl = `${BASE_API_URL}?action=search&q=${encodeURIComponent(category.replace(/-/g, ' '))}&page=${page}`;
        }

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
