"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Maximize2, Sparkles, ZoomIn, Eye } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const SAMPLES = [
  {
    id: "1",
    src: "/preview_samples/Baliram Giri.jpeg",
    title: "Elegant Marathi Biodata Sample",
    community: "Marathi / Hindu",
    description: "A complete pre-filled matrimonial profile showcasing clean formatting, elegant styling, and proper photo frame integration."
  },
  {
    id: "2",
    src: "/preview_samples/effqtr5upgc4k4sp87cp.png",
    title: "Shubh Vivah Parichay",
    community: "Marathi / Regional",
    description: "A complete Marathi marriage biodata template featuring a crimson border, floral corner motifs, and traditional styling."
  },
  {
    id: "3",
    src: "/preview_samples/ewqlvpmwlvhpijrs72w6.png",
    title: "Watercolor Blue & Orange",
    community: "Hindi / Universal",
    description: "A clean and elegant Hindi marriage biodata template featuring a soft watercolor background with blue and orange tones."
  },
  {
    id: "4",
    src: "/preview_samples/nbmzkftttzofbvuis0uw.png",
    title: "Royal Gold Marathi Style",
    community: "Hindi / Marathi",
    description: "A traditional Hindi marriage biodata template with deep maroon backgrounds, gold borders, and clear layout."
  },
  {
    id: "5",
    src: "/preview_samples/template_preview_hq_1780654994849.png",
    title: "Premium Floral Heritage",
    community: "Traditional Hindu",
    description: "A premium matrimonial biodata design featuring intricate floral borders and gold ornamental frame accents."
  },
  {
    id: "6",
    src: "/preview_samples/vysbvo5lwv7wxhj2ahzw.png",
    title: "Traditional Marathi Parichay",
    community: "Marathi / Regional",
    description: "A beautifully structured marriage biodata template crafted for Marathi families, featuring elegant gold ornamental borders."
  },
  {
    id: "7",
    src: "/preview_samples/मराठी विवाह परिचय पत्र Template _ Marathi Marriage Biodata Design 2026 – Printable PDF_preview_hq_1780753314877 (1).png",
    title: "Marathi Vivah Parichay Patra",
    community: "मराठी / Regional",
    description: "The most trusted Marathi matrimonial biodata template of 2026, optimized for high-quality printing and sharing."
  }
];

export function SampleCarousel() {
  const [mounted, setMounted] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedTitle, setSelectedTitle] = useState<string>("");
  const [api, setApi] = useState<CarouselApi>();

  React.useEffect(() => {
    if (!api) return;
    const interval = setInterval(() => {
      api.scrollNext();
    }, 4000); // auto-slide every 4 seconds

    return () => clearInterval(interval);
  }, [api]);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <section className="py-16 bg-[#FFFBF8] dark:bg-[#1A0A0E] overflow-hidden relative border-t border-border/30">
        <div className="w-full px-4 md:px-12 relative z-10">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
              Browse Our Premium Biodata Samples
            </h2>
          </div>
          <div className="flex gap-6 overflow-hidden justify-center opacity-40">
            {SAMPLES.slice(0, 3).map((sample) => (
              <div key={sample.id} className="w-72 aspect-[595/842] border border-[#C9A84C]/25 rounded-2xl bg-stone-100 dark:bg-stone-900" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <TooltipProvider>
      <section className="py-16 bg-[#FFFBF8] dark:bg-[#1A0A0E] overflow-hidden relative border-t border-border/30">
        {/* Glow background effects */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-[#C9A84C]/5 dark:bg-[#C9A84C]/2 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-[#9B1B30]/5 dark:bg-[#9B1B30]/2 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="w-full px-4 md:px-12 relative z-10">
          {/* Header */}
          <div className="text-center mb-12 space-y-4">
            <div className="inline-flex items-center gap-1.5 bg-[#FBF5E6]/90 dark:bg-[#8A7233]/25 px-4.5 py-2 rounded-full border border-[#C9A84C]/45 text-xs font-black text-[#9B1B30] dark:text-[#E6C97A]">
              <Sparkles className="w-3.5 h-3.5" />
              Interactive Gallery
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground font-sans">
              Browse Our <span className="text-gradient-primary">Premium Biodata Samples</span>
            </h2>
            <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto leading-relaxed font-semibold">
              Click any template to zoom in and check its high-quality print preview.
            </p>
          </div>

          {/* Carousel */}
          <div className="relative px-2 md:px-12">
            <Carousel
              setApi={setApi}
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4 md:-ml-6">
                {SAMPLES.map((sample) => (
                  <CarouselItem
                    key={sample.id}
                    className="pl-4 md:pl-6 basis-[85%] sm:basis-1/2 md:basis-1/3"
                  >
                    <div className="premium-gold-border premium-gold-card group flex flex-col h-full bg-card border border-[#C9A84C]/20 dark:border-stone-850 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-[#C9A84C]/60 hover:-translate-y-1">
                      {/* Image Preview Area */}
                      <div
                        className="relative aspect-[595/842] w-full overflow-hidden bg-stone-50 dark:bg-stone-900 border-b border-[#C9A84C]/10 cursor-pointer"
                        onClick={() => {
                          setSelectedImage(sample.src);
                          setSelectedTitle(sample.title);
                        }}
                      >
                        <Image
                          src={sample.src}
                          alt={sample.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 30vw"
                          quality={75}
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2.5">
                          <span className="bg-white/95 dark:bg-stone-900/95 text-foreground px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                            <ZoomIn className="w-3.5 h-3.5 text-[#9B1B30] dark:text-[#E6C97A]" />
                            Zoom Preview
                          </span>
                        </div>
                      </div>

                      {/* Details Area */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-[#9B1B30] dark:text-[#E6C97A] bg-[#FFFBF8] dark:bg-[#1A0A0E] px-2.5 py-1 rounded-md border border-[#C9A84C]/30 inline-block">
                            {sample.community}
                          </span>
                          <h3 className="text-lg font-bold text-stone-900 dark:text-white pt-1">
                            {sample.title}
                          </h3>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {sample.description}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-stone-100 dark:border-stone-850 flex items-center justify-between">
                          <button
                            onClick={() => {
                              setSelectedImage(sample.src);
                              setSelectedTitle(sample.title);
                            }}
                            className="text-xs font-bold text-[#9B1B30] dark:text-[#E6C97A] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View Full Size
                          </button>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>

              {/* Navigation Controls */}
              <CarouselPrevious className="hidden md:flex absolute -left-12 top-1/2 -translate-y-1/2 bg-white/95 dark:bg-stone-900/95 hover:bg-white dark:hover:bg-stone-900 border-[#C9A84C]/45 hover:border-[#C9A84C] shadow-md" />
              <CarouselNext className="hidden md:flex absolute -right-12 top-1/2 -translate-y-1/2 bg-white/95 dark:bg-stone-900/95 hover:bg-white dark:hover:bg-stone-900 border-[#C9A84C]/45 hover:border-[#C9A84C] shadow-md" />
            </Carousel>
          </div>
        </div>

        {/* Zoom Dialog Modal (Using Radix Dialog) */}
        <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
          <DialogContent className="max-w-xl sm:max-w-2xl bg-white dark:bg-stone-950 p-3 sm:p-5 rounded-2xl border-[#C9A84C]/40 overflow-hidden shadow-2xl">
            <DialogTitle className="text-xl font-bold text-stone-900 dark:text-white px-2 py-1 border-b border-[#C9A84C]/25 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C9A84C]" />
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
