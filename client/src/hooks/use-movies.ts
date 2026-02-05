import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type ApiResponse, type MovieDetail, apiResponseSchema, movieDetailSchema } from "@shared/schema";

// Helper to fetch valid categories
const fetchCategory = async (category: string, page = 1): Promise<ApiResponse> => {
  try {
    const url = buildUrl(api.movies.list.path, { category });
    const finalUrl = `${url}?page=${page}`;
    const res = await fetch(finalUrl, { credentials: "include" });

    if (!res.ok) {
      console.warn(`API returned ${res.status} for category ${category}`);
      return { success: false, items: [], page, hasMore: false };
    }

    const data = await res.json();
    const finalData = data?.data || data || {};

    // Ensure we return the expected structure even if upstream is inconsistent
    const items = Array.isArray(finalData?.items) ? finalData.items.map((item: any) => ({
      id: String(item?.id || Math.random()),
      title: String(item?.title || "Unknown Title"),
      poster: String(item?.poster || ""),
      rating: Number(item?.rating || 0),
      year: String(item?.year || ""),
      type: String(item?.type || "movie"),
      genre: String(item?.genre || ""),
      detailPath: String(item?.detailPath || ""),
    })) : [];

    return {
      success: !!finalData?.success,
      items,
      page: typeof finalData?.page === 'number' ? finalData.page : page,
      hasMore: !!finalData?.hasMore,
    };
  } catch (error) {
    console.error(`Error fetching category ${category}:`, error);
    return { success: false, items: [], page, hasMore: false };
  }
};

// Hook for categories (simple query, enough for sliders)
export function useMoviesCategory(category: string) {
  const safeCategory = typeof category === 'string' ? category : 'trending';

  return useQuery({
    queryKey: ["movies", "list", safeCategory],
    queryFn: () => fetchCategory(safeCategory, 1),
    staleTime: 1000 * 60 * 5,
  });
}

// Hook for categories with explicit pagination
export function useMoviesCategoryPaged(category: string, page: number) {
  const safeCategory = typeof category === 'string' ? category : 'trending';

  return useQuery({
    queryKey: ["movies", "list", safeCategory, page],
    queryFn: () => fetchCategory(safeCategory, page),
    staleTime: 1000 * 60 * 5,
  });
}


// Hook for infinite scrolling categories (specifically for Category page)
export function useInfiniteMoviesCategory(category: string) {
  const safeCategory = typeof category === 'string' ? category : 'trending';

  return useInfiniteQuery({
    queryKey: ["movies", "list", "infinite", safeCategory],
    queryFn: ({ pageParam = 1 }) => fetchCategory(safeCategory, pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage: ApiResponse) => {
      if (lastPage?.hasMore) return (lastPage?.page || 1) + 1;
      return undefined;
    },
    enabled: !!safeCategory,
  });
}

// Simple hook for single page (e.g., for hero slider)
export function useTrendingMovies() {
  return useQuery({
    queryKey: ["movies", "list", "trending"],
    queryFn: async () => {
      try {
        return await fetchCategory('trending', 1);
      } catch (err) {
        console.error("Trending fetch error:", err);
        return { success: false, items: [], page: 1, hasMore: false };
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}

// Helper to fetch search results
const fetchSearch = async (query: string, page = 1): Promise<ApiResponse> => {
  const safeQuery = String(query || '').trim();
  if (safeQuery.length < 3) return { success: true, items: [], page: 1, hasMore: false };

  try {
    const url = `${api.movies.search.path}?q=${encodeURIComponent(safeQuery)}&page=${page}`;
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) throw new Error("Failed to search movies");
    const data = await res.json();
    const finalData = data?.data || data || {};
    const items = Array.isArray(finalData?.items) ? finalData.items : [];

    return {
      success: !!finalData?.success,
      items,
      page: typeof finalData?.page === 'number' ? finalData.page : page,
      hasMore: !!finalData?.hasMore
    };
  } catch (e) {
    console.error("Search error:", e);
    return { success: false, items: [], page: 1, hasMore: false };
  }
};

// Hook for Search (Simple, for Navbar)
export function useSearchMovies(query: string) {
  const safeQuery = String(query || '').trim();
  return useQuery({
    queryKey: ["movies", "search", safeQuery],
    queryFn: () => fetchSearch(safeQuery, 1),
    enabled: safeQuery.length >= 3,
    staleTime: 1000 * 60 * 5,
  });
}

// Hook for Infinite Search (For Results Page)
export function useInfiniteSearchMovies(query: string) {
  const safeQuery = String(query || '').trim();
  return useInfiniteQuery({
    queryKey: ["movies", "search", "infinite", safeQuery],
    queryFn: ({ pageParam = 1 }) => fetchSearch(safeQuery, pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage: ApiResponse) => {
      if (lastPage?.hasMore) return (lastPage?.page || 1) + 1;
      return undefined;
    },
    enabled: safeQuery.length >= 3,
    staleTime: 1000 * 60 * 5,
  });
}

// Hook for Detail
export function useMovieDetail(path: string | null) {
  return useQuery({
    queryKey: [api.movies.detail.path, path],
    queryFn: async () => {
      if (!path) return null;
      // path needs to be encoded properly as a query param
      const url = `${api.movies.detail.path}?path=${encodeURIComponent(path)}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch movie details");
      const data = await res.json();
      const finalData = data.data || data;

      try {
        return movieDetailSchema.parse(finalData);
      } catch (e) {
        console.error("Zod Schema Parsing Error for movie detail:", e);
        console.log("Raw data that failed parsing:", finalData);
        throw e;
      }
    },
    enabled: !!path,
  });
}
