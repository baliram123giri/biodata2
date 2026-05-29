"use client";

import React, { useState, useEffect } from "react";
import { Star, Sparkles, X, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

function getCurrencySymbol(currency?: string | null) {
  if (currency === "USD") return "$";
  if (currency === "EUR") return "\u20ac";
  if (currency === "GBP") return "\u00a3";
  return "\u20b9"; // INR default
}

interface FeedbackModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialName: string;
  onSubmit: (rating: number, name: string, comment: string, format: "pdf" | "docx" | "jpg" | "png" | "combo") => void;
  onSkip: (name: string, format: "pdf" | "docx" | "jpg" | "png" | "combo") => void;
  isPremium?: boolean;
  price?: number | null;
  discountPrice?: number | null;
  currency?: string | null;
  // Format-specific pricing overrides
  downloadFormat?: "pdf" | "docx" | "jpg" | "png" | "combo" | null;
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

export function FeedbackModal({
  isOpen,
  onOpenChange,
  initialName,
  onSubmit,
  onSkip,
  isPremium = false,
  price = null,
  discountPrice = null,
  currency = "INR",
  downloadFormat = null,
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
}: FeedbackModalProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [filename, setFilename] = useState("");
  const [feedbackText, setFeedbackText] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<"pdf" | "docx" | "jpg" | "png" | "combo">("pdf");

  // Sync initialName and format when modal opens
  useEffect(() => {
    if (isOpen) {
      setFilename(initialName);
      setRating(5);
      setHoverRating(null);
      setFeedbackText("");
      if (downloadFormat) {
        setSelectedFormat(downloadFormat);
      }
    }
  }, [isOpen, initialName, downloadFormat]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(rating, filename, feedbackText, selectedFormat);
  };

  const handleSkip = () => {
    onSkip(filename, selectedFormat);
  };

  const currencySymbol = getCurrencySymbol(currency);

  // Dynamically resolve format-specific prices or fallback to overall price
  let resolvedPrice = price;
  let resolvedDiscountPrice = discountPrice;

  if (selectedFormat === "pdf") {
    resolvedPrice = pdfPrice ?? price;
    resolvedDiscountPrice = pdfDiscountPrice ?? discountPrice;
  } else if (selectedFormat === "docx") {
    resolvedPrice = docxPrice ?? price;
    resolvedDiscountPrice = docxDiscountPrice ?? discountPrice;
  } else if (selectedFormat === "jpg") {
    resolvedPrice = jpgPrice ?? price;
    resolvedDiscountPrice = jpgDiscountPrice ?? discountPrice;
  } else if (selectedFormat === "png") {
    resolvedPrice = pngPrice ?? price;
    resolvedDiscountPrice = pngDiscountPrice ?? discountPrice;
  } else if (selectedFormat === "combo") {
    resolvedPrice = comboPrice ?? price ?? 199;
    resolvedDiscountPrice = comboDiscountPrice ?? discountPrice ?? 79;
  }

  const finalPrice = resolvedDiscountPrice ?? resolvedPrice ?? 49;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[95%] sm:max-w-md bg-white border border-stone-200 shadow-2xl rounded-2xl overflow-hidden p-0 gap-0"
      >
        <div className="bg-gradient-to-br from-[#3D0810] via-[#5C0F1B] to-[#3D0810] py-3.5 px-5 text-white relative overflow-hidden flex items-center gap-3.5 border-b border-white/5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9A84C]/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-[#D4627A]/5 rounded-full blur-2xl pointer-events-none" />

          <div className="absolute top-3.5 right-4 z-20">
            <DialogClose asChild>
              <Button
                variant="ghost"
                className="h-7 w-7 p-0 rounded-full text-white/70 hover:text-white hover:bg-white/15 border-0 cursor-pointer"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </DialogClose>
          </div>

          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-inner shrink-0 relative z-10">
            <Sparkles className="w-5 h-5 text-[#E6C97A] fill-[#E6C97A]" />
          </div>
          <div className="text-left flex-1 min-w-0 relative z-10">
            <DialogTitle className="text-base sm:text-lg font-black tracking-wide text-white leading-tight">
              {isPremium ? "Unlock Premium Design" : "Help Us Improve"}
            </DialogTitle>
            <DialogDescription className="text-[10px] sm:text-xs text-stone-300 mt-0.5 font-medium leading-tight">
              {isPremium 
                ? "Get premium access with high-resolution download" 
                : "Help us make the platform even better."}
            </DialogDescription>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 flex flex-col gap-4 sm:gap-5 bg-stone-50/50">
          {/* Premium Pricing Banner */}
          {isPremium && (
            <div className="border border-amber-200 bg-amber-50/40 rounded-xl p-3 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
                  <Crown className="w-4.5 h-4.5" />
                </div>
                <div className="text-left">
                  <h4 className="text-[11px] font-black text-amber-900 uppercase tracking-wider">Premium Template</h4>
                  <p className="text-[9px] text-amber-700 font-medium">One-time payment for unlimited edits & downloads</p>
                </div>
              </div>
              <div className="text-right">
                {resolvedDiscountPrice && resolvedPrice && resolvedPrice > resolvedDiscountPrice ? (
                  <div className="flex flex-col leading-none">
                    <span className="text-[9px] text-stone-400 line-through font-bold">
                      {currencySymbol}{resolvedPrice}
                    </span>
                    <span className="text-xs font-black text-[#9B1B30]">
                      {currencySymbol}{resolvedDiscountPrice}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs font-black text-[#9B1B30]">
                    {currencySymbol}{resolvedPrice || resolvedDiscountPrice || 49}
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Your Rating
            </span>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled =
                  hoverRating !== null ? star <= hoverRating : star <= rating;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1 transition-transform duration-100 hover:scale-125 active:scale-95 text-[#C9A84C] cursor-pointer"
                  >
                    <Star
                      className={cn(
                        "w-7 h-7 sm:w-8 sm:h-8 transition-colors duration-150",
                        isFilled
                          ? "fill-[#C9A84C] stroke-[#C9A84C]"
                          : "fill-transparent stroke-stone-300"
                      )}
                      strokeWidth={1.5}
                    />
                  </button>
                );
              })}
            </div>
            <span className="text-[11px] font-bold text-[#9B1B30] mt-1 uppercase tracking-wide">
              {rating === 5 && "Excellent! Love it 😍"}
              {rating === 4 && "Great experience! 🙂"}
              {rating === 3 && "Good / Average 😐"}
              {rating === 2 && "Needs improvement 🙁"}
              {rating === 1 && "Very poor experience 😡"}
            </span>
          </div>

          {/* File Name Input */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="file-name-input"
              className="text-xs font-bold uppercase tracking-wider text-stone-500"
            >
              Your Name
            </label>
            <input
              id="file-name-input"
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="Enter your name..."
              className="w-full p-3 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B1B30]/20 focus:border-[#9B1B30] transition-all placeholder:text-stone-400 shadow-sm font-semibold text-stone-800"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="feedback-comment"
              className="text-xs font-bold uppercase tracking-wider text-stone-500"
            >
              Any suggestions? (Optional)
            </label>
            <textarea
              id="feedback-comment"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="What can we do to make it even better?..."
              className="w-full min-h-[80px] p-3 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B1B30]/20 focus:border-[#9B1B30] resize-none transition-all placeholder:text-stone-400 shadow-sm"
            />
          </div>

          {/* Format Selection (Only for Free templates) */}
          {!isPremium && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Select Download Format
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: "pdf", label: "PDF", desc: "Best for print", color: "hover:bg-red-50 hover:border-red-200 text-red-700 hover:text-red-800" },
                  { id: "docx", label: "Word", desc: "Editable Doc", color: "hover:bg-blue-50 hover:border-blue-200 text-blue-700 hover:text-blue-800" },
                  { id: "jpg", label: "JPEG", desc: "Standard Image", color: "hover:bg-green-50 hover:border-green-200 text-green-700 hover:text-green-800" },
                  { id: "png", label: "PNG", desc: "Lossless Image", color: "hover:bg-purple-50 hover:border-purple-200 text-purple-700 hover:text-purple-800" },
                  { id: "combo", label: "Combo Pack", desc: "All-in-One", color: "col-span-2 sm:col-span-1 hover:bg-amber-50 hover:border-amber-250 text-amber-700 hover:text-amber-800" }
                ].map((fmt) => {
                  const isSelected = selectedFormat === fmt.id;
                  return (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => setSelectedFormat(fmt.id as any)}
                      className={cn(
                        "flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer",
                        fmt.color,
                        isSelected
                          ? "border-stone-800 bg-stone-900 text-white hover:bg-stone-900 hover:border-stone-900 hover:text-white shadow-sm"
                          : "border-stone-200/80 bg-white text-stone-600"
                      )}
                    >
                      <span className="text-xs font-black tracking-wide leading-none">{fmt.label}</span>
                      <span className={cn("text-[9px] font-bold mt-1", isSelected ? "text-stone-300" : "text-stone-400")}>{fmt.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2.5 mt-2">
            <Button
              type="submit"
              className="w-full py-6 rounded-xl bg-gradient-to-r from-[#9B1B30] to-[#BC2C3D] hover:from-[#7A1323] hover:to-[#9B1B30] text-[#E6C97A] font-extrabold uppercase tracking-wider shadow-lg shadow-[#9B1B30]/25 transition-all duration-200 border border-[#E6C97A]/20 cursor-pointer active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {isPremium 
                ? `Submit & Pay ${currencySymbol}${finalPrice}`
                : `Submit & Download Free (${selectedFormat.toUpperCase()})`}
            </Button>

            <Button
              type="button"
              onClick={handleSkip}
              variant="outline"
              className="w-full py-5 rounded-xl border border-stone-200 hover:bg-stone-100/80 text-stone-500 font-bold tracking-wide transition-colors cursor-pointer text-xs"
            >
              {isPremium 
                ? `Skip & Pay ${currencySymbol}${finalPrice}`
                : `Skip & Download (${selectedFormat.toUpperCase()})`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
