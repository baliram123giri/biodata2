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
  const { selectedTemplate, setSelectedTemplate, customTemplates } = useBiodataStore();
  const theme = useThemeStore();

  const templates = React.useMemo(() => {
    const all = [...Object.values(TEMPLATE_CONFIGS)];
    // Ensure all custom templates from the database are registered and rendered reactively
    customTemplates.forEach((customTpl) => {
      if (!all.some((t) => t.id === customTpl.id)) {
        all.push(customTpl);
      }
    });
    return all;
  }, [customTemplates]);

  return (
    <div className="grid grid-cols-2 gap-3">
      {templates.map((tpl) => {
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
              onSelect?.();
            }}
            className={cn(
              "group relative flex flex-col gap-2 cursor-pointer select-none active:scale-95 transition-all duration-200 rounded-2xl focus:outline-none",
              isSelected ? "scale-[1.02]" : "hover:scale-[1.01]"
            )}
          >
            {/* Card thumbnail */}
            <div
              className={cn(
                "relative w-full aspect-[3/4] rounded-2xl overflow-hidden border-2 transition-all duration-200 shadow-sm group-hover:shadow-md",
                isSelected
                  ? "border-stone-900 shadow-[0_0_0_3px_rgba(0,0,0,0.12)]"
                  : "border-transparent group-hover:border-stone-300"
              )}
              style={cardStyle}
            >
              {/* Simulated inner border lines like a real biodata frame (only if there is no custom thumbnail) */}
              {!tpl.thumbnailUrl && (
                <>
                  <div
                    className="absolute inset-[6px] border rounded-xl opacity-40 pointer-events-none"
                    style={{ borderColor: tpl.defaultSecondary }}
                  />

                  {/* Mock content lines */}
                  <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-1.5 pointer-events-none">
                    <div className="h-1 rounded-full w-3/4 opacity-30" style={{ backgroundColor: tpl.defaultSecondary }} />
                    <div className="h-1 rounded-full w-1/2 opacity-20" style={{ backgroundColor: tpl.defaultSecondary }} />
                    <div className="h-1 rounded-full w-2/3 opacity-20" style={{ backgroundColor: tpl.defaultSecondary }} />
                  </div>
                </>
              )}

              {/* Selected overlay with checkmark */}
              {isSelected && (
                <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] flex items-start justify-end p-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-200"
                    style={{ backgroundColor: tpl.defaultPrimary }}
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

              {/* Color swatches */}
              <div className="flex items-center gap-1 mt-1">
                <div className="w-2.5 h-2.5 rounded-full shadow-sm border border-white/30" style={{ backgroundColor: tpl.defaultPrimary }} />
                <div className="w-2.5 h-2.5 rounded-full shadow-sm border border-white/30" style={{ backgroundColor: tpl.defaultSecondary }} />
                {tpl.defaultAccent && (
                  <div className="w-2.5 h-2.5 rounded-full shadow-sm border border-white/30" style={{ backgroundColor: tpl.defaultAccent }} />
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
});
