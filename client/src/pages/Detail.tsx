import { useLocation } from "wouter";
import { useMovieDetail } from "@/hooks/use-movies";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Loader2, Star, Share2, Heart, PlayCircle, Layers, Info, History, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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

  useEffect(() => {
    if (movie) {
      if (movie.seasons && movie.seasons.length > 0) {
        const firstSeasonName = movie.seasons[0].name || `Season ${movie.seasons[0].season}` || "Season 1";
        setSelectedSeason(firstSeasonName);
      }
    }
  }, [movie]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-white/50 font-medium">Loading details...</p>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">Ups! Gagal memuat konten.</h2>
          <p className="text-white/50">Silahkan coba lagi atau kembali ke halaman utama.</p>
          <Button onClick={() => window.history.back()}>Kembali</Button>
        </div>
      </div>
    );
  }

  const getSeasonDisplayName = (s: any) => s.name || `Season ${s.season}` || "Season 1";
  const getEpisodeUrl = (ep: any) => ep.playerUrl || ep.url || "";
  const getEpisodeDisplayName = (ep: any, idx: number) => ep.title || `Episode ${ep.episode}` || `Episode ${idx + 1}`;

  const currentSeason = movie.seasons?.find(s => getSeasonDisplayName(s) === selectedSeason);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Backdrop & Header */}
      <div className="relative w-full h-[50vh] md:h-[70vh]">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={movie.poster}
            alt="Backdrop"
            className="w-full h-full object-cover blur-md scale-110 opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 to-transparent" />
        </div>

        <div className="absolute inset-0 container mx-auto px-4 flex flex-col justify-end pb-10 md:pb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row gap-8 items-end"
          >
            <div className="hidden md:block w-64 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10 flex-shrink-0">
              <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
            </div>

            <div className="flex-1 space-y-4 md:space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                {movie.rating && (
                  <span className="flex items-center gap-1.5 bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-lg font-bold border border-yellow-500/20">
                    <Star className="w-4 h-4 fill-current" /> {movie.rating}
                  </span>
                )}
                <span className="bg-white/10 text-white px-3 py-1 rounded-lg font-medium text-sm border border-white/5">
                  {movie.year || "2024"}
                </span>
                <span className="bg-primary/20 text-primary px-3 py-1 rounded-lg font-bold text-sm border border-primary/20 uppercase">
                  {movie.type || "MOVIE"}
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-display font-black text-white leading-tight drop-shadow-xl">
                {movie.title}
              </h1>

              {movie.genre && (
                <p className="text-lg md:text-xl text-white/70 font-medium">
                  {movie.genre}
                </p>
              )}

              <div className="flex flex-wrap gap-4 pt-2">
                <Button
                  size="lg"
                  className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold h-12 px-8 shadow-lg shadow-primary/20"
                  onClick={() => {
                    const watchUrl = movie.playerUrl && (!movie.seasons || movie.seasons.length === 0)
                      ? movie.playerUrl
                      : currentSeason?.episodes?.[0] ? getEpisodeUrl(currentSeason.episodes[0]) : null;

                    if (watchUrl) {
                      const epTitle = currentSeason?.episodes?.[0]
                        ? getEpisodeDisplayName(currentSeason.episodes[0], 0)
                        : movie.title;

                      setLocation(`/watch?url=${encodeURIComponent(watchUrl)}&title=${encodeURIComponent(movie.title)}&epTitle=${encodeURIComponent(epTitle)}&path=${encodeURIComponent(detailPath || "")}&poster=${encodeURIComponent(movie.poster || "")}`);
                    }
                  }}
                >
                  <PlayCircle className="w-5 h-5 mr-2 fill-current" />
                  Start Watching
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-xl bg-white/5 border-white/10 text-white hover:bg-white/10 h-12 px-6"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  Favorite
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  className="rounded-xl text-white/70 hover:text-white hover:bg-white/5 h-12 px-4"
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8 md:mt-12">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* 1. Synopsis / Storyline At Top */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <History className="w-6 h-6" />
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">Synopsis</h3>
            </div>
            <div className="bg-card border border-white/5 rounded-3xl p-6 md:p-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />
              <p className="text-lg md:text-xl leading-relaxed text-white/70 relative z-10">
                {movie.description || "No description available for this title."}
              </p>
            </div>
          </section>

          {/* 2. Split Content: Info (Left) and Episodes (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-16">
            {/* Information (Left - 1 column) */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-card border border-white/5 rounded-3xl p-6 md:p-8">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary" />
                  Information
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between border-b border-white/5 pb-4">
                    <span className="text-white/50 text-sm font-medium">Status</span>
                    <span className="text-white font-bold">Released</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-4">
                    <span className="text-white/50 text-sm font-medium">Release Year</span>
                    <span className="text-white font-bold">{movie.year || "2024"}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-4">
                    <span className="text-white/50 text-sm font-medium">Rating</span>
                    <span className="text-yellow-500 font-black tracking-wider">{movie.rating || "8.5"}/10</span>
                  </div>
                  <div className="flex flex-col gap-3 pt-2">
                    <span className="text-white/50 text-sm font-medium">Genre</span>
                    <div className="flex flex-wrap gap-2">
                      {movie.genre?.split(',').map((g: string) => (
                        <span key={g} className="text-xs font-bold bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full text-white/80 border border-white/5 transition-colors">
                          {g.trim()}
                        </span>
                      )) || <span className="text-xs text-white/30">N/A</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Episodes (Right - 2 columns) */}
            <div className="lg:col-span-2">
              {movie.seasons && movie.seasons.length > 0 ? (
                <div className="bg-card/30 border border-white/5 rounded-3xl p-6 md:p-8 space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-white font-bold text-xl">
                      <Layers className="w-6 h-6 text-primary" />
                      Episodes
                    </div>

                    {/* Season Selector Dropdown */}
                    {movie.seasons.length > 1 ? (
                      <Select value={selectedSeason || ""} onValueChange={setSelectedSeason}>
                        <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white rounded-xl focus:ring-primary/20">
                          <SelectValue placeholder="Select Season" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-xl">
                          {movie.seasons.map((season: any, i: number) => {
                            const name = getSeasonDisplayName(season);
                            return (
                              <SelectItem
                                key={name + i}
                                value={name}
                                className="focus:bg-primary focus:text-white cursor-pointer"
                              >
                                {name}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl text-primary text-xs font-black uppercase tracking-widest">
                        {selectedSeason}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {currentSeason?.episodes?.map((ep: any, idx: number) => {
                      const epUrl = getEpisodeUrl(ep);
                      const epName = getEpisodeDisplayName(ep, idx);
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setLocation(`/watch?url=${encodeURIComponent(epUrl)}&title=${encodeURIComponent(movie.title)}&epTitle=${encodeURIComponent(epName)}&path=${encodeURIComponent(detailPath || "")}&poster=${encodeURIComponent(movie.poster || "")}`);
                          }}
                          className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/50 hover:bg-white/10 transition-all text-left group"
                        >
                          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-xs font-black text-white/30 group-hover:bg-primary group-hover:text-white transition-all">
                            {idx + 1}
                          </div>
                          <span className="text-sm font-bold text-white/70 group-hover:text-white line-clamp-1 flex-1">
                            {epName}
                          </span>
                          <PlayCircle className="w-5 h-5 text-white/5 group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="bg-card/30 border border-white/5 rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                    <PlayCircle className="w-10 h-10 text-white/10" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-white font-bold text-xl uppercase tracking-tight">Ready to Watch</p>
                    <p className="text-white/30 text-sm">Click the movie start button below to begin streaming.</p>
                  </div>
                  <Button
                    className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl h-11 px-8"
                    onClick={() => {
                      if (movie.playerUrl) {
                        setLocation(`/watch?url=${encodeURIComponent(movie.playerUrl)}&title=${encodeURIComponent(movie.title)}&epTitle=${encodeURIComponent(movie.title)}&path=${encodeURIComponent(detailPath || "")}&poster=${encodeURIComponent(movie.poster || "")}`);
                      }
                    }}
                  >
                    START STREAMING
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer variant="full" />
    </div>
  );
}
