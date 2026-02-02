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
}

export function CategoryRow({ title, items, isLoading, viewAllLink }: CategoryRowProps) {
  // Sanitize title for use in CSS selectors (remove special chars like !)
  const sanitizedId = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const prevElClass = `swiper-prev-${sanitizedId}`;
  const nextElClass = `swiper-next-${sanitizedId}`;

  return (
    <section className="py-8 md:py-12 last:border-0 relative group/row">
      <div className="container mx-auto px-4 mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">{title}</h2>
          <div className="h-1 w-20 bg-primary rounded-full transition-all duration-300 group-hover/row:w-32" />
        </div>

        {viewAllLink && (
          <Link href={viewAllLink} className="group flex items-center gap-2 text-sm font-semibold text-white/60 hover:text-primary transition-colors">
            View All
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </div>

      <div className="container mx-auto px-4 relative">
        {isLoading ? (
          <div className="flex gap-4 md:gap-6 overflow-hidden">
            {Array(6).fill(0).map((_, i) => (
              <MovieCardSkeleton key={i} />
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
              spaceBetween={12}
              slidesPerView={2.2}
              slidesPerGroup={2}
              breakpoints={{
                640: {
                  slidesPerView: 3.2,
                  slidesPerGroup: 3,
                  spaceBetween: 16
                },
                1024: {
                  slidesPerView: 5,
                  slidesPerGroup: 5,
                  spaceBetween: 20
                },
                1280: {
                  slidesPerView: 6,
                  slidesPerGroup: 6,
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
            <button className={`${prevElClass} absolute left-0 top-1/2 -translate-y-1/2 -ml-6 z-30 w-12 h-12 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white opacity-0 group-hover/swiper:opacity-100 transition-all duration-300 hover:bg-primary hover:border-primary disabled:hidden hover:scale-110 shadow-2xl hidden md:flex`}>
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button className={`${nextElClass} absolute right-0 top-1/2 -translate-y-1/2 -mr-6 z-30 w-12 h-12 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white opacity-0 group-hover/swiper:opacity-100 transition-all duration-300 hover:bg-primary hover:border-primary disabled:hidden hover:scale-110 shadow-2xl hidden md:flex`}>
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        ) : (
          <div className="w-full text-center text-white/40 py-10">No items found</div>
        )}
      </div>
    </section>
  );
}
