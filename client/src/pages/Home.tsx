import { Navbar } from "@/components/Navbar";
import { HeroSlider } from "@/components/HeroSlider";
import { CategoryRow } from "@/components/CategoryRow";
import { useMoviesCategory } from "@/hooks/use-movies";
import { Loader2 } from "lucide-react";

export default function Home() {
  // Fetch a few categories for the homepage
  const { data: indonesianMovies, isLoading: loadingIndo } = useMoviesCategory("indonesian-movies");
  const { data: kdrama, isLoading: loadingKdrama } = useMoviesCategory("kdrama");
  const { data: anime, isLoading: loadingAnime } = useMoviesCategory("anime");
  const { data: shortTv, isLoading: loadingShortTv } = useMoviesCategory("short-tv");

  // Helper to extract items from infinite query pages
  const getItems = (data: any) => data?.pages?.flatMap((page: any) => page.items) || [];

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <Navbar />
      
      {/* Hero Section */}
      <HeroSlider />

      <div className="mt-[-80px] md:mt-[-120px] relative z-20 space-y-4 md:space-y-8">
        {/* Categories */}
        <div className="bg-gradient-to-t from-background via-background to-transparent pt-20 md:pt-32">
          <CategoryRow 
            title="Indonesian Movies" 
            items={getItems(indonesianMovies)} 
            isLoading={loadingIndo} 
            viewAllLink="/category/indonesian-movies"
          />
          
          <CategoryRow 
            title="Popular K-Dramas" 
            items={getItems(kdrama)} 
            isLoading={loadingKdrama}
            viewAllLink="/category/kdrama"
          />

          <CategoryRow 
            title="Latest Anime" 
            items={getItems(anime)} 
            isLoading={loadingAnime}
            viewAllLink="/category/anime"
          />

          <CategoryRow 
            title="Short TV Series" 
            items={getItems(shortTv)} 
            isLoading={loadingShortTv}
            viewAllLink="/category/short-tv"
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-4 pt-10 pb-6 border-t border-white/5 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="text-2xl font-display font-bold tracking-tighter text-white">
            Stream<span className="text-primary">X</span>
          </div>
          <p className="text-white/40 text-sm max-w-md mx-auto">
            Premium streaming experience for movies, dramas, and anime. 
            All content is provided by non-affiliated third parties.
          </p>
          <div className="text-white/20 text-xs mt-4">
            © 2024 StreamX. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
