import React, { useMemo } from "react";
import { SlidersHorizontal, Globe } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useBiodataStore } from "@/store/useBiodataStore";
import { cn } from "@/lib/utils";

export function TemplateFilter() {
  const {
    customTemplates,
    langFilter,
    setLangFilter,
    priceFilter,
    setPriceFilter
  } = useBiodataStore();

  const languagesList = useMemo(() => {
    const langs = new Set<string>();
    customTemplates.forEach((t) => {
      if (t.language) {
        langs.add(t.language);
      }
    });
    if (langs.size === 0) return [];
    return ["all", ...Array.from(langs)];
  }, [customTemplates]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-black transition-all cursor-pointer select-none",
          priceFilter !== "all" || langFilter !== "all"
            ? "bg-primary text-white border-primary shadow-sm"
            : "bg-white/60 dark:bg-stone-900/60 border-stone-200/50 dark:border-stone-800/50 text-stone-600 dark:text-stone-450 hover:bg-stone-50 dark:hover:bg-stone-850"
        )}>
          <SlidersHorizontal className="w-3 h-3" />
          <span>Filter</span>
          {(priceFilter !== "all" || langFilter !== "all") && (
            <span className="ml-1 px-1.5 py-0.2 text-[8px] bg-amber-500 text-white rounded-full font-black">
              {(priceFilter !== "all" ? 1 : 0) + (langFilter !== "all" ? 1 : 0)}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3 rounded-2xl border border-stone-200/60 dark:border-stone-800/60 bg-white/95 dark:bg-stone-950/95 shadow-2xl backdrop-blur-xl flex flex-col gap-3" align="end">
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-900 pb-2">
          <span className="text-[10px] font-black text-stone-900 dark:text-stone-100 uppercase tracking-wider">Filter Settings</span>
          {(priceFilter !== "all" || langFilter !== "all") && (
            <button
              onClick={() => {
                setPriceFilter("all");
                setLangFilter("all");
              }}
              className="text-[10px] font-extrabold text-amber-500 hover:text-amber-600 cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>

        {/* Price Filter section */}
        <div className="flex flex-col gap-1.5 text-left">
          <span className="text-[9px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-wider">Price</span>
          <div className="grid grid-cols-3 gap-1">
            {["all", "free", "premium"].map((price) => {
              const isActive = priceFilter === price;
              return (
                <button
                  key={price}
                  onClick={() => setPriceFilter(price as any)}
                  className={cn(
                    "py-1 text-[10px] font-bold rounded-lg cursor-pointer transition-all border text-center capitalize",
                    isActive
                      ? "bg-primary text-white border-primary font-extrabold"
                      : "bg-stone-50/50 dark:bg-stone-900/20 text-stone-600 dark:text-stone-450 border-stone-200/40 dark:border-stone-800/30 hover:bg-stone-100/40"
                  )}
                >
                  {price}
                </button>
              );
            })}
          </div>
        </div>

        {/* Language Filter section */}
        {languagesList.length > 1 && (
          <div className="flex flex-col gap-1.5 border-t border-stone-100 dark:border-stone-900 pt-2.5 text-left">
            <span className="text-[9px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-wider">Language</span>
            <div className="grid grid-cols-2 gap-1 max-h-36 overflow-y-auto scrollbar-thin">
              {languagesList.map((lang) => {
                const isActive = langFilter === lang;
                return (
                  <button
                    key={lang}
                    onClick={() => setLangFilter(lang)}
                    className={cn(
                      "flex items-center justify-center gap-1 py-1 text-[10px] font-bold rounded-lg cursor-pointer transition-all border text-center capitalize",
                      isActive
                        ? "bg-primary text-white border-primary font-extrabold"
                        : "bg-stone-50/50 dark:bg-stone-900/20 text-stone-600 dark:text-stone-450 border-stone-200/40 dark:border-stone-800/30 hover:bg-stone-100/40"
                    )}
                  >
                    {lang === "all" && <Globe className="w-3 h-3 text-stone-400" />}
                    {lang === "all" ? "All" : lang}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
