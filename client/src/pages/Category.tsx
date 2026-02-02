import { useParams } from "wouter";
import { Navbar } from "@/components/Navbar";
import { useInfiniteMoviesCategory } from "@/hooks/use-movies";
import { MovieCard, MovieCardSkeleton } from "@/components/MovieCard";
import { Footer } from "@/components/Footer";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";

// Helper to format category/genre slug to title
const formatTitle = (slug: string) => {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function Category() {
  const { name } = useParams<{ name?: string }>();

  const categoryName = name || "trending";

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteMoviesCategory(categoryName);

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const items = data?.pages?.flatMap(page => page.items) || [];
  const displayTitle = formatTitle(categoryName);
  const description = `Explore our extensive collection of ${displayTitle.toLowerCase()}, updated daily with the highest quality content available.`;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Header */}
      <div className="relative pt-32 pb-12 md:pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full scale-150 translate-y-1/2 opacity-20 pointer-events-none" />
        <div className="container mx-auto relative z-10">
          <h1 className="text-4xl md:text-6xl font-display font-black text-white mb-4 tracking-tight">
            {displayTitle}
          </h1>
          <div className="h-1.5 w-24 bg-primary rounded-full" />
          <p className="mt-4 text-white/60 text-lg max-w-2xl">
            {description}
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="container mx-auto px-4">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
            {Array(12).fill(0).map((_, i) => (
              <MovieCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
            {items.map((movie, index) => (
              <motion.div
                key={`${movie.id} -${index} `}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index % 10 * 0.05 }}
              >
                <MovieCard movie={movie} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Load More Trigger */}
        <div ref={ref} className="w-full py-12 flex justify-center">
          {isFetchingNextPage && (
            <div className="flex items-center gap-2 text-primary">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="font-medium">Loading more...</span>
            </div>
          )}
          {!hasNextPage && items.length > 0 && (
            <div className="text-white/30 text-sm font-medium">You've reached the end</div>
          )}
        </div>
      </div>
      <Footer variant="full" />
    </div>
  );
}
