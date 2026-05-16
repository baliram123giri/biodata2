import React from "react";
import { useBiodataStore } from "@/store/useBiodataStore";
import { useThemeStore } from "@/store/useThemeStore";
import { TEMPLATE_CONFIGS } from "@/lib/frame-config";
import { cn } from "@/lib/utils";
import { Check, Layout } from "lucide-react";
import { Label } from "@/components/ui/label";

export function TemplateSelector() {
  const { selectedTemplate, setSelectedTemplate } = useBiodataStore();
  const theme = useThemeStore();

  const templates = Object.values(TEMPLATE_CONFIGS);

  return (
    <div className="flex flex-col gap-6 p-1">
      <div className="flex flex-col gap-3">
        <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-stitch-on-surface-variant">
          Available Templates
        </Label>
        
        <div className="grid grid-cols-1 gap-4">
          {templates.map((tpl) => {
            const isSelected = selectedTemplate === tpl.id;
            
            return (
              <button
                key={tpl.id}
                onClick={() => {
                  setSelectedTemplate(tpl.id);
                  theme.setPalette({ 
                    name: "None", 
                    primary: tpl.defaultPrimary, 
                    secondary: tpl.defaultSecondary, 
                    accent: tpl.defaultAccent 
                  });
                }}
                className={cn(
                  "group relative flex flex-col gap-3 p-3 rounded-2xl border transition-all duration-300 text-left",
                  isSelected 
                    ? "border-stitch-primary bg-white shadow-lg ring-1 ring-stitch-primary/20" 
                    : "border-stitch-outline/10 hover:border-stitch-outline/30 bg-transparent hover:bg-white/40"
                )}
              >
                {/* Miniature Preview Placeholder (Aesthetic) */}
                <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-stitch-surface-variant/20 border border-stitch-outline/5 shadow-inner flex items-center justify-center">
                  {tpl.frame.type === "image" ? (
                    <div className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity" 
                         style={{ 
                           backgroundImage: `url(${tpl.frame.urlTemplate.replace("{color}", tpl.defaultPrimary.replace("#", ""))})`,
                           backgroundSize: 'cover'
                         }} 
                    />
                  ) : tpl.frame.type === "gradient" ? (
                    <div className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity" 
                         style={{ 
                           background: `linear-gradient(90deg, ${tpl.frame.gradientColors.join(", ")})`,
                         }} 
                    />
                  ) : (
                    <div className="absolute inset-2 border-2 border-dashed border-stitch-on-surface-variant/20 rounded-lg flex items-center justify-center">
                       <Layout className="w-8 h-8 text-stitch-on-surface-variant/10" />
                    </div>
                  )}
                  
                  {/* Overlay for selection */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-stitch-primary/5 backdrop-blur-[1px] flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-stitch-primary text-white flex items-center justify-center shadow-xl scale-110 animate-in zoom-in duration-300">
                        <Check className="w-6 h-6 stroke-[3]" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col px-1">
                  <span className="text-sm font-bold text-stitch-on-surface tracking-tight leading-none mb-1">
                    {tpl.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tpl.defaultPrimary }} />
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tpl.defaultSecondary }} />
                    </div>
                    <span className="text-[10px] text-stitch-on-surface-variant/60 font-medium">
                      Classic Style
                    </span>
                  </div>
                </div>

                {/* Hover Glow */}
                <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-stitch-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </button>
            );
          })}
        </div>
      </div>
      
      <div className="mt-4 p-4 rounded-xl bg-stitch-primary/5 border border-stitch-primary/10">
        <p className="text-[11px] text-stitch-on-surface-variant leading-relaxed font-medium">
          <span className="font-bold text-stitch-primary block mb-1">Pro Tip:</span>
          Switching templates will keep your content intact but will reset colors to the template defaults.
        </p>
      </div>
    </div>
  );
}
