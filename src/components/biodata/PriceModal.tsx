"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FileText, FileType, ImageIcon, Sparkles, Crown, Check, Tag, X } from "lucide-react";
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
  onSelectFormat: (format: "pdf" | "jpg" | "png" | "combo", couponCode?: string) => void;

  currency?: string | null;
  price?: number | null;
  discountPrice?: number | null;
  pdfPrice?: number | null;
  pdfDiscountPrice?: number | null;
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
  jpgPrice = null,
  jpgDiscountPrice = null,
  pngPrice = null,
  pngDiscountPrice = null,
  comboPrice = null,
  comboDiscountPrice = null,
}: PriceModalProps) {
  const currencySymbol = getCurrencySymbol(currency);

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountType: string; discountValue: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const [availableCoupons, setAvailableCoupons] = useState<{ id: string; code: string; discountType: string; discountValue: number }[]>([]);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      const fetchActiveCoupons = async () => {
        setIsLoadingCoupons(true);
        try {
          const res = await fetch("/api/razorpay/active-coupons");
          const data = await res.json();
          if (res.ok && data.success) {
            setAvailableCoupons(data.coupons || []);
          }
        } catch (err) {
          console.error("Error fetching active coupons:", err);
        } finally {
          setIsLoadingCoupons(false);
        }
      };
      fetchActiveCoupons();
    }
  }, [isOpen]);

  const handleQuickApply = async (codeStr: string) => {
    setCouponCode(codeStr);
    setIsValidating(true);
    setCouponError(null);
    try {
      const res = await fetch("/api/razorpay/validate-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeStr }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Invalid coupon code");
      }
      setAppliedCoupon(data.coupon);
      setCouponError(null);
    } catch (err: any) {
      setCouponError(err.message || "Failed to apply coupon");
      setAppliedCoupon(null);
    } finally {
      setIsValidating(false);
    }
  };

  const calculateDiscountedPrice = (originalPrice: number) => {
    if (!appliedCoupon) return originalPrice;
    let discounted: number;
    if (appliedCoupon.discountType === "percentage") {
      discounted = Math.max(0, originalPrice * (1 - appliedCoupon.discountValue / 100));
    } else {
      discounted = Math.max(0, originalPrice - appliedCoupon.discountValue);
    }
    // Razorpay minimum is ₹1 — clamp sub-₹1 prices UP to ₹1 so the UI
    // matches what the customer will actually be charged.
    if (discounted > 0 && discounted < 1) {
      discounted = 1;
    }
    return discounted;
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsValidating(true);
    setCouponError(null);
    try {
      const res = await fetch("/api/razorpay/validate-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Invalid coupon code");
      }
      setAppliedCoupon(data.coupon);
      setCouponError(null);
    } catch (err: any) {
      setCouponError(err.message || "Failed to apply coupon");
      setAppliedCoupon(null);
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError(null);
  };

  // Helper to compute a fallback original price dynamically if not directly set
  const getOriginalPrice = (discount: number | null, base: number | null, scale = 1.6) => {
    const val = discount ?? base;
    return val ? Math.round(val * scale) : null;
  };

  // Format-wise prices with sensible distinct format-specific fallbacks
  const formatPdfPrice = calculateDiscountedPrice(pdfDiscountPrice ?? pdfPrice ?? 29);
  const formatPdfOriginal = pdfPrice ?? getOriginalPrice(pdfDiscountPrice, null, 1.6) ?? 49;

  const formatJpgPrice = calculateDiscountedPrice(jpgDiscountPrice ?? jpgPrice ?? 19);
  const formatJpgOriginal = jpgPrice ?? getOriginalPrice(jpgDiscountPrice, null, 1.6) ?? 29;

  const formatPngPrice = calculateDiscountedPrice(pngDiscountPrice ?? pngPrice ?? 19);
  const formatPngOriginal = pngPrice ?? getOriginalPrice(pngDiscountPrice, null, 1.6) ?? 29;

  const formatComboPrice = calculateDiscountedPrice(comboDiscountPrice ?? comboPrice ?? 79);
  const formatComboOriginalPrice = comboPrice ?? (comboDiscountPrice ? Math.round(comboDiscountPrice * 1.8) : 199);


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95%] sm:max-w-md p-0 flex flex-col gap-0 max-h-[90vh] md:max-h-[85vh] overflow-hidden border-0 bg-background/95 backdrop-blur-xl shadow-[0_20px_70px_-15px_rgba(0,0,0,0.4)] rounded-3xl [&>button]:text-white [&>button]:focus:ring-primary [&>button]:opacity-90 ring-1 ring-border/50">
        {/* Compact Header Banner with Shine */}
        <div className="bg-gradient-primary py-5 px-6 text-white relative select-none flex items-center gap-4 border-b border-primary/20 shrink-0 overflow-hidden shadow-sm">
          {/* Shine Sweep animation across header */}
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-1/2 h-full animate-shine pointer-events-none z-0" />
          
          <div className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md shrink-0 shadow-inner relative z-10 border border-white/20">
            <Crown className="w-5.5 h-5.5 text-white fill-white/20" />
          </div>
          <div className="text-left flex-1 min-w-0 relative z-10">
            <DialogTitle className="text-lg sm:text-xl font-black tracking-wide text-white leading-tight drop-shadow-sm">
              Select Package & Download
            </DialogTitle>
            <DialogDescription className="text-[11px] sm:text-xs text-white/90 mt-1 font-semibold leading-tight">
              Unlock edits & download premium formats
            </DialogDescription>
          </div>
        </div>

        {/* Scrollable Container */}
        <div className="p-5 sm:p-6 pb-8 sm:pb-12 flex-1 overflow-y-auto flex flex-col gap-4">
          
          {/* Coupon Input Area */}
          <div className="border border-emerald-500/25 bg-emerald-500/[0.03] dark:bg-emerald-500/[0.02] rounded-2xl p-4 flex flex-col gap-3 shadow-sm shrink-0">
            <div className="flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400 tracking-wide">Have a Promo Coupon?</span>
            </div>
            
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[3px]" />
                  <div className="flex flex-col text-left">
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-450">{appliedCoupon.code} applied!</span>
                    <span className="text-[9px] font-semibold text-emerald-700 dark:text-emerald-500/80">
                      {appliedCoupon.discountType === "percentage" 
                        ? `${appliedCoupon.discountValue}% discount applied`
                        : `Flat ${currencySymbol}${appliedCoupon.discountValue} discount applied`}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="p-1 rounded-full hover:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 transition-colors border-0 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter code (e.g. WELCOME50)"
                    className="flex-1 px-3 py-2 text-xs bg-card border border-emerald-500/20 focus:border-emerald-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-muted-foreground/40 font-bold text-foreground transition-all uppercase"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={isValidating || !couponCode.trim()}
                    className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 disabled:from-muted disabled:to-muted text-white disabled:text-muted-foreground text-xs font-black uppercase tracking-wide rounded-xl shadow-md border border-emerald-500/20 cursor-pointer disabled:cursor-not-allowed hover:-translate-y-0.5 active:scale-95 transition-all select-none flex items-center justify-center min-w-[65px]"
                  >
                    {isValidating ? "..." : "Apply"}
                  </button>
                </div>
                {couponError && (
                  <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400 text-left pl-1">
                    ⚠️ {couponError}
                  </span>
                )}
                
                {/* Available Coupons list */}
                {availableCoupons.length > 0 && (
                  <div className="flex flex-col gap-1.5 mt-1.5 pt-2 border-t border-emerald-500/10">
                    <span className="text-[8px] font-black uppercase text-emerald-800/60 dark:text-emerald-400/60 tracking-wider">Available Offers (Click to Apply):</span>
                    <div className="flex flex-wrap gap-1.5 max-h-[85px] overflow-y-auto pr-1">
                      {availableCoupons.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleQuickApply(c.code)}
                          className="text-[9px] font-black text-emerald-700 dark:text-emerald-350 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 hover:scale-[1.02] px-2.5 py-1 rounded-lg cursor-pointer transition-all flex items-center gap-1 select-none"
                        >
                          <Tag className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                          <span>{c.code}</span>
                          <span className="text-[8px] opacity-75 font-semibold">
                            ({c.discountType === "percentage" ? `${c.discountValue}% OFF` : `Flat ${currencySymbol}${c.discountValue} OFF`})
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* HERO CARD: All-in-One Combo Pack (Premium Golden Gradient Background with Shine) */}
          <button
            onClick={() => onSelectFormat("combo", appliedCoupon?.code || undefined)}
            className="flex flex-col w-full p-5 sm:p-6 rounded-2xl text-left bg-gradient-saffron border-2 border-secondary/40 hover:border-secondary hover:shadow-[0_8px_30px_rgba(201,168,76,0.35)] hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer shadow-md relative overflow-hidden active:scale-[0.98] shrink-0"
          >
            {/* Dynamic Shine Beam */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-1/2 h-full animate-shine pointer-events-none z-0" />

            {/* Recommended Sparkles Badge */}
            <div className="absolute right-0 top-0 bg-primary text-[9px] font-black uppercase text-white px-2.5 py-0.5 rounded-bl-lg tracking-wider flex items-center gap-0.5 shadow-xs z-10">
              <Sparkles className="w-2.5 h-2.5 fill-white animate-pulse" /> Popular Choice
            </div>

            <div className="flex items-center gap-3 w-full relative z-10">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/50 flex items-center justify-center shrink-0 border border-[#9B1B30]/15 shadow-inner">
                <Crown className="w-5 h-5 text-[#9B1B30] fill-[#9B1B30]/20 animate-wiggle" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs sm:text-sm font-black text-[#2C1117] leading-tight block">All-in-One Combo Pack</span>
                <span className="text-[10px] sm:text-xs font-extrabold text-[#9B1B30] mt-0.5 block">PDF + JPEG + PNG</span>
              </div>
              <div className="text-right leading-none shrink-0 flex flex-col items-end">
                {formatComboOriginalPrice && (
                  <span className="text-[10px] sm:text-[11px] font-bold text-[#2C1117]/60 line-through block">
                    {currencySymbol}{formatComboOriginalPrice.toFixed(2)}
                  </span>
                )}
                <span className="text-base sm:text-lg font-black text-[#9B1B30] mt-1 block">
                  {currencySymbol}{formatComboPrice.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Grid list of format benefits inside the Combo Hero Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mt-4 border-t border-[#9B1B30]/15 pt-3.5 w-full relative z-10">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#9B1B30] shrink-0 shadow-[0_0_4px_rgba(155,27,48,0.25)]" />
                <span className="text-[10px] sm:text-[11px] font-extrabold text-[#2C1117]">PDF (HD Vector Print Quality)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#9B1B30] shrink-0 shadow-[0_0_4px_rgba(155,27,48,0.25)]" />
                <span className="text-[10px] sm:text-[11px] font-extrabold text-[#2C1117]">JPEG (Quick WhatsApp Share)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#9B1B30] shrink-0 shadow-[0_0_4px_rgba(155,27,48,0.25)]" />
                <span className="text-[10px] sm:text-[11px] font-extrabold text-[#2C1117]">PNG (Lossless High Details)</span>
              </div>
            </div>
          </button>

          {/* Section Divider */}
          <div className="flex items-center my-1 select-none shrink-0">
            <div className="flex-1 h-[1px] bg-border" />
            <span className="px-3 text-[9px] sm:text-[10px] font-black text-muted-foreground/80 uppercase tracking-widest">Or Single Format</span>
            <div className="flex-1 h-[1px] bg-border" />
          </div>

          {/* BENTO GRID: Individual Formats */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 shrink-0">
            {/* PDF Card */}
            <button
              onClick={() => onSelectFormat("pdf", appliedCoupon?.code || undefined)}
              className="flex flex-col items-center p-4 rounded-2xl bg-card border border-border/80 hover:border-red-500/50 hover:bg-red-500/[0.04] transition-all duration-300 group cursor-pointer text-center shadow-sm hover:shadow-lg hover:-translate-y-1 active:scale-[0.98]"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center shrink-0 group-hover:bg-red-500/20 group-hover:scale-110 transition-all shadow-inner border border-red-500/10 mb-3 relative">
                <FileText className="w-6 h-6 text-red-600 dark:text-red-500" />
                <span className="absolute -top-2 -right-2 text-[7px] font-bold uppercase tracking-wider text-red-600 dark:text-red-500 bg-red-500/15 border border-red-500/20 px-1.5 py-0.5 rounded shadow-sm backdrop-blur-md">Print</span>
              </div>
              <span className="text-[11px] sm:text-xs font-black text-red-700 dark:text-red-400 leading-tight">PDF Document</span>
              <span className="text-[9px] text-muted-foreground font-semibold leading-tight mt-1 mb-2 px-1">High resolution vector, print ready</span>
              
              <div className="flex flex-col items-center w-full pt-3 mt-auto border-t border-border/50">
                {formatPdfOriginal && formatPdfOriginal > formatPdfPrice ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-bold text-muted-foreground/60 line-through">
                      {currencySymbol}{formatPdfOriginal.toFixed(2)}
                    </span>
                    <span className="text-sm font-black text-red-600 dark:text-red-500">
                      {currencySymbol}{formatPdfPrice.toFixed(2)}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm font-black text-red-600 dark:text-red-500">
                    {currencySymbol}{formatPdfPrice.toFixed(2)}
                  </span>
                )}
              </div>
            </button>
 
            {/* JPEG Card */}
            <button
              onClick={() => onSelectFormat("jpg", appliedCoupon?.code || undefined)}
              className="flex flex-col items-center p-4 rounded-2xl bg-card border border-border/80 hover:border-green-500/50 hover:bg-green-500/[0.04] transition-all duration-300 group cursor-pointer text-center shadow-sm hover:shadow-lg hover:-translate-y-1 active:scale-[0.98]"
            >
              <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center shrink-0 group-hover:bg-green-500/20 group-hover:scale-110 transition-all shadow-inner border border-green-500/10 mb-3 relative">
                <ImageIcon className="w-6 h-6 text-green-600 dark:text-green-500" />
                <span className="absolute -top-2 -right-2 text-[7px] font-bold uppercase tracking-wider text-green-600 dark:text-green-500 bg-green-500/15 border border-green-500/20 px-1.5 py-0.5 rounded shadow-sm backdrop-blur-md">Share</span>
              </div>
              <span className="text-[11px] sm:text-xs font-black text-green-700 dark:text-green-400 leading-tight">JPEG Image</span>
              <span className="text-[9px] text-muted-foreground font-semibold leading-tight mt-1 mb-2 px-1">Standard quality, best for WhatsApp</span>
              
              <div className="flex flex-col items-center w-full pt-3 mt-auto border-t border-border/50">
                {formatJpgOriginal && formatJpgOriginal > formatJpgPrice ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-bold text-muted-foreground/60 line-through">
                      {currencySymbol}{formatJpgOriginal.toFixed(2)}
                    </span>
                    <span className="text-sm font-black text-green-600 dark:text-green-500">
                      {currencySymbol}{formatJpgPrice.toFixed(2)}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm font-black text-green-600 dark:text-green-500">
                    {currencySymbol}{formatJpgPrice.toFixed(2)}
                  </span>
                )}
              </div>
            </button>
 
            {/* PNG Card */}
            <button
              onClick={() => onSelectFormat("png", appliedCoupon?.code || undefined)}
              className="flex flex-col items-center p-4 rounded-2xl bg-card border border-border/80 hover:border-purple-500/50 hover:bg-purple-500/[0.04] transition-all duration-300 group cursor-pointer text-center shadow-sm hover:shadow-lg hover:-translate-y-1 active:scale-[0.98]"
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center shrink-0 group-hover:bg-purple-500/20 group-hover:scale-110 transition-all shadow-inner border border-purple-500/10 mb-3 relative">
                <ImageIcon className="w-6 h-6 text-purple-600 dark:text-purple-500" />
                <span className="absolute -top-2 -right-2 text-[7px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-500 bg-purple-500/15 border border-purple-500/20 px-1.5 py-0.5 rounded shadow-sm backdrop-blur-md">Clear</span>
              </div>
              <span className="text-[11px] sm:text-xs font-black text-purple-700 dark:text-purple-400 leading-tight">PNG Image</span>
              <span className="text-[9px] text-muted-foreground font-semibold leading-tight mt-1 mb-2 px-1">Lossless rendering with high details</span>
              
              <div className="flex flex-col items-center w-full pt-3 mt-auto border-t border-border/50">
                {formatPngOriginal && formatPngOriginal > formatPngPrice ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-bold text-muted-foreground/60 line-through">
                      {currencySymbol}{formatPngOriginal.toFixed(2)}
                    </span>
                    <span className="text-sm font-black text-purple-600 dark:text-purple-500">
                      {currencySymbol}{formatPngPrice.toFixed(2)}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm font-black text-purple-600 dark:text-purple-500">
                    {currencySymbol}{formatPngPrice.toFixed(2)}
                  </span>
                )}
              </div>
            </button>
          </div>

          {/* Bottom spacing buffer to ensure full visibility and easy scrolling */}
          <div className="h-2 shrink-0" />

        </div>
      </DialogContent>
    </Dialog>
  );
}
