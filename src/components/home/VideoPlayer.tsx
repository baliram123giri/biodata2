"use client";

import { useState } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Play } from "lucide-react";

const VIDEO_ID = "tSXLftIk8Fg";

/**
 * VideoPlayer — client-only island.
 * Handles the play/iframe toggle; everything else is SSR in VideoSection.
 */
export function VideoPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="relative rounded-3xl border border-[#C9A84C]/30 bg-white/55 dark:bg-stone-900/35 p-2 md:p-3 shadow-xl backdrop-blur-sm max-w-3xl mx-auto group">
      {/* Subtle hover glow border */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-[#C9A84C]/10 via-transparent to-[#9B1B30]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="overflow-hidden rounded-2xl border border-stone-200/50 dark:border-stone-800 shadow-inner bg-black relative">
        <AspectRatio ratio={16 / 9}>
          {isPlaying ? (
            <iframe
              src={`https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1`}
              title="How to Create Marriage Biodata Online – Step by Step Video Tutorial"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full object-cover"
            />
          ) : (
            <button
              onClick={() => setIsPlaying(true)}
              className="w-full h-full relative block overflow-hidden group/btn focus:outline-hidden cursor-pointer"
              aria-label="Play marriage biodata video tutorial"
            >
              {/* YouTube Thumbnail — loaded as SSR-friendly <img> */}
              <img
                src={`https://img.youtube.com/vi/${VIDEO_ID}/maxresdefault.jpg`}
                alt="Marriage Biodata Tutorial – How to fill in details, pick a template and download"
                width={1280}
                height={720}
                className="w-full h-full object-cover transition-transform duration-700 group-hover/btn:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${VIDEO_ID}/hqdefault.jpg`;
                }}
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/30 group-hover/btn:bg-black/40 transition-colors duration-300" />

              {/* Play Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* Ripple */}
                  <div className="absolute -inset-4 bg-[#C9A84C]/30 rounded-full animate-ping opacity-75" />
                  <div className="absolute -inset-2 bg-[#9B1B30]/20 rounded-full" />
                  <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-primary border-2 border-[#C9A84C]/60 flex items-center justify-center shadow-lg transform group-hover/btn:scale-110 active:scale-95 transition-all duration-300">
                    <Play className="w-6 h-6 md:w-8 md:h-8 text-white fill-white ml-1 animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Hover hint */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-xs text-white border border-[#C9A84C]/30 text-xs font-bold px-4 py-1.5 rounded-full opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300">
                Click to Play Video Tutorial
              </div>
            </button>
          )}
        </AspectRatio>
      </div>
    </div>
  );
}
