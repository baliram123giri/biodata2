"use client";

import React from "react";
import { Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBiodataStore } from "@/store/useBiodataStore";
import { translateUI } from "@/lib/translations";

export type DownloadFormat = "pdf" | "jpg" | "png" | "combo";

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
  jpgPrice?: number | null;
  jpgDiscountPrice?: number | null;
  pngPrice?: number | null;
  pngDiscountPrice?: number | null;
  comboPrice?: number | null;
  comboDiscountPrice?: number | null;
  isMuslimPage?: boolean;
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
  isMuslimPage = false,
}: DownloadDropdownProps) {
  const currentLang = useBiodataStore(state => state.formData?.language) || "English";
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
          "relative overflow-hidden rounded-2xl shadow-lg font-bold text-xs h-10 px-4 flex items-center gap-1.5 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-0 text-white",
          isMuslimPage 
            ? "bg-[#0F4C3A] hover:bg-[#0D4333] shadow-[#0F4C3A]/20" 
            : "bg-gradient-primary",
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
              <span>{translateUI("generating", currentLang)}</span>
            </>
          ) : (
            <>
              {isPremium ? (
                <span className="flex items-center gap-1.5">
                  <span>👑 {translateUI("download", currentLang)}</span>
                </span>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>{translateUI("download", currentLang)}</span>
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
        "relative overflow-hidden text-[10px] md:text-xs font-bold md:font-semibold h-8 md:h-9 px-3 md:px-6 flex items-center gap-1 md:gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer rounded-full md:rounded-md border-0 text-white",
        isMuslimPage 
          ? "bg-[#0F4C3A] hover:bg-[#0D4333]" 
          : "bg-gradient-primary",
        className
      )}
    >
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-1/2 h-full animate-shine pointer-events-none" />
      <span className="relative flex items-center gap-1 md:gap-2">
        {isGenerating ? (
          <>
            <svg className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="hidden sm:inline">{translateUI("generating", currentLang)}</span>
            <span className="inline sm:hidden">{translateUI("generating", currentLang)}</span>
          </>
        ) : (
          <>
            {isPremium ? (
              <span className="flex items-center gap-1 font-bold">
                <span className="hidden sm:inline">👑 {translateUI("premiumDownload", currentLang)}</span>
                <span className="inline sm:hidden">👑 {translateUI("download", currentLang)}</span>
              </span>
            ) : (
              <>
                <span>{translateUI("download", currentLang)}</span>
                <Download className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </>
            )}
          </>
        )}
      </span>
    </button>
  );
}
