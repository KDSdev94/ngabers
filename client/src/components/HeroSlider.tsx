import { useTrendingMovies } from "@/hooks/use-movies";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import { Link } from "wouter";
import { Play, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <div className="relative w-full h-[60vh] md:h-[85vh] group">
      <Swiper
        modules={[Autoplay, EffectFade, Pagination]}
        effect="fade"
        speed={1000}
        autoplay={{ delay: 6000, disableOnInteraction: false }}
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
            {/* Background Image with Blur/Dim */}
            <div className="absolute inset-0">
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-full h-full object-cover object-top opacity-60 md:opacity-100"
              />
              {/* Complex Gradients for Cinematic Look */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
            </div>

            {/* Content Container */}
            <div className="absolute inset-0 container mx-auto px-4 flex items-end pb-20 md:pb-32 md:items-center md:pt-20">
              <div className="max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
                
                {/* Meta Tags */}
                <div className="flex items-center gap-3">
                   <span className="bg-primary px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg shadow-primary/20">
                     TRENDING
                   </span>
                   {movie.rating && (
                     <span className="flex items-center gap-1 text-yellow-400 text-sm font-semibold">
                       ★ {movie.rating}
                     </span>
                   )}
                   <span className="text-white/70 text-sm">{movie.year}</span>
                </div>

                {/* Title */}
                <h1 className="text-4xl md:text-7xl font-display font-black text-white leading-[0.9] tracking-tight drop-shadow-2xl">
                  {movie.title}
                </h1>

                {/* Description - if available (often not in list view, but nice to have space) */}
                {movie.genre && (
                  <p className="text-lg text-white/80 font-medium md:w-3/4">
                    {movie.genre.split(',').join(' • ')}
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-4 pt-4">
                  <Link href={`/detail?path=${encodeURIComponent(movie.detailPath)}`}>
                    <Button 
                      size="lg" 
                      className="h-14 px-8 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-xl shadow-primary/25 hover:scale-105 transition-all duration-300"
                    >
                      <Play className="w-5 h-5 mr-2 fill-current" />
                      Watch Now
                    </Button>
                  </Link>
                  <Link href={`/detail?path=${encodeURIComponent(movie.detailPath)}`}>
                    <Button 
                      size="lg" 
                      variant="outline"
                      className="h-14 px-8 rounded-xl bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm font-semibold text-lg hover:scale-105 transition-all duration-300"
                    >
                      <Info className="w-5 h-5 mr-2" />
                      Details
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
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
