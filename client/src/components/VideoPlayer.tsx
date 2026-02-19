import { useState, useEffect, useRef } from "react";
import { Loader2, AlertCircle, RefreshCw, Maximize, Minimize } from "lucide-react";

interface VideoPlayerProps {
  url: string;
}

export function VideoPlayer({ url }: VideoPlayerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle fullscreen change & auto-rotate
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFs = document.fullscreenElement !== null;
      setIsFullscreen(isFs);

      // Auto-rotate to landscape when entering fullscreen
      if (isFs && screen.orientation) {
        screen.orientation.lock('landscape').catch((err) => {
          console.log('Screen orientation lock not supported or failed:', err);
        });
      } else if (!isFs && screen.orientation) {
        screen.orientation.unlock();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Handle timeout
  useEffect(() => {
    if (!loading) return;

    const timer = setTimeout(() => {
      if (loading) {
        console.warn("Video loading timed out after 25s");
        setError(true);
        setLoading(false);
      }
    }, 25000); // 25 seconds timeout

    return () => clearTimeout(timer);
  }, [loading, retryCount]);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      try {
        await containerRef.current.requestFullscreen();
      } catch (err) {
        console.error('Failed to enter fullscreen:', err);
      }
    } else {
      try {
        await document.exitFullscreen();
      } catch (err) {
        console.error('Failed to exit fullscreen:', err);
      }
    }
  };

  if (!url) return null;

  const handleRetry = () => {
    setError(false);
    setLoading(true);
    setRetryCount(prev => prev + 1);
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl shadow-black/50 ring-1 ring-white/10 group"
    >
      {loading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 z-10">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
          <p className="text-white/60 font-medium">Menyambungkan ke server...</p>
          <p className="text-white/30 text-xs mt-2 uppercase tracking-widest">Sabar ya, lagi loading...</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 z-10 p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Gagal Memuat Video</h3>
          <p className="text-white/60 text-sm max-w-sm mb-8">
            Server lagi sibuk atau koneksi internet kamu ngelag.
            Coba pake VPN atau ganti jaringan internet.
          </p>
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-2xl hover:bg-primary/80 transition-all active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            Coba Lagi
          </button>
        </div>
      )}

      {!error && (
        <iframe
          key={`${url}-${retryCount}`}
          src={url}
          className="w-full h-full border-0"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          sandbox="allow-forms allow-scripts allow-pointer-lock allow-same-origin allow-top-navigation"
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
        />
      )}

      {/* Fullscreen Toggle Button */}
      <button
        onClick={toggleFullscreen}
        className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black/80 rounded-lg text-white/80 hover:text-white transition-all opacity-0 group-hover:opacity-100 z-20"
        title={isFullscreen ? "Keluar fullscreen" : "Fullscreen"}
      >
        {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
      </button>

      {/* Cinematic Vignette */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] rounded-2xl" />
    </div>
  );
}
