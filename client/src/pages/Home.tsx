import { Navbar } from "@/components/Navbar";
import { HeroSlider } from "@/components/HeroSlider";
import { CategoryRow } from "@/components/CategoryRow";
import { Footer } from "@/components/Footer";
import { useMoviesCategory } from "@/hooks/use-movies";
import { Loader2, Flame, Film, Zap, Heart, Tv, Globe, Star, Clapperboard, Gem, MonitorPlay, Laugh } from "lucide-react";

export default function Home() {
  // ... (lines 8-105 remain unchanged)
  // Fetch all 9 categories for the homepage
  const { data: indonesianMovies, isLoading: loadingIndo } =
    useMoviesCategory("indonesian-movies");
  const { data: trending, isLoading: loadingTrending } =
    useMoviesCategory("trending");
  const { data: anime, isLoading: loadingAnime } = useMoviesCategory("anime");
  const { data: indonesianDrama, isLoading: loadingIndoDrama } =
    useMoviesCategory("indonesian-drama");
  const { data: kdrama, isLoading: loadingKdrama } =
    useMoviesCategory("kdrama");
  const { data: shortTv, isLoading: loadingShortTv } =
    useMoviesCategory("short-tv");
  const { data: adultComedy, isLoading: loadingAdultComedy } =
    useMoviesCategory("adult-comedy");
  const { data: westernTv, isLoading: loadingWesternTv } =
    useMoviesCategory("western-tv");
  const { data: indoDub, isLoading: loadingIndoDub } =
    useMoviesCategory("indo-dub");
  const { data: dramaBox, isLoading: loadingDramaBox } =
    useMoviesCategory("drama-box-trending");
  const { data: dbMustSees, isLoading: loadingDbMustSees } = useMoviesCategory(
    "drama-box-must-sees",
  );
  const { data: dbGems, isLoading: loadingDbGems } = useMoviesCategory(
    "drama-box-hidden-gems",
  );

  const getItems = (data: any) => data?.items || [];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero Section */}
      <HeroSlider />

      <div className="mt-[-100px] md:mt-[-160px] relative z-20 space-y-4 md:space-y-8">
        {/* Categories */}
        <div className="bg-gradient-to-t from-background via-background to-transparent pt-24 md:pt-32 space-y-2 md:space-y-6">
          {/* 1. Trending */}
          <CategoryRow
            title="Sedang Tren"
            icon={<Flame className="w-5 h-5 md:w-6 md:h-6 fill-current" />}
            items={getItems(trending)}
            isLoading={loadingTrending}
            viewAllLink="/category/trending"
          />
          {/* 2. Film Indonesia (TOP) */}
          <CategoryRow
            title="Film Indonesia Lagi Ngetren"
            icon={<Film className="w-5 h-5 md:w-6 md:h-6 fill-current" />}
            items={getItems(indonesianMovies)}
            isLoading={loadingIndo}
            viewAllLink="/category/indonesian-movies"
          />
          {/* 3. Anime (THIRD) */}
          <CategoryRow
            title="Masuk ke Dunia Animasi"
            icon={<Zap className="w-5 h-5 md:w-6 md:h-6 fill-current" />}
            items={getItems(anime)}
            isLoading={loadingAnime}
            viewAllLink="/category/anime"
          />
          {/* 4. K-Drama */}
          <CategoryRow
            title="Drakor Terbaru"
            icon={<Heart className="w-5 h-5 md:w-6 md:h-6 fill-current" />}
            items={getItems(kdrama)}
            isLoading={loadingKdrama}
            viewAllLink="/category/kdrama"
          />

          {/* 5. Indonesian Drama */}
          <CategoryRow
            title="Drama Indonesia Terkini"
            icon={<Tv className="w-5 h-5 md:w-6 md:h-6 fill-current" />}
            items={getItems(indonesianDrama)}
            isLoading={loadingIndoDrama}
            viewAllLink="/category/indonesian-drama"
          />
          {/* 9. Indo Dub */}
          <CategoryRow
            title="Tayangan Dub Indo Terbaik!"
            icon={<Globe className="w-5 h-5 md:w-6 md:h-6" />}
            items={getItems(indoDub)}
            isLoading={loadingIndoDub}
            viewAllLink="/category/indo-dub"
          />

          {/* New Drama Box Category */}
          <CategoryRow
            title="Drama Box Specials"
            icon={<Star className="w-5 h-5 md:w-6 md:h-6 fill-current" />}
            items={getItems(dramaBox)}
            isLoading={loadingDramaBox}
            viewAllLink="/category/drama-box"
          />

          {/* Drama Box Must Sees */}
          <CategoryRow
            title="Drama Box: Recommended for You"
            icon={<Clapperboard className="w-5 h-5 md:w-6 md:h-6 fill-current" />}
            items={getItems(dbMustSees)}
            isLoading={loadingDbMustSees}
            viewAllLink="/category/drama-box-must-sees"
          />

          {/* Drama Box Hidden Gems */}
          <CategoryRow
            title="Drama Box: Hidden Gems"
            icon={<Gem className="w-5 h-5 md:w-6 md:h-6 fill-current" />}
            items={getItems(dbGems)}
            isLoading={loadingDbGems}
            viewAllLink="/category/drama-box-hidden-gems"
          />

          {/* 6. Short TV */}
          <CategoryRow
            title="Hot TV"
            icon={<MonitorPlay className="w-5 h-5 md:w-6 md:h-6 fill-current" />}
            items={getItems(shortTv)}
            isLoading={loadingShortTv}
            viewAllLink="/category/short-tv"
          />

          {/* 7. Adult Comedy */}
          <CategoryRow
            title="Canda Dewasa"
            icon={<Laugh className="w-5 h-5 md:w-6 md:h-6 fill-current" />}
            items={getItems(adultComedy)}
            isLoading={loadingAdultComedy}
            viewAllLink="/category/adult-comedy"
          />

          {/* 8. Western TV */}
          <CategoryRow
            title="Western TV"
            icon={<Tv className="w-5 h-5 md:w-6 md:h-6" />}
            items={getItems(westernTv)}
            isLoading={loadingWesternTv}
            viewAllLink="/category/western-tv"
          />
        </div>
      </div>
      <Footer variant="full" />
    </div>
  );
}
