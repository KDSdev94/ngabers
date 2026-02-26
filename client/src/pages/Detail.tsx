import { useLocation } from "wouter";
import { useMovieDetail } from "@/hooks/use-movies";
import { Navbar } from "@/components/Navbar";
import { RecommendationSection } from "@/components/RecommendationSection";
import { Footer } from "@/components/Footer";
import {
  Loader2, Star, Play,
  Search, Calendar, Globe,
  Clapperboard, CheckCircle2, Clock, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useMemo } from "react";
import { getProgress, formatMinutes } from "@/lib/watchProgress";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Detail() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const detailPath = searchParams.get("path");

  const { data: movie, isLoading, error } = useMovieDetail(detailPath);
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);
  const [episodeSearch, setEpisodeSearch] = useState("");

  useEffect(() => {
    if (movie?.seasons?.length) {
      const firstSeason = movie.seasons[0];
      setSelectedSeason(firstSeason.name || `Season ${firstSeason.season}` || "Season 1");
    }
  }, [movie]);

  const currentSeason = useMemo(() => {
    return movie?.seasons?.find(s =>
      (s.name || `Season ${s.season}` || "Season 1") === selectedSeason
    );
  }, [movie, selectedSeason]);

  const filteredEpisodes = useMemo(() => {
    if (!currentSeason?.episodes) return [];
    if (!episodeSearch.trim()) return currentSeason.episodes;

    return currentSeason.episodes.filter(ep =>
      (ep.title || "").toLowerCase().includes(episodeSearch.toLowerCase()) ||
      (ep.episode || "").toString().includes(episodeSearch)
    );
  }, [currentSeason, episodeSearch]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-white/40 font-bold uppercase tracking-widest text-sm animate-pulse text-center">Loading dulu yah!</p>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-primary/20">
            <Info className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">Koneksi Terputus</h2>
          <p className="text-white/50 leading-relaxed">Kami tidak dapat memuat konten untuk saat ini. Silakan coba lagi atau kembali ke halaman utama.</p>
          <Button size="lg" className="w-full rounded-2xl font-bold bg-primary hover:bg-primary/90 text-white" onClick={() => setLocation("/")}>Kembali ke Beranda</Button>
        </div>
      </div>
    );
  }

  const handleWatch = (url: string, epTitle: string) => {
    setLocation(`/watch?url=${encodeURIComponent(url)}&title=${encodeURIComponent(movie.title)}&epTitle=${encodeURIComponent(epTitle)}&path=${encodeURIComponent(detailPath || "")}&poster=${encodeURIComponent(movie.poster || "")}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero Section - Cinematic Layout (Original Ngabers) */}
      <section className="relative w-full min-h-[85vh] flex items-end md:items-center py-20 overflow-hidden">
        {/* Backdrop Background */}
        <div className="absolute inset-0 z-0">
          <img
            src={movie.poster}
            alt=""
            className="w-full h-full object-cover opacity-80 md:opacity-80 blur-sm scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent hidden md:block" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row gap-10 items-start md:items-center">
            {/* Poster Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="w-48 sm:w-64 aspect-[2/3] rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex-shrink-0 self-center md:self-auto group"
            >
              <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            </motion.div>

            {/* Info Container */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex-1 space-y-6"
            >
              <h1 className="text-4xl md:text-7xl font-display font-black text-white leading-tight tracking-tight drop-shadow-2xl">
                {movie.title}
              </h1>

              {/* Meta Rows */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <div className="flex items-center gap-1.5 text-yellow-500 font-black">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="text-lg">{movie.rating}</span>
                </div>
                <div className="flex items-center gap-2 text-white/60 text-sm font-semibold">
                  <Calendar className="w-4 h-4" />
                  {movie.year || "2024"}
                </div>
                <div className="flex items-center gap-2 text-white/60 text-sm font-semibold uppercase tracking-wider">
                  <Clapperboard className="w-4 h-4" />
                  {movie.type === "tv" ? "Series" : "Movie"}
                </div>
                <div className="flex items-center gap-2 text-white/60 text-sm font-semibold">
                  <Globe className="w-4 h-4" />
                  {movie.country || "International"}
                </div>
              </div>

              {/* Genre Pills */}
              <div className="flex flex-wrap gap-2 pt-2">
                {movie.genre?.split(',').map((g: string) => (
                  <span key={g} className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/80 text-xs font-bold hover:bg-red-500/20 hover:border-red-500/50 transition-all cursor-default">
                    {g.trim()}
                  </span>
                ))}
              </div>

              {/* Synopsis */}
              <p className="text-white/70 text-base md:text-lg leading-relaxed max-w-3xl line-clamp-3 md:line-clamp-none">
                {movie.description || "Jelajahi petualangan luar biasa dalam judul ini. Sinopsis lengkap akan segera diperbarui untuk pengalaman menonton yang lebih baik."}
              </p>

              {/* Action */}
              <div className="pt-4">
                <Button
                  size="xl"
                  className="w-full md:w-auto h-14 px-10 rounded-2xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-black text-lg shadow-xl shadow-red-500/30 group active:scale-95 transition-all"
                  onClick={() => {
                    const firstEp = currentSeason?.episodes?.[0];
                    if (movie.playerUrl && !currentSeason?.episodes?.length) {
                      handleWatch(movie.playerUrl, movie.title);
                    } else if (firstEp) {
                      handleWatch(firstEp.playerUrl || firstEp.url, firstEp.title || `Episode 1`);
                    }
                  }}
                >
                  <Play className="w-6 h-6 mr-3 fill-current group-hover:scale-110 transition-transform" />
                  Tonton Sekarang
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Episodes Section - Layout seperti Mizunime (Only show for series) */}
      {movie.type === "tv" && (
        <div className="container mx-auto px-4 py-8 -mt-8">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h3 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                <span className="w-1.5 h-8 bg-red-500 rounded-full"></span>
                Episode ({currentSeason?.episodes?.length || 0})
              </h3>

              {/* Episode Search */}
              <div className="relative w-full sm:w-56">
                <input
                  type="text"
                  placeholder="Search episode..."
                  value={episodeSearch}
                  onChange={(e) => setEpisodeSearch(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-full py-2 px-4 pl-10 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 text-white placeholder-white/30 outline-none transition-all"
                />
                <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-white/40" />
              </div>
            </div>

            {/* Season Selector */}
            {movie.seasons && movie.seasons.length > 1 && (
              <Select value={selectedSeason || ""} onValueChange={setSelectedSeason}>
                <SelectTrigger className="w-full md:w-48 h-11 bg-white/5 border-white/10 text-white rounded-xl font-bold text-sm mb-6">
                  <SelectValue placeholder="Pilih Season" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-xl">
                  {movie.seasons.map((s, i) => {
                    const name = s.name || `Season ${s.season}` || "Season 1";
                    return (
                      <SelectItem key={i} value={name} className="focus:bg-red-500 focus:text-white cursor-pointer py-2 font-bold text-sm">
                        {name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            )}

            {/* Episode Grid - 2 cols mobile, responsive desktop */}
            <AnimatePresence mode="wait">
              {filteredEpisodes.length > 0 ? (
                <motion.div
                  key={selectedSeason + episodeSearch}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[500px] overflow-y-auto p-1 custom-scrollbar">
                    {filteredEpisodes.map((ep, idx) => {
                      const title = ep.title || `Episode ${ep.episode || idx + 1}`;
                      const epUrl = ep.playerUrl || ep.url;
                      const progress = epUrl ? getProgress(epUrl) : null;
                      const isCompleted = progress?.completed ?? false;
                      const hasProgress = !isCompleted && (progress?.minutes ?? 0) > 0.5;
                      return (
                        <Button
                          key={idx}
                          variant="secondary"
                          className={`relative overflow-hidden bg-zinc-900 hover:bg-red-900 border transition-all h-auto flex-col items-start p-3 rounded-xl ${isCompleted
                            ? "border-green-500/30 bg-green-900/10"
                            : hasProgress
                              ? "border-orange-500/30"
                              : "border-white/5 hover:border-red-500/50"
                            }`}
                          onClick={() => handleWatch(ep.playerUrl || ep.url, title)}
                        >
                          {/* Progress bar */}
                          {hasProgress && (
                            <div
                              className="absolute bottom-0 left-0 h-0.5 bg-orange-500/70 rounded-full"
                              style={{ width: `${Math.min((progress!.minutes / 21) * 100, 95)}%` }}
                            />
                          )}
                          {isCompleted && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500/70 rounded-full" />
                          )}

                          <div className="w-full flex items-start justify-between gap-1 mb-1">
                            <span className="text-white/60 text-xs text-left truncate flex-1">
                              {ep.title || `Episode ${ep.episode || idx + 1}`}
                            </span>
                            {isCompleted && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
                            )}
                            {hasProgress && (
                              <Clock className="w-3 h-3 text-orange-400 shrink-0" />
                            )}
                          </div>
                          <span className="text-white font-bold text-sm">
                            Episode {ep.episode || idx + 1}
                          </span>
                          {hasProgress && (
                            <span className="text-orange-400/80 text-[10px] font-bold mt-0.5">
                              {formatMinutes(progress!.minutes)}
                            </span>
                          )}
                          {isCompleted && (
                            <span className="text-green-400/80 text-[10px] font-bold mt-0.5">
                              Sudah ditonton
                            </span>
                          )}
                        </Button>
                      );
                    })}
                  </div>
                </motion.div>
              ) : (
                <div className="py-20 text-center space-y-4 bg-white/5 rounded-xl border border-dashed border-white/10">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                    <Search className="w-8 h-8 text-white/20" />
                  </div>
                  <p className="text-white/40 font-bold text-sm">Tidak ada episode ditemukan</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}



      {/* Recommendations */}
      <div className="container mx-auto px-4 pb-20">
        <div className="h-px w-full bg-white/5 mb-16" />
        <RecommendationSection />
      </div>

      <Footer variant="full" />
    </div>
  );
}
