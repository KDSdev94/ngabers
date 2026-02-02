import { useLocation } from "wouter";
import { useMovieDetail } from "@/hooks/use-movies";
import { Navbar } from "@/components/Navbar";
import { VideoPlayer } from "@/components/VideoPlayer";
import { Loader2, Star, Calendar, Clock, Share2, Heart, PlayCircle, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function Detail() {
  const [location] = useLocation();
  
  // Extract 'path' query param manually since wouter doesn't parse query params by default in hook
  const searchParams = new URLSearchParams(window.location.search);
  const detailPath = searchParams.get("path");

  const { data: movie, isLoading, error } = useMovieDetail(detailPath);
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);
  const [activeEpisodeUrl, setActiveEpisodeUrl] = useState<string | null>(null);

  // Auto-select first season/episode logic
  useEffect(() => {
    if (movie) {
      if (movie.seasons && movie.seasons.length > 0) {
        setSelectedSeason(movie.seasons[0].name);
      }
      if (movie.playerUrl) {
        setActiveEpisodeUrl(movie.playerUrl);
      } else if (movie.seasons?.[0]?.episodes?.[0]?.url) {
        setActiveEpisodeUrl(movie.seasons[0].episodes[0].url);
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
          <h2 className="text-2xl font-bold text-white">Oops! Could not load content.</h2>
          <p className="text-white/50">Please try again later or go back home.</p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const currentSeason = movie.seasons?.find(s => s.name === selectedSeason);

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <Navbar />

      {/* Backdrop & Header */}
      <div className="relative w-full h-[50vh] md:h-[70vh]">
        {/* Blurred Backdrop */}
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src={movie.poster} 
            alt="Backdrop" 
            className="w-full h-full object-cover blur-md scale-110 opacity-40" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 to-transparent" />
        </div>

        {/* Content Overlay */}
        <div className="absolute inset-0 container mx-auto px-4 flex flex-col justify-end pb-10 md:pb-16">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row gap-8 items-end"
          >
            {/* Poster - hidden on mobile, visible on desktop */}
            <div className="hidden md:block w-64 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10 flex-shrink-0">
              <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4 md:space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                 {movie.rating && (
                   <span className="flex items-center gap-1.5 bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-lg font-bold border border-yellow-500/20">
                     <Star className="w-4 h-4 fill-current" /> {movie.rating}
                   </span>
                 )}
                 <span className="bg-white/10 text-white px-3 py-1 rounded-lg font-medium text-sm border border-white/5">
                   {movie.year || "Unknown Year"}
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
                    const player = document.getElementById('player-section');
                    player?.scrollIntoView({ behavior: 'smooth' });
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

      <div className="container mx-auto px-4 mt-8 md:mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content (Player + Description) */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* Player Section */}
          <section id="player-section" className="scroll-mt-24">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <PlayCircle className="w-6 h-6 text-primary" />
              Stream Now
            </h2>
            {activeEpisodeUrl ? (
              <VideoPlayer url={activeEpisodeUrl} />
            ) : (
              <div className="w-full aspect-video bg-secondary rounded-2xl flex items-center justify-center border border-white/5">
                 <p className="text-white/40">Select an episode to play</p>
              </div>
            )}
          </section>

          {/* Storyline */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Storyline</h2>
            <div className="bg-card/50 border border-white/5 rounded-2xl p-6 md:p-8">
               <p className="text-lg leading-relaxed text-white/80">
                 {movie.description || "No description available for this title."}
               </p>
            </div>
          </section>
        </div>

        {/* Sidebar (Episodes / Details) */}
        <div className="space-y-8">
          {movie.seasons && movie.seasons.length > 0 ? (
            <div className="bg-card border border-white/5 rounded-2xl p-6 overflow-hidden sticky top-24">
              <div className="flex items-center gap-2 mb-6 text-white font-bold text-xl border-b border-white/10 pb-4">
                <Layers className="w-5 h-5 text-primary" />
                Episodes
              </div>

              {/* Season Selector */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-thin">
                {movie.seasons.map((season) => (
                  <button
                    key={season.name}
                    onClick={() => setSelectedSeason(season.name)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                      selectedSeason === season.name
                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                        : "bg-secondary text-white/60 hover:text-white hover:bg-secondary/80"
                    }`}
                  >
                    {season.name}
                  </button>
                ))}
              </div>

              {/* Episode List */}
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {currentSeason?.episodes?.map((ep, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveEpisodeUrl(ep.url)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group ${
                      activeEpisodeUrl === ep.url
                        ? "bg-white/10 border border-primary/50"
                        : "hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                      activeEpisodeUrl === ep.url ? "bg-primary text-white" : "bg-white/10 text-white/50 group-hover:bg-white/20"
                    }`}>
                      {idx + 1}
                    </div>
                    <span className={`text-sm font-medium line-clamp-1 ${
                      activeEpisodeUrl === ep.url ? "text-primary" : "text-white/80 group-hover:text-white"
                    }`}>
                      {ep.episode}
                    </span>
                    {activeEpisodeUrl === ep.url && (
                       <div className="ml-auto w-2 h-2 rounded-full bg-primary animate-pulse" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Movie Details Sidebar (if not series) */
            <div className="bg-card border border-white/5 rounded-2xl p-6 sticky top-24">
              <h3 className="text-xl font-bold text-white mb-4">Information</h3>
              <div className="space-y-4">
                <div className="flex justify-between border-b border-white/5 pb-3">
                  <span className="text-white/50">Status</span>
                  <span className="text-white font-medium">Released</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-3">
                  <span className="text-white/50">Release Year</span>
                  <span className="text-white font-medium">{movie.year}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-3">
                   <span className="text-white/50">Rating</span>
                   <span className="text-yellow-500 font-bold">{movie.rating}/10</span>
                </div>
                 <div className="flex flex-col gap-2">
                   <span className="text-white/50">Genre</span>
                   <div className="flex flex-wrap gap-2">
                     {movie.genre?.split(',').map(g => (
                       <span key={g} className="text-xs bg-white/5 px-2 py-1 rounded text-white/80">
                         {g.trim()}
                       </span>
                     ))}
                   </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
