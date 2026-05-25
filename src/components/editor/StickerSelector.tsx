"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useBiodataStore } from "@/store/useBiodataStore";
import { useThemeStore } from "@/store/useThemeStore";
import { cn } from "@/lib/utils";
import { Sparkles, Plus } from "lucide-react";
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
              alt={sticker.name}
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
      <div className="grid grid-cols-2 gap-4">
        {STICKER_ASSETS.map((sticker) => (
          <StickerItem
            key={sticker.id}
            sticker={sticker}
            themeColor={theme.primaryColor}
            onAdd={handleAddSticker}
          />
        ))}
      </div>

      <div className="mt-8 p-4 rounded-xl bg-stitch-primary/5 border border-stitch-primary/10">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-stitch-primary" />
          <h4 className="text-[10px] font-bold text-stitch-primary uppercase tracking-widest">Designer Tip</h4>
        </div>
        <p className="text-[10px] text-stitch-on-surface-variant/80 leading-relaxed italic">
          Add sacred symbols to the header or corners of your biodata to create a traditional, auspicious look. 
          <br /><br />
          <strong>Pro Tip:</strong> Hold <strong>Alt</strong> while dragging a sticker to duplicate it!
        </p>
      </div>
    </div>
  );
});
