"use client";

import React, { useState, useEffect } from "react";
import { Star, Sparkles, X, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useBiodataStore } from "@/store/useBiodataStore";
import { translateUI } from "@/lib/translations";
import { getReligionTheme } from "@/lib/religionThemes";

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
  downloadFormat?: "pdf" | "jpg" | "png" | "combo" | null;
  pdfPrice?: number | null;
  pdfDiscountPrice?: number | null;
  jpgPrice?: number | null;
  jpgDiscountPrice?: number | null;
  pngPrice?: number | null;
  pngDiscountPrice?: number | null;
  comboPrice?: number | null;
  comboDiscountPrice?: number | null;
  religion?: string | null;
}

export function FeedbackModal({
  isOpen,
  onOpenChange,
  initialName,
  onSubmit,
  onSkip,
  downloadFormat = "pdf",
  religion = null,
}: FeedbackModalProps) {
  const currentLang = useBiodataStore(state => state.formData?.language) || "English";
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [filename, setFilename] = useState("");
  const [feedbackText, setFeedbackText] = useState("");
  const theme = getReligionTheme(religion);

  useEffect(() => {
    if (isOpen) {
      setFilename(initialName);
      setRating(5);
      setHoverRating(null);
      setFeedbackText("");
    }
  }, [isOpen, initialName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(rating, filename, feedbackText, downloadFormat || "pdf");
  };

  const handleSkip = () => {
    onSkip(filename, downloadFormat || "pdf");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="max-w-[95%] sm:max-w-md max-h-[90vh] md:max-h-[85vh] flex flex-col bg-background/95 backdrop-blur-xl border-0 ring-1 ring-border/50 shadow-[0_20px_70px_-15px_rgba(0,0,0,0.4)] rounded-3xl overflow-hidden p-0 gap-0"
      >
        <div 
          className={cn(
            "py-5 px-6 text-white relative overflow-hidden flex items-center gap-4 shrink-0 shadow-sm",
            theme ? "border-transparent" : "bg-gradient-primary border-primary/20"
          )}
          style={theme ? { backgroundColor: theme.primary, borderBottomColor: theme.secondaryLight } : undefined}
        >
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
            <Heart className="w-5.5 h-5.5 text-rose-350 fill-rose-350/40 animate-pulse" />
          </div>
          <div className="text-left flex-1 min-w-0 relative z-10">
            <DialogTitle className="text-lg sm:text-xl font-black tracking-wide text-white leading-tight drop-shadow-sm">
              {translateUI("helpUsImprove", currentLang)}
            </DialogTitle>
            <DialogDescription className="text-[11px] sm:text-xs text-white/90 mt-1 font-semibold leading-tight">
              {translateUI("helpUsImproveDesc", currentLang)}
            </DialogDescription>
          </div>
        </div>
 
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 pb-6 sm:pb-8 flex-1 overflow-y-auto flex flex-col gap-4 sm:gap-5 bg-background">
          <div className="flex flex-col items-center gap-2 mt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {translateUI("yourRating", currentLang)}
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
              {rating === 5 && translateUI("excellentRating", currentLang)}
              {rating === 4 && translateUI("greatRating", currentLang)}
              {rating === 3 && translateUI("goodRating", currentLang)}
              {rating === 2 && translateUI("needsImprovementRating", currentLang)}
              {rating === 1 && translateUI("poorRating", currentLang)}
            </span>
          </div>
 
          {/* File Name Input */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="file-name-input"
              className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >
              {translateUI("yourName", currentLang)}
            </label>
            <input
              id="file-name-input"
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder={translateUI("enterYourName", currentLang)}
              className="w-full p-3.5 text-xs bg-card/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 placeholder:text-muted-foreground/50 shadow-sm hover:shadow-md font-semibold text-foreground hover:bg-card"
            />
          </div>
 
          <div className="flex flex-col gap-2">
            <label
              htmlFor="feedback-comment"
              className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >
              {translateUI("suggestionsOptional", currentLang)}
            </label>
            <textarea
              id="feedback-comment"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder={translateUI("suggestionsPlaceholder", currentLang)}
              className="w-full min-h-[90px] p-3.5 text-xs bg-card/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-all duration-300 placeholder:text-muted-foreground/50 shadow-sm hover:shadow-md text-foreground hover:bg-card"
            />
          </div>
 
          <div className="flex flex-col gap-3 mt-4">
            <Button
              type="submit"
              className={cn(
                "w-full py-6 rounded-2xl font-extrabold uppercase tracking-wider transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 border cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2",
                !theme && "bg-gradient-to-r from-[#9B1B30] to-[#BC2C3D] hover:from-[#7A1323] hover:to-[#9B1B30] text-[#E6C97A] shadow-[#9B1B30]/30 border-[#E6C97A]/20"
              )}
              style={theme ? {
                backgroundColor: theme.primary,
                color: "#ffffff",
                boxShadow: `0 8px 30px ${theme.shadowColor}`,
                borderColor: "transparent"
              } : undefined}
            >
              <Sparkles className="w-4 h-4" />
              Submit Feedback
            </Button>
 
            <Button
              type="button"
              onClick={handleSkip}
              variant="outline"
              className="w-full py-5 rounded-2xl border border-border/80 hover:bg-muted/50 hover:border-border text-muted-foreground font-bold tracking-wide transition-all duration-300 cursor-pointer text-xs hover:-translate-y-0.5 active:scale-[0.98]"
            >
              Skip / Close
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
