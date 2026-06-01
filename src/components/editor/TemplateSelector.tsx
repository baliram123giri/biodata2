"use client";
import React from "react";
import { useBiodataStore } from "@/store/useBiodataStore";
import { useThemeStore } from "@/store/useThemeStore";
import { TEMPLATE_CONFIGS, getFrameImageUrl } from "@/lib/frame-config";
import { cn } from "@/lib/utils";
import { Check, Crown, Globe } from "lucide-react";
import Image from "next/image";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TEMPLATE_LABELS: Record<string, string> = {
  royal: "Royal Gold",
  "ivory-elegance": "Ivory Elegance",
  "modern-gradient": "Modern Gradient",
  "new-generation": "New Generation",
  "ornate-grandeur": "Ornate Grandeur",
  "green-shapes": "Green Shapes",
};

export const TemplateSelector = React.memo(function TemplateSelector({ onSelect }: { onSelect?: () => void }) {
  const { selectedTemplate, setSelectedTemplate, customTemplates, formData, fetchCustomTemplates } = useBiodataStore();
  const theme = useThemeStore();
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (customTemplates.length <= 1) {
      setIsLoading(true);
      fetchCustomTemplates().finally(() => {
        setIsLoading(false);
      });
    }
  }, [fetchCustomTemplates, customTemplates.length]);

  // Initial language filter set to "all" to show all languages by default
  const [langFilter, setLangFilter] = React.useState<string>("all");

  const templates = React.useMemo(() => {
    return customTemplates;
  }, [customTemplates]);

  // List of unique languages from uploaded custom templates
  const languagesList = React.useMemo(() => {
    const langs = new Set<string>();
    customTemplates.forEach((t) => {
      if (t.language) {
        langs.add(t.language);
      }
    });
    if (langs.size === 0) return [];
    return ["all", ...Array.from(langs)];
  }, [customTemplates]);

  const filteredTemplates = React.useMemo(() => {
    if (languagesList.length <= 1 || langFilter === "all") return templates;
    // Show templates matching selection, OR classic templates (which have no language constraint)
    return templates.filter((t) => !t.language || t.language === langFilter);
  }, [templates, langFilter, languagesList]);

  return (
    <div className="space-y-3">
      {/* Language filter dropdown using Radix UI Select */}
      {languagesList.length > 1 && (
        <div className="sticky top-0 z-30 pb-3 pt-1 bg-transparent">
          <div className="flex items-center gap-2 bg-white/60 dark:bg-stone-950/60 backdrop-blur-xl border border-stone-200/40 dark:border-stone-800/40 p-1.5 px-3 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.03)]">
            <Globe className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400 shrink-0" />
            <Select value={langFilter} onValueChange={setLangFilter}>
              <SelectTrigger
                id="template-language-filter"
                className="h-6 text-[11px] font-black rounded-full border-0 bg-transparent focus:ring-0 focus-visible:ring-0 w-full p-0 shadow-none capitalize text-stone-700 dark:text-stone-300"
              >
                <SelectValue placeholder="Filter by language" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border border-stone-200/50 dark:border-stone-800/50 shadow-2xl backdrop-blur-xl bg-white/95 dark:bg-stone-950/95">
                {languagesList.map((lang) => (
                  <SelectItem
                    key={lang}
                    value={lang}
                    className="text-xs font-bold cursor-pointer"
                  >
                    {lang === "all" ? "All Languages" : lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
      {filteredTemplates.map((tpl) => {
        const isSelected = selectedTemplate === tpl.id;

        // Build the card background style
        let cardStyle: React.CSSProperties = {};
        if (tpl.thumbnailUrl) {
          cardStyle = {
            backgroundImage: `url(${tpl.thumbnailUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          };
        } else if (tpl.frame.type === "image") {
          cardStyle = {
            backgroundImage: `url(${getFrameImageUrl(tpl.frame, tpl.defaultPrimary)})`,
            backgroundColor: tpl.frame.bgColor,
            backgroundSize: "cover",
            backgroundPosition: "center",
          };
        } else if (tpl.frame.type === "gradient") {
          cardStyle = {
            background: `linear-gradient(145deg, ${tpl.frame.gradientColors.join(", ")})`,
          };
        } else if (tpl.frame.type === "svg") {
          cardStyle = { backgroundColor: tpl.frame.bgColor };
        } else {
          cardStyle = { backgroundColor: tpl.defaultPrimary };
        }

        return (
          <button
            key={tpl.id}
            onClick={() => {
              setSelectedTemplate(tpl.id);
              
              // Resolve template background colors (gradients or solids)
              let bgColors: string[] = ["#ffffff"];
              if (tpl.bgGradientColors && tpl.bgGradientColors.length > 0) {
                bgColors = tpl.bgGradientColors;
              } else if (tpl.frame.type === "gradient") {
                bgColors = tpl.frame.gradientColors;
              } else if (tpl.frame.bgColor) {
                bgColors = [tpl.frame.bgColor];
              }

              theme.setPalette({
                name: "None",
                primary: tpl.defaultPrimary,
                secondary: tpl.defaultSecondary,
                accent: tpl.defaultAccent,
                bgColors: bgColors,
              });

              // Apply the template's dynamic default padding from the database configuration
              if (tpl.defaultPadding !== undefined && tpl.defaultPadding !== null) {
                theme.setPadding(tpl.defaultPadding);
              }
              theme.setPaddingY(tpl.defaultYPadding !== null && tpl.defaultYPadding !== undefined ? tpl.defaultYPadding : undefined);

              onSelect?.();
            }}
            className={cn(
              "group relative flex flex-col gap-2 cursor-pointer select-none active:scale-95 transition-all duration-200 rounded-xl focus:outline-none",
              isSelected ? "scale-[1.02]" : "hover:scale-[1.01]"
            )}
          >
            {/* Card thumbnail */}
            <div
              className={cn(
                "relative w-full aspect-[595/842] rounded-xl overflow-hidden transition-all duration-200 shadow-sm group-hover:shadow-md bg-stone-50 dark:bg-stone-950",
                isSelected
                  ? "premium-gold-border p-[3px] shadow-[0_0_20px_rgba(252,224,104,0.4)]"
                  : "border border-stone-200 dark:border-stone-800 group-hover:border-stone-400"
              )}
              style={!tpl.thumbnailUrl ? cardStyle : undefined}
            >
              {tpl.thumbnailUrl && (
                <Image
                  src={tpl.thumbnailUrl.includes("res.cloudinary.com") && tpl.thumbnailUrl.includes("/image/upload/")
                    ? tpl.thumbnailUrl.replace("/image/upload/", "/image/upload/w_595,h_842,c_fit,f_auto,q_auto/")
                    : tpl.thumbnailUrl
                  }
                  alt={tpl.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 30vw"
                  className={cn(
                    "absolute object-contain select-none pointer-events-none group-hover:scale-[1.03] transition-transform duration-300 ease-out",
                    isSelected ? "inset-[3px] rounded-[9px]" : "inset-0"
                  )}
                  priority={isSelected || filteredTemplates.indexOf(tpl) === 0}
                />
              )}
              {/* Simulated inner border lines like a real biodata frame (only if there is no custom thumbnail) */}
              {!tpl.thumbnailUrl && (
                <>
                  <div
                    className="absolute inset-[6px] border rounded-none opacity-40 pointer-events-none"
                    style={{ borderColor: tpl.defaultSecondary }}
                  />

                  {/* Mock content lines */}
                  <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-1.5 pointer-events-none">
                    <div className="h-1 rounded-none w-3/4 opacity-30" style={{ backgroundColor: tpl.defaultSecondary }} />
                    <div className="h-1 rounded-none w-1/2 opacity-20" style={{ backgroundColor: tpl.defaultSecondary }} />
                    <div className="h-1 rounded-none w-2/3 opacity-20" style={{ backgroundColor: tpl.defaultSecondary }} />
                  </div>
                </>
              )}

              {/* FREE / PREMIUM badge — top-left corner of thumbnail */}
              <div className="absolute top-1.5 left-1.5 z-20 pointer-events-none">
                {tpl.isPremium ? (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-black bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow">
                    <Crown className="w-2 h-2" />
                    PREMIUM
                  </span>
                ) : (
                  <span className="inline-flex px-1.5 py-0.5 rounded text-[8px] font-black bg-green-500 text-white shadow">
                    FREE
                  </span>
                )}
              </div>

              {/* Selected overlay with checkmark (no blur backdrop) */}
              {isSelected && (
                <div className="absolute top-2 right-2 pointer-events-none z-10">
                  <div
                    className="w-6 h-6 rounded-none flex items-center justify-center shadow-lg animate-in zoom-in duration-200 bg-emerald-500"
                  >
                    <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                  </div>
                </div>
              )}
            </div>

            {/* Label below card */}
            <div className="flex flex-col px-0.5">
              <span className={cn(
                "text-[11px] font-extrabold tracking-tight leading-none truncate transition-colors",
                isSelected ? "text-stone-900" : "text-stone-600 group-hover:text-stone-800"
              )}>
                {tpl.name}
              </span>

              {/* Color swatches & language badge */}
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-none shadow-sm border border-white/30" style={{ backgroundColor: tpl.defaultPrimary }} />
                  <div className="w-2.5 h-2.5 rounded-none shadow-sm border border-white/30" style={{ backgroundColor: tpl.defaultSecondary }} />
                  {tpl.defaultAccent && (
                    <div className="w-2.5 h-2.5 rounded-none shadow-sm border border-white/30" style={{ backgroundColor: tpl.defaultAccent }} />
                  )}
                </div>
                {tpl.language && (
                  <span className="text-[7.5px] font-black px-1.5 py-px rounded-none bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30 shrink-0">
                    {tpl.language}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}

      {/* Render individual skeleton slots next to already loaded templates while fetching */}
      {isLoading && Array.from({ length: 4 }).map((_, idx) => (
        <div key={`skeleton-${idx}`} className="flex flex-col gap-2 animate-pulse select-none">
          <div className="w-full aspect-[595/842] rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200/50 dark:border-stone-800/50 relative overflow-hidden">
            {/* Mock Badge */}
            <div className="absolute top-2 left-2 w-10 h-3.5 bg-stone-200 dark:bg-stone-800 rounded-md" />
            
            {/* Inner simulated lines */}
            <div className="absolute inset-[8px] border border-dashed border-stone-200/30 dark:border-stone-800/30" />
            <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-1.5">
              <div className="h-1 bg-stone-200 dark:bg-stone-800 w-3/4 rounded" />
              <div className="h-1 bg-stone-200 dark:bg-stone-800 w-1/2 rounded" />
            </div>
          </div>
          <div className="flex flex-col gap-1 px-1">
            <div className="h-3 bg-stone-200 dark:bg-stone-800 w-2/3 rounded-md" />
            <div className="flex justify-between items-center mt-0.5">
              <div className="flex gap-1">
                <div className="w-2.5 h-2.5 bg-stone-200 dark:bg-stone-800 rounded-sm" />
                <div className="w-2.5 h-2.5 bg-stone-200 dark:bg-stone-800 rounded-sm" />
                <div className="w-2.5 h-2.5 bg-stone-200 dark:bg-stone-800 rounded-sm" />
              </div>
              <div className="w-8 h-2.5 bg-stone-200 dark:bg-stone-800 rounded-sm" />
            </div>
          </div>
        </div>
      ))}
      </div>
    </div>
  );
});
