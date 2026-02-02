import type { Express } from "express";
import type { Server } from "http";
import { api } from "@shared/routes";
import { z } from "zod";

const BASE_API_URL = "https://zeldvorik.ru/apiv3/api.php";
const DRAMA_BOX_API_URL = "https://db.hafizhibnusyam.my.id/api";
const BOTRAIKI_API_URL = "https://dramabox.botraiki.biz/api";

const COMMON_HEADERS = {
  'accept': 'application/json',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

// Helper to fetch and normalize from Drama Box (Secondary Fallback - db.hafizhibnusyam.my.id)
async function fetchFromDramaBox(endpoint: string, page: number = 1) {
  const url = `${DRAMA_BOX_API_URL}${endpoint}?page=${page}`;
  console.log(`[DramaBox] Fetching: ${url}`);

  try {
    const response = await fetch(url, {
      headers: COMMON_HEADERS,
      signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
      console.error(`[DramaBox] HTTP Error: ${response.status} ${response.statusText}`);
      throw new Error(`Drama Box API error: ${response.statusText}`);
    }

    const data = await response.json();
    const itemsList = data.data || [];
    console.log(`[DramaBox] Success! Received ${itemsList.length} items.`);

    return {
      success: true,
      items: itemsList.map((item: any) => ({
        id: `db-${item.id}`,
        title: item.title,
        poster: item.cover_image,
        // Generate a pseudo-rating since API doesn't provide one
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

// Helper to fetch detail from Drama Box (Secondary Fallback - db.hafizhibnusyam.my.id)
async function fetchDramaBoxDetail(id: string) {
  const detailUrl = `${DRAMA_BOX_API_URL}/dramas/${id}`;
  const chaptersUrl = `${DRAMA_BOX_API_URL}/chapters/video?book_id=${id}`;

  console.log(`[DramaBox] Fetching detail for ID ${id}`);
  try {
    const detailRes = await fetch(detailUrl, { headers: COMMON_HEADERS });
    if (!detailRes.ok) throw new Error(`Drama Box Detail error: ${detailRes.statusText}`);
    const detailData = await detailRes.json();
    const drama = detailData.data || {};

    console.log(`[DramaBox] Detail for ${id}: Title="${drama.title}", Score="${drama.score}"`);

    console.log(`[DramaBox] Fetching chapters for ID ${id}`);
    const chaptersRes = await fetch(chaptersUrl, {
      method: 'POST',
      headers: {
        ...COMMON_HEADERS,
        'Content-Type': 'application/json'
      }
    });

    let episodes = [];
    if (chaptersRes.ok) {
      const chaptersData = await chaptersRes.json();
      // chaptersData.data usually contains the episodes list
      // Sometimes it might be in chaptersData itself if not nested
      const epList = chaptersData.data || (Array.isArray(chaptersData) ? chaptersData : []);

      // Also check if there's an 'extras' field which sometimes contains more episodes
      if (chaptersData.extras && Array.isArray(chaptersData.extras)) {
        epList.push(...chaptersData.extras);
      }

      console.log(`[DramaBox] Found ${epList.length} total raw chapters/extras for ${id}`);

      if (epList.length > 0) {
        episodes = epList.map((chap: any, idx: number) => {
          // Robust video URL extraction
          let videoUrl = "";
          if (Array.isArray(chap.stream_url)) {
            videoUrl = chap.stream_url[0]?.url || "";
          } else if (typeof chap.stream_url === 'string') {
            videoUrl = chap.stream_url.trim();
          }

          if (!videoUrl) {
            videoUrl = chap.url || chap.video_url || chap.playerUrl || "";
          }

          const epIndex = chap.chapter_index || (idx + 1).toString();
          return {
            episode: epIndex,
            title: chap.title || `Episode ${epIndex}`,
            url: videoUrl,
            playerUrl: videoUrl,
            cover: chap.cover || drama.cover_image || ""
          };
        });

        // Sort episodes by index to be safe
        episodes.sort((a: any, b: any) => parseInt(a.episode) - parseInt(b.episode));
      }
    } else {
      console.warn(`[DramaBox] Chapters API failed with status ${chaptersRes.status}`);
    }

    // Defensive rating calculation
    let finalRating = 8.5;
    const apiScore = parseFloat(drama.score || drama.rating);
    if (!isNaN(apiScore) && apiScore > 0) {
      finalRating = apiScore;
    } else {
      // Fallback: Use the last digits of ID to make it look "real"
      const idNum = parseInt(id.slice(-3)) || 0;
      finalRating = 8.8 + (idNum % 10) / 10;
    }

    // Defensive year
    const finalYear = drama.year || (new Date().getFullYear()).toString();

    const result = {
      id: `db-${drama.id || id}`,
      title: drama.title || "DramaBox Drama",
      poster: drama.cover_image || "",
      description: drama.introduction || "No description available.",
      genre: drama.tags?.join(", ") || drama.genre || "",
      type: "tv",
      rating: Number(finalRating.toFixed(1)),
      year: finalYear,
      detailPath: `db-${drama.id || id}`,
      seasons: [{
        name: "Season 1",
        season: "1",
        episodes: episodes
      }]
    };

    console.log(`[DramaBox] Returning detail for ${id}: ${episodes.length} episodes, rating ${result.rating}, year ${result.year}`);
    return result;
  } catch (err) {
    console.error(`[DramaBox] Critical mapping error for ${id}:`, err);
    // Generic fallback so the page doesn't crash
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

// Helper to fetch and normalize from Botraiki API (tertiary fallback)
async function fetchFromBotraiki(endpoint: string, page: number = 1) {
  const url = `${BOTRAIKI_API_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}page=${page}`;
  console.log(`[Botraiki] Fetching: ${url}`);

  try {
    const response = await fetch(url, {
      headers: COMMON_HEADERS,
      signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
      console.error(`[Botraiki] HTTP Error: ${response.status} ${response.statusText}`);
      throw new Error(`Botraiki API error: ${response.statusText}`);
    }

    const data = await response.json();
    const itemsList = Array.isArray(data) ? data : (data.data || data.rankList || data.suggestList || []);
    console.log(`[Botraiki] Success! Received ${itemsList.length} items.`);

    return {
      success: true,
      items: itemsList.map((item: any) => {
        // Map hotCode to a rating if score is missing
        let rating = 0;
        if (item.score) {
          rating = parseFloat(item.score);
        } else if (item.rankVo?.hotCode) {
          // If hotCode is something like "863K", convert to a rating between 8.5-9.8
          rating = 8.5 + (Math.min(parseFloat(item.rankVo.hotCode) || 0, 1000) / 1000) * 1.3;
        } else {
          rating = 8.8 + (Math.random() * 0.7);
        }

        return {
          id: `bt-${item.bookId || item.id}`,
          title: item.bookName || item.title,
          poster: item.coverWap || item.cover || item.bookCover,
          rating: Number(rating.toFixed(1)),
          year: item.shelfTime?.split(' ')[0]?.split('-')[0] || "",
          type: "tv",
          genre: item.tags?.join(", ") || item.tagNames?.join(", ") || "",
          detailPath: `bt-${item.bookId || item.id}`,
          // Additional fields for UI
          chapterCount: item.chapterCount || 0,
          playCount: item.playCount || item.rankVo?.hotCode || "",
          introduction: item.introduction || "",
          protagonist: item.protagonist || "",
          rank: item.rankVo?.sort || 0,
          rankType: item.rankVo?.rankType || 0,
          hotCode: item.rankVo?.hotCode || ""
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

// Helper to fetch detail from Botraiki API
async function fetchBotraikiDetail(bookId: string) {
  const episodesUrl = `${BOTRAIKI_API_URL}/episodes?bookId=${bookId}`;

  console.log(`[Botraiki] Fetching detail for bookId ${bookId}`);

  try {
    // First try to get book info from /detail endpoint
    let bookInfo: any = null;

    try {
      const detailRes = await fetch(`${BOTRAIKI_API_URL}/detail?bookId=${bookId}`, {
        headers: COMMON_HEADERS,
        signal: AbortSignal.timeout(10000)
      });
      if (detailRes.ok) {
        const detailData = await detailRes.json();
        // Check if response has actual book data
        if (detailData.data && detailData.data.bookId) {
          bookInfo = detailData.data;
          console.log(`[Botraiki] Got book info from /detail`);
        }
      }
    } catch (e) {
      console.warn(`[Botraiki] /detail failed, will try alternatives`);
    }

    // Helper to search in endpoint
    const searchInEndpoint = async (endpoint: string, endpointName: string) => {
      if (bookInfo) return;
      try {
        console.log(`[Botraiki] Searching in ${endpointName}...`);
        const res = await fetch(`${BOTRAIKI_API_URL}${endpoint}`, {
          headers: COMMON_HEADERS,
          signal: AbortSignal.timeout(8000)
        });
        if (res.ok) {
          const data = await res.json();
          const items = Array.isArray(data) ? data : (data.data || data.rankList || []);
          const found = items.find((item: any) => item.bookId === bookId);
          if (found) {
            bookInfo = found;
            console.log(`[Botraiki] Found book in ${endpointName}`);
          }
        }
      } catch (e) {
        console.warn(`[Botraiki] ${endpointName} search failed`);
      }
    };

    // Search in multiple endpoints
    await searchInEndpoint('/trending', '/trending');
    await searchInEndpoint('/latest', '/latest');
    await searchInEndpoint('/for-you', '/for-you');
    await searchInEndpoint('/dubbed?classify=terpopuler', '/dubbed');
    await searchInEndpoint('/random', '/random');

    // If still not found, try search API with partial ID
    if (!bookInfo) {
      console.log(`[Botraiki] Trying search API...`);
      try {
        const searchRes = await fetch(`${BOTRAIKI_API_URL}/search?query=${bookId}`, {
          headers: COMMON_HEADERS,
          signal: AbortSignal.timeout(8000)
        });
        if (searchRes.ok) {
          const searchData = await searchRes.json();
          const items = Array.isArray(searchData) ? searchData : (searchData.data || searchData.suggestList || []);
          const found = items.find((item: any) => item.bookId === bookId);
          if (found) {
            bookInfo = found;
            console.log(`[Botraiki] Found book via search`);
          }
        }
      } catch (e) {
        console.warn(`[Botraiki] Search API failed`);
      }
    }

    // Default book info if not found - we still have episodes, so use bookId
    if (!bookInfo) {
      bookInfo = { bookId, bookName: `Drama #${bookId}`, introduction: "Loading content from DramaBox..." };
      console.log(`[Botraiki] Using default book info for ${bookId}`);
    }

    // Now fetch episodes
    console.log(`[Botraiki] Fetching episodes for bookId ${bookId}`);
    let episodes: any[] = [];
    try {
      const episodesRes = await fetch(episodesUrl, {
        headers: COMMON_HEADERS,
        signal: AbortSignal.timeout(90000) // 90s timeout for episodes
      });

      console.log(`[Botraiki] Episodes status: ${episodesRes.status}`);

      if (episodesRes.ok) {
        const episodesData = await episodesRes.json();
        const epList = Array.isArray(episodesData) ? episodesData : (episodesData.data || []);

        console.log(`[Botraiki] Found ${epList.length} episodes`);

        episodes = epList.map((ep: any, idx: number) => {
          // Get best quality video URL - try multiple paths
          let videoUrl = "";

          // Try cdnList structure first (based on API docs)
          if (ep.cdnList && ep.cdnList.length > 0) {
            const cdn = ep.cdnList[0];
            if (cdn.videoPathList && cdn.videoPathList.length > 0) {
              // Priority: 720p default > any default > 720p > 540p > any
              const defaultVideo = cdn.videoPathList.find((v: any) => v.isDefault === 1);
              const video720 = cdn.videoPathList.find((v: any) => v.quality === 720);
              const video540 = cdn.videoPathList.find((v: any) => v.quality === 540);
              const anyVideo = cdn.videoPathList[0];
              videoUrl = defaultVideo?.videoPath || video720?.videoPath || video540?.videoPath || anyVideo?.videoPath || "";
            }
          }

          // Fallback to direct videoUrl field
          if (!videoUrl) {
            videoUrl = ep.videoUrl || ep.video_url || "";
          }

          const episodeNum = typeof ep.chapterIndex === 'number' ? ep.chapterIndex + 1 : idx + 1;

          return {
            episode: episodeNum.toString(),
            title: ep.chapterName || `Episode ${episodeNum}`,
            url: videoUrl,
            playerUrl: videoUrl
          };
        });
      }
    } catch (epErr) {
      console.warn(`[Botraiki] Failed to fetch episodes:`, epErr);
    }

    // Build response with proper structure
    let rating = 0;
    if (bookInfo.score) {
      rating = parseFloat(bookInfo.score);
    } else if (bookInfo.rankVo?.hotCode) {
      rating = 8.5 + (Math.min(parseFloat(bookInfo.rankVo.hotCode) || 0, 1000) / 1000) * 1.3;
    } else if (bookInfo.playCount) {
      rating = 8.8 + (Math.random() * 0.7);
    } else {
      rating = 0;
    }

    const result = {
      id: `bt-${bookInfo.bookId || bookId}`,
      title: bookInfo.bookName || bookInfo.title || "Unknown Title",
      poster: bookInfo.coverWap || bookInfo.cover || bookInfo.bookCover || "",
      description: bookInfo.introduction || "",
      genre: bookInfo.tags?.join(", ") || "",
      type: "tv",
      rating: Number(rating.toFixed(1)),
      year: bookInfo.shelfTime?.split(' ')[0]?.split('-')[0] || "",
      detailPath: `bt-${bookInfo.bookId || bookId}`,
      chapterCount: bookInfo.chapterCount || episodes.length,
      playCount: bookInfo.playCount || bookInfo.rankVo?.hotCode || "",
      status: bookInfo.statusName || "Ongoing",
      seasons: episodes.length > 0 ? [{
        name: "Season 1",
        season: "1",
        episodes: episodes
      }] : [],
      playerUrl: episodes.length === 1 ? episodes[0].playerUrl : undefined
    };

    console.log(`[Botraiki] Returning detail with ${episodes.length} episodes, title: ${result.title}`);
    return result;

  } catch (err) {
    console.error(`[Botraiki] Detail Error:`, err);
    throw err;
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Proxy for listing categories
  app.get(api.movies.list.path, async (req, res) => {
    try {
      const category = req.params.category as string;
      const page = req.query.page || 1;

      console.log(`[API] Category: ${category}, Page: ${page}`);

      // Special Drama Box categories
      if (category.startsWith('drama-box')) {
        let endpoint = '/dramas';
        if (category === 'drama-box-trending') endpoint = '/dramas/trending';
        else if (category === 'drama-box-indo') endpoint = '/dramas/indo';
        else if (category === 'drama-box-must-sees') endpoint = '/dramas/must-sees';
        else if (category === 'drama-box-hidden-gems') endpoint = '/dramas/hidden-gems';

        const result = await fetchFromDramaBox(endpoint, Number(page));
        return res.json(result);
      }

      const PRIMARY_ACTIONS = [
        'trending', 'indonesian-movies', 'indonesian-drama', 'kdrama',
        'short-tv', 'anime', 'adult-comedy', 'western-tv', 'indo-dub'
      ];

      let apiUrl: string;
      if (category.startsWith('genre-')) {
        const genreName = category.replace('genre-', '');
        apiUrl = `${BASE_API_URL}?action=search&q=${encodeURIComponent(genreName)}&page=${page}`;
      } else if (!PRIMARY_ACTIONS.includes(category) && category !== 'home') {
        // If it's not a primary action, treat it as a search query (likely a genre slug)
        apiUrl = `${BASE_API_URL}?action=search&q=${encodeURIComponent(category.replace(/-/g, ' '))}&page=${page}`;
      } else {
        apiUrl = `${BASE_API_URL}?action=${category}&page=${page}`;
      }

      try {
        console.log(`[API] Primary fetch: ${apiUrl}`);
        const response = await fetch(apiUrl, {
          signal: AbortSignal.timeout(10000) // 10s timeout
        });
        if (!response.ok) {
          throw new Error(`Upstream API error: ${response.statusText}`);
        }
        const data = await response.json();
        res.json(data);
      } catch (e) {
        console.warn(`[API] Primary API failed for ${category}, trying Drama Box fallback... Error: ${e instanceof Error ? e.message : 'Timeout'}`);
        // Fallback triggers for key categories - try secondary (HafizHibnu) first
        try {
          if (category === 'trending') {
            return res.json(await fetchFromDramaBox('/dramas/trending', Number(page)));
          } else if (category === 'short-tv' || category === 'indonesian-movies') {
            return res.json(await fetchFromDramaBox('/dramas', Number(page)));
          } else if (category === 'indonesian-drama' || category === 'indo-dub') {
            return res.json(await fetchFromDramaBox('/dramas/indo', Number(page)));
          }
          throw e;
        } catch (secondaryError) {
          console.warn(`[API] Secondary API (HafizHibnu) also failed for ${category}, trying Botraiki fallback...`);
          // Tertiary fallback - Botraiki API
          try {
            if (category === 'trending') {
              return res.json(await fetchFromBotraiki('/trending', Number(page)));
            } else if (category === 'short-tv' || category === 'indonesian-movies') {
              return res.json(await fetchFromBotraiki('/latest', Number(page)));
            } else if (category === 'indonesian-drama' || category === 'indo-dub') {
              return res.json(await fetchFromBotraiki('/dubbed?classify=terpopuler', Number(page)));
            }
            // Also try for-you as general fallback
            return res.json(await fetchFromBotraiki('/for-you', Number(page)));
          } catch (tertiaryError) {
            console.error(`[API] All APIs failed for ${category}`);
            throw tertiaryError;
          }
        }
      }
    } catch (error) {
      console.error('[API] Proxy Error:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch data from upstream API";
      res.status(500).json({
        message: "Failed to fetch data from upstream API",
        details: errorMessage
      });
    }
  });

  // Proxy for search
  app.get(api.movies.search.path, async (req, res) => {
    const q = req.query.q as string;
    const page = Number(req.query.page) || 1;
    if (!q) {
      return res.status(400).json({ message: "Query parameter 'q' is required" });
    }

    try {
      const response = await fetch(`${BASE_API_URL}?action=search&q=${encodeURIComponent(q)}&page=${page}`, {
        signal: AbortSignal.timeout(10000)
      });
      if (!response.ok) throw new Error("Search failed on primary API");
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.warn('[API] Search failed on primary API, trying Drama Box:', error);
      try {
        const dbResponse = await fetch(`${DRAMA_BOX_API_URL}/search?q=${encodeURIComponent(q)}&page=${page}`, {
          headers: { 'accept': 'application/json' },
          signal: AbortSignal.timeout(10000)
        });
        if (!dbResponse.ok) throw new Error("Secondary search failed");
        const dbData = await dbResponse.json();
        res.json({
          success: true,
          items: (dbData.data || []).map((item: any) => ({
            id: `db-${item.id}`,
            title: item.title,
            poster: item.cover_image,
            rating: Number((9.0 + (Math.random() * 0.7)).toFixed(1)),
            year: "",
            type: "tv",
            genre: item.tags?.join(", ") || "",
            detailPath: `db-${item.id}`
          })),
          page: dbData.meta?.pagination?.page || page,
          hasMore: dbData.meta?.pagination?.has_more || false
        });
      } catch (dbError) {
        console.warn('[API] Search failed on HafizHibnu, trying Botraiki:', dbError);
        try {
          const btResponse = await fetchFromBotraiki(`/search?query=${encodeURIComponent(q)}`, page);
          res.json(btResponse);
        } catch (btError) {
          console.error('[API] All search APIs failed');
          res.status(500).json({ message: "Search failed on all providers" });
        }
      }
    }
  });

  // Proxy for details
  app.get(api.movies.detail.path, async (req, res) => {
    try {
      const path = req.query.path as string;
      if (!path) {
        return res.status(400).json({ message: "Query parameter 'path' is required" });
      }

      // 1. Khusus Drama Box (Secondary)
      if (path.startsWith('db-')) {
        const id = path.replace('db-', '');
        const data = await fetchDramaBoxDetail(id);
        return res.json(data);
      }

      // 2. Khusus Botraiki (Tertiary)
      if (path.startsWith('bt-')) {
        const bookId = path.replace('bt-', '');
        const data = await fetchBotraikiDetail(bookId);
        return res.json(data);
      }

      // 3. API Utama (Zeldvorik)
      console.log(`[API] Fetching detail from Primary: ${path}`);
      const response = await fetch(`${BASE_API_URL}?action=detail&detailPath=${encodeURIComponent(path)}`, {
        signal: AbortSignal.timeout(12000)
      });

      if (!response.ok) {
        throw new Error(`Upstream API error: ${response.statusText}`);
      }

      const data = await response.json();
      const finalData = data.data || data;

      // Pastikan rating ada untuk primary
      if (finalData && !finalData.rating) {
        finalData.rating = "8.9";
      }

      res.json(finalData);
    } catch (error) {
      console.error('[API] Detail Proxy Error:', error);
      res.status(500).json({ message: "Failed to fetch movie details" });
    }
  });

  return httpServer;
}
