"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Tilt from "react-parallax-tilt";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

interface Slide {
  id: string;
  imageUrl: string;
  title: string | null;
}

export function HeroCardDeck({ slides }: { slides: Slide[] }) {
  const [activeIdx, setActiveIdx] = useState(1); // Default focus: middle layout
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [selectedSlide, setSelectedSlide] = useState<Slide | null>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Setup autoplay to cycle between templates smoothly
  const startAutoplay = () => {
    stopAutoplay();
    autoPlayRef.current = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % slides.length);
    }, 5000);
  };

  const stopAutoplay = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
  };

  useEffect(() => {
    if (!isHovered) {
      startAutoplay();
    } else {
      stopAutoplay();
    }
    return () => stopAutoplay();
  }, [slides.length, isHovered]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIdx((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIdx((prev) => (prev + 1) % slides.length);
  };

  const handleCardClick = (index: number) => {
    if (index === activeIdx) {
      // Click active: zoom open high-res lightbox
      setSelectedSlide(slides[index]);
    } else {
      // Switch active card
      setActiveIdx(index);
    }
  };

  return (
    <div className="relative w-full flex flex-col items-center select-none overflow-visible">
      
      {/* 3D Overlapping Paper Stack Container */}
      <div 
        className="relative w-full h-[450px] md:h-[490px] flex items-center justify-center perspective-[1200px] overflow-visible"
        style={{ transformStyle: "preserve-3d" }}
      >
        {slides.map((slide, index) => {
          // Calculate looped relative position offsets
          const diff = (index - activeIdx + slides.length) % slides.length;
          
          let transformX = 0;
          let scale = 0.88;
          let rotateZ = 0;
          let zIndex = 10;
          let opacity = 0.96; // High visibility readability for side templates
          let targetZ = -40;
          const isCenter = diff === 0;

          if (isCenter) {
            transformX = 0;
            scale = 1.0;
            rotateZ = 0;
            zIndex = 30;
            opacity = 1.0;
            targetZ = 60;
          } else if (diff === 1 || (diff === -2 && slides.length === 3)) {
            // Right Card: angled slightly clockwise, shifted right
            transformX = 32; // Overlaps perfectly
            scale = 0.88;
            rotateZ = 5; // Clean physical rotation angle
            zIndex = 20;
            targetZ = -30;
          } else {
            // Left Card: angled slightly counter-clockwise, shifted left
            transformX = -32; // Overlaps perfectly
            scale = 0.88;
            rotateZ = -5; // Clean physical rotation angle
            zIndex = 10;
            targetZ = -30;
          }

          return (
            <motion.div
              key={slide.id}
              onClick={() => handleCardClick(index)}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              animate={{
                x: `${transformX}%`,
                scale,
                rotateZ,
                z: targetZ,
                opacity,
              }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 26,
              }}
              style={{
                zIndex,
                position: "absolute",
                width: "50%", // Sized perfectly to stack and fit the container width
                transformStyle: "preserve-3d",
              }}
              className={cn(
                "aspect-[595/842] rounded-none overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-card cursor-pointer border-none",
                isCenter ? "shadow-[#C9A84C]/20" : "shadow-black/25"
              )}
            >
              <Tilt
                tiltEnable={isCenter}
                tiltMaxAngleX={12}
                tiltMaxAngleY={12}
                perspective={1000}
                scale={1.02}
                glareEnable={isCenter}
                glareMaxOpacity={0.18}
                glareColor="#ffffff"
                glarePosition="all"
                glareBorderRadius="0px"
                style={{ width: "100%", height: "100%", transformStyle: "preserve-3d" }}
              >
                {/* 100% Unclipped, No Border-Padding Image Render */}
                <div 
                  className="relative rounded-none overflow-hidden h-full w-full bg-transparent flex items-center justify-center"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <img
                    src={slide.imageUrl}
                    alt={slide.title || "Premium template layout"}
                    className="w-full h-full object-contain select-none"
                    style={{ 
                      transform: isCenter ? "translateZ(25px) scale(0.97)" : "translateZ(0px)",
                      transformStyle: "preserve-3d",
                    }}
                    loading="eager"
                  />
                </div>
              </Tilt>
            </motion.div>
          );
        })}
      </div>

      {/* Premium Glassmorphic Controls */}
      <div className="flex items-center gap-4 mt-8 z-30">
        <button
          onClick={handlePrev}
          className="w-10 h-10 rounded-full border border-[#C9A84C]/35 bg-[#FBF5E6]/60 dark:bg-[#8A7233]/15 text-foreground hover:bg-[#C9A84C]/15 dark:hover:bg-[#C9A84C]/15 flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer backdrop-blur-sm"
          title="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Dynamic Dot Indicators */}
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => handleCardClick(i)}
              className={cn(
                "h-2 rounded-full transition-all duration-300 cursor-pointer",
                i === activeIdx ? "w-6 bg-[#C9A84C]" : "w-2 bg-[#C9A84C]/30 hover:bg-[#C9A84C]/50"
              )}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="w-10 h-10 rounded-full border border-[#C9A84C]/35 bg-[#FBF5E6]/60 dark:bg-[#8A7233]/15 text-foreground hover:bg-[#C9A84C]/15 dark:hover:bg-[#C9A84C]/15 flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer backdrop-blur-sm"
          title="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* High-Resolution Glassmorphic Lightbox Modal (Radix UI Primitive Dialog) */}
      <Dialog open={!!selectedSlide} onOpenChange={(open) => !open && setSelectedSlide(null)}>
        <DialogContent className="max-w-2xl bg-transparent border-none p-0 shadow-none flex flex-col items-center justify-center outline-none">
          {/* Uncompressed Full-Quality Image Render - 100% Pure & Borderless */}
          <div className="relative w-full overflow-hidden aspect-[595/842] flex items-center justify-center bg-transparent border-none">
            {selectedSlide && (
              <img
                src={selectedSlide.imageUrl}
                alt={selectedSlide.title || "High resolution template detail"}
                className="w-full h-full object-contain select-none"
                style={{ imageRendering: "auto" }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
