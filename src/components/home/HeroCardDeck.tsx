import React from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface Slide {
  id: string;
  imageUrl: string;
  title: string | null;
}

export function HeroCardDeck({ slides }: { slides: Slide[] }) {
  // Take exactly up to 3 slides to show side by side or in a simple stack
  const displaySlides = slides.slice(0, 3);

  return (
    <div className="w-full flex flex-row items-center justify-center gap-2 py-4 md:gap-4 md:py-8">
      {displaySlides.map((slide, index) => (
        <div
          key={slide.id}
          className={cn(
            "relative w-1/3 aspect-[595/842] rounded-md overflow-hidden shadow-lg border border-border/50",
            index === 1 ? "scale-110 z-10 shadow-xl border-[#C9A84C]/50" : "opacity-90 grayscale-[20%]"
          )}
        >
          <Image
            src={slide.imageUrl}
            alt={slide.title ? `Matrimonial biodata design template: ${slide.title}` : "Premium matrimonial biodata template design layout"}
            fill
            sizes="(max-width: 768px) 30vw, 180px"
            quality={75}
            className="object-cover animate-fade-in"
            priority={index === 1}
          />
        </div>
      ))}
    </div>
  );
}
