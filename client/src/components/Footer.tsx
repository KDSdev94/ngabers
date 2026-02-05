import { Link } from "wouter";
import { ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FooterProps {
    variant?: 'full' | 'simple';
}

export function Footer({ variant = 'full' }: FooterProps) {
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 400);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (variant === 'simple') {
        return (
            <footer className="bg-background dark:bg-black border-t border-white/5 mt-auto">
                <div className="container mx-auto px-4 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <Link href="/" className="flex items-center gap-2 group cursor-pointer">
                        <img
                            src="/header.png"
                            alt="Ngabers Logo"
                            className="h-6 md:h-8 w-auto object-contain"
                        />
                    </Link>
                    <p className="text-[10px] uppercase tracking-widest text-white/20">
                        © 2026 Ngabers. All rights reserved.
                    </p>
                </div>
            </footer>
        );
    }

    return (
        <footer className="bg-background dark:bg-[#0a0a0a] border-t border-white/5 pt-16 mt-auto overflow-hidden">
            <div className="container mx-auto px-4">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
                    {/* Logo & Description */}
                    <div className="lg:col-span-5 space-y-6">
                        <Link href="/" className="inline-block">
                            <img
                                src="/header.png"
                                alt="Ngabers Logo"
                                className="h-10 md:h-14 w-auto object-contain"
                            />
                        </Link>
                        <p className="text-white text-[13px] leading-relaxed max-w-xl">
                            Ngabers adalah platform streaming film, series, anime, dan drakor subtitle Indonesia
                            terbaik. Kami menyediakan kualitas tayangan premium secara gratis dengan dukungan server
                            yang cepat dan stabil. Tidak seperti platform lainnya, Ngabers berkomitmen memberikan
                            pengalaman nonton film berkualitas tinggi tanpa biaya langganan, memastikan akses hiburan
                            terjangkau bagi seluruh masyarakat Indonesia.
                        </p>
                    </div>

                    {/* Link Columns */}
                    <div className="lg:col-span-7 grid grid-cols-2 gap-8 md:gap-4 lg:pl-12">
                        <div className="flex flex-col gap-4">
                            <h4 className="text-[11px] font-bold text-white/80 uppercase tracking-[0.2em]">Genre</h4>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-2">
                                {[
                                    { name: 'Action', href: '/search?q=Action' },
                                    { name: 'Romance', href: '/search?q=Romance' },
                                    { name: 'Horror', href: '/search?q=Horror' },
                                    { name: 'Comedy', href: '/search?q=Comedy' },
                                    { name: 'Anime', href: '/category/anime' },
                                    { name: 'K-Drama', href: '/category/kdrama' },
                                    { name: 'Adventure', href: '/search?q=Adventure' },
                                    { name: 'Sci-Fi', href: '/search?q=Sci-Fi' }
                                ].map(item => (
                                    <li key={item.name}>
                                        <Link href={item.href} className="text-[13px] text-primary hover:text-primary/80 transition-colors font-medium cursor-pointer">
                                            {item.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="flex flex-col gap-4">
                            <h4 className="text-[11px] font-bold text-white/80 uppercase tracking-[0.2em]">Social Media</h4>
                            <ul className="space-y-2">
                                {[
                                    { name: 'Instagram', url: 'https://www.instagram.com/kdwiisap_/' },
                                    { name: 'TikTok', url: 'https://www.tiktok.com/@veyvy4?_r=1&_t=ZT-93fNRv7CAyj' },
                                    { name: 'Facebook', url: '#' },
                                ].map(item => (
                                    <li key={item.name}>
                                        <a href={item.url} className="text-[13px] text-primary hover:text-primary/80 transition-colors font-medium">{item.name}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Credits Section - PINNED TO BOTTOM */}
            <div className="bg-black/40 py-5 border-t border-white/5">
                <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[11px] text-white uppercase tracking-[0.1em] font-medium">
                        © 2026 Ngabers. Streaming Film & Series Gratis.
                    </p>

                    <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2">
                        {['Discord', 'Telegram', 'Instagram'].map((item, idx) => (
                            <div key={item} className="flex items-center">
                                <a href="#" className="text-[11px] text-white/40 hover:text-white transition-colors uppercase tracking-widest font-bold">{item}</a>
                                {idx < 5 && <span className="ml-6 hidden md:inline text-white/10 opacity-30">|</span>}
                            </div>
                        ))}
                    </div>

                    <AnimatePresence>
                        {showScrollTop && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.5, y: 20 }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                className="fixed bottom-6 right-6 md:bottom-8 md:right-8 w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-2xl shadow-primary/40 z-[100] border border-white/20 hover:bg-primary/90 transition-colors"
                            >
                                <ChevronUp className="w-5 h-5 md:w-6 md:h-6" />
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </footer>
    );
}
