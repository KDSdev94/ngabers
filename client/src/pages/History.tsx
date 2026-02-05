import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useHistory } from "@/hooks/use-history";
import { MovieCard } from "@/components/MovieCard";
import { Trash2, History as HistoryIcon, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";

export default function History() {
    const { history, clearHistory, removeFromHistory } = useHistory();
    const [location, setLocation] = useLocation();

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 pt-24 pb-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                    <div className="space-y-1">
                        <button
                            onClick={() => window.history.back()}
                            className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors text-sm font-bold mb-2 group"
                        >
                            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                            KEMBALI
                        </button>
                        <h1 className="text-4xl md:text-5xl font-display font-black text-white tracking-tight flex items-center gap-4">
                            <HistoryIcon className="w-10 h-10 text-primary" />
                            HISTORY
                        </h1>
                        <p className="text-white/40 font-medium">Riwayat tontonan khusus di perangkat ini</p>
                    </div>

                    {history.length > 0 && (
                        <Button
                            variant="destructive"
                            onClick={clearHistory}
                            className="rounded-xl gap-2 font-bold"
                        >
                            <Trash2 className="w-4 h-4" /> Hapus Semua
                        </Button>
                    )}
                </div>

                <AnimatePresence mode="popLayout">
                    {history.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                            {history.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="relative group"
                                >
                                    <MovieCard
                                        movie={{
                                            id: item.id,
                                            title: item.title,
                                            poster: item.poster,
                                            rating: 0,
                                            year: "",
                                            type: "movie",
                                            detailPath: item.path || "",
                                            genre: ""
                                        }}
                                    />

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeFromHistory(item.id);
                                        }}
                                        className="absolute top-2 right-2 p-2 bg-black/60 backdrop-blur-md rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <div className="mt-2 text-[10px] text-white/30 font-bold uppercase tracking-widest">
                                        {item.epTitle || "Dilihat"}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center py-20 text-center space-y-4"
                        >
                            <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-4">
                                <HistoryIcon className="w-10 h-10 text-white/10" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Belum ada riwayat</h2>
                            <p className="text-white/40 max-w-xs mx-auto">Film yang Anda tonton akan muncul di sini khusus untuk perangkat ini.</p>
                            <Button
                                onClick={() => setLocation("/")}
                                className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl px-8"
                            >
                                Mulai Menonton
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <Footer variant="full" />
        </div>
    );
}
