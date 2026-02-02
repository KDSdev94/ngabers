import { Link } from "wouter";
import { MovieCard, MovieCardSkeleton } from "./MovieCard";
import { type MovieItem } from "@shared/schema";
import { ArrowRight } from "lucide-react";

interface CategoryRowProps {
  title: string;
  items: MovieItem[];
  isLoading?: boolean;
  viewAllLink?: string;
}

export function CategoryRow({ title, items, isLoading, viewAllLink }: CategoryRowProps) {
  return (
    <section className="py-8 md:py-12 border-b border-white/5 last:border-0">
      <div className="container mx-auto px-4 mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">{title}</h2>
          <div className="h-1 w-20 bg-primary rounded-full" />
        </div>
        
        {viewAllLink && (
          <Link href={viewAllLink} className="group flex items-center gap-2 text-sm font-semibold text-white/60 hover:text-primary transition-colors">
            View All
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </div>

      <div className="container mx-auto px-4 overflow-x-auto pb-8 -mb-8 scrollbar-hide">
        <div className="flex gap-4 md:gap-6 min-w-max">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <MovieCardSkeleton key={i} />
            ))
          ) : items?.length > 0 ? (
            items.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))
          ) : (
             <div className="w-full text-center text-white/40 py-10">No items found</div>
          )}
        </div>
      </div>
    </section>
  );
}
