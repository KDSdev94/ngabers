import { Link } from "wouter";
import { MovieCard, MovieCardSkeleton } from "./MovieCard";
import { type MovieItem } from "@shared/schema";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";

interface CategoryRowProps {
  title: string;
  items: MovieItem[];
  isLoading?: boolean;
  viewAllLink?: string;
  icon?: React.ReactNode;
}

export function CategoryRow({ title, items, isLoading, viewAllLink, icon }: CategoryRowProps) {
  // Sanitize title for use in CSS selectors (remove special chars like !)
  const sanitizedId = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const prevElClass = `swiper-prev-${sanitizedId}`;
  const nextElClass = `swiper-next-${sanitizedId}`;

  return (
    <section className="py-2 md:py-4 last:border-0 relative group/row">
      <div className="container mx-auto px-4 mb-4 md:mb-6">
        <div className="flex items-center justify-between gap-6 md:gap-10 mb-2 md:mb-3">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-lg md:text-2xl font-display font-bold text-white leading-tight flex items-center gap-2 md:gap-3">
              {icon && <span className="text-primary shrink-0">{icon}</span>}
              <span>{title}</span>
            </h2>
          </div>

          {viewAllLink && (
            <Link href={viewAllLink} className="flex-shrink-0 group flex items-center gap-1.5 text-xs md:text-sm font-semibold text-white/60 hover:text-primary transition-colors">
              <span className="whitespace-nowrap">View All</span>
              <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </div>
        <div className="h-1 w-12 md:w-20 bg-primary rounded-full transition-all duration-300 group-hover/row:w-32" />
      </div>

      <div className="container mx-auto px-4 relative">
        {isLoading ? (
          <div className="flex gap-4 md:gap-6 overflow-hidden">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="w-[140px] md:w-[200px] flex-shrink-0">
                <MovieCardSkeleton />
              </div>
            ))}
          </div>
        ) : items?.length > 0 ? (
          <div className="relative group/swiper">
            <Swiper
              modules={[Navigation]}
              navigation={{
                nextEl: `.${nextElClass}`,
                prevEl: `.${prevElClass}`,
              }}
              spaceBetween={16}
              slidesPerView={2.2}
              slidesPerGroup={1}
              breakpoints={{
                640: {
                  slidesPerView: 3.2,
                  slidesPerGroup: 2,
                  spaceBetween: 16
                },
                1024: {
                  slidesPerView: 5.2,
                  slidesPerGroup: 3,
                  spaceBetween: 20
                },
                1280: {
                  slidesPerView: 6.2,
                  slidesPerGroup: 4,
                  spaceBetween: 24
                },
              }}
              className="rounded-xl"
            >
              {items.map((movie) => (
                <SwiperSlide key={movie.id}>
                  <MovieCard movie={movie} />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Custom Navigation Buttons - Positioned to look integrated */}
            <button className={`${prevElClass} absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-white opacity-0 group-hover/swiper:opacity-100 transition-all duration-300 hover:bg-primary hover:border-primary disabled:hidden hover:scale-110 shadow-2xl hidden md:flex`}>
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <button className={`${nextElClass} absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-white opacity-0 group-hover/swiper:opacity-100 transition-all duration-300 hover:bg-primary hover:border-primary disabled:hidden hover:scale-110 shadow-2xl hidden md:flex`}>
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        ) : (
          <div className="w-full text-center text-white/40 py-10">Item Gak Ditemukan</div>
        )}
      </div>
    </section>
  );
}
