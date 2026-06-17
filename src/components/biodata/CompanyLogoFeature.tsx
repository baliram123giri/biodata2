"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Globe, Zap, Briefcase, HelpCircle, Clock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CompanyLogoPreview } from "./CompanyLogoPreview";
import { getReligionTheme } from "@/lib/religionThemes";

interface CompanyLogoFeatureProps {
  variant?: "card" | "banner";
  className?: string;
  religion?: string | null;
}

export function CompanyLogoFeature({ variant = "card", className, religion = null }: CompanyLogoFeatureProps) {
  const theme = getReligionTheme(religion);
  if (variant === "banner") {
    return (
      <div className={cn(
        "mt-8 bg-gradient-to-br from-[#FFF8F2] via-[#FFFDFB] to-[#FFF8F2] dark:from-[#200A10] dark:via-[#1A0A0E] dark:to-[#200A10] border-2 border-[#E6C97A]/40 rounded-3xl p-6 md:p-8 shadow-xl max-w-4xl mx-auto overflow-hidden relative group",
        className
      )}>
        {/* Soft glow background */}
        <div className="absolute top-0 right-0 w-[250px] h-[250px] rounded-full bg-[#E6C97A]/10 blur-[60px] pointer-events-none transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute bottom-0 left-0 w-[200px] h-[200px] rounded-full bg-primary/5 blur-[60px] pointer-events-none transition-transform duration-700 group-hover:scale-110" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Text description */}
          <div className="lg:col-span-7 space-y-4 text-left">
            <div className="flex items-center gap-2">
              <span 
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                  theme ? "" : "bg-[#9B1B30]/10 text-[#9B1B30] border border-[#9B1B30]/20 dark:bg-[#E6C97A]/10 dark:text-[#E6C97A] dark:border-[#E6C97A]/30"
                )}
                style={theme ? { backgroundColor: theme.primaryLight, color: theme.primary, borderColor: `${theme.primary}25` } : undefined}
              >
                ⭐ Exclusive Feature
              </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      type="button" 
                      className="text-muted-foreground/70 hover:text-foreground transition-colors cursor-help"
                      aria-label="More information about Company Logo auto display"
                    >
                      <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-stone-900 text-white text-xs border border-stone-850 p-2.5 rounded-lg shadow-md max-w-xs leading-relaxed">
                    Only available on biodata99.com. We integrate with global brand API databases to fetch high-resolution vector logos of verified employers automatically.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <h3 className="text-2xl font-black text-foreground tracking-tight leading-tight">
              🏢 Company Logo: <span 
                className={cn(!theme && "text-gradient-primary")}
                style={theme ? {
                  backgroundImage: `linear-gradient(to right, ${theme.primary}, ${theme.secondary})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  color: "transparent"
                } : undefined}
              >Auto Search &amp; Display on your Biodata</span>
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed font-medium">
              A unique feature exclusively on <span 
                className={cn("font-bold", !theme && "text-[#9B1B30] dark:text-[#E6C97A]")}
                style={theme ? { color: theme.primary } : undefined}
              >biodata99.com</span>: search your company name and your official logo appears automatically on your biodata:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/40 text-blue-600 dark:text-blue-400">
                  <Globe className="w-4 h-4" aria-hidden="true" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-foreground">Global Company Coverage</h4>
                  <p className="text-[10px] text-muted-foreground leading-normal font-medium">Searches companies from all over the world</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-900/40 text-amber-600 dark:text-amber-400">
                  <Zap className="w-4 h-4" aria-hidden="true" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-foreground">Auto Logo Rendering</h4>
                  <p className="text-[10px] text-muted-foreground leading-normal font-medium">Official logo fetched instantly, no upload needed</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400">
                  <Briefcase className="w-4 h-4" aria-hidden="true" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-foreground">Professional Appearance</h4>
                  <p className="text-[10px] text-muted-foreground leading-normal font-medium">Logo sits beautifully next to your work details</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center shrink-0 border border-purple-100 dark:border-purple-900/40 text-purple-600 dark:text-purple-400">
                  <Clock className="w-4 h-4" aria-hidden="true" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-foreground">Saves Time</h4>
                  <p className="text-[10px] text-muted-foreground leading-normal font-medium">No manual image hunting or cropping required</p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Visual Preview (Client Component) */}
          <div className="lg:col-span-5 w-full">
            <CompanyLogoPreview />
          </div>
        </div>
      </div>
    );
  }

  // Default "card" variant styled next to WhatsApp Widget
  return (
    <div className={cn(
      "bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-850 rounded-[24px] p-4 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-left w-full max-w-2xl mx-auto transition-all hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] relative overflow-hidden flex flex-col justify-between group h-full",
      className
    )}>
      {/* Soft glow background */}
      <div className="absolute top-0 right-0 w-[200px] h-[200px] rounded-full bg-[#E6C97A]/5 blur-[50px] pointer-events-none transition-transform duration-700 group-hover:scale-110" />
      
      <div className="space-y-4 relative z-10 flex flex-col flex-1 justify-between">
        <div className="space-y-4">
          {/* Header section */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-[16px] bg-[#FFF5EB] dark:bg-amber-950/20 flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-900/30">
              <Briefcase className="w-6 h-6 text-[#C9A84C]" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span 
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider",
                    theme ? "" : "bg-[#9B1B30]/10 text-[#9B1B30] border border-[#9B1B30]/20 dark:bg-[#E6C97A]/10 dark:text-[#E6C97A] dark:border-[#E6C97A]/30"
                  )}
                  style={theme ? { backgroundColor: theme.primaryLight, color: theme.primary, borderColor: `${theme.primary}25` } : undefined}
                >
                  ⭐ Exclusive Feature
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        type="button" 
                        className="text-muted-foreground/70 hover:text-foreground transition-colors cursor-help"
                        aria-label="More information about Company Logo auto display"
                      >
                        <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-stone-900 text-white text-xs border border-stone-850 p-2.5 rounded-lg shadow-md max-w-xs leading-relaxed">
                      Only available on biodata99.com. We integrate with global brand API databases to fetch high-resolution vector logos of verified employers automatically.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <h3 className="text-lg font-black text-[#062B36] dark:text-white tracking-tight">
                Company Logo: <span 
                  className={cn(!theme && "text-gradient-primary")}
                  style={theme ? {
                    backgroundImage: `linear-gradient(to right, ${theme.primary}, ${theme.secondary})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    color: "transparent"
                  } : undefined}
                >Auto Search &amp; Display</span>
              </h3>
            </div>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
            Search your company name in the form and its official brand logo appears instantly on your marriage biodata. No manual cropping or uploads required!
          </p>

          {/* Sub-features list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="flex gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center shrink-0 border border-blue-100/60 dark:border-blue-900/30 text-blue-600 dark:text-blue-400">
                <Globe className="w-3.5 h-3.5" aria-hidden="true" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-[11px] font-bold text-foreground">Global Coverage</h4>
                <p className="text-[9.5px] text-muted-foreground leading-snug font-semibold">Searches brand databases worldwide</p>
              </div>
            </div>

            <div className="flex gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center shrink-0 border border-amber-100/60 dark:border-amber-900/30 text-amber-600 dark:text-amber-400">
                <Zap className="w-3.5 h-3.5" aria-hidden="true" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-[11px] font-bold text-foreground">Instant Fetch</h4>
                <p className="text-[9.5px] text-muted-foreground leading-snug font-semibold">Fetched and rendered automatically</p>
              </div>
            </div>

            <div className="flex gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center shrink-0 border border-emerald-100/60 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                <Briefcase className="w-3.5 h-3.5" aria-hidden="true" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-[11px] font-bold text-foreground">Professional Look</h4>
                <p className="text-[9.5px] text-muted-foreground leading-snug font-semibold">Logo sits beautifully next to job details</p>
              </div>
            </div>

            <div className="flex gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/20 flex items-center justify-center shrink-0 border border-purple-100/60 dark:border-purple-900/30 text-purple-600 dark:text-purple-400">
                <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-[11px] font-bold text-foreground">Saves Time</h4>
                <p className="text-[9.5px] text-muted-foreground leading-snug font-semibold">No manual image searching needed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Interactive Preview Box (Client Component) */}
        <div className="mt-4">
          <CompanyLogoPreview />
        </div>
      </div>
    </div>
  );
}
