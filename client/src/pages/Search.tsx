import { useInfiniteSearchMovies } from "@/hooks/use-movies";
import { Navbar } from "@/components/Navbar";
import { MovieCard, MovieCardSkeleton } from "@/components/MovieCard";
import { Footer } from "@/components/Footer";
import { Search as SearchIcon, ArrowLeft, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

export default function Search() {
    // Get the search query from URL
    const searchParams = new URLSearchParams(window.location.search);
    const query = searchParams.get("q") || "";

    const {
        data,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useInfiniteSearchMovies(query);

    const { ref, inView } = useInView();

    useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, fetchNextPage]);

    const items = data?.pages?.flatMap(page => page.items) || [];

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Navbar />

            {/* Header */}
            <div className="relative pt-32 pb-12 md:pb-20 px-4 overflow-hidden">
                <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full scale-150 translate-y-1/2 opacity-20 pointer-events-none" />
                <div className="container mx-auto relative z-10">
                    <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors group">
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        <span>Kembali ke Home</span>
                    </Link>

                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
                            <SearchIcon className="w-7 h-7 text-primary" />
                        </div>
                        <div>
                            <p className="text-white/50 text-sm">Hasil pencarian untuk</p>
                            <h1 className="text-3xl md:text-5xl font-display font-bold text-white tracking-tight">
                                "{query}"
                            </h1>
                        </div>
                    </div>
                    <div className="h-1.5 w-24 bg-primary rounded-full" />
                    <p className="mt-4 text-white/60 text-lg">
                        {isLoading ? "Mencari..." : `Ditemukan ${items.length} hasil`}
                    </p>
                </div>
            </div>

            {/* Results Grid */}
            <div className="container mx-auto px-4">
                {isLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
                        {Array(12).fill(0).map((_, i) => (
                            <MovieCardSkeleton key={i} />
                        ))}
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
                            <SearchIcon className="w-12 h-12 text-white/20" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Tidak ada hasil</h2>
                        <p className="text-white/50 mb-6">
                            Tidak ditemukan film atau series dengan kata kunci "{query}"
                        </p>
                        <Link href="/">
                            <button className="px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors">
                                Kembali ke Beranda
                            </button>
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
                            {items.map((movie, index) => (
                                <motion.div
                                    key={`${movie.id}-${index}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index % 10 * 0.05 }}
                                >
                                    <MovieCard movie={movie} />
                                </motion.div>
                            ))}
                        </div>

                        {/* Load More Trigger */}
                        <div ref={ref} className="w-full py-12 flex justify-center">
                            {isFetchingNextPage && (
                                <div className="flex items-center gap-2 text-primary">
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    <span className="font-medium">Loading more...</span>
                                </div>
                            )}
                            {!hasNextPage && items.length > 0 && (
                                <div className="text-white/30 text-sm font-medium">Anda telah mencapai akhir hasil pencarian</div>
                            )}
                        </div>
                    </>
                )}
            </div>
            <Footer variant="full" />
        </div>
    );
}
