import { Link, useLocation } from "wouter";
import { Search, Menu, X, Play } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchMovies } from "@/hooks/use-movies";
import { useDebounceValue } from "usehooks-ts";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
        <div className="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group cursor-pointer z-50">
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
              { label: "Movies", href: "/category/indonesian-movies" },
              { label: "K-Drama", href: "/category/kdrama" },
              { label: "Drama Box", href: "/category/drama-box" },
              { label: "Anime", href: "/category/anime" },
              { label: "Genres", href: "/genres" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-white/70 hover:text-white hover:text-shadow-glow transition-all"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <div className="flex items-center gap-4 flex-1 md:flex-none justify-end">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim().length >= 2) {
                  setLocation(`/search?q=${encodeURIComponent(searchQuery)}`);
                  // Manual search query check to force close dropdown by blurring or resetting
                  const input = e.currentTarget.querySelector('input');
                  if (input) input.blur();
                }
              }}
              className="relative group w-full max-w-[200px] md:max-w-[300px]"
            >
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-white/50 group-focus-within:text-primary transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search titles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-secondary/50 border border-white/5 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:bg-secondary focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
              />

              {/* Search Results Dropdown */}
              <AnimatePresence>
                {searchQuery.length > 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-4 w-[300px] md:w-[400px] max-h-[60vh] overflow-y-auto bg-card border border-white/10 rounded-2xl shadow-2xl shadow-black/50 p-2 z-50"
                  >
                    {isSearching ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">Searching...</div>
                    ) : searchResults?.items?.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">No results found</div>
                    ) : (
                      <div className="space-y-1">
                        {searchResults?.items?.slice(0, 5).map((movie) => (
                          <Link key={movie.id} href={`/detail?path=${encodeURIComponent(movie.detailPath)}`}>
                            <div className="flex gap-3 p-2 hover:bg-white/5 rounded-xl transition-colors cursor-pointer group">
                              <img src={movie.poster} alt={movie.title} className="w-12 h-16 object-cover rounded-md shadow-sm" />
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-white group-hover:text-primary transition-colors truncate">{movie.title}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-white/50">{movie.year}</span>
                                  <span className="text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary font-medium">{movie.rating}</span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                        {searchResults?.items?.length! > 5 && (
                          <div className="p-2 pt-0">
                            <Link href={`/search?q=${encodeURIComponent(searchQuery)}`}>
                              <button className="w-full py-2 text-xs font-medium text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
                                View all results
                              </button>
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {
          isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="fixed top-16 left-0 right-0 bg-background border-b border-white/10 z-40 md:hidden overflow-hidden"
            >
              <nav className="flex flex-col p-4 gap-2">
                {[
                  { label: "Home", href: "/" },
                  { label: "Movies", href: "/category/indonesian-movies" },
                  { label: "K-Drama", href: "/category/kdrama" },
                  { label: "Drama Box", href: "/category/drama-box" },
                  { label: "Anime", href: "/category/anime" },
                  { label: "Genres", href: "/genres" },
                  { label: "Trending", href: "/category/trending" },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-xl hover:bg-white/5 text-white/80 hover:text-white font-medium transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </motion.div>
          )
        }
      </AnimatePresence >
    </>
  );
}
