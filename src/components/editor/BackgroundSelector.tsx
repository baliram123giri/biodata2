"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useThemeStore } from "@/store/useThemeStore";
import { useShallow } from "zustand/react/shallow";
import { cn } from "@/lib/utils";
import { ImageIcon, Check, Trash2, Loader2 } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Slider } from "@/components/ui/slider";

const BackgroundItem = React.memo(function BackgroundItem({
  url,
  name,
  isSelected,
  onSelect,
}: {
  url: string;
  name: string;
  isSelected: boolean;
  onSelect: (url: string) => void;
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <button
      onClick={() => onSelect(url)}
      className={cn(
        "group relative flex flex-col items-center cursor-pointer gap-2 p-1.5 rounded-2xl border transition-all hover:shadow-xl w-full",
        isSelected
          ? "border-stitch-primary bg-white shadow-md scale-[1.02]"
          : "border-stitch-outline/10 bg-white/50 hover:bg-white hover:border-stitch-primary/30 hover:-translate-y-1"
      )}
    >
      <div className="relative w-full aspect-[595/842] flex items-center justify-center overflow-hidden rounded-xl bg-black/[0.02]">
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/5 animate-pulse rounded-xl">
            <div className="w-8 h-8 rounded-full bg-black/10" />
          </div>
        )}
        <Image
          src={url || ""}
          alt={`Watermark background: ${name}`}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 15vw"
          onLoad={() => setIsLoaded(true)}
          className={cn(
            "object-cover transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
        />

        {isSelected && (
          <div className="absolute inset-0 bg-stitch-primary/10 backdrop-blur-[0.5px] transition-all flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-stitch-primary flex items-center justify-center shadow-lg animate-in zoom-in duration-200">
              <Check className="w-4 h-4 text-white stroke-[3]" />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center px-1 w-full">
        <span className="text-[10px] font-extrabold text-stitch-on-surface truncate w-full text-center">
          {name}
        </span>
      </div>
    </button>
  );
});

export const BackgroundSelector = React.memo(function BackgroundSelector({ onSelect }: { onSelect?: () => void }) {
  const theme = useThemeStore(useShallow(s => ({
    bgImageUrl: s.bgImageUrl,
    bgImageOpacity: s.bgImageOpacity,
    bgImageScale: s.bgImageScale,
    bgImageXOffset: s.bgImageXOffset,
    bgImageYOffset: s.bgImageYOffset,
    setBgImageUrl: s.setBgImageUrl,
    setBgImageOpacity: s.setBgImageOpacity,
    setBgImageScale: s.setBgImageScale,
    setBgImageXOffset: s.setBgImageXOffset,
    setBgImageYOffset: s.setBgImageYOffset,
  })));

  const {
    data: customBackgroundsInfiniteData,
    isLoading: isBackgroundsLoading,
    fetchNextPage: fetchNextPage,
    hasNextPage: hasNextPage,
    isFetchingNextPage: isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["backgrounds"],
    queryFn: async ({ pageParam }) => {
      const url = pageParam 
        ? `/api/backgrounds?limit=10&cursor=${pageParam}`
        : `/api/backgrounds?limit=10`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load custom backgrounds");
      const json = await res.json();
      return json as { backgrounds: any[]; nextCursor: string | null };
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: Infinity,
  });

  const backgroundsList = customBackgroundsInfiniteData
    ? customBackgroundsInfiniteData.pages.flatMap((page) => page.backgrounds)
    : [];

  const observerTarget = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!observerTarget.current || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSelectBackground = (url: string) => {
    theme.setBgImageUrl(url);
    if (onSelect) {
      onSelect();
    }
  };

  const handleRemoveBackground = () => {
    theme.setBgImageUrl(null);
    if (onSelect) {
      onSelect();
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {theme.bgImageUrl && (
        <div className="space-y-4 border border-stitch-outline/10 bg-white/50 p-4 rounded-2xl animate-fade-in shadow-inner">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-black text-stitch-on-surface uppercase tracking-wider">Watermark Settings</h4>
            <button
              onClick={handleRemoveBackground}
              className="flex items-center justify-center gap-1 py-1 px-2 rounded-lg border border-red-200 bg-red-50/70 hover:bg-red-50 text-red-700 text-[9px] font-bold transition-all active:scale-95 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              Remove
            </button>
          </div>

          <div className="space-y-3.5 pt-2 border-t border-stitch-outline/5">
            {/* Opacity Slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[9px] font-bold text-stitch-on-surface-variant/80 uppercase">
                <span>Opacity</span>
                <span className="font-mono text-stitch-primary">{(theme.bgImageOpacity * 100).toFixed(0)}%</span>
              </div>
              <Slider
                min={0}
                max={1}
                step={0.01}
                value={[theme.bgImageOpacity]}
                onValueChange={(val) => theme.setBgImageOpacity(val[0])}
                className="w-full"
              />
            </div>

            {/* Scale Slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[9px] font-bold text-stitch-on-surface-variant/80 uppercase">
                <span>Scale / Size</span>
                <span className="font-mono text-stitch-primary">{(theme.bgImageScale * 100).toFixed(0)}%</span>
              </div>
              <Slider
                min={0.2}
                max={2.0}
                step={0.05}
                value={[theme.bgImageScale]}
                onValueChange={(val) => theme.setBgImageScale(val[0])}
                className="w-full"
              />
            </div>

            {/* X Offset Slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[9px] font-bold text-stitch-on-surface-variant/80 uppercase">
                <span>Horizontal Offset</span>
                <span className="font-mono text-stitch-primary">{theme.bgImageXOffset} px</span>
              </div>
              <Slider
                min={-300}
                max={300}
                step={2}
                value={[theme.bgImageXOffset]}
                onValueChange={(val) => theme.setBgImageXOffset(val[0])}
                className="w-full"
              />
            </div>

            {/* Y Offset Slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[9px] font-bold text-stitch-on-surface-variant/80 uppercase">
                <span>Vertical Offset</span>
                <span className="font-mono text-stitch-primary">{theme.bgImageYOffset} px</span>
              </div>
              <Slider
                min={-300}
                max={400}
                step={2}
                value={[theme.bgImageYOffset]}
                onValueChange={(val) => theme.setBgImageYOffset(val[0])}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      {!isBackgroundsLoading && backgroundsList.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl border border-stitch-primary/10 bg-gradient-to-br from-white/80 via-white/50 to-stitch-primary/[0.02] p-6 text-center shadow-md backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:border-stitch-primary/20 flex flex-col items-center justify-center gap-4 group">
          <div className="absolute -right-10 -top-10 w-24 h-24 rounded-full bg-stitch-primary/5 blur-2xl group-hover:bg-stitch-primary/10 transition-colors duration-500" />
          <div className="absolute -left-10 -bottom-10 w-24 h-24 rounded-full bg-stitch-primary/5 blur-2xl group-hover:bg-stitch-primary/10 transition-colors duration-500" />

          <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-stitch-primary/10 to-stitch-primary/5 border border-stitch-primary/20 text-stitch-primary shadow-inner group-hover:scale-110 transition-transform duration-300">
            <ImageIcon className="w-5 h-5 animate-pulse" />
          </div>

          <div className="space-y-1.5 z-10">
            <h4 className="text-xs font-bold text-stitch-on-surface uppercase tracking-wider">
              No Backgrounds Available
            </h4>
            <p className="text-[10px] text-stitch-on-surface-variant/70 leading-relaxed max-w-[200px] mx-auto">
              Custom backgrounds can be uploaded from the Admin Panel to be applied here!
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {backgroundsList.map((bg) => (
            <BackgroundItem
              key={bg.id}
              url={bg.url}
              name={bg.name}
              isSelected={theme.bgImageUrl === bg.url}
              onSelect={handleSelectBackground}
            />
          ))}
        </div>
      )}

      {/* Infinite scrolling loader */}
      <div ref={observerTarget} className="h-12 flex items-center justify-center mt-2">
        {(isBackgroundsLoading || isFetchingNextPage) && (
          <Loader2 className="w-5 h-5 animate-spin text-stitch-primary" />
        )}
      </div>
    </div>
  );
});
