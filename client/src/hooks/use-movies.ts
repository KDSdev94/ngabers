import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type ApiResponse, type MovieDetail, apiResponseSchema, movieDetailSchema } from "@shared/schema";

// Helper to fetch valid categories
const fetchCategory = async (category: string, page = 1) => {
  const url = buildUrl(api.movies.list.path, { category });
  const finalUrl = `${url}?page=${page}`;
  const res = await fetch(finalUrl, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch movies");
  const data = await res.json();
  // Unwrap data if it's nested under a 'data' property
  const finalData = data.data || data;
  
  // Ensure we return the expected structure even if upstream is inconsistent
  const items = Array.isArray(finalData.items) ? finalData.items : [];
  const success = typeof finalData.success === 'boolean' ? finalData.success : true;
  
  return apiResponseSchema.parse({
    ...finalData,
    items,
    success
  });
};

// Hook for infinite scrolling categories
export function useMoviesCategory(category: string) {
  return useInfiniteQuery({
    queryKey: [api.movies.list.path, category],
    queryFn: ({ pageParam = 1 }) => fetchCategory(category, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? (lastPage.page || 1) + 1 : undefined),
  });
}

// Simple hook for single page (e.g., for hero slider)
export function useTrendingMovies() {
  return useQuery({
    queryKey: [api.movies.list.path, 'trending'],
    queryFn: () => fetchCategory('trending', 1),
  });
}

// Hook for Search
export function useSearchMovies(query: string) {
  return useQuery({
    queryKey: [api.movies.search.path, query],
    queryFn: async () => {
      if (!query) return { success: true, items: [] };
      const url = `${api.movies.search.path}?q=${encodeURIComponent(query)}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to search movies");
      const data = await res.json();
      const finalData = data.data || data;
      return apiResponseSchema.parse(finalData);
    },
    enabled: !!query && query.length > 2,
    staleTime: 1000 * 60 * 5, // Cache results for 5 mins
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
      return movieDetailSchema.parse(finalData);
    },
    enabled: !!path,
  });
}
