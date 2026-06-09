"use client";

import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const COMPANIES_MOCK = [
  {
    name: "Google",
    role: "Senior Software Engineer",
    color: "#4285F4",
    logo: (
      <svg viewBox="0 0 24 24" className="w-full h-full" aria-hidden="true">
        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.61a5.66 5.66 0 0 1-2.45 3.71v3.08h3.94c2.31-2.13 3.64-5.26 3.64-8.64z"/>
        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.94-3.08c-1.1.73-2.5 1.18-3.99 1.18-3.07 0-5.67-2.08-6.6-4.88H1.31v3.18A12 12 0 0 0 12 24z"/>
        <path fill="#FBBC05" d="M5.4 14.31A7.16 7.16 0 0 1 5 12c0-.8.14-1.6.4-2.31V6.51H1.31A12 12 0 0 0 0 12c0 1.92.45 3.74 1.31 5.49l4.09-3.18z"/>
        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43A11.93 11.93 0 0 0 12 0 12 12 0 0 0 1.31 6.51l4.09 3.18c.93-2.8 3.53-4.94 6.6-4.94z"/>
      </svg>
    )
  },
  {
    name: "Microsoft",
    role: "Product Manager",
    color: "#F25022",
    logo: (
      <svg viewBox="0 0 23 23" className="w-full h-full" aria-hidden="true">
        <rect x="0" y="0" width="10.5" height="10.5" fill="#F25022" />
        <rect x="11.5" y="0" width="10.5" height="10.5" fill="#7FBA00" />
        <rect x="0" y="11.5" width="10.5" height="10.5" fill="#00A4EF" />
        <rect x="11.5" y="11.5" width="10.5" height="10.5" fill="#FFB900" />
      </svg>
    )
  },
  {
    name: "Amazon",
    role: "Solutions Architect",
    color: "#FF9900",
    logo: (
      <svg viewBox="0 0 24 24" className="w-full h-full" aria-hidden="true">
        <path fill="#000000" className="dark:fill-white" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.63 15.65c-1.37.1-2.27-.47-2.31-1.37-.04-.84.66-1.57 2.22-1.74 1.25-.13 2.19-.07 2.19-.07v.85c0 1.25-.85 2.23-2.1 2.33zm3.7-2.6v-2.32c0-1.68-.69-2.37-2.43-2.37-1.12 0-2.21.36-2.83.79l.56 1.05c.49-.33 1.22-.59 1.94-.59.95 0 1.25.43 1.25 1.15v.23s-.99-.07-2.1-.03c-2.14.07-3.46.99-3.43 2.47.03 1.35 1.22 2.27 2.83 2.27 1.38 0 2.27-.59 2.73-1.22l.1.49h1.38v-1.92z"/>
        <path fill="#FF9900" d="M6.3 18.2c2.4 1.5 5.5 2.3 8.7 2.3 2.8 0 5.4-.6 7.6-1.7l-.4-.9c-2 1-4.4 1.6-6.9 1.6-3 0-5.8-.8-8.1-2.1l-.9.8z"/>
      </svg>
    )
  }
];

export function CompanyLogoPreview() {
  const [typedText, setTypedText] = useState("");
  const [searchState, setSearchState] = useState<"typing" | "searching" | "resolved">("typing");
  const [companyIndex, setCompanyIndex] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const currentCompany = COMPANIES_MOCK[companyIndex];

    if (searchState === "typing") {
      if (typedText.length < currentCompany.name.length) {
        timer = setTimeout(() => {
          setTypedText(currentCompany.name.substring(0, typedText.length + 1));
        }, 150);
      } else {
        timer = setTimeout(() => {
          setSearchState("searching");
        }, 600);
      }
    } else if (searchState === "searching") {
      timer = setTimeout(() => {
        setSearchState("resolved");
      }, 1200);
    } else if (searchState === "resolved") {
      timer = setTimeout(() => {
        setSearchState("typing");
        setTypedText("");
        setCompanyIndex((prev) => (prev + 1) % COMPANIES_MOCK.length);
      }, 3500);
    }

    return () => clearTimeout(timer);
  }, [typedText, searchState, companyIndex]);

  return (
    <div className="bg-stone-50 dark:bg-stone-950/50 border border-stone-150 dark:border-stone-850 rounded-2xl p-4 select-none relative overflow-hidden flex flex-col gap-2 min-h-[140px] justify-between w-full max-w-sm mx-auto">
      <div className="flex items-center justify-between border-b border-stone-200/50 dark:border-stone-800 pb-2">
        <div className="space-y-0.5 text-left">
          <div className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Form Input</div>
          <div 
            className="flex items-center gap-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-2.5 py-1 rounded-md text-[11px] font-bold text-foreground min-w-[120px] h-7"
            role="textbox"
            aria-readonly="true"
            aria-label="Simulation of company search input"
          >
            <span>{typedText}</span>
            {searchState === "typing" && (
              <span className="w-[1.5px] h-3.5 bg-foreground animate-pulse shrink-0" aria-hidden="true" />
            )}
            {searchState === "searching" && (
              <Loader2 className="w-3 h-3 text-[#C9A84C] animate-spin shrink-0" aria-hidden="true" />
            )}
          </div>
        </div>
        <div 
          className={cn(
            "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border transition-all duration-300",
            searchState === "resolved"
              ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400"
              : searchState === "searching"
              ? "bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 animate-pulse"
              : "bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/30 text-amber-600 dark:text-amber-400"
          )}
          aria-live="polite"
        >
          {searchState === "resolved" ? "Verified ✓" : searchState === "searching" ? "Searching..." : "Auto-Render"}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-1 text-left relative min-h-[48px] justify-start">
        {searchState === "resolved" ? (
          <div className="flex items-center gap-3 w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="w-10 h-10 rounded-lg bg-white dark:bg-stone-900 shadow-xs border border-stone-200/60 dark:border-stone-800 flex items-center justify-center shrink-0 p-1">
              {COMPANIES_MOCK[companyIndex].logo}
            </div>
            <div className="space-y-0.5">
              <div className="text-[9px] font-bold text-muted-foreground/80 uppercase tracking-wider leading-none">Occupation Details</div>
              <div className="text-xs font-black text-foreground">{COMPANIES_MOCK[companyIndex].name}</div>
              <div className="text-[9.5px] text-stone-500 font-semibold">{COMPANIES_MOCK[companyIndex].role}</div>
            </div>
          </div>
        ) : searchState === "searching" ? (
          <div className="flex items-center gap-3 w-full animate-pulse" aria-hidden="true">
            <div className="w-10 h-10 rounded-lg bg-stone-250 dark:bg-stone-800 shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="h-2.5 bg-stone-250 dark:bg-stone-800 rounded w-16" />
              <div className="h-3.5 bg-stone-250 dark:bg-stone-800 rounded w-24" />
              <div className="h-3 bg-stone-250 dark:bg-stone-800 rounded w-32" />
            </div>
          </div>
        ) : (
          <div className="text-[10px] text-muted-foreground/75 font-semibold italic flex items-center gap-1.5 py-2 animate-pulse">
            <span>💡 Type name of your company to fetch brand logo</span>
          </div>
        )}
      </div>
    </div>
  );
}
