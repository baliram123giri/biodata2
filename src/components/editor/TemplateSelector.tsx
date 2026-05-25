"use client";
import React from "react";
import { useBiodataStore } from "@/store/useBiodataStore";
import { useThemeStore } from "@/store/useThemeStore";
import { TEMPLATE_CONFIGS, getFrameImageUrl } from "@/lib/frame-config";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const TEMPLATE_LABELS: Record<string, string> = {
  royal: "Royal Gold",
  "ivory-elegance": "Ivory Elegance",
  "modern-gradient": "Modern Gradient",
  "new-generation": "New Generation",
  "ornate-grandeur": "Ornate Grandeur",
  "green-shapes": "Green Shapes",
};

export const TemplateSelector = React.memo(function TemplateSelector({ onSelect }: { onSelect?: () => void }) {
  const { selectedTemplate, setSelectedTemplate, customTemplates, formData } = useBiodataStore();
  const theme = useThemeStore();

  // Initial language filter matches the current biodata form's selected language
  const currentLang = formData?.language || "English";
  const [langFilter, setLangFilter] = React.useState<string>(currentLang);

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
      {/* Horizontal scrollable language filters */}
      {languagesList.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 mb-1 border-b border-stone-100 dark:border-stone-800">
          {languagesList.map((lang) => (
            <button
              key={lang}
              onClick={() => setLangFilter(lang)}
              className={cn(
                "px-2.5 py-1 text-[9px] font-black rounded-none border transition-all cursor-pointer whitespace-nowrap outline-none",
                langFilter === lang
                  ? "bg-stone-900 text-white border-stone-900 dark:bg-stone-100 dark:text-stone-900 dark:border-stone-100 shadow-sm"
                  : "bg-stone-50 text-stone-500 border-stone-200 hover:bg-stone-100 dark:bg-stone-900 dark:text-stone-400 dark:border-stone-800 dark:hover:bg-stone-800"
              )}
            >
              {lang === "all" ? "All Languages" : lang}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
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
                <img
                  src={tpl.thumbnailUrl.includes("res.cloudinary.com") && tpl.thumbnailUrl.includes("/image/upload/")
                    ? tpl.thumbnailUrl.replace("/image/upload/", "/image/upload/w_595,h_842,c_fit,q_100/")
                    : tpl.thumbnailUrl
                  }
                  alt={tpl.name}
                  className={cn(
                    "absolute w-full h-full object-contain select-none pointer-events-none group-hover:scale-[1.03] transition-transform duration-300 ease-out",
                    isSelected ? "inset-[3px] rounded-[9px]" : "inset-0"
                  )}
                  loading="lazy"
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
      </div>
    </div>
  );
});
