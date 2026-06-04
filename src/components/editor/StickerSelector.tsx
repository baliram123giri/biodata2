"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useBiodataStore } from "@/store/useBiodataStore";
import { useThemeStore } from "@/store/useThemeStore";
import { cn } from "@/lib/utils";
import { Sparkles, Plus, Loader2 } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { STICKER_ASSETS, type StickerAsset } from "@/lib/sticker-assets";

const StickerItem = React.memo(function StickerItem({
  sticker,
  themeColor,
  onAdd
}: {
  sticker: StickerAsset;
  themeColor: string;
  onAdd: (id: string) => void;
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <button
      onClick={() => onAdd(sticker.id)}
      className="group relative flex flex-col items-center cursor-pointer gap-3 p-1.5 rounded-2xl border border-stitch-outline/10 bg-white/50 hover:bg-white hover:border-stitch-primary/30 transition-all hover:shadow-xl hover:-translate-y-1 w-full"
    >
      <div className="relative w-full aspect-square flex items-center justify-center overflow-hidden rounded-xl bg-black/[0.02]">
        {sticker.type === 'image' ? (
          <>
            {!isLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/5 animate-pulse rounded-xl">
                <div className="w-8 h-8 rounded-full bg-black/10" />
              </div>
            )}
            <Image
              src={sticker.url || ""}
              alt={`Decorative sticker: ${sticker.name}`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 15vw"
              onLoad={() => setIsLoaded(true)}
              className={cn(
                "object-contain p-1.5 transition-opacity duration-300",
                isLoaded ? "opacity-100" : "opacity-0"
              )}
            />
          </>
        ) : (
          <svg
            viewBox={sticker.viewBox}
            className="w-10 h-10 transition-colors"
            style={{ fill: themeColor }}
          >
            <path d={sticker.path} />
          </svg>
        )}
      </div>

      <div className="flex flex-col items-center">
        <span className="text-[13px] font-bold text-stitch-on-surface-variant uppercase tracking-wider text-center">{sticker.name}</span>
      </div>

      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-5 h-5 rounded-full bg-stitch-primary flex items-center justify-center shadow-lg">
          <Plus className="w-3 h-3 text-white" />
        </div>
      </div>
    </button>
  );
});

export const StickerSelector = React.memo(function StickerSelector({ onSelect }: { onSelect?: () => void }) {
  const { addSticker } = useBiodataStore();
  const theme = useThemeStore();

  // Fetch dynamic custom stickers from database using useInfiniteQuery
  const {
    data: customStickersInfiniteData,
    isLoading: isCustomStickersLoading,
    fetchNextPage: fetchNextCustomPage,
    hasNextPage: hasNextCustomPage,
    isFetchingNextPage: isFetchingNextCustomPage,
  } = useInfiniteQuery({
    queryKey: ["stickers"],
    queryFn: async ({ pageParam }) => {
      const url = pageParam 
        ? `/api/stickers?limit=10&cursor=${pageParam}`
        : `/api/stickers?limit=10`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load custom stickers");
      const json = await res.json();
      return json as { stickers: any[]; nextCursor: string | null };
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: Infinity, // Cache until page refresh
  });

  // Dynamically register new custom stickers as they are loaded so that the Konva stage knows their image URLs
  React.useEffect(() => {
    if (customStickersInfiniteData) {
      const allFetchedStickers = customStickersInfiniteData.pages.flatMap((page) => page.stickers);
      if (allFetchedStickers.length > 0) {
        import("@/lib/sticker-assets").then(({ registerDynamicStickers }) => {
          registerDynamicStickers(allFetchedStickers);
        });
      }
    }
  }, [customStickersInfiniteData]);

  // Combine static predefined STICKER_ASSETS and paginated custom stickers
  const dynamicStickers = customStickersInfiniteData
    ? customStickersInfiniteData.pages.flatMap((page) => page.stickers.map((s: any) => ({
        id: s.id,
        name: s.name,
        type: "image" as const,
        url: s.url,
      })))
    : [];

  const combinedStickers = dynamicStickers;

  // Infinite Scroll Trigger logic
  const observerTarget = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!observerTarget.current || !hasNextCustomPage || isFetchingNextCustomPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextCustomPage();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [hasNextCustomPage, isFetchingNextCustomPage, fetchNextCustomPage]);

  const handleAddSticker = (type: string) => {
    addSticker({
      type,
      x: 100, // Default drop position
      y: 100,
      scaleX: 0.8,
      scaleY: 0.8,
    });
    if (onSelect) {
      onSelect();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {!isCustomStickersLoading && combinedStickers.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl border border-stitch-primary/10 bg-gradient-to-br from-white/80 via-white/50 to-stitch-primary/[0.02] p-6 text-center shadow-md backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:border-stitch-primary/20 flex flex-col items-center justify-center gap-4 group">
          {/* Subtle background glow decorator */}
          <div className="absolute -right-10 -top-10 w-24 h-24 rounded-full bg-stitch-primary/5 blur-2xl group-hover:bg-stitch-primary/10 transition-colors duration-500" />
          <div className="absolute -left-10 -bottom-10 w-24 h-24 rounded-full bg-stitch-primary/5 blur-2xl group-hover:bg-stitch-primary/10 transition-colors duration-500" />

          {/* Icon frame with golden/crimson gradient */}
          <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-stitch-primary/10 to-stitch-primary/5 border border-stitch-primary/20 text-stitch-primary shadow-inner group-hover:scale-110 transition-transform duration-300">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>

          <div className="space-y-1.5 z-10">
            <h4 className="text-xs font-bold text-stitch-on-surface uppercase tracking-wider">
              No Stickers Available
            </h4>
            <p className="text-[10px] text-stitch-on-surface-variant/70 leading-relaxed max-w-[200px] mx-auto">
              Ready to decorate? Upload custom matrimonial stickers from the Admin Panel to see them here!
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {combinedStickers.map((sticker) => (
            <StickerItem
              key={sticker.id}
              sticker={sticker}
              themeColor={theme.primaryColor}
              onAdd={handleAddSticker}
            />
          ))}
        </div>
      )}

      {/* Infinite scrolling bottom loader target */}
      <div ref={observerTarget} className="h-12 flex items-center justify-center mt-4">
        {(isCustomStickersLoading || isFetchingNextCustomPage) && (
          <Loader2 className="w-5 h-5 animate-spin text-stitch-primary" />
        )}
      </div>
    </div>
  );
});
