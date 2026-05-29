"use client";

import React from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FileText, FileType, ImageIcon, Sparkles, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

function getCurrencySymbol(currency?: string | null) {
  if (currency === "USD") return "$";
  if (currency === "EUR") return "\u20ac";
  if (currency === "GBP") return "\u00a3";
  return "\u20b9"; // INR default
}

interface PriceModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectFormat: (format: "pdf" | "docx" | "jpg" | "png" | "combo") => void;
  currency?: string | null;
  price?: number | null;
  discountPrice?: number | null;
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

export function PriceModal({
  isOpen,
  onOpenChange,
  onSelectFormat,
  currency = "INR",
  price = null,
  discountPrice = null,
  pdfPrice = null,
  pdfDiscountPrice = null,
  docxPrice = null,
  docxDiscountPrice = null,
  jpgPrice = null,
  jpgDiscountPrice = null,
  pngPrice = null,
  pngDiscountPrice = null,
  comboPrice = null,
  comboDiscountPrice = null,
}: PriceModalProps) {
  const currencySymbol = getCurrencySymbol(currency);

  // Helper to compute a fallback original price dynamically if not directly set
  const getOriginalPrice = (discount: number | null, base: number | null, scale = 1.6) => {
    const val = discount ?? base;
    return val ? Math.round(val * scale) : null;
  };

  // Format-wise prices falling back to main template price/discount if not specified
  const formatPdfPrice = pdfDiscountPrice ?? pdfPrice ?? discountPrice ?? price ?? 49;
  const formatPdfOriginal = pdfPrice ?? price ?? getOriginalPrice(pdfDiscountPrice, discountPrice, 1.6);

  const formatDocxPrice = docxDiscountPrice ?? docxPrice ?? discountPrice ?? price ?? 49;
  const formatDocxOriginal = docxPrice ?? price ?? getOriginalPrice(docxDiscountPrice, discountPrice, 1.6);

  const formatJpgPrice = jpgDiscountPrice ?? jpgPrice ?? discountPrice ?? price ?? 29;
  const formatJpgOriginal = jpgPrice ?? price ?? getOriginalPrice(jpgDiscountPrice, discountPrice, 1.6);

  const formatPngPrice = pngDiscountPrice ?? pngPrice ?? discountPrice ?? price ?? 29;
  const formatPngOriginal = pngPrice ?? price ?? getOriginalPrice(pngDiscountPrice, discountPrice, 1.6);

  const formatComboPrice = comboDiscountPrice ?? comboPrice ?? discountPrice ?? price ?? 79;
  const formatComboOriginalPrice = comboPrice ?? (comboDiscountPrice ? Math.round(comboDiscountPrice * 1.8) : (price ? Math.round(price * 1.5) : 199));

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95%] sm:max-w-md p-0 flex flex-col gap-0 max-h-[90vh] md:max-h-[85vh] overflow-hidden border border-stone-200/80 bg-stone-50/98 shadow-2xl rounded-2xl">
        {/* Compact Header Banner */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 py-3.5 px-5 text-white relative select-none flex items-center gap-3.5 border-b border-amber-500/20 shrink-0">
          <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-xs shrink-0 shadow-inner">
            <Crown className="w-5 h-5 text-amber-100 fill-amber-100/10" />
          </div>
          <div className="text-left flex-1 min-w-0">
            <DialogTitle className="text-base sm:text-lg font-black tracking-wide text-amber-50 leading-tight">
              Select Package & Download
            </DialogTitle>
            <DialogDescription className="text-[10px] sm:text-xs text-amber-100/90 mt-0.5 font-medium leading-tight">
              Unlock edits & download premium formats
            </DialogDescription>
          </div>
        </div>

        {/* Scrollable Container */}
        <div className="p-5 sm:p-6 pb-8 sm:pb-12 flex-1 overflow-y-auto flex flex-col gap-4">
          
          {/* HERO CARD: All-in-One Combo Pack (Light Golden Background) */}
          <button
            onClick={() => onSelectFormat("combo")}
            className="flex flex-col w-full p-4.5 sm:p-5 rounded-2xl text-left bg-gradient-to-br from-amber-50 via-amber-100/20 to-amber-50/90 border-2 border-amber-400 hover:border-amber-500 transition-all group cursor-pointer shadow-sm relative overflow-hidden active:scale-[0.99] shrink-0"
          >
            {/* Recommended Sparkles Badge */}
            <div className="absolute right-0 top-0 bg-amber-500 text-[9px] font-black uppercase text-white px-2.5 py-0.5 rounded-bl-lg tracking-wider flex items-center gap-0.5 shadow-xs z-10">
              <Sparkles className="w-2.5 h-2.5 fill-white animate-pulse" /> Popular Choice
            </div>

            <div className="flex items-center gap-3 w-full">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 border border-amber-300 shadow-inner">
                <Crown className="w-5 h-5 text-amber-800 fill-amber-800/10 animate-wiggle" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs sm:text-sm font-black text-amber-955 leading-tight block">All-in-One Combo Pack</span>
                <span className="text-[10px] sm:text-xs font-extrabold text-amber-700 mt-0.5 block">PDF + Word + JPEG + PNG</span>
              </div>
              <div className="text-right leading-none shrink-0 flex flex-col items-end">
                <span className="text-[10px] sm:text-[11px] font-bold text-stone-400 line-through block">
                  {currencySymbol}{formatComboOriginalPrice}
                </span>
                <span className="text-base sm:text-lg font-black text-amber-900 mt-1 block">
                  {currencySymbol}{formatComboPrice}
                </span>
              </div>
            </div>

            {/* Grid list of format benefits inside the Combo Hero Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mt-4 border-t border-amber-250 pt-3.5 w-full">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0 shadow-[0_0_4px_rgba(217,119,6,0.3)]" />
                <span className="text-[10px] sm:text-[11px] font-bold text-stone-700">PDF (HD Vector Print Quality)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0 shadow-[0_0_4px_rgba(217,119,6,0.3)]" />
                <span className="text-[10px] sm:text-[11px] font-bold text-stone-700">Word (100% Editable Text)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0 shadow-[0_0_4px_rgba(217,119,6,0.3)]" />
                <span className="text-[10px] sm:text-[11px] font-bold text-stone-700">JPEG (Quick WhatsApp Share)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0 shadow-[0_0_4px_rgba(217,119,6,0.3)]" />
                <span className="text-[10px] sm:text-[11px] font-bold text-stone-700">PNG (Lossless High Details)</span>
              </div>
              <div className="flex items-center gap-2 col-span-1 sm:col-span-2 mt-1.5 bg-amber-500/10 py-1.5 px-3 rounded-lg border border-amber-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0 animate-pulse shadow-[0_0_6px_rgba(217,119,6,0.5)]" />
                <span className="text-[10px] sm:text-[11px] font-black text-amber-900">2 Times Edition & Download</span>
              </div>
            </div>
          </button>

          {/* Section Divider */}
          <div className="flex items-center my-1 select-none shrink-0">
            <div className="flex-1 h-[1px] bg-stone-200" />
            <span className="px-3 text-[9px] sm:text-[10px] font-black text-stone-400 uppercase tracking-widest">Or Single Format</span>
            <div className="flex-1 h-[1px] bg-stone-200" />
          </div>

          {/* SLEEK ROW-LIST: Individual Formats */}
          <div className="flex flex-col gap-2.5 shrink-0">
            {/* PDF Row */}
            <button
              onClick={() => onSelectFormat("pdf")}
              className="flex items-center gap-3 w-full p-3 rounded-xl bg-white hover:bg-red-50/20 border border-stone-200/80 hover:border-red-200 transition-all group cursor-pointer text-left shadow-xs active:scale-[0.99] shrink-0"
            >
              <div className="w-8.5 h-8.5 rounded-lg bg-red-50 flex items-center justify-center shrink-0 group-hover:bg-red-100 transition-colors">
                <FileText className="w-4.5 h-4.5 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] sm:text-xs font-black text-stone-800 leading-tight">PDF Document</span>
                  <span className="text-[7px] font-bold uppercase tracking-wider text-red-650 bg-red-50 px-1 py-0.5 rounded shrink-0">Print Ready</span>
                </div>
                <span className="text-[9px] text-stone-400 font-bold leading-none mt-0.5 block">High resolution vector, perfect for printing</span>
              </div>
              <div className="text-right leading-none shrink-0 flex flex-col items-end">
                {formatPdfOriginal && formatPdfOriginal > formatPdfPrice && (
                  <span className="text-[7px] sm:text-[8px] font-bold text-stone-400 line-through">
                    {currencySymbol}{formatPdfOriginal}
                  </span>
                )}
                <span className="text-xs font-black text-stone-850 mt-0.5">
                  {currencySymbol}{formatPdfPrice}
                </span>
              </div>
            </button>

            {/* Word Row */}
            <button
              onClick={() => onSelectFormat("docx")}
              className="flex items-center gap-3 w-full p-3 rounded-xl bg-white hover:bg-blue-50/20 border border-stone-200/80 hover:border-blue-200 transition-all group cursor-pointer text-left shadow-xs active:scale-[0.99] shrink-0"
            >
              <div className="w-8.5 h-8.5 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                <FileType className="w-4.5 h-4.5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] sm:text-xs font-black text-stone-800 leading-tight">Word (DOCX)</span>
                  <span className="text-[7px] font-bold uppercase tracking-wider text-blue-650 bg-blue-50 px-1 py-0.5 rounded shrink-0">Editable</span>
                </div>
                <span className="text-[9px] text-stone-400 font-bold leading-none mt-0.5 block">Modify details in Microsoft Word or WPS Office</span>
              </div>
              <div className="text-right leading-none shrink-0 flex flex-col items-end">
                {formatDocxOriginal && formatDocxOriginal > formatDocxPrice && (
                  <span className="text-[7px] sm:text-[8px] font-bold text-stone-400 line-through">
                    {currencySymbol}{formatDocxOriginal}
                  </span>
                )}
                <span className="text-xs font-black text-stone-850 mt-0.5">
                  {currencySymbol}{formatDocxPrice}
                </span>
              </div>
            </button>

            {/* JPEG Row */}
            <button
              onClick={() => onSelectFormat("jpg")}
              className="flex items-center gap-3 w-full p-3 rounded-xl bg-white hover:bg-green-50/20 border border-stone-200/80 hover:border-green-200 transition-all group cursor-pointer text-left shadow-xs active:scale-[0.99] shrink-0"
            >
              <div className="w-8.5 h-8.5 rounded-lg bg-green-50 flex items-center justify-center shrink-0 group-hover:bg-green-100 transition-colors">
                <ImageIcon className="w-4.5 h-4.5 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] sm:text-xs font-black text-stone-800 leading-tight">JPEG Image</span>
                  <span className="text-[7px] font-bold uppercase tracking-wider text-green-650 bg-green-50 px-1 py-0.5 rounded shrink-0">WhatsApp</span>
                </div>
                <span className="text-[9px] text-stone-400 font-bold leading-none mt-0.5 block">Standard image quality, saved to photo gallery</span>
              </div>
              <div className="text-right leading-none shrink-0 flex flex-col items-end">
                {formatJpgOriginal && formatJpgOriginal > formatJpgPrice && (
                  <span className="text-[7px] sm:text-[8px] font-bold text-stone-400 line-through">
                    {currencySymbol}{formatJpgOriginal}
                  </span>
                )}
                <span className="text-xs font-black text-stone-850 mt-0.5">
                  {currencySymbol}{formatJpgPrice}
                </span>
              </div>
            </button>

            {/* PNG Row */}
            <button
              onClick={() => onSelectFormat("png")}
              className="flex items-center gap-3 w-full p-3 rounded-xl bg-white hover:bg-purple-50/20 border border-stone-200/80 hover:border-purple-200 transition-all group cursor-pointer text-left shadow-xs active:scale-[0.99] shrink-0"
            >
              <div className="w-8.5 h-8.5 rounded-lg bg-purple-50 flex items-center justify-center shrink-0 group-hover:bg-purple-100 transition-colors">
                <ImageIcon className="w-4.5 h-4.5 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] sm:text-xs font-black text-stone-800 leading-tight">PNG Image</span>
                  <span className="text-[7px] font-bold uppercase tracking-wider text-purple-650 bg-purple-50 px-1 py-0.5 rounded shrink-0">Lossless</span>
                </div>
                <span className="text-[9px] text-stone-400 font-bold leading-none mt-0.5 block">Crystal clear text render with high details</span>
              </div>
              <div className="text-right leading-none shrink-0 flex flex-col items-end">
                {formatPngOriginal && formatPngOriginal > formatPngPrice && (
                  <span className="text-[7px] sm:text-[8px] font-bold text-stone-400 line-through">
                    {currencySymbol}{formatPngOriginal}
                  </span>
                )}
                <span className="text-xs font-black text-stone-850 mt-0.5">
                  {currencySymbol}{formatPngPrice}
                </span>
              </div>
            </button>

            {/* Bottom spacing buffer to ensure full visibility and easy scrolling */}
            <div className="h-6 sm:h-8 shrink-0" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
