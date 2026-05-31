"use client";

import React, { useState, useEffect } from "react";
import { Star, Sparkles, X, Crown, FileText, ImageIcon } from "lucide-react";
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
  onSubmit: (rating: number, name: string, comment: string, format: "pdf" | "jpg" | "png" | "combo") => void;
  onSkip: (name: string, format: "pdf" | "jpg" | "png" | "combo") => void;
  isPremium?: boolean;
  price?: number | null;
  discountPrice?: number | null;
  currency?: string | null;
  // Format-specific pricing overrides
  downloadFormat?: "pdf" | "jpg" | "png" | "combo" | null;
  pdfPrice?: number | null;
  pdfDiscountPrice?: number | null;
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
  const [selectedFormat, setSelectedFormat] = useState<"pdf" | "jpg" | "png" | "combo">("pdf");

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
        className="max-w-[95%] sm:max-w-md max-h-[90vh] md:max-h-[85vh] flex flex-col bg-background/95 backdrop-blur-xl border-0 ring-1 ring-border/50 shadow-[0_20px_70px_-15px_rgba(0,0,0,0.4)] rounded-3xl overflow-hidden p-0 gap-0"
      >
        <div className="bg-gradient-primary py-5 px-6 text-white relative overflow-hidden flex items-center gap-4 border-b border-primary/20 shadow-sm shrink-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
 
          <div className="absolute top-4 right-5 z-20">
            <DialogClose asChild>
              <Button
                variant="ghost"
                className="h-7 w-7 p-0 rounded-full text-white/70 hover:text-white hover:bg-white/20 border-0 cursor-pointer transition-colors"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </DialogClose>
          </div>
 
          <div className="w-11 h-11 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-inner shrink-0 relative z-10">
            <Sparkles className="w-5.5 h-5.5 text-[#E6C97A] fill-[#E6C97A]" />
          </div>
          <div className="text-left flex-1 min-w-0 relative z-10">
            <DialogTitle className="text-lg sm:text-xl font-black tracking-wide text-white leading-tight drop-shadow-sm">
              {isPremium ? "Unlock Premium Design" : "Help Us Improve"}
            </DialogTitle>
            <DialogDescription className="text-[11px] sm:text-xs text-white/90 mt-1 font-semibold leading-tight">
              {isPremium 
                ? "Get premium access with high-resolution download" 
                : "Help us make the platform even better."}
            </DialogDescription>
          </div>
        </div>
 
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 pb-6 sm:pb-8 flex-1 overflow-y-auto flex flex-col gap-4 sm:gap-5 bg-background">
          {/* Premium Pricing Banner */}
          {isPremium && (
            <div className="border border-secondary/30 bg-accent/30 rounded-2xl p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/60 flex items-center justify-center text-secondary-foreground shadow-inner">
                  <Crown className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-black text-foreground uppercase tracking-wider">Premium Template</h4>
                  <p className="text-[10px] text-muted-foreground font-medium mt-0.5">One-time payment for unlimited edits</p>
                </div>
              </div>
              <div className="text-right">
                {resolvedDiscountPrice && resolvedPrice && resolvedPrice > resolvedDiscountPrice ? (
                  <div className="flex flex-col leading-none">
                    <span className="text-[9px] text-muted-foreground/75 line-through font-bold">
                      {currencySymbol}{resolvedPrice}
                    </span>
                    <span className="text-xs font-black text-primary">
                      {currencySymbol}{resolvedDiscountPrice}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs font-black text-primary">
                    {currencySymbol}{resolvedPrice || resolvedDiscountPrice || 49}
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
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
                    className="p-1 transition-transform duration-100 hover:scale-125 active:scale-95 text-secondary cursor-pointer"
                  >
                    <Star
                      className={cn(
                        "w-7 h-7 sm:w-8 sm:h-8 transition-colors duration-150",
                        isFilled
                          ? "fill-secondary stroke-secondary"
                          : "fill-transparent stroke-border"
                      )}
                      strokeWidth={1.5}
                    />
                  </button>
                );
              })}
            </div>
            <span className="text-[11px] font-bold text-primary mt-1 uppercase tracking-wide">
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
              className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >
              Your Name
            </label>
            <input
              id="file-name-input"
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="Enter your name..."
              className="w-full p-3.5 text-xs bg-card/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 placeholder:text-muted-foreground/50 shadow-sm hover:shadow-md font-semibold text-foreground hover:bg-card"
            />
          </div>
 
          <div className="flex flex-col gap-2">
            <label
              htmlFor="feedback-comment"
              className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >
              Any suggestions? (Optional)
            </label>
            <textarea
              id="feedback-comment"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="What can we do to make it even better?..."
              className="w-full min-h-[90px] p-3.5 text-xs bg-card/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-all duration-300 placeholder:text-muted-foreground/50 shadow-sm hover:shadow-md text-foreground hover:bg-card"
            />
          </div>
 
          {/* Format Selection (Only for Free templates) */}
          {!isPremium && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center my-1 select-none shrink-0">
                <div className="flex-1 h-[1px] bg-border" />
                <span className="px-3 text-[9px] sm:text-[10px] font-black text-muted-foreground/80 uppercase tracking-widest">Select Download Format</span>
                <div className="flex-1 h-[1px] bg-border" />
              </div>

              {/* Combo Pack Hero Card (Free) */}
              <button
                type="button"
                onClick={() => setSelectedFormat("combo")}
                className={cn(
                  "flex flex-col w-full p-4 sm:p-5 rounded-2xl text-left border-2 transition-all duration-300 group cursor-pointer shadow-sm relative overflow-hidden active:scale-[0.98] shrink-0",
                  selectedFormat === "combo"
                    ? "bg-gradient-saffron border-[#9B1B30] shadow-[0_8px_30px_rgba(155,27,48,0.25)] ring-2 ring-offset-2 ring-offset-background ring-[#9B1B30]"
                    : "bg-card border-border hover:border-[#9B1B30]/50 hover:shadow-md"
                )}
              >
                {selectedFormat === "combo" && (
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-1/2 h-full animate-shine pointer-events-none z-0" />
                )}
                <div className="absolute right-0 top-0 bg-primary text-[9px] font-black uppercase text-white px-2.5 py-0.5 rounded-bl-lg tracking-wider flex items-center gap-0.5 shadow-xs z-10">
                  <Sparkles className="w-2.5 h-2.5 fill-white animate-pulse" /> Popular Choice
                </div>
                <div className="flex items-center gap-3 w-full relative z-10">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#9B1B30]/5 flex items-center justify-center shrink-0 border border-[#9B1B30]/15 shadow-inner">
                    <Crown className="w-5 h-5 text-[#9B1B30] fill-[#9B1B30]/20 group-hover:animate-wiggle" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs sm:text-sm font-black text-[#2C1117] leading-tight block">All-in-One Combo Pack</span>
                    <span className="text-[10px] sm:text-xs font-extrabold text-[#9B1B30] mt-0.5 block">PDF + JPEG + PNG</span>
                  </div>
                  {selectedFormat === "combo" && (
                    <div className="w-5 h-5 rounded-full bg-[#9B1B30] text-white flex items-center justify-center shadow-md">
                      <Star className="w-3 h-3 fill-white" />
                    </div>
                  )}
                </div>
              </button>

              {/* Individual Formats Grid */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 shrink-0">
                {/* PDF Card */}
                <button
                  type="button"
                  onClick={() => setSelectedFormat("pdf")}
                  className={cn(
                    "flex flex-col items-center p-3 rounded-2xl bg-card border transition-all duration-300 group cursor-pointer text-center shadow-sm active:scale-[0.98]",
                    selectedFormat === "pdf"
                      ? "border-red-500 bg-red-500/[0.08] shadow-[0_4px_15px_rgba(239,68,68,0.2)] ring-2 ring-offset-2 ring-offset-background ring-red-500"
                      : "border-border/80 hover:border-red-500/50 hover:bg-red-500/[0.04] hover:shadow-md hover:-translate-y-0.5"
                  )}
                >
                  <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0 group-hover:bg-red-500/20 group-hover:scale-110 transition-all shadow-inner border border-red-500/10 mb-2 relative">
                    <FileText className="w-4 h-4 text-red-600 dark:text-red-500" />
                  </div>
                  <span className="text-[10px] font-black text-red-700 dark:text-red-400 leading-tight">PDF</span>
                  <span className="text-[8px] text-muted-foreground font-semibold leading-tight mt-0.5">Best for print</span>
                </button>

                {/* JPEG Card */}
                <button
                  type="button"
                  onClick={() => setSelectedFormat("jpg")}
                  className={cn(
                    "flex flex-col items-center p-3 rounded-2xl bg-card border transition-all duration-300 group cursor-pointer text-center shadow-sm active:scale-[0.98]",
                    selectedFormat === "jpg"
                      ? "border-green-500 bg-green-500/[0.08] shadow-[0_4px_15px_rgba(34,197,94,0.2)] ring-2 ring-offset-2 ring-offset-background ring-green-500"
                      : "border-border/80 hover:border-green-500/50 hover:bg-green-500/[0.04] hover:shadow-md hover:-translate-y-0.5"
                  )}
                >
                  <div className="w-8 h-8 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0 group-hover:bg-green-500/20 group-hover:scale-110 transition-all shadow-inner border border-green-500/10 mb-2 relative">
                    <ImageIcon className="w-4 h-4 text-green-600 dark:text-green-500" />
                  </div>
                  <span className="text-[10px] font-black text-green-700 dark:text-green-400 leading-tight">JPEG</span>
                  <span className="text-[8px] text-muted-foreground font-semibold leading-tight mt-0.5">Standard Share</span>
                </button>

                {/* PNG Card */}
                <button
                  type="button"
                  onClick={() => setSelectedFormat("png")}
                  className={cn(
                    "flex flex-col items-center p-3 rounded-2xl bg-card border transition-all duration-300 group cursor-pointer text-center shadow-sm active:scale-[0.98]",
                    selectedFormat === "png"
                      ? "border-purple-500 bg-purple-500/[0.08] shadow-[0_4px_15px_rgba(168,85,247,0.2)] ring-2 ring-offset-2 ring-offset-background ring-purple-500"
                      : "border-border/80 hover:border-purple-500/50 hover:bg-purple-500/[0.04] hover:shadow-md hover:-translate-y-0.5"
                  )}
                >
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0 group-hover:bg-purple-500/20 group-hover:scale-110 transition-all shadow-inner border border-purple-500/10 mb-2 relative">
                    <ImageIcon className="w-4 h-4 text-purple-600 dark:text-purple-500" />
                  </div>
                  <span className="text-[10px] font-black text-purple-700 dark:text-purple-400 leading-tight">PNG</span>
                  <span className="text-[8px] text-muted-foreground font-semibold leading-tight mt-0.5">Lossless Detail</span>
                </button>
              </div>
            </div>
          )}
 
          <div className="flex flex-col gap-3 mt-2">
            <Button
              type="submit"
              className="w-full py-6 rounded-2xl bg-gradient-to-r from-[#9B1B30] to-[#BC2C3D] hover:from-[#7A1323] hover:to-[#9B1B30] text-[#E6C97A] font-extrabold uppercase tracking-wider shadow-lg shadow-[#9B1B30]/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 border border-[#E6C97A]/20 cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {isPremium 
                ? `Submit & Pay ${currencySymbol}${finalPrice}`
                : `Submit & Download Free (${selectedFormat === "jpg" ? "JPEG" : selectedFormat.toUpperCase()})`}
            </Button>
 
            <Button
              type="button"
              onClick={handleSkip}
              variant="outline"
              className="w-full py-5 rounded-2xl border border-border/80 hover:bg-muted/50 hover:border-border text-muted-foreground font-bold tracking-wide transition-all duration-300 cursor-pointer text-xs hover:-translate-y-0.5 active:scale-[0.98]"
            >
              {isPremium 
                ? `Skip & Pay ${currencySymbol}${finalPrice}`
                : `Skip & Download (${selectedFormat === "jpg" ? "JPEG" : selectedFormat.toUpperCase()})`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
