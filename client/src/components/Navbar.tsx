import { Link, useLocation } from "wouter";
import { Search, Menu, X, Play } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchMovies } from "@/hooks/use-movies";
import { useDebounceValue } from "usehooks-ts";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch] = useDebounceValue(searchQuery, 500);
  const [location, setLocation] = useLocation();

  const { data: searchResults, isLoading: isSearching } = useSearchMovies(debouncedSearch);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close search results on route change
  useEffect(() => {
    setSearchQuery("");
  }, [location]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled || isMobileMenuOpen ? "bg-background/95 backdrop-blur-md border-b border-white/10" : "bg-gradient-to-b from-black/80 to-transparent"
          }`}
      >
        <div className="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between md:gap-4 relative">

          {/* Mobile: Hamburger Button (Left) */}
          <button
            className="md:hidden w-10 h-10 flex items-center justify-start rounded-full text-white hover:text-primary transition-colors z-20"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo (Center Mobile, Left Desktop) */}
          <Link href="/" className="items-center gap-2 group cursor-pointer z-20 flex absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 md:left-auto">
            <img
              src="/header.png"
              alt="Ngabers Logo"
              className="h-8 md:h-12 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {[
              { label: "Home", href: "/" },
              { label: "All Categories", href: "/category/trending", pattern: "/category" },
              { label: "K-Drama", href: "/category/kdrama" },
              { label: "Short TV", href: "/category/short-tv" },
              { label: "Anime", href: "/category/anime" },
              { label: "Western TV", href: "/category/western-tv" },
              { label: "Indo Dub", href: "/category/indo-dub" },
            ].map((item) => {
              const isActive = item.pattern
                ? location.startsWith(item.pattern) && (item.href === "/category/trending" ? location === "/category/trending" : true)
                : location === item.href;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`relative py-2 text-sm font-bold transition-all duration-300 ${isActive ? "text-primary" : "text-white/60 hover:text-white"
                    }`}
                >
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_rgba(229,25,80,0.5)]"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Search & Actions */}
          <div className="flex items-center gap-4 flex-none justify-end z-20">
            {/* Mobile Search Toggle */}
            <button
              className="md:hidden w-10 h-10 flex items-center justify-end text-white hover:text-primary transition-colors"
              onClick={() => {
                setShowMobileSearch(!showMobileSearch);
                setIsMobileMenuOpen(false);
              }}
            >
              {showMobileSearch ? <X className="w-6 h-6" /> : <Search className="w-6 h-6" />}
            </button>

            {/* Desktop Search Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim().length >= 2) {
                  setLocation(`/search?q=${encodeURIComponent(searchQuery)}`);
                  const input = e.currentTarget.querySelector('input');
                  if (input) input.blur();
                }
              }}
              className="hidden md:block relative group w-full md:max-w-[300px]"
            >
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Search className="w-4 h-4 text-white/50 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Cari Judul..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-900 border border-white/5 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:bg-secondary focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                />
              </div>

              {/* Desktop Search Results Dropdown */}
              <AnimatePresence>
                {searchQuery.length > 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-4 w-[400px] max-h-[60vh] overflow-y-auto bg-background/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 p-2 z-50"
                  >
                    <SearchResultsContent searchResults={searchResults} isSearching={isSearching} />
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>
        </div>

        {/* Mobile Search Bar Expansion (Exactly below navbar) */}
        <AnimatePresence>
          {showMobileSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-background/60 backdrop-blur-xl border-b border-white/10 overflow-hidden"
            >
              <div className="p-4 pt-2">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (searchQuery.trim().length >= 2) {
                      setLocation(`/search?q=${encodeURIComponent(searchQuery)}`);
                      setShowMobileSearch(false);
                    }
                  }}
                  className="relative"
                >
                  <div className="relative flex items-center bg-gray-950/40 border border-white/10 rounded-xl focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all backdrop-blur-md">
                    <Search className="absolute left-4 w-5 h-5 text-white/30" />
                    <input
                      type="text"
                      autoFocus
                      placeholder="Cari film atau series..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent py-4 pl-12 pr-4 text-base text-white placeholder:text-white/20 focus:outline-none"
                    />
                  </div>

                  {/* Mobile Search Results */}
                  {searchQuery.length > 2 && (
                    <div className="mt-2 max-h-[50vh] overflow-y-auto bg-background/40 backdrop-blur-2xl border border-white/10 rounded-xl p-2">
                      <SearchResultsContent searchResults={searchResults} isSearching={isSearching} />
                    </div>
                  )}
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Menu (Hamburger content) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed top-16 left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-white/10 z-[60] md:hidden overflow-hidden"
          >
            <nav className="flex flex-col p-4 gap-2">
              {[
                { label: "Home", href: "/" },
                { label: "All Categories", href: "/category/trending", pattern: "/category" },
                { label: "K-Drama", href: "/category/kdrama" },
                { label: "Short TV", href: "/category/short-tv" },
                { label: "Anime", href: "/category/anime" },
                { label: "Western TV", href: "/category/western-tv" },
                { label: "Indo Dub", href: "/category/indo-dub" },
              ].map((item) => {
                const isActive = item.pattern
                  ? location.startsWith(item.pattern) && (item.href === "/category/trending" ? location === "/category/trending" : true)
                  : location === item.href;

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-xl transition-colors font-medium ${isActive ? "bg-primary/20 text-primary" : "hover:bg-white/5 text-white/80"
                      }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Sub-component for search results to keep code clean and consistent
function SearchResultsContent({ searchResults, isSearching }: any) {
  if (isSearching) return <div className="p-4 text-center text-sm text-muted-foreground italic">Mencari...</div>;
  if (!searchResults?.items || searchResults.items.length === 0) return <div className="p-4 text-center text-sm text-muted-foreground">Tidak ditemukan</div>;

  return (
    <div className="space-y-1">
      {searchResults.items.slice(0, 5).map((movie: any) => (
        <Link key={movie.id} href={`/detail?path=${encodeURIComponent(movie.detailPath)}`}>
          <div className="gap-3 p-2 hover:bg-white/5 rounded-xl transition-colors cursor-pointer group flex items-start">
            <img src={movie.poster} alt={movie.title} className="w-12 h-16 object-cover rounded-md shadow-sm shrink-0" />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-white group-hover:text-primary transition-colors truncate">{movie.title}</h4>
              <div className="flex items-center gap-2 mt-1 text-white/40">
                <span className="text-xs">{movie.year}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-bold">{movie.rating}</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
