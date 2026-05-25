"use client";

import React, { useState } from "react";
import { Download, FileText, FileType, ChevronDown, ImageIcon, Share2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export type DownloadFormat = "pdf" | "docx" | "jpg";

/** WhatsApp brand icon (inline SVG) */
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

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
  /** Optional: callback for WhatsApp share — if provided, shows the share option */
  onWhatsAppShare?: () => void;
  /** Whether sharing is in progress */
  isSharing?: boolean;
}

/**
 * A download button with a Radix UI popover dropdown to choose
 * between PDF, Word, JPG formats — plus an integrated WhatsApp share option.
 */
export function DownloadDropdown({
  onDownload,
  isGenerating,
  labels,
  variant = "primary",
  className,
  onWhatsAppShare,
  isSharing = false,
}: DownloadDropdownProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (format: DownloadFormat) => {
    setOpen(false);
    onDownload(format);
  };

  const handleWhatsAppShare = () => {
    setOpen(false);
    onWhatsAppShare?.();
  };

  /** The popover menu items shared between both variants */
  const menuItems = (
    <>
      {/* ── Download Section ────────────────────────────── */}
      <div className="px-3 pt-2 pb-1">
        <span className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground/60">
          Download
        </span>
      </div>
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
      <button
        onClick={() => handleSelect("jpg")}
        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left text-sm font-semibold text-stitch-on-surface hover:bg-stitch-primary/10 hover:text-stitch-primary transition-colors group cursor-pointer"
      >
        <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
          <ImageIcon className="w-4 h-4 text-green-600" />
        </div>
        <div className="flex flex-col">
          <span>JPEG Image (High Quality)</span>
          <span className="text-[10px] font-medium text-muted-foreground">Ultra-high resolution picture</span>
        </div>
      </button>

      {/* ── Share Section (only if handler provided) ──── */}
      {onWhatsAppShare && (
        <>
          <Separator className="my-1 bg-stitch-outline/10" />
          <div className="px-3 pt-1 pb-1">
            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground/60">
              Share
            </span>
          </div>
          <button
            onClick={handleWhatsAppShare}
            disabled={isSharing}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left text-sm font-semibold text-stitch-on-surface hover:bg-[#25D366]/10 hover:text-[#128C7E] transition-colors group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-8 h-8 rounded-lg bg-[#25D366]/10 flex items-center justify-center group-hover:bg-[#25D366]/20 transition-colors">
              <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
            </div>
            <div className="flex flex-col flex-1">
              <span className="flex items-center gap-1.5">
                WhatsApp
                <span className="text-[8px] font-black uppercase tracking-wider text-[#25D366] bg-[#25D366]/10 px-1.5 py-0.5 rounded-full leading-none">
                  Quick
                </span>
              </span>
              <span className="text-[10px] font-medium text-muted-foreground">Send as image directly</span>
            </div>
          </button>
        </>
      )}
    </>
  );

  if (variant === "compact") {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          disabled={isGenerating}
          render={
            <button
              disabled={isGenerating}
              className={cn(
                "relative overflow-hidden rounded-2xl shadow-lg bg-gradient-primary font-bold text-xs h-10 px-4 flex items-center gap-1.5 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-0",
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
        <PopoverContent side="top" sideOffset={8} className="w-56 p-1.5 rounded-xl">
          {menuItems}
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
              "relative overflow-hidden bg-gradient-primary text-xs font-semibold h-9 px-4 md:px-6 flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer rounded-md border-0",
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
      <PopoverContent side="bottom" sideOffset={8} className="w-56 p-1.5 rounded-xl">
        {menuItems}
      </PopoverContent>
    </Popover>
  );
}
