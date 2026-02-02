import { Link, useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";
import { useTrendingMovies } from "@/hooks/use-movies";
import { MovieCard, MovieCardSkeleton } from "@/components/MovieCard";
import { Footer } from "@/components/Footer";
import { Film, Heart, Laugh, Ghost, Rocket, Users, Sword, Wand2, Skull, Search, Baby, Clapperboard, Sparkles, Tv } from "lucide-react";
import { useState, useEffect } from "react";

// Genre icons mapping
const genreIcons: Record<string, any> = {
    "Drama": Film,
    "Komedi": Laugh,
    "Tindakan": Sword,
    "Percintaan": Heart,
    "Petualangan": Rocket,
    "Fantasi": Wand2,
    "Anime": Baby,
    "Keluarga": Users,
    "Kejahatan": Skull,
    "Misteri": Search,
    "Horor": Ghost,
    "Fiksi Ilmiah": Clapperboard,
    "Aksi": Sword,
    "Action": Sword,
    "Romance": Heart,
    "Adventure": Rocket,
    "Fantasy": Wand2,
    "Family": Users,
    "Horror": Ghost,
    "Mystery": Search,
    "Crime": Skull,
    "Sci-Fi": Sparkles,
    "Short TV": Tv,
    "K-Drama": Clapperboard,
    "Indonesian Movies": Film,
    "Indonesian Drama": Tv,
    "Indo Dub": Users,
    "Western TV": Film,
    "Adult Comedy": Laugh,
};

const genreColors: Record<string, { color: string; bgColor: string }> = {
    "Drama": { color: "from-purple-500 to-pink-500", bgColor: "bg-purple-500/10" },
    "Komedi": { color: "from-yellow-500 to-amber-500", bgColor: "bg-yellow-500/10" },
    "Comedy": { color: "from-yellow-500 to-amber-500", bgColor: "bg-yellow-500/10" },
    "Tindakan": { color: "from-red-500 to-orange-500", bgColor: "bg-red-500/10" },
    "Action": { color: "from-red-500 to-orange-500", bgColor: "bg-red-500/10" },
    "Percintaan": { color: "from-pink-500 to-rose-500", bgColor: "bg-pink-500/10" },
    "Romance": { color: "from-pink-500 to-rose-500", bgColor: "bg-pink-500/10" },
    "Petualangan": { color: "from-blue-500 to-cyan-500", bgColor: "bg-blue-500/10" },
    "Adventure": { color: "from-blue-500 to-cyan-500", bgColor: "bg-blue-500/10" },
    "Fantasi": { color: "from-violet-500 to-purple-500", bgColor: "bg-violet-500/10" },
    "Fantasy": { color: "from-violet-500 to-purple-500", bgColor: "bg-violet-500/10" },
    "Anime": { color: "from-cyan-500 to-teal-500", bgColor: "bg-cyan-500/10" },
    "Keluarga": { color: "from-green-500 to-emerald-500", bgColor: "bg-green-500/10" },
    "Family": { color: "from-green-500 to-emerald-500", bgColor: "bg-green-500/10" },
    "Kejahatan": { color: "from-gray-600 to-zinc-700", bgColor: "bg-gray-500/10" },
    "Crime": { color: "from-gray-600 to-zinc-700", bgColor: "bg-gray-500/10" },
    "Misteri": { color: "from-indigo-500 to-blue-600", bgColor: "bg-indigo-500/10" },
    "Mystery": { color: "from-indigo-500 to-blue-600", bgColor: "bg-indigo-500/10" },
    "Horor": { color: "from-gray-700 to-gray-900", bgColor: "bg-gray-700/10" },
    "Horror": { color: "from-gray-700 to-gray-900", bgColor: "bg-gray-700/10" },
    "Fiksi Ilmiah": { color: "from-indigo-500 to-purple-500", bgColor: "bg-indigo-500/10" },
    "Sci-Fi": { color: "from-indigo-500 to-purple-500", bgColor: "bg-indigo-500/10" },
    "Short TV": { color: "from-orange-500 to-red-600", bgColor: "bg-orange-500/10" },
    "K-Drama": { color: "from-blue-400 to-indigo-600", bgColor: "bg-blue-400/10" },
    "Indonesian Movies": { color: "from-red-600 to-red-800", bgColor: "bg-red-600/10" },
    "Indonesian Drama": { color: "from-red-400 to-red-600", bgColor: "bg-red-400/10" },
    "Indo Dub": { color: "from-emerald-500 to-teal-700", bgColor: "bg-emerald-500/10" },
    "Western TV": { color: "from-blue-700 to-blue-900", bgColor: "bg-blue-700/10" },
    "Adult Comedy": { color: "from-pink-700 to-purple-900", bgColor: "bg-pink-700/10" },
};

export default function Genres() {
    const [location, setLocation] = useLocation();
    const { data: trendingData, isLoading } = useTrendingMovies();
    const [availableGenres, setAvailableGenres] = useState<string[]>([]);

    // Map genre names to their respective category slugs if they exist in our API
    const genreToCategoryMap: Record<string, string> = {
        "Anime": "anime",
        "K-Drama": "kdrama",
        "Short TV": "short-tv",
        "Indonesian Movies": "indonesian-movies",
        "Indonesian Drama": "indonesian-drama",
        "Indo Dub": "indo-dub",
        "Western TV": "western-tv",
        "Adult Comedy": "adult-comedy"
    };

    // Standard genres if trending data isn't loaded yet
    const defaultGenres = [
        "Anime", "Action", "Romance", "Adventure", "Fantasy",
        "Drama", "Short TV", "Horror", "Comedy", "Sci-Fi",
        "Mystery", "Family", "K-Drama", "Indonesian Movies",
        "Indonesian Drama", "Indo Dub", "Western TV", "Adult Comedy"
    ];

    useEffect(() => {
        if (trendingData?.items) {
            const genreSet = new Set<string>(defaultGenres);
            trendingData.items.forEach(item => {
                if (item.genre) {
                    const genres = item.genre.split(',').map(g => g.trim());
                    genres.forEach(g => genreSet.add(g));
                }
            });
            setAvailableGenres(Array.from(genreSet).sort());
        } else if (!isLoading) {
            setAvailableGenres(defaultGenres.sort());
        }
    }, [trendingData, isLoading]);

    const handleGenreClick = (genre: string) => {
        const slug = genreToCategoryMap[genre];
        if (slug) {
            // If it's a known category endpoint
            setLocation(`/category/${slug}`);
        } else {
            // Fallback to search for generic genres
            setLocation(`/search?q=${encodeURIComponent(genre)}`);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Navbar />

            {/* Header */}
            <div className="relative pt-32 pb-12 md:pb-20 px-4 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 blur-3xl rounded-full scale-150 translate-y-1/2 opacity-30 pointer-events-none" />
                <div className="container mx-auto relative z-10">
                    <h1 className="text-4xl md:text-6xl font-display font-black text-white mb-4 tracking-tight">
                        Genres
                    </h1>
                    <div className="h-1.5 w-24 bg-gradient-to-r from-primary to-pink-500 rounded-full" />
                    <p className="mt-4 text-white/60 text-lg max-w-2xl">
                        Telusuri koleksi kami berdasarkan genre favoritmu. Klik genre untuk melihat semua konten yang tersedia.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4">
                {/* Genre Grid */}
                {isLoading && availableGenres.length === 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                        {Array(12).fill(0).map((_, i) => (
                            <div key={i} className="aspect-square rounded-2xl bg-secondary animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                        {availableGenres.map((genre, index) => {
                            const Icon = genreIcons[genre] || Film;
                            const colors = genreColors[genre] || { color: "from-gray-500 to-gray-700", bgColor: "bg-gray-500/10" };

                            return (
                                <motion.div
                                    key={genre}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <button
                                        onClick={() => handleGenreClick(genre)}
                                        className={`group relative aspect-square rounded-2xl overflow-hidden cursor-pointer ${colors.bgColor} border border-white/5 hover:border-white/20 transition-all duration-300 w-full`}
                                    >
                                        <div className={`absolute inset-0 bg-gradient-to-br ${colors.color} opacity-20 group-hover:opacity-40 transition-opacity duration-300`} />
                                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4">
                                            <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br ${colors.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                                <Icon className="w-8 h-8 md:w-10 md:h-10 text-white" />
                                            </div>
                                            <span className="text-white font-bold text-sm md:text-base text-center">
                                                {genre}
                                            </span>
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </button>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Info Text */}
                <div className="mt-12 text-center">
                    <p className="text-white/40 text-sm">
                        Klik genre untuk melihat koleksi film dan series dalam kategori tersebut
                    </p>
                </div>
            </div>
            <Footer variant="full" />
        </div>
    );
}
