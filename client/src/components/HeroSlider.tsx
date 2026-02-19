import { useTrendingMovies, useMovieDetail } from "@/hooks/use-movies";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import { Link } from "wouter";
import { Play, Info, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type MovieItem } from "@shared/schema";

function HeroSlideItem({ movie }: { movie: MovieItem }) {
  // Pre-fetch detail so the "Tonton Sekarang" button has the player/episode data ready
  const { data: detail } = useMovieDetail(movie.detailPath);
  const displayMovie = detail || movie;

  return (
    <div className="relative w-full h-full">
      {/* Background Layer - Strictly non-interactive */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <img
          src={displayMovie.poster}
          alt={displayMovie.title}
          className="w-full h-full object-cover object-top opacity-70 md:opacity-100"
        />
        {/* Cinematic Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/20 to-transparent md:via-background/40" />
      </div>

      {/* Content Layer - High Z-index to stay above the overlap section */}
      <div className="absolute inset-0 z-50 container mx-auto px-4 flex flex-col justify-end pb-20 md:pb-0 md:justify-center md:pt-32 pointer-events-auto">
        <div className="max-w-2xl space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">

          {/* Badge Category */}
          <div className="flex items-center">
            <span className="bg-[#E50914] px-3 py-1 md:px-4 md:py-1.5 rounded-md text-[10px] md:text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5 md:gap-2">
              <Flame className="w-3 h-3 md:w-4 md:h-4 fill-white" />
              TRENDING
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-6xl lg:text-7xl font-display font-black text-white leading-tight tracking-tight drop-shadow-lg line-clamp-2 md:line-clamp-none">
            {displayMovie.title}
          </h1>

          {/* Meta Tags */}
          <div className="flex items-center gap-3 md:gap-4 text-xs md:text-base font-bold text-white/90">
            <div className="flex items-center gap-1 text-yellow-400">
              <span className="text-sm md:text-lg">★</span>
              <span>{displayMovie.rating || "N/A"}</span>
            </div>
            <span>{displayMovie.year || "2024"}</span>
            <span className="px-1.5 py-0.5 md:px-2 md:py-0.5 bg-white/20 rounded text-[10px] md:text-xs uppercase tracking-wide">
              {displayMovie.type === 'tv' ? 'TV' : 'Film'}
            </span>
          </div>

          {/* Description / Synopsis */}
          <div className="md:w-3/4">
            <p className="text-xs md:text-base text-gray-300 leading-relaxed line-clamp-2 md:line-clamp-3">
              {displayMovie.description || "Sinopsis tidak tersedia untuk judul ini. Tonton sekarang untuk mengetahui cerita lengkapnya!"}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 md:gap-4 pt-2 md:pt-4">
            <Button
              size="lg"
              className="flex-1 md:flex-none h-10 md:h-14 px-4 md:px-8 rounded-lg bg-white hover:bg-white/90 text-black font-black text-xs md:text-base transition-all hover:scale-105 active:scale-95 shadow-lg shadow-white/5"
              onClick={() => {
                // If it's a TV series, we need to get the first episode
                if (detail?.seasons?.[0]?.episodes?.[0]) {
                  const firstEp = detail.seasons[0].episodes[0];
                  window.location.href = `/watch?url=${encodeURIComponent(firstEp.playerUrl || firstEp.url)}&title=${encodeURIComponent(displayMovie.title)}&path=${encodeURIComponent(displayMovie.detailPath)}`;
                } else if (displayMovie.type === 'movie') {
                  // For movies, we go to detail first or direct if we had the URL, 
                  // but usually we go to detail to fetch the player URL
                  window.location.href = `/detail?path=${encodeURIComponent(displayMovie.detailPath)}`;
                } else {
                  // Fallback to detail page if data isn't ready
                  window.location.href = `/detail?path=${encodeURIComponent(displayMovie.detailPath)}`;
                }
              }}
            >
              <Play className="w-3.5 h-3.5 md:w-5 md:h-5 mr-1.5 md:mr-2 fill-black" />
              Tonton Sekarang
            </Button>

            <Button
              size="lg"
              className="flex-1 md:flex-none h-10 md:h-14 px-4 md:px-8 rounded-lg bg-white/20 hover:bg-white/30 text-white font-bold text-xs md:text-base backdrop-blur-md border border-white/10 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-black/10"
              onClick={() => window.location.href = `/detail?path=${encodeURIComponent(displayMovie.detailPath || "")}`}
            >
              <Info className="w-3.5 h-3.5 md:w-5 md:h-5 mr-1.5 md:mr-2" />
              Info Lengkap
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeroSlider() {
  const { data, isLoading } = useTrendingMovies();

  if (isLoading || !data?.items) {
    return (
      <div className="w-full h-[60vh] md:h-[85vh] bg-secondary animate-pulse relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
      </div>
    );
  }

  // Take top 5 items for the slider
  const slides = data.items.slice(0, 5);

  return (
    <div className="relative z-40 w-full h-[60vh] md:h-[85vh] group">
      <Swiper
        modules={[Autoplay, EffectFade, Pagination]}
        effect="fade"
        speed={1000}
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        allowTouchMove={false}
        pagination={{
          clickable: true,
          modifierClass: 'swiper-pagination-custom-',
          bulletClass: 'swiper-pagination-bullet-custom',
          bulletActiveClass: 'swiper-pagination-bullet-active-custom'
        }}
        loop
        className="w-full h-full"
      >
        {slides.map((movie) => (
          <SwiperSlide key={movie.id} className="relative w-full h-full">
            <HeroSlideItem movie={movie} />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Pagination Styles */}
      <style>{`
        .swiper-pagination-bullet-custom {
          width: 10px;
          height: 10px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          display: inline-block;
          margin: 0 6px;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .swiper-pagination-bullet-active-custom {
          background: #E51950;
          width: 24px;
          border-radius: 6px;
          box-shadow: 0 0 10px rgba(229, 25, 80, 0.5);
        }
      `}</style>
    </div>
  );
}
