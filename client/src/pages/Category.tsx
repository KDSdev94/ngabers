import { useMemo } from "react";
import { useParams, useLocation, Link } from "wouter";

import { Navbar } from "@/components/Navbar";
import { useMoviesCategoryPaged } from "@/hooks/use-movies";
import { MovieCard, MovieCardSkeleton } from "@/components/MovieCard";
import { Footer } from "@/components/Footer";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Flame,
  Film,
  Tv,
  Heart,
  Smartphone,
  Sparkles,
  Laugh,
  Globe,
  Mic2,
  Star
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const CATEGORY_TITLES: Record<string, string> = {
  "trending": "Lagi Tren",
  "indonesian-movies": "Film Indonesia",
  "indonesian-drama": "Drama Indonesia",
  "kdrama": "Drakor Terbaru",
  "short-tv": "Hot TV",
  "anime": "Masuk ke Dunia Anime",
  "adult-comedy": "Yang hot-hot",
  "western-tv": "TV Barat",
  "indo-dub": "Dub Indo Terbaik!",
  "drama-box": "Drama Box Specials",
  "drama-box-must-sees": "Drama Box: Rekomendasi untukmu",
  "drama-box-hidden-gems": "Drama Box: Hidden Gems"
};

// Helper to format category/genre slug to title
const formatTitle = (slug: string) => {
  if (CATEGORY_TITLES[slug]) return CATEGORY_TITLES[slug];

  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function Category() {
  const { name } = useParams<{ name?: string }>();
  const [location, setLocation] = useLocation();

  // Get current page from URL or default to 1
  // We use location as a dependency to ensure rerender when query string changes
  const currentPage = useMemo(() => {
    const searchParams = new URLSearchParams(window.location.search);
    return parseInt(searchParams.get("page") || "1", 10);
  }, [window.location.search, location]);

  const categoryName = name || "trending";
  const { data, isLoading, isFetching } = useMoviesCategoryPaged(categoryName, currentPage);


  const items = data?.items || [];
  const hasMore = data?.hasMore || false;
  const displayTitle = formatTitle(categoryName);
  const description = `Jelajahi koleksi ${displayTitle} kami yang lengkap, diperbarui setiap hari dengan konten berkualitas tinggi.`;

  const handlePageChange = (newPage: number) => {
    // Force a full page refresh to ensure data is updated correctly
    const params = new URLSearchParams(window.location.search);
    params.set("page", newPage.toString());
    window.location.href = `${window.location.pathname}?${params.toString()}`;
  };


  // Generate page numbers to show (1, 2, 3 ... last)
  // Since we don't know total pages from API (only hasMore), we'll do Simple Prev/Next or limited range
  const renderPagination = () => {
    if (items.length === 0 && !isLoading) return null;

    return (
      <div className="flex flex-col items-center gap-6 py-16">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage <= 1 || isFetching}
            onClick={() => handlePageChange(currentPage - 1)}
            className="rounded-xl bg-white/5 border-white/10 hover:bg-primary hover:text-white transition-all duration-300 disabled:opacity-20"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <div className="flex items-center gap-2 px-6 py-2 bg-white/5 rounded-2xl border border-white/10 shadow-inner">
            <span className="text-white/40 text-xs font-black uppercase tracking-widest">Page</span>
            <span className="text-primary text-lg font-black">{currentPage}</span>
          </div>

          <Button
            variant="outline"
            size="icon"
            disabled={!hasMore || isFetching}
            onClick={() => handlePageChange(currentPage + 1)}
            className="rounded-xl bg-white/5 border-white/10 hover:bg-primary hover:text-white transition-all duration-300 disabled:opacity-20"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {isFetching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-primary/60 text-xs font-bold uppercase tracking-[0.2em]"
          >
            <Loader2 className="w-3 h-3 animate-spin" />
            Synchronizing...
          </motion.div>
        )}
      </div>
    );
  };

  const CATEGORIES = [
    { id: "trending", label: "Trending", icon: <Flame className="w-4 h-4" /> },
    { id: "indonesian-movies", label: "Film Indonesia", icon: <Film className="w-4 h-4" /> },
    { id: "indonesian-drama", label: "Drama Indonesia", icon: <Tv className="w-4 h-4" /> },
    { id: "kdrama", label: "K-Drama", icon: <Heart className="w-4 h-4" /> },
    { id: "short-tv", label: "Short TV", icon: <Smartphone className="w-4 h-4" /> },
    { id: "anime", label: "Anime", icon: <Sparkles className="w-4 h-4" /> },
    { id: "adult-comedy", label: "Canda Dewasa", icon: <Laugh className="w-4 h-4" /> },
    { id: "western-tv", label: "Western TV", icon: <Globe className="w-4 h-4" /> },
    { id: "indo-dub", label: "Indo Dub", icon: <Mic2 className="w-4 h-4" /> },
    { id: "drama-box", label: "Drama Box", icon: <Star className="w-4 h-4" /> },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Header & Category Selector */}
      <div className="relative pt-32 pb-8 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full scale-150 translate-y-1/2 opacity-20 pointer-events-none" />
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-display font-black text-white mb-2 tracking-tight">
              {displayTitle}
            </h1>
            <div className="h-1.5 w-24 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary),0.5)] mb-6" />

            {/* Horizontal Category Selector with Moving Underline */}
            <div className="relative border-b border-white/5">
              <div className="flex items-center gap-6 md:gap-10 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                {CATEGORIES.map((cat) => {
                  const isActive = categoryName === cat.id;
                  return (
                    <Link
                      key={cat.id}
                      href={`/category/${cat.id}`}
                      className="relative py-4 group flex-shrink-0"
                    >
                      <div className={`flex items-center gap-2.5 whitespace-nowrap font-bold text-sm md:text-lg transition-all duration-300 ${isActive ? "text-primary scale-110" : "text-white/40 hover:text-white"
                        }`}>
                        <span className={`transition-colors duration-300 ${isActive ? "text-primary" : "text-white/20 group-hover:text-primary"
                          }`}>
                          {cat.icon}
                        </span>
                        {cat.label}
                      </div>

                      {isActive && (
                        <motion.div
                          layoutId="category-underline"
                          className="absolute bottom-0 left-0 right-0 h-1 bg-primary shadow-[0_0_20px_rgba(229,25,80,0.8)] rounded-t-full z-10"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Grid */}
      <div className="container mx-auto px-4 flex-1">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8"
            >
              {Array(18).fill(0).map((_, i) => (
                <MovieCardSkeleton key={i} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8"
            >
              {items.map((movie, index) => (
                <motion.div
                  key={`${movie.id}-${index}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (index % 12) * 0.03 }}
                >
                  <MovieCard movie={movie} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Numerical Pagination */}
        {renderPagination()}
      </div>

      <Footer variant="full" />
    </div>
  );
}

