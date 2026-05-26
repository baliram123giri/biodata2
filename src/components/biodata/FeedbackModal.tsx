"use client";

import React, { useState, useEffect } from "react";
import { Star, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface FeedbackModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialName: string;
  onSubmit: (rating: number, name: string, comment: string) => void;
  onSkip: (name: string) => void;
}

export function FeedbackModal({
  isOpen,
  onOpenChange,
  initialName,
  onSubmit,
  onSkip,
}: FeedbackModalProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [filename, setFilename] = useState("");
  const [feedbackText, setFeedbackText] = useState("");

  // Sync initialName when modal opens
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
    onSubmit(rating, filename, feedbackText);
  };

  const handleSkip = () => {
    onSkip(filename);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md bg-white border border-stone-200 shadow-2xl rounded-2xl overflow-hidden p-0 gap-0"
      >
        <div className="bg-gradient-to-br from-[#3D0810] via-[#5C0F1B] to-[#3D0810] px-6 py-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9A84C]/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-[#D4627A]/10 rounded-full blur-2xl" />

            <DialogClose asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 rounded-full text-white/70 hover:text-white hover:bg-white/15 border-0 cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
                <span className="sr-only">Close</span>
              </Button>
            </DialogClose>

          <div className="relative z-10 text-center flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-inner mb-2 animate-bounce">
              <Sparkles className="w-6 h-6 text-[#E6C97A] fill-[#E6C97A]" />
            </div>
            <DialogTitle className="text-xl font-extrabold tracking-tight text-white">
              Help Us Improve
            </DialogTitle>
            <DialogDescription className="text-stone-300 text-xs mt-1 max-w-[280px]">
              We read every suggestion to improve the experience.
            </DialogDescription>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5 bg-stone-50/50">
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
                        "w-8 h-8 transition-colors duration-150",
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

          <div className="flex flex-col gap-2.5 mt-2">
            <Button
              type="submit"
              className="w-full py-6 rounded-xl bg-gradient-to-r from-[#9B1B30] to-[#BC2C3D] hover:from-[#7A1323] hover:to-[#9B1B30] text-[#E6C97A] font-extrabold uppercase tracking-wider shadow-lg shadow-[#9B1B30]/25 transition-all duration-200 border border-[#E6C97A]/20 cursor-pointer active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Submit & Download Free
            </Button>

            <Button
              type="button"
              onClick={handleSkip}
              variant="outline"
              className="w-full py-5 rounded-xl border border-stone-200 hover:bg-stone-100/80 text-stone-500 font-bold tracking-wide transition-colors cursor-pointer text-xs"
            >
              Skip & Download
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
