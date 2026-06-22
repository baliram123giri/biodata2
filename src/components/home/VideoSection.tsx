// Server Component — no "use client" directive.
// All static markup (heading, subtitle, badge, layout, backgrounds) is
// rendered on the server. Only the interactive player toggle is delegated
// to the <VideoPlayer> client island.

import { Sparkles } from "lucide-react";
import { VideoPlayer } from "./VideoPlayer";

interface VideoSectionProps {
  title?: string;
  subtitle?: string;
  className?: string;
  inline?: boolean;
}

export function VideoSection({
  title = "How to Create Marriage Biodata Step-by-Step",
  subtitle = "Watch this quick guide to learn how to fill in your details, customize a template, and download your biodata with ease",
  className = "",
  inline = false,
}: VideoSectionProps) {
  if (inline) {
    return (
      <div className={`w-full space-y-8 ${className}`}>
        {(title || subtitle) && (
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 bg-[#FBF5E6]/90 dark:bg-[#8A7233]/25 px-4 py-1.5 rounded-full border border-[#C9A84C]/45 text-xs font-extrabold text-[#8A7233] dark:text-[#E6C97A] backdrop-blur-sm shadow-sm">
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-[#C9A84C]" />
              Video Tutorial
            </div>
            {title && (
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-white font-sans">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-stone-650 dark:text-stone-300 text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-semibold">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Client island — only the play button / iframe toggle needs JS */}
        <VideoPlayer />
      </div>
    );
  }

  return (
    <section
      className={`py-12 md:py-16 px-4 bg-[#FFFBF8] dark:bg-[#1A0A0E] relative overflow-hidden border-t border-border/30 ${className}`}
      aria-label="Video Tutorial"
    >
      {/* SSR-rendered decorative backgrounds */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(201,168,76,0.04)_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#C9A84C]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#9B1B30]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto max-w-4xl relative z-10 space-y-8 md:space-y-12">
        {/* SSR-rendered static text — visible to crawlers without JS */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-[#FBF5E6]/90 dark:bg-[#8A7233]/25 px-4 py-1.5 rounded-full border border-[#C9A84C]/45 text-xs font-extrabold text-[#8A7233] dark:text-[#E6C97A] backdrop-blur-sm shadow-sm">
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-[#C9A84C]" />
            Video Tutorial
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-stone-900 dark:text-white font-sans">
            {title}
          </h2>
          <p className="text-stone-650 dark:text-stone-300 text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-semibold">
            {subtitle}
          </p>
        </div>

        {/* Client island — only the play button / iframe toggle needs JS */}
        <VideoPlayer />
      </div>
    </section>
  );
}
