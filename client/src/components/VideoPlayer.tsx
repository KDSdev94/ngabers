import { useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";

interface VideoPlayerProps {
  url: string;
}

export function VideoPlayer({ url }: VideoPlayerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Note: Most streaming APIs return an iframe URL. 
  // We need to ensure we handle it securely.

  if (!url) return null;

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl shadow-black/50 ring-1 ring-white/10 group">
      {loading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 z-10">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
          <p className="text-white/60 font-medium">Loading stream...</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 z-10">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-white font-medium">Unable to load video</p>
          <p className="text-white/40 text-sm mt-2">Source might be unavailable</p>
        </div>
      )}

      <iframe
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

      {/* Cinematic Vignette */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] rounded-2xl" />
    </div>
  );
}
