import { useLocation } from "wouter";
import { useMovieDetail } from "@/hooks/use-movies";
import { useHistory } from "@/hooks/use-history";
import { Navbar } from "@/components/Navbar";
import { VideoPlayer } from "@/components/VideoPlayer";
import { Footer } from "@/components/Footer";
import { ArrowLeft, ArrowRight, Share2, Info, MessageSquare, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo } from "react";

export default function Watch() {
    const [location, setLocation] = useLocation();
    const [autoNext, setAutoNext] = useState(true);
    const { addToHistory } = useHistory();


    // Get current query params reactively
    const searchParams = new URLSearchParams(window.location.search);
    const currentUrl = searchParams.get("url");
    const title = searchParams.get("title");
    const epTitle = searchParams.get("epTitle");
    const poster = searchParams.get("poster");
    const path = searchParams.get("path");

    // Fetch full details to get the episode list for navigation
    const { data: movie } = useMovieDetail(path);

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

    // Save to history when movie data or the current episode URL is available
    useEffect(() => {
        if (title && (currentUrl || path)) {
            addToHistory({
                id: path || currentUrl || "unknown",
                title: title,
                poster: poster || "",
                path: path || undefined,
                epTitle: epTitle || undefined
            });
        }
    }, [title, currentUrl, path, poster, epTitle]);

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

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 pt-24 pb-12">
                {/* Cinematic Header (Title on Top) */}
                <div className="mb-8 space-y-4">
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
                            <Button variant="outline" size="sm" className="rounded-xl bg-white/5 border-white/10 gap-2 hover:bg-white/10">
                                <Share2 className="w-4 h-4" /> Share
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

                {/* Player Section */}
                <div className="space-y-6">
                    <div className="relative aspect-video rounded-[2rem] overflow-hidden bg-black shadow-2xl shadow-primary/10 border border-white/5 ring-1 ring-white/5">
                        <VideoPlayer url={currentUrl} />
                    </div>

                    {/* Episode Controls */}
                    <div className="flex items-center justify-between gap-4 py-2">
                        <div className="flex-1 max-w-[300px]">
                            <AnimatePresence mode="wait">
                                {prevEp && (
                                    <motion.button
                                        key={prevEp.url || prevEp.playerUrl}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        onClick={() => navigateToEpisode(prevEp)}
                                        className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-primary/30 transition-all group text-left"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                            <ArrowLeft className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Previous</p>
                                            <p className="text-sm font-bold text-white/80 line-clamp-1 group-hover:text-white">
                                                {prevEp.title || `Episode ${prevEp.episode}`}
                                            </p>
                                        </div>
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="hidden md:flex flex-col items-center">
                            <div className="flex items-center space-x-3 bg-white/5 px-5 py-3 rounded-2xl border border-white/5">
                                <Label htmlFor="auto-next" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 cursor-pointer">
                                    Auto Next
                                </Label>
                                <Switch
                                    id="auto-next"
                                    checked={autoNext}
                                    onCheckedChange={setAutoNext}
                                    className="data-[state=checked]:bg-primary"
                                />
                            </div>
                        </div>

                        <div className="flex-1 max-w-[300px]">
                            <AnimatePresence mode="wait">
                                {nextEp && (
                                    <motion.button
                                        key={nextEp.url || nextEp.playerUrl}
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        onClick={() => navigateToEpisode(nextEp)}
                                        className="w-full flex flex-1 flex-row-reverse items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-primary/30 transition-all group text-right"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                            <ArrowRight className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Next Episode</p>
                                            <p className="text-sm font-bold text-white/80 line-clamp-1 group-hover:text-white">
                                                {nextEp.title || `Episode ${nextEp.episode}`}
                                            </p>
                                        </div>
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Social / Comments Placeholder */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                        <div className="md:col-span-2 bg-card/30 border border-white/5 rounded-[2rem] p-8 flex items-center justify-center min-h-[150px]">
                            <div className="text-center space-y-3">
                                <MessageSquare className="w-10 h-10 text-white/10 mx-auto" />
                                <p className="text-white/40 font-medium tracking-wide">Comments coming soon...</p>
                                <p className="text-white/20 text-xs">Join the community to discuss this title!</p>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/10 rounded-[2rem] p-8 flex flex-col justify-center">
                            <h3 className="text-xl font-black text-white mb-4 tracking-tight">Enjoying Ngabers?</h3>
                            <p className="text-sm text-white/50 leading-relaxed mb-6">
                                Dukung kami dengan share ke teman-temanmu agar kami bisa terus menyediakan konten berkualitas secara gratis!
                            </p>
                            <Button className="w-full bg-primary hover:bg-primary/90 text-white font-black rounded-xl h-12 shadow-lg shadow-primary/20">
                                JOIN DISCORD
                            </Button>
                        </div>
                    </div>
                </div>
            </main>

            <Footer variant="full" />
        </div>
    );
}
