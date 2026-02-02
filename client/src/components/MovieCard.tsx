import { Play, Star, Calendar, Info } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { type MovieItem } from "@shared/schema";

interface MovieCardProps {
  movie: MovieItem;
  priority?: boolean;
}

export function MovieCard({ movie, priority = false }: MovieCardProps) {
  return (
    <Link href={`/detail?path=${encodeURIComponent(movie.detailPath)}`}>
      <motion.div
        className="group relative flex-shrink-0 w-[160px] md:w-[220px] aspect-[2/3] rounded-2xl overflow-hidden cursor-pointer bg-card shadow-lg shadow-black/20 border border-white/5"
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ duration: 0.2 }}
        layout={priority}
      >
        {/* Poster Image */}
        <img
          src={movie.poster}
          alt={movie.title}
          loading={priority ? "eager" : "lazy"}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 group-hover:opacity-40"
        />

        {/* Rating Badge */}
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 z-10 border border-white/10">
          <Star className="w-3 h-3 text-yellow-500 fill-current" />
          <span className="text-xs font-bold text-white">{movie.rating}</span>
        </div>

        {/* Hover Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            
            {/* Play Button */}
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mb-3 shadow-lg shadow-primary/40 mx-auto scale-0 group-hover:scale-100 transition-transform duration-300 delay-75">
              <Play className="w-5 h-5 text-white fill-current ml-0.5" />
            </div>

            <h3 className="text-white font-bold text-lg leading-tight line-clamp-2 mb-1 drop-shadow-md">
              {movie.title}
            </h3>
            
            <div className="flex items-center gap-3 text-white/70 text-xs mb-2">
              {movie.year && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{movie.year}</span>
                </div>
              )}
              {movie.type && (
                <span className="px-1.5 py-0.5 rounded bg-white/10 uppercase tracking-wider text-[10px] font-semibold">
                  {movie.type}
                </span>
              )}
            </div>

            {movie.genre && (
              <p className="text-white/50 text-xs line-clamp-1">{movie.genre}</p>
            )}
          </div>
        </div>

        {/* Dark Gradient Overlay for text readability on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </motion.div>
    </Link>
  );
}

export function MovieCardSkeleton() {
  return (
    <div className="w-[160px] md:w-[220px] aspect-[2/3] rounded-2xl bg-secondary animate-pulse relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-100%] animate-shimmer" />
    </div>
  );
}
