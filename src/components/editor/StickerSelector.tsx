"use client";

import React from "react";
import { useBiodataStore } from "@/store/useBiodataStore";
import { useThemeStore } from "@/store/useThemeStore";
import { cn } from "@/lib/utils";
import { Sparkles, Plus } from "lucide-react";


import { STICKER_ASSETS } from "@/lib/sticker-assets";

export function StickerSelector({ onSelect }: { onSelect?: () => void }) {
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
          <button
            key={sticker.id}
            onClick={() => handleAddSticker(sticker.id)}
            className="group relative flex flex-col items-center cursor-pointer gap-3 p-1 rounded-2xl border border-stitch-outline/10 bg-white/50 hover:bg-white hover:border-stitch-primary/30 transition-all hover:shadow-xl hover:-translate-y-1"
          >
            <div className=" flex items-center justify-center  overflow-hidden">
              {sticker.type === 'image' ? (
                <img
                  src={sticker.url}
                  alt={sticker.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <svg
                  viewBox={sticker.viewBox}
                  className="w-10 h-10 transition-colors"
                  style={{ fill: theme.primaryColor }}
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
}
