import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
      <div className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle className="w-12 h-12 text-destructive" />
      </div>
      
      <h1 className="text-5xl font-display font-black text-white mb-4">404</h1>
      <p className="text-xl text-white/60 mb-8 max-w-md">
        Whoops! It looks like you've wandered into the void. The page you're looking for doesn't exist.
      </p>

      <Link href="/">
        <Button size="lg" className="bg-white text-black hover:bg-white/90 font-bold rounded-xl px-8">
          Return Home
        </Button>
      </Link>
    </div>
  );
}
