"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Sparkles, ZoomIn } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { TooltipProvider } from "@/components/ui/tooltip";

export interface TemplateSample {
  id: string;
  src: string;
  title: string;
  community: string;
  description?: string;
}

interface TemplateCarouselProps {
  samples: TemplateSample[];
  title?: React.ReactNode;
  subtitle?: string;
  badgeText?: string;
  themePrimary?: string;
  themeAccent?: string;
}

export function TemplateCarousel({
  samples,
  title = "Browse Our Premium Biodata Samples",
  subtitle = "Click any template to zoom in and check its high-quality print preview.",
  badgeText = "Interactive Gallery",
  themePrimary = "#9B1B30",
  themeAccent = "#C9A84C",
}: TemplateCarouselProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedTitle, setSelectedTitle] = useState<string>("");
  const [api, setApi] = useState<CarouselApi>();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = React.useRef<HTMLElement>(null);

  // Observe section visibility – only starts autoplay when carousel is on screen
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Autoplay – only fires when section is scrolled into view
  useEffect(() => {
    if (!api || !isVisible) return;
    const interval = setInterval(() => {
      api.scrollNext();
    }, 4000);
    return () => clearInterval(interval);
  }, [api, isVisible]);

  // Capture and restore scroll position to prevent any hydration-related jump
  useEffect(() => {
    const saved = window.scrollY;
    return () => {
      if (Math.abs(window.scrollY - saved) > 5) {
        window.scrollTo({ top: saved, behavior: "instant" });
      }
    };
  }, []);

  return (
    <TooltipProvider>
      <section
        ref={sectionRef}
        className="py-10 bg-[#FFFBF8] dark:bg-[#1A0A0E] overflow-hidden relative border-t border-border/30"
      >
        {/* Glow background effects */}
        <div
          className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-3xl pointer-events-none -z-10 opacity-10"
          style={{ backgroundColor: themeAccent }}
        />
        <div
          className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-3xl pointer-events-none -z-10 opacity-10"
          style={{ backgroundColor: themePrimary }}
        />

        <div className="w-full px-4 md:px-12 relative z-10">
          {/* Header */}
          <div className="text-center mb-12 space-y-4">
            <div
              className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-full border text-xs font-black backdrop-blur-sm"
              style={{
                borderColor: `${themeAccent}45`,
                backgroundColor: `${themeAccent}10`,
                color: themePrimary,
              }}
            >
              <Sparkles className="w-3.5 h-3.5" style={{ color: themeAccent }} />
              {badgeText}
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground font-sans">
              {title}
            </h2>
            <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto leading-relaxed font-semibold">
              {subtitle}
            </p>
          </div>

          {/* Carousel */}
          <div className="relative px-2 md:px-12">
            <Carousel
              setApi={setApi}
              opts={{
                align: "start",
                loop: true,
                watchFocus: false,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4 md:-ml-6">
                {samples.map((sample, index) => (
                  <CarouselItem
                    key={sample.id}
                    className="pl-4 md:pl-6 basis-[85%] sm:basis-1/2 md:basis-1/3"
                  >
                    <div
                      className="group flex flex-col h-full bg-card border rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                      style={{ borderColor: `${themeAccent}30` }}
                    >
                      {/* Image Preview Area */}
                      <div
                        className="relative aspect-[595/842] w-full overflow-hidden bg-stone-50 dark:bg-stone-900 border-b cursor-pointer"
                        style={{ borderBottomColor: `${themeAccent}15` }}
                        onClick={() => {
                          setSelectedImage(sample.src);
                          setSelectedTitle(sample.title);
                        }}
                      >
                        <Image
                          src={sample.src}
                          alt={sample.title}
                          fill
                          unoptimized
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 30vw"
                          quality={75}
                          priority={index < 2}
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2.5">
                          <span className="bg-white/95 dark:bg-stone-900/95 text-foreground px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                            <ZoomIn className="w-3.5 h-3.5" style={{ color: themeAccent }} />
                            Zoom Preview
                          </span>
                        </div>
                      </div>

                      {/* Details Area */}
                      <div className="pt-5 px-5 pb-[10px] space-y-1">
                        <span
                          className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border inline-block"
                          style={{
                            borderColor: `${themeAccent}40`,
                            backgroundColor: `${themeAccent}10`,
                            color: themePrimary,
                          }}
                        >
                          {sample.community}
                        </span>
                        <h3 className="text-lg font-bold text-stone-900 dark:text-white pt-1">
                          {sample.title}
                        </h3>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>

              {/* Navigation Controls */}
              <CarouselPrevious
                className="hidden md:flex absolute -left-12 top-1/2 -translate-y-1/2 bg-white/95 dark:bg-stone-900/95 hover:bg-white dark:hover:bg-stone-900 shadow-md"
                style={{ borderColor: `${themeAccent}45` }}
              />
              <CarouselNext
                className="hidden md:flex absolute -right-12 top-1/2 -translate-y-1/2 bg-white/95 dark:bg-stone-900/95 hover:bg-white dark:hover:bg-stone-900 shadow-md"
                style={{ borderColor: `${themeAccent}45` }}
              />
            </Carousel>
          </div>
        </div>

        {/* Zoom Dialog Modal (Using Radix Dialog) */}
        <Dialog
          open={!!selectedImage}
          onOpenChange={(open) => !open && setSelectedImage(null)}
        >
          <DialogContent
            className="max-w-xl sm:max-w-2xl bg-white dark:bg-stone-950 p-3 sm:p-5 rounded-2xl overflow-hidden shadow-2xl"
            style={{ borderColor: `${themeAccent}40` }}
          >
            <DialogTitle
              className="text-xl font-bold text-stone-900 dark:text-white px-2 py-1 border-b flex items-center gap-2"
              style={{ borderBottomColor: `${themeAccent}25` }}
            >
              <Sparkles className="w-4 h-4" style={{ color: themeAccent }} />
              {selectedTitle} - Print Quality Preview
            </DialogTitle>
            <DialogDescription className="sr-only">
              Full screen preview image of {selectedTitle} matrimonial biodata template.
            </DialogDescription>
            <div className="relative aspect-[595/842] w-full max-h-[80vh] bg-stone-50 dark:bg-stone-900 rounded-lg overflow-hidden mt-2 border border-border/60">
              {selectedImage && (
                <Image
                  src={selectedImage}
                  alt={selectedTitle}
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, 650px"
                  quality={75}
                  priority
                  className="object-contain"
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </section>
    </TooltipProvider>
  );
}
