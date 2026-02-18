import { useLocation } from "wouter";
import { useMovieDetail, useMoviesCategory } from "@/hooks/use-movies";
import { Navbar } from "@/components/Navbar";
import { VideoPlayer } from "@/components/VideoPlayer";
import { MovieCard } from "@/components/MovieCard";
import { RecommendationSection } from "@/components/RecommendationSection";
import { Footer } from "@/components/Footer";
import { ArrowLeft, ArrowRight, Share2, Info, ChevronLeft, Star, Calendar, Globe, Maximize, Minimize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo, useRef } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function Watch() {
    const [location, setLocation] = useLocation();
    const [copied, setCopied] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isIdle, setIsIdle] = useState(false);
    const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Handle Idle State (Auto-hide controls)
    useEffect(() => {
        const resetIdle = () => {
            setIsIdle(false);
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
            if (document.fullscreenElement) {
                idleTimerRef.current = setTimeout(() => setIsIdle(true), 3000);
            }
        };

        const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'resize'];
        events.forEach(e => window.addEventListener(e, resetIdle));

        return () => {
            events.forEach(e => window.removeEventListener(e, resetIdle));
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        };
    }, [isFullscreen]);

    // Handle Fullscreen State
    useEffect(() => {
        const handleFsChange = () => {
            // Check if any element is in fullscreen mode
            const isFs = !!document.fullscreenElement;
            setIsFullscreen(isFs);
        };

        document.addEventListener("fullscreenchange", handleFsChange);
        return () => document.removeEventListener("fullscreenchange", handleFsChange);
    }, []);



    // Get current query params reactively
    const searchParams = new URLSearchParams(window.location.search);
    const currentUrl = searchParams.get("url");
    const title = searchParams.get("title");
    const epTitle = searchParams.get("epTitle");
    const poster = searchParams.get("poster");
    const path = searchParams.get("path");

    // Fetch full details to get the episode list for navigation
    const { data: movie } = useMovieDetail(path);

    const [selectedSeason, setSelectedSeason] = useState<string | null>(null);

    // Set initial season
    useEffect(() => {
        if (movie?.seasons?.length && !selectedSeason) {
            const firstSeason = movie.seasons[0];
            setSelectedSeason(firstSeason.name || `Season ${firstSeason.season}` || "Season 1");
        }
    }, [movie]);

    const currentSeasonData = useMemo(() => {
        return movie?.seasons?.find(s =>
            (s.name || `Season ${s.season}` || "Season 1") === selectedSeason
        );
    }, [movie, selectedSeason]);

    // Calculate prev/next episodes based on current URL and movie data
    const { prevEp, nextEp } = useMemo(() => {
        if (!movie || !movie.seasons || !currentUrl) return { prevEp: null, nextEp: null };

        const normalize = (u: string) => {
            try {
                return u.replace(/^https?:\/\//, '').replace(/\/+$/, '').split('#')[0];
            } catch (e) {
                return u;
            }
        };

        const normalizedCurrent = normalize(decodeURIComponent(currentUrl));

        const allEpisodes = movie.seasons.flatMap((s: any) =>
            s.episodes.map((ep: any) => ({
                ...ep,
                seasonName: s.name || `Season ${s.season}`
            }))
        );

        const currentIndex = allEpisodes.findIndex((ep: any) => {
            const epUrl = ep.playerUrl || ep.url;
            if (!epUrl) return false;
            return normalize(decodeURIComponent(epUrl)) === normalizedCurrent;
        });

        return {
            prevEp: currentIndex > 0 ? allEpisodes[currentIndex - 1] : null,
            nextEp: currentIndex !== -1 && currentIndex < allEpisodes.length - 1 ? allEpisodes[currentIndex + 1] : null
        };
    }, [movie, currentUrl]);



    if (!currentUrl) {

        setLocation("/");
        return null;
    }

    const navigateToEpisode = (ep: any) => {
        const epUrl = ep.playerUrl || ep.url;
        const dispName = ep.title || `Episode ${ep.episode}`;

        const newSearch = new URLSearchParams();
        newSearch.set("url", epUrl);
        newSearch.set("title", title || "");
        newSearch.set("epTitle", dispName);
        newSearch.set("path", path || "");
        newSearch.set("poster", poster || "");

        // Force a full page reload to refresh everything (player, states, etc)
        window.location.href = `/watch?${newSearch.toString()}`;
    };

    const handleShare = async () => {
        const shareData = {
            title: title || "Stream Zone",
            text: `Nonton ${title} di Stream Zone!`,
            url: window.location.href,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error("Error sharing:", err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(window.location.href);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error("Failed to copy:", err);
            }
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    return (
        <div className={`flex flex-col min-h-screen bg-background text-foreground ${isFullscreen && isIdle ? 'cursor-none' : ''}`}>
            {/* Hide Navbar in Fullscreen Mode */}
            <div className={`transition-transform duration-300 ${isFullscreen ? '-translate-y-full fixed w-full z-40' : 'translate-y-0 sticky top-0 z-50'}`}>
                <Navbar />
            </div>

            <main className="flex-1 pt-24 pb-12">
                {/* Cinematic Header (Title on Top) */}
                <div className={`container mx-auto px-4 mb-8 space-y-4 transition-opacity duration-500 ${isFullscreen && isIdle ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 mb-2">
                                <button
                                    onClick={() => window.history.back()}
                                    className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors text-sm font-bold group"
                                >
                                    <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                                    KEMBALI
                                </button>
                                <span className="text-white/20 text-xs">/</span>
                                <span className="text-white/40 text-xs font-bold uppercase tracking-widest">{epTitle}</span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-display font-black text-white tracking-tight leading-none">
                                {title}
                            </h1>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={toggleFullscreen}
                                className="rounded-xl bg-white/5 border-white/10 gap-2 hover:bg-white/10 min-w-[100px]"
                            >
                                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                                {isFullscreen ? "Exit FS" : "Fullscreen"}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleShare}
                                className="rounded-xl bg-white/5 border-white/10 gap-2 hover:bg-white/10 min-w-[100px]"
                            >
                                {copied ? (
                                    <>
                                        <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-full bg-green-500" />
                                        </div>
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Share2 className="w-4 h-4" /> Share
                                    </>
                                )}
                            </Button>
                            {path && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-xl bg-white/5 border-white/10 gap-2 hover:bg-white/10"
                                    onClick={() => setLocation(`/detail?path=${path}`)}
                                >
                                    <Info className="w-4 h-4" /> Detail
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Player Section - Responsive Layout */}
                <div className="container mx-auto px-4 space-y-6">
                    {movie?.seasons?.length ? (
                        /* SERIES LAYOUT: Dual Column */
                        <div className="grid grid-cols-1 lg:grid-cols-12 md:gap-1 overflow-hidden md:rounded-[2rem] border-y md:border border-white/5 bg-black md:shadow-2xl md:shadow-primary/10">
                            {/* Player Column */}
                            <div className={`lg:col-span-9 relative aspect-video bg-black ${isFullscreen && isIdle ? '[&_iframe]:pointer-events-none' : ''}`}>
                                <VideoPlayer url={currentUrl} />
                                {isFullscreen && isIdle && (
                                    <div className="absolute inset-0 z-50 bg-black/0" />
                                )}
                            </div>

                            {/* Episodes Sidebar Column */}
                            <div className="lg:col-span-3 bg-[#121212] lg:border-l border-white/5 relative overflow-hidden h-[400px] lg:h-auto">
                                <div className="lg:absolute lg:inset-0 flex flex-col h-full">
                                    <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1 h-5 bg-primary rounded-full shadow-[0_0_10px_rgba(229,25,80,0.5)]" />
                                            <h2 className="text-base font-display font-black text-white uppercase tracking-tight">Episodes</h2>
                                        </div>

                                        {/* Season Selector */}
                                        {movie.seasons.length > 1 && (
                                            /* @ts-ignore */
                                            <Select value={selectedSeason || ""} onValueChange={(val) => setSelectedSeason(val)} modal={false}>
                                                <SelectTrigger className="w-20 h-7 bg-white/5 border-white/10 text-white rounded-lg text-[10px] font-bold">
                                                    <SelectValue placeholder="S1" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-xl">
                                                    {movie.seasons.map((s, i) => {
                                                        const name = s.name || `Season ${s.season}` || "Season 1";
                                                        return (
                                                            <SelectItem key={i} value={name} className="focus:bg-primary focus:text-white cursor-pointer py-2 font-bold text-[10px]">
                                                                {name}
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </div>

                                    {/* Episode List - Matches player height on desktop */}
                                    <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar border-t lg:border-t-0 border-white/5">
                                        {currentSeasonData?.episodes?.map((ep, idx) => {
                                            const epNum = ep.episode || (idx + 1).toString();
                                            const isActive = ep.playerUrl === currentUrl || ep.url === currentUrl;
                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => navigateToEpisode(ep)}
                                                    className={`w-full group flex items-center gap-2.5 p-2 rounded-xl transition-all ${isActive ? "bg-primary/20 border border-primary/30" : "bg-white/5 border border-transparent hover:bg-white/10"
                                                        }`}
                                                >
                                                    <div className={`w-7 h-7 shrink-0 rounded-lg flex items-center justify-center font-black text-[10px] transition-colors ${isActive ? "bg-primary text-white" : "bg-white/10 text-white/40 group-hover:bg-primary/20 group-hover:text-primary"
                                                        }`}>
                                                        {epNum}
                                                    </div>
                                                    <span className={`text-xs font-bold truncate transition-colors ${isActive ? "text-white" : "text-white/60 group-hover:text-white"
                                                        }`}>
                                                        {ep.title || `Episode ${epNum}`}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* MOVIE LAYOUT: Square on mobile, Rounded on desktop */
                        <div className={`relative aspect-video md:rounded-[2rem] overflow-hidden bg-black md:shadow-2xl md:shadow-primary/10 border-y md:border border-white/5 md:ring-1 md:ring-white/5 ${isFullscreen && isIdle ? '[&_iframe]:pointer-events-none' : ''}`}>
                            <VideoPlayer url={currentUrl} />
                            {isFullscreen && isIdle && (
                                <div className="absolute inset-0 z-50 bg-black/0" />
                            )}
                        </div>
                    )}
                </div>

                {/* Sub-content Section */}
                <div className="container mx-auto px-4 mt-8 space-y-12">
                    {/* Movie Info Section */}
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        {/* Poster */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-40 md:w-56 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10 shrink-0 self-center md:self-auto"
                        >
                            <img
                                src={movie?.poster || poster || ""}
                                alt={title || ""}
                                className="w-full h-full object-cover"
                            />
                        </motion.div>

                        {/* Content */}
                        <div className="flex-1 space-y-6">
                            <h2 className="text-3xl md:text-5xl font-display font-black text-white leading-tight">
                                {movie?.title || title}
                            </h2>

                            <div className="flex flex-wrap items-center gap-4 text-sm md:text-base font-bold text-white/60">
                                <div className="flex items-center gap-1.5 text-yellow-500">
                                    <Star className="w-4 h-4 fill-current" />
                                    <span>{movie?.rating || "8.5"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>{movie?.year || "2024"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Globe className="w-4 h-4" />
                                    <span className="uppercase">{movie?.type || "tv"}</span>
                                </div>
                                {movie?.genre && (
                                    <div className="flex gap-2">
                                        {movie.genre.split(',').map((g: string, i: number) => (
                                            <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-md text-[10px] md:text-xs text-white/80">
                                                {g.trim()}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <p className="text-sm md:text-lg text-white/50 leading-relaxed font-medium max-w-4xl">
                                {movie?.description || "Sinopsis tidak tersedia untuk judul ini. Tonton sekarang untuk mengetahui cerita lengkapnya!"}
                            </p>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px w-full bg-white/5" />

                    {/* Recommendations */}
                    <RecommendationSection />
                </div>
            </main >

            <Footer variant="full" />
        </div >
    );
}


