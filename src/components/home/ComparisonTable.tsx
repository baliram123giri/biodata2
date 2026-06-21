"use client";

import React from "react";
import { Check, X, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface ComparisonRow {
  feature: string;
  tooltip?: string;
  biodata99: {
    status: "yes" | "no" | "warning";
    label: string;
  };
  others: {
    status: "yes" | "no" | "warning";
    label: string;
  };
}

const comparisonData: ComparisonRow[] = [
  {
    feature: "Free PDF Download",
    tooltip: "Download your completed marriage biodata as a print-ready A4 PDF for free.",
    biodata99: { status: "yes", label: "✓" },
    others: { status: "warning", label: "Limited or Paid" },
  },
  {
    feature: "PNG & JPEG Download",
    tooltip: "Save your biodata as high-resolution image formats, perfect for viewing on any device.",
    biodata99: { status: "yes", label: "✓" },
    others: { status: "no", label: "Rare" },
  },
  {
    feature: "WhatsApp Ready Sharing",
    tooltip: "Optimized file sizes and formatting so your biodata displays perfectly when sent on WhatsApp.",
    biodata99: { status: "yes", label: "✓" },
    others: { status: "warning", label: "Limited" },
  },
  {
    feature: "Company Logo Auto-Fetch",
    tooltip: "Search for your employer name, and their official logo automatically formats into your career block.",
    biodata99: { status: "yes", label: "✓" },
    others: { status: "no", label: "✗" },
  },
  {
    feature: "Full Design Customization",
    tooltip: "Total creative freedom over frames, borders, decorations, card styles, and details.",
    biodata99: { status: "yes", label: "✓" },
    others: { status: "warning", label: "Limited" },
  },
  {
    feature: "Theme & Color Changes",
    tooltip: "Choose from curated premium color schemes or pick your own custom theme colors.",
    biodata99: { status: "yes", label: "✓" },
    others: { status: "warning", label: "Limited" },
  },
  {
    feature: "Decorative Stickers & Icons",
    tooltip: "Add customized religious mantras, Ganesha icons, crescent moons, or floral decorative stickers.",
    biodata99: { status: "yes", label: "✓" },
    others: { status: "no", label: "Rare" },
  },
  {
    feature: "Live Preview While Editing",
    tooltip: "See exactly how your final printed biodata will look on the fly as you type each character.",
    biodata99: { status: "yes", label: "✓" },
    others: { status: "warning", label: "Limited" },
  },
  {
    feature: "Auto Layout Adjustment",
    tooltip: "Dynamic adjustments to field heights and borders to make sure everything looks clean.",
    biodata99: { status: "yes", label: "✓" },
    others: { status: "no", label: "Rare" },
  },
  {
    feature: "No Text Overlapping Issues",
    tooltip: "Intelligent auto-scaling font technology prevents text from running over borders or boxes.",
    biodata99: { status: "yes", label: "✓" },
    others: { status: "no", label: "✗" },
  },
  {
    feature: "Handles Long Profiles Gracefully",
    tooltip: "Adapts spacing dynamically to fit extensive family or education details on a single page.",
    biodata99: { status: "yes", label: "✓" },
    others: { status: "warning", label: "Limited" },
  },
  {
    feature: "Mobile & Desktop Friendly",
    tooltip: "Full responsive designer experience. Build and download seamlessly on any device.",
    biodata99: { status: "yes", label: "✓" },
    others: { status: "yes", label: "✓" },
  },
  {
    feature: "Modern Marathi Templates",
    tooltip: "Specifically designed layouts for Maharashtrian weddings, supporting Marathi script and horoscope details.",
    biodata99: { status: "yes", label: "✓" },
    others: { status: "warning", label: "Limited" },
  },
  {
    feature: "Community-Specific Designs",
    tooltip: "Tailored templates for Hindu, Muslim, Sikh, Jain, Christian, and regional preferences.",
    biodata99: { status: "yes", label: "✓" },
    others: { status: "warning", label: "Limited" },
  },
  {
    feature: "You Can Request New Designs ",
    tooltip: "Don't see a style you love? Suggest a format and our team will work on it.",
    biodata99: { status: "yes", label: "✓" },
    others: { status: "no", label: "Rare" },
  },
  {
    feature: "New Designs will be Added Within 3 Working Days*",
    tooltip: "Fast design turnaround for requested templates based on feasibility and complexity.",
    biodata99: { status: "yes", label: "✓" },
    others: { status: "no", label: "✗" },
  },
];

export function ComparisonTable() {
  return (
    <TooltipProvider delayDuration={150}>
      <section className="py-12 md:py-20 px-4 border-t border-border/30 bg-[#FFFDF9] dark:bg-[#150709] relative overflow-hidden">
        {/* Background Decorative Patterns */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(201,168,76,0.03)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="container mx-auto mt-4 max-w-5xl relative z-10">
          {/* Section Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto mb-10 md:mb-16">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#C9A84C] block font-sans">
              Head-to-Head Comparison
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-stone-900 dark:text-white tracking-tight font-sans">
              Why Choose <span className="text-gradient-primary">Biodata99</span> Over Other Biodata Makers?
            </h2>
            <p className="text-sm md:text-base text-stone-600 dark:text-stone-300 leading-relaxed font-semibold max-w-3xl mx-auto">
              Create a beautiful marriage biodata easily with Biodata99. Customize every detail, download instantly, and share effortlessly—all without design or formatting hassles.
            </p>
          </div>

          {/* Table Container Card */}
          <div className="premium-gold-border md:premium-gold-border overflow-hidden bg-white dark:bg-stone-900/40 border border-stone-200/60 dark:border-stone-850 shadow-md rounded-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[640px]">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/80">
                    <th className="py-5 px-6 text-xs font-black uppercase tracking-wider text-stone-500 dark:text-stone-400 font-sans w-2/5">
                      Feature
                    </th>
                    <th className="py-5 px-6 text-xs font-black uppercase tracking-wider text-[#9B1B30] dark:text-[#E6C97A] font-sans text-center bg-[#FAEAED]/40 dark:bg-[#9B1B30]/5 w-[30%]">
                      Biodata99
                    </th>
                    <th className="py-5 px-6 text-xs font-black uppercase tracking-wider text-stone-600 dark:text-stone-400 font-sans text-center w-[30%]">
                      Other Biodata Makers
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-150 dark:divide-stone-800/60">
                  {comparisonData.map((row, index) => (
                    <tr
                      key={index}
                      className="hover:bg-stone-50/30 dark:hover:bg-stone-800/10 transition-colors"
                    >
                      {/* Feature Column */}
                      <td className="py-4 px-6 text-sm font-bold text-stone-800 dark:text-stone-200 font-sans">
                        <div className="flex items-center gap-1.5">
                          <span>{row.feature}</span>
                          {row.tooltip && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  className="text-stone-400 hover:text-[#9B1B30] dark:hover:text-[#E6C97A] transition-colors cursor-help p-0.5"
                                  aria-label={`About ${row.feature}`}
                                >
                                  <HelpCircle className="w-3.5 h-3.5" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-[240px] text-center">
                                <p className="text-xs font-medium leading-normal">{row.tooltip}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </td>

                      {/* Biodata99 Column */}
                      <td className="py-4 px-6 text-center bg-[#FAEAED]/20 dark:bg-[#9B1B30]/2 border-x border-stone-150 dark:border-stone-800/40">
                        {row.biodata99.label === "✓" ? (
                          <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-250/20 dark:border-emerald-800/20">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        ) : (
                          <span className="text-sm font-black text-stone-500 dark:text-stone-400">
                            {row.biodata99.label}
                          </span>
                        )}
                      </td>

                      {/* Others Column */}
                      <td className="py-4 px-6 text-center">
                        {row.others.label === "✓" ? (
                          <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-stone-50 dark:bg-stone-800/60 text-stone-500 dark:text-stone-400 border border-stone-200 dark:border-stone-700">
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          </div>
                        ) : row.others.label === "✗" ? (
                          <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-50 dark:bg-rose-950/20 text-rose-500 dark:text-rose-450 border border-rose-250/25 dark:border-rose-900/25">
                            <X className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        ) : row.others.status === "warning" ? (
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-black bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-250/20 dark:border-amber-900/20">
                            {row.others.label}
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-black bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700">
                            {row.others.label}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footnote */}
          <p className="mt-4 text-xs font-semibold text-stone-500 dark:text-stone-400 text-left pl-2">
            *Based on feasibility and design complexity.
          </p>
        </div>
      </section>
    </TooltipProvider>
  );
}
