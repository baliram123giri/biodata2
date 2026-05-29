"use client";

import React from "react";
import { Download } from "lucide-react";
import { cn } from "@/lib/utils";

export type DownloadFormat = "pdf" | "docx" | "jpg" | "png" | "combo";

function getCurrencySymbol(currency?: string | null) {
  if (currency === "USD") return "$";
  if (currency === "EUR") return "\u20ac";
  if (currency === "GBP") return "\u00a3";
  return "\u20b9"; // INR default
}

interface DownloadDropdownProps {
  onDownload: () => void;
  isGenerating: boolean;
  labels?: {
    download?: string;
    generating?: string;
    [key: string]: any;
  };
  variant?: "primary" | "compact";
  className?: string;
  isPremium?: boolean;
  price?: number | null;
  discountPrice?: number | null;
  currency?: string | null;
  pdfPrice?: number | null;
  pdfDiscountPrice?: number | null;
  docxPrice?: number | null;
  docxDiscountPrice?: number | null;
  jpgPrice?: number | null;
  jpgDiscountPrice?: number | null;
  pngPrice?: number | null;
  pngDiscountPrice?: number | null;
  comboPrice?: number | null;
  comboDiscountPrice?: number | null;
}

/**
 * A styled direct download button (replaces the popover dropdown menu).
 * Triggers the parent modal download flow (PriceModal for premium, FeedbackModal for free).
 */
export function DownloadDropdown({
  onDownload,
  isGenerating,
  labels,
  variant = "primary",
  className,
  isPremium = false,
  price = null,
  discountPrice = null,
  currency = "INR",
}: DownloadDropdownProps) {
  const currencySymbol = getCurrencySymbol(currency);
  const finalPrice = discountPrice ?? price ?? 49;

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isGenerating) {
      onDownload();
    }
  };

  if (variant === "compact") {
    return (
      <button
        onClick={handleButtonClick}
        disabled={isGenerating}
        className={cn(
          "relative overflow-hidden rounded-2xl shadow-lg bg-gradient-primary font-bold text-xs h-10 px-4 flex items-center gap-1.5 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-0 text-white",
          className
        )}
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
              {isPremium ? (
                <span className="flex items-center gap-1.5">
                  <span>👑 Premium</span>
                </span>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>{labels?.download || "Download"}</span>
                </>
              )}
            </>
          )}
        </span>
      </button>
    );
  }

  // Primary variant (used in header bar and main download buttons)
  return (
    <button
      onClick={handleButtonClick}
      disabled={isGenerating}
      className={cn(
        "relative overflow-hidden bg-gradient-primary text-xs font-semibold h-9 px-4 md:px-6 flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer rounded-md border-0 text-white",
        className
      )}
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
            {isPremium ? (
              <span className="flex items-center gap-1.5 font-bold">
                <span>👑 Premium Download</span>
              </span>
            ) : (
              <>
                <span>{labels?.download || "Download"}</span>
                <Download className="w-4 h-4" />
              </>
            )}
          </>
        )}
      </span>
    </button>
  );
}
