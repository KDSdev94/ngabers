import { useMoviesCategory } from "@/hooks/use-movies";
import { MovieCard } from "./MovieCard";

export function RecommendationSection() {
    const { data: trending, isLoading } = useMoviesCategory("trending");
    const items = trending?.items?.slice(0, 10) || [];

    return (
        <section className="space-y-8">
            <div className="flex items-center gap-3">
                <div className="w-1.5 h-8 bg-primary rounded-full shadow-[0_0_15px_rgba(229,25,80,0.5)]" />
                <h3 className="text-2xl md:text-3xl font-display font-black text-white tracking-tight uppercase">
                    Rekomendasi
                </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                {isLoading ? (
                    Array(5).fill(0).map((_, i) => (
                        <div key={i} className="aspect-[2/3] bg-white/5 rounded-2xl animate-pulse" />
                    ))
                ) : (
                    items.map((movie: any) => {
                        return <MovieCard key={movie.id} movie={movie} />;
                    })
                )}
            </div>
        </section>
    );
}
