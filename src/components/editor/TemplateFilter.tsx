"use client";

import React, { useMemo, useRef, useEffect } from "react";
import { SlidersHorizontal, Globe, Check, X } from "lucide-react";
import { useBiodataStore } from "@/store/useBiodataStore";
import { cn } from "@/lib/utils";

const PRICE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "free", label: "Free" },
  { value: "premium", label: "Premium" },
] as const;

export function TemplateFilter() {
  const customTemplates = useBiodataStore((s) => s.customTemplates);
  const langFilter = useBiodataStore((s) => s.langFilter);
  const setLangFilter = useBiodataStore((s) => s.setLangFilter);
  const priceFilter = useBiodataStore((s) => s.priceFilter);
  const setPriceFilter = useBiodataStore((s) => s.setPriceFilter);

  const [open, setOpen] = React.useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const languagesList = useMemo(() => {
    const langs = new Set<string>();
    customTemplates.forEach((t) => {
      if (t.language) langs.add(t.language);
    });
    if (langs.size === 0) return [];
    return ["all", ...Array.from(langs)];
  }, [customTemplates]);

  const activeCount =
    (priceFilter !== "all" ? 1 : 0) + (langFilter !== "all" ? 1 : 0);

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-black transition-all cursor-pointer select-none",
          open || activeCount > 0
            ? "bg-primary text-white border-primary shadow-sm"
            : "bg-white/80 dark:bg-stone-900/80 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50"
        )}
      >
        <SlidersHorizontal className="w-3 h-3" />
        <span>Filter</span>
        {activeCount > 0 && (
          <span className="ml-0.5 inline-flex items-center justify-center w-3.5 h-3.5 text-[8px] bg-amber-400 text-stone-900 rounded-full font-black leading-none">
            {activeCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel — absolutely positioned, no portal */}
      {open && (
        <div
          className={cn(
            "absolute right-0 top-[calc(100%+6px)] z-[9999]",
            "w-52 rounded-2xl border border-stone-200 dark:border-stone-800",
            "bg-white dark:bg-stone-950 shadow-2xl",
            "flex flex-col gap-0 overflow-hidden",
            "animate-in fade-in-0 zoom-in-95 duration-150"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-stone-100 dark:border-stone-900">
            <span className="text-[9px] font-black text-stone-500 dark:text-stone-400 uppercase tracking-widest">
              Filter Templates
            </span>
            <div className="flex items-center gap-2">
              {activeCount > 0 && (
                <button
                  type="button"
                  onClick={() => { setPriceFilter("all"); setLangFilter("all"); }}
                  className="text-[9px] font-extrabold text-amber-500 hover:text-amber-600 cursor-pointer"
                >
                  Reset
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-4 h-4 rounded-full bg-stone-100 dark:bg-stone-900 flex items-center justify-center hover:bg-stone-200 dark:hover:bg-stone-800 cursor-pointer transition-colors"
              >
                <X className="w-2.5 h-2.5 text-stone-500" />
              </button>
            </div>
          </div>

          {/* Price Section */}
          <div className="px-3 pt-2.5 pb-1 flex flex-col gap-1.5">
            <span className="text-[8px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-widest">
              Price
            </span>
            <div className="flex gap-1">
              {PRICE_OPTIONS.map((opt) => {
                const isActive = priceFilter === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPriceFilter(opt.value)}
                    className={cn(
                      "flex-1 py-1.5 text-[9px] font-bold rounded-lg cursor-pointer transition-all border capitalize",
                      isActive
                        ? "bg-primary text-white border-primary shadow-sm"
                        : "bg-stone-50 dark:bg-stone-900 text-stone-500 dark:text-stone-400 border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800"
                    )}
                  >
                    {isActive && <Check className="inline w-2.5 h-2.5 mr-0.5 -mt-px" />}
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Language Section */}
          {languagesList.length > 1 && (
            <div className="px-3 pt-1.5 pb-3 flex flex-col gap-1.5 border-t border-stone-100 dark:border-stone-900 mt-1">
              <span className="text-[8px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-widest mt-1">
                Language
              </span>
              <div className="grid grid-cols-2 gap-1">
                {languagesList.map((lang) => {
                  const isActive = langFilter === lang;
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setLangFilter(lang)}
                      className={cn(
                        "flex items-center justify-center gap-1 py-1.5 text-[9px] font-bold rounded-lg cursor-pointer transition-all border truncate",
                        isActive
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "bg-stone-50 dark:bg-stone-900 text-stone-500 dark:text-stone-400 border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800"
                      )}
                    >
                      {lang === "all" && (
                        <Globe className="w-2.5 h-2.5 shrink-0" />
                      )}
                      {isActive && lang !== "all" && (
                        <Check className="w-2.5 h-2.5 shrink-0" />
                      )}
                      <span className="truncate">{lang === "all" ? "All" : lang}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
