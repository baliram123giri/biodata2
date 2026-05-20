"use client";

import React, { useState } from "react";
import { Download, FileText, FileType, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type DownloadFormat = "pdf" | "docx";

interface DownloadDropdownProps {
  /** Called when the user picks a format */
  onDownload: (format: DownloadFormat) => void;
  /** Whether a download is currently in progress */
  isGenerating: boolean;
  /** Label overrides from translations */
  labels?: {
    download?: string;
    downloadPdf?: string;
    generating?: string;
  };
  /** Style variant */
  variant?: "primary" | "compact";
  className?: string;
}

/**
 * A download button with a Radix UI popover dropdown to choose
 * between PDF and Word formats.
 */
export function DownloadDropdown({
  onDownload,
  isGenerating,
  labels,
  variant = "primary",
  className,
}: DownloadDropdownProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (format: DownloadFormat) => {
    setOpen(false);
    onDownload(format);
  };

  if (variant === "compact") {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          disabled={isGenerating}
          render={
            <button
              disabled={isGenerating}
              className={cn(
                "relative overflow-hidden rounded-2xl shadow-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs h-10 px-4 flex items-center gap-1.5 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all",
                className
              )}
            />
          }
        >
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-1/2 h-full animate-shine pointer-events-none" />
          <span className="relative flex items-center gap-1.5">
            {isGenerating ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>{labels?.generating || "..."}</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                {labels?.download || "Download"}
                <ChevronDown className="w-3 h-3 opacity-70" />
              </>
            )}
          </span>
        </PopoverTrigger>
        <PopoverContent side="top" sideOffset={8} className="w-48 p-1.5 rounded-xl">
          <button
            onClick={() => handleSelect("pdf")}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left text-sm font-semibold text-stitch-on-surface hover:bg-stitch-primary/10 hover:text-stitch-primary transition-colors group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
              <FileText className="w-4 h-4 text-red-600" />
            </div>
            <div className="flex flex-col">
              <span>PDF</span>
              <span className="text-[10px] font-medium text-muted-foreground">Best for printing</span>
            </div>
          </button>
          <button
            onClick={() => handleSelect("docx")}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left text-sm font-semibold text-stitch-on-surface hover:bg-stitch-primary/10 hover:text-stitch-primary transition-colors group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <FileType className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex flex-col">
              <span>Word</span>
              <span className="text-[10px] font-medium text-muted-foreground">Editable .docx file</span>
            </div>
          </button>
        </PopoverContent>
      </Popover>
    );
  }

  // Primary variant (used in header bar and main download buttons)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        disabled={isGenerating}
        render={
          <button
            disabled={isGenerating}
            className={cn(
              "relative overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white transition-all text-xs font-semibold h-9 px-4 md:px-6 flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer rounded-md border-0",
              className
            )}
          />
        }
      >
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-1/2 h-full animate-shine pointer-events-none" />
        <span className="relative flex items-center gap-2">
          {isGenerating ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="hidden sm:inline">{labels?.generating || "Generating..."}</span>
            </>
          ) : (
            <>
              <span>{labels?.download || "Download"}</span>
              <Download className="w-4 h-4" />
              <ChevronDown className="w-3 h-3 opacity-70 -ml-1" />
            </>
          )}
        </span>
      </PopoverTrigger>
      <PopoverContent side="bottom" sideOffset={8} className="w-52 p-1.5 rounded-xl">
        <button
          onClick={() => handleSelect("pdf")}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left text-sm font-semibold text-stitch-on-surface hover:bg-stitch-primary/10 hover:text-stitch-primary transition-colors group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
            <FileText className="w-4 h-4 text-red-600" />
          </div>
          <div className="flex flex-col">
            <span>PDF</span>
            <span className="text-[10px] font-medium text-muted-foreground">Best for printing</span>
          </div>
        </button>
        <button
          onClick={() => handleSelect("docx")}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left text-sm font-semibold text-stitch-on-surface hover:bg-stitch-primary/10 hover:text-stitch-primary transition-colors group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
            <FileType className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex flex-col">
            <span>Word</span>
            <span className="text-[10px] font-medium text-muted-foreground">Editable .docx file</span>
          </div>
        </button>
      </PopoverContent>
    </Popover>
  );
}
