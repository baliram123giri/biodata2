"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FileText, FileType, ImageIcon, Sparkles, Crown, Check, Tag, X, Lock, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBiodataStore } from "@/store/useBiodataStore";
import { translateUI } from "@/lib/translations";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

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
  isPremium?: boolean;
  isGenerating?: boolean;
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
  isPremium = true,
  isGenerating = false,
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
  const currentLang = useBiodataStore(state => state.formData?.language) || "English";
  const currencySymbol = getCurrencySymbol(currency);

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountType: string; discountValue: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const [availableCoupons, setAvailableCoupons] = useState<{ id: string; code: string; discountType: string; discountValue: number }[]>([]);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<"combo" | "pdf" | "jpg" | "png">("combo");

  const getSelectedPrice = () => {
    if (selectedFormat === "combo") return formatComboPrice;
    if (selectedFormat === "pdf") return formatPdfPrice;
    if (selectedFormat === "jpg") return formatJpgPrice;
    return formatPngPrice;
  };

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
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="max-w-[95%] sm:max-w-md p-0 flex flex-col gap-0 max-h-[90vh] md:max-h-[85vh] overflow-hidden border-0 bg-background/95 backdrop-blur-xl shadow-[0_20px_70px_-15px_rgba(0,0,0,0.4)] rounded-3xl [&>button]:text-white [&>button]:focus:ring-primary [&>button]:opacity-90 ring-1 ring-border/50"
      >
        {/* Compact Header Banner with Shine */}
        <div className="bg-gradient-primary py-5 px-6 text-white relative select-none flex items-center gap-4 border-b border-primary/20 shrink-0 overflow-hidden shadow-sm">
          {/* Shine Sweep animation across header */}
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-1/2 h-full animate-shine pointer-events-none z-0" />
          
          <div className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md shrink-0 shadow-inner relative z-10 border border-white/20">
            <Crown className="w-5.5 h-5.5 text-white fill-white/20" />
          </div>
          <div className="text-left flex-1 min-w-0 relative z-10">
            <DialogTitle className="text-lg sm:text-xl font-black tracking-wide text-white leading-tight drop-shadow-sm">
              {translateUI("selectPackageDownload", currentLang)}
            </DialogTitle>
            <DialogDescription className="text-[11px] sm:text-xs text-white/90 mt-1 font-semibold leading-tight">
              {translateUI("unlockEditsPremiumDesc", currentLang)}
            </DialogDescription>
          </div>
        </div>

        {/* Scrollable Container */}
        <div className="p-5 sm:p-6 pb-8 sm:pb-12 flex-1 overflow-y-auto flex flex-col gap-4">
          {isPremium && (isLoadingCoupons || availableCoupons.length > 0 || appliedCoupon) && (
            <Accordion type="single" collapsible className="w-full shrink-0 border-0">
              <AccordionItem value="coupons-offers" className="border-0 bg-emerald-500/[0.03] dark:bg-emerald-500/[0.02] border border-emerald-500/25 rounded-3xl overflow-hidden shadow-xs">
                <AccordionTrigger className="hover:no-underline px-4 py-3.5 flex items-center justify-between transition-all border-0 [&[data-state=open]>svg]:rotate-180">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-emerald-600 dark:text-emerald-450 animate-pulse" />
                    <span className="text-[11px] font-black uppercase text-emerald-850 dark:text-emerald-450 tracking-wider">Offers & Coupons</span>
                  </div>
                  {appliedCoupon && (
                    <span className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[8.5px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full animate-bounce mr-2">
                      Applied!
                    </span>
                  )}
                </AccordionTrigger>
                
                <AccordionContent className="px-4 pb-4 pt-1.5 flex flex-col gap-3.5 border-t border-emerald-500/10">
                  {/* Blinkit-Style Coupon Input Field (only shown if no coupon is applied) */}
                  {!appliedCoupon && (
                    <div className="flex items-center gap-2 bg-background border border-emerald-500/20 rounded-xl p-1 shadow-inner relative">
                      <div className="pl-2 shrink-0">
                        <Tag className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter coupon code"
                        className="flex-1 bg-transparent text-xs font-bold focus:outline-none placeholder:text-muted-foreground/60 border-0 p-1 uppercase"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={!couponCode || isValidating}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed border-0 cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                  )}

                  {couponError && !appliedCoupon && (
                    <span className="text-[9px] font-bold text-rose-600 dark:text-rose-450 text-left pl-1">
                      ⚠️ {couponError}
                    </span>
                  )}

                  {/* Applied Coupon Card */}
                  {appliedCoupon && (
                    <div className="relative flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-dashed border-emerald-500 overflow-hidden shadow-sm">
                      {/* Punch cuts on left and right sides */}
                      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-background border-r border-dashed border-emerald-500" />
                      <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-background border-l border-dashed border-emerald-500" />

                      <div className="flex items-center gap-3 pl-2">
                        <div className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/35">
                          <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-450 stroke-[3px]" />
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="text-[11px] font-black uppercase tracking-widest text-emerald-800 dark:text-emerald-400">{appliedCoupon.code}</span>
                          <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-500/80 mt-0.5">
                            {appliedCoupon.discountType === "percentage" 
                              ? `${appliedCoupon.discountValue}% OFF Applied successfully`
                              : `FLAT ${currencySymbol}${appliedCoupon.discountValue} OFF Applied successfully`}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-[10px] font-black uppercase text-rose-600 hover:text-rose-700 pr-2 transition-all active:scale-95 border-0 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {/* Available Coupons list */}
                  {!appliedCoupon && (
                    <div className="flex flex-col gap-2">
                      {isLoadingCoupons ? (
                        <span className="text-[10px] text-muted-foreground animate-pulse text-left pl-1">{translateUI("loadingActiveOffers", currentLang)}</span>
                      ) : availableCoupons.length > 0 ? (
                        <div className="flex flex-col gap-2">
                          <span className="text-[9.5px] font-black uppercase text-emerald-855 dark:text-emerald-400 tracking-wider text-left pl-1">Available Vouchers</span>
                          
                          <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1">
                            {availableCoupons.map((c) => (
                              <div
                                key={c.id}
                                className="relative flex items-center justify-between p-3 rounded-xl bg-emerald-500/[0.04] dark:bg-emerald-950/15 border border-dashed border-emerald-500/30 overflow-hidden shadow-xs hover:border-emerald-500/60 transition-all duration-300"
                              >
                                {/* Punch cuts on left and right sides */}
                                <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 w-3 h-3 rounded-full bg-background border-r border-dashed border-emerald-500/30" />
                                <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 w-3 h-3 rounded-full bg-background border-l border-dashed border-emerald-500/30" />

                                <div className="flex items-center gap-2.5 pl-1.5">
                                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                                    <Tag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                  </div>
                                  <div className="flex flex-col text-left">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-450">{c.code}</span>
                                    <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-500 leading-tight mt-0.5">
                                      {c.discountType === "percentage" 
                                        ? `Save ${c.discountValue}% on your order` 
                                        : `FLAT ${currencySymbol}${c.discountValue} OFF`}
                                    </span>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  disabled={isValidating}
                                  onClick={() => handleQuickApply(c.code)}
                                  className="text-[10px] font-black uppercase text-emerald-600 hover:text-emerald-700 pr-1.5 transition-all active:scale-95 disabled:opacity-50 border-0 cursor-pointer"
                                >
                                  Apply
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
              {/* STACKED LIST: Format Selections */}
          <div className="flex flex-col gap-3 shrink-0">
            {/* Combo Pack Selection */}
            <button
              type="button"
              onClick={() => setSelectedFormat("combo")}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden select-none cursor-pointer",
                selectedFormat === "combo"
                  ? "bg-gradient-saffron/10 border-secondary shadow-[0_4px_20px_rgba(201,168,76,0.15)] ring-1 ring-secondary/30"
                  : "bg-card border-border/80 hover:bg-stone-50 dark:hover:bg-stone-900/40"
              )}
            >
              {/* Dynamic Shine Beam */}
              {selectedFormat === "combo" && (
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent w-1/2 h-full animate-shine pointer-events-none z-0" />
              )}

              {/* Radio Indicator */}
              <div className="shrink-0 relative z-10">
                {selectedFormat === "combo" ? (
                  <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center bg-primary">
                    <Check className="w-3.5 h-3.5 text-white stroke-[3.5px]" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-stone-300 dark:border-stone-700" />
                )}
              </div>

              <div className="flex-1 min-w-0 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-black text-foreground">{translateUI("comboPackTitle", currentLang)}</span>
                  <span className="bg-primary text-white text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded flex items-center gap-0.5 animate-pulse">
                    <Sparkles className="w-2 h-2 fill-white" /> Popular
                  </span>
                </div>
                <span className="text-[10px] sm:text-xs text-muted-foreground font-semibold block mt-0.5">{translateUI("pdfJpgPngCombo", currentLang)}</span>
              </div>

              <div className="text-right leading-none shrink-0 flex flex-col items-end relative z-10">
                {isPremium ? (
                  <>
                    {formatComboOriginalPrice && (
                      <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground/60 line-through">
                        {currencySymbol}{formatComboOriginalPrice.toFixed(2)}
                      </span>
                    )}
                    <span className="text-sm sm:text-base font-black text-primary mt-1">
                      {currencySymbol}{formatComboPrice.toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="bg-emerald-555 text-emerald-700 dark:text-emerald-450 text-[9.5px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                    FREE
                  </span>
                )}
              </div>
            </button>

            {/* PDF Selection */}
            <button
              type="button"
              onClick={() => setSelectedFormat("pdf")}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden select-none cursor-pointer",
                selectedFormat === "pdf"
                  ? "bg-red-500/[0.04] border-red-500 shadow-[0_4px_20px_rgba(220,38,38,0.08)] ring-1 ring-red-500/20"
                  : "bg-card border-border/80 hover:bg-stone-50 dark:hover:bg-stone-900/40"
              )}
            >
              {/* Radio Indicator */}
              <div className="shrink-0 relative z-10">
                {selectedFormat === "pdf" ? (
                  <div className="w-5 h-5 rounded-full border-2 border-red-600 flex items-center justify-center bg-red-600">
                    <Check className="w-3.5 h-3.5 text-white stroke-[3.5px]" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-stone-300 dark:border-stone-700" />
                )}
              </div>

              <div className="flex-1 min-w-0 relative z-10">
                <span className="text-xs sm:text-sm font-black text-foreground block">{translateUI("pdfDocument", currentLang)}</span>
                <span className="text-[10px] sm:text-xs text-muted-foreground font-semibold block mt-0.5">{translateUI("highResVectorPrintReady", currentLang)}</span>
              </div>

              <div className="text-right leading-none shrink-0 flex flex-col items-end relative z-10">
                {isPremium ? (
                  <>
                    {formatPdfOriginal && (
                      <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground/60 line-through">
                        {currencySymbol}{formatPdfOriginal.toFixed(2)}
                      </span>
                    )}
                    <span className="text-sm sm:text-base font-black text-red-600 dark:text-red-500 mt-1">
                      {currencySymbol}{formatPdfPrice.toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="bg-emerald-555 text-emerald-700 dark:text-emerald-450 text-[9.5px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                    FREE
                  </span>
                )}
              </div>
            </button>

            {/* JPEG Selection */}
            <button
              type="button"
              onClick={() => setSelectedFormat("jpg")}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden select-none cursor-pointer",
                selectedFormat === "jpg"
                  ? "bg-green-500/[0.04] border-green-500 shadow-[0_4px_20px_rgba(22,163,74,0.08)] ring-1 ring-green-500/20"
                  : "bg-card border-border/80 hover:bg-stone-50 dark:hover:bg-stone-900/40"
              )}
            >
              {/* Radio Indicator */}
              <div className="shrink-0 relative z-10">
                {selectedFormat === "jpg" ? (
                  <div className="w-5 h-5 rounded-full border-2 border-green-600 flex items-center justify-center bg-green-600">
                    <Check className="w-3.5 h-3.5 text-white stroke-[3.5px]" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-stone-300 dark:border-stone-700" />
                )}
              </div>

              <div className="flex-1 min-w-0 relative z-10">
                <span className="text-xs sm:text-sm font-black text-foreground block">{translateUI("jpegImage", currentLang)}</span>
                <span className="text-[10px] sm:text-xs text-muted-foreground font-semibold block mt-0.5">{translateUI("standardQualityWhatsApp", currentLang)}</span>
              </div>

              <div className="text-right leading-none shrink-0 flex flex-col items-end relative z-10">
                {isPremium ? (
                  <>
                    {formatJpgOriginal && (
                      <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground/60 line-through">
                        {currencySymbol}{formatJpgOriginal.toFixed(2)}
                      </span>
                    )}
                    <span className="text-sm sm:text-base font-black text-green-600 dark:text-green-500 mt-1">
                      {currencySymbol}{formatJpgPrice.toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="bg-emerald-555 text-emerald-700 dark:text-emerald-450 text-[9.5px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                    FREE
                  </span>
                )}
              </div>
            </button>

            {/* PNG Selection */}
            <button
              type="button"
              onClick={() => setSelectedFormat("png")}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden select-none cursor-pointer",
                selectedFormat === "png"
                  ? "bg-purple-500/[0.04] border-purple-500 shadow-[0_4px_20px_rgba(147,51,234,0.08)] ring-1 ring-purple-500/20"
                  : "bg-card border-border/80 hover:bg-stone-50 dark:hover:bg-stone-900/40"
              )}
            >
              {/* Radio Indicator */}
              <div className="shrink-0 relative z-10">
                {selectedFormat === "png" ? (
                  <div className="w-5 h-5 rounded-full border-2 border-purple-600 flex items-center justify-center bg-purple-600">
                    <Check className="w-3.5 h-3.5 text-white stroke-[3.5px]" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-stone-300 dark:border-stone-700" />
                )}
              </div>

              <div className="flex-1 min-w-0 relative z-10">
                <span className="text-xs sm:text-sm font-black text-foreground block">{translateUI("pngImage", currentLang)}</span>
                <span className="text-[10px] sm:text-xs text-muted-foreground font-semibold block mt-0.5">{translateUI("losslessRenderingHighDetails", currentLang)}</span>
              </div>

              <div className="text-right leading-none shrink-0 flex flex-col items-end relative z-10">
                {isPremium ? (
                  <>
                    {formatPngOriginal && (
                      <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground/60 line-through">
                        {currencySymbol}{formatPngOriginal.toFixed(2)}
                      </span>
                    )}
                    <span className="text-sm sm:text-base font-black text-purple-600 dark:text-purple-500 mt-1">
                      {currencySymbol}{formatPngPrice.toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="bg-emerald-555 text-emerald-700 dark:text-emerald-450 text-[9.5px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                    FREE
                  </span>
                )}
              </div>
            </button>
          </div>

          {/* Secure Payment Confirmation Area */}
          <div className="mt-5 flex flex-col gap-3 shrink-0">
            <button
              type="button"
              disabled={isGenerating}
              onClick={() => onSelectFormat(selectedFormat, appliedCoupon?.code || undefined)}
              className={cn(
                "w-full relative overflow-hidden text-white text-xs sm:text-sm font-black uppercase tracking-wider py-3.5 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 border-0 cursor-pointer active:scale-[0.99] select-none shadow-lg disabled:opacity-50 disabled:cursor-not-allowed",
                isPremium
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-[0_8px_30px_rgba(16,185,129,0.25)]"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-[0_8px_30px_rgba(37,99,235,0.25)]"
              )}
            >
              {/* Shine highlight animation on payment button */}
              {!isGenerating && (
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-1/2 h-full animate-shine pointer-events-none" />
              )}
              
              {isGenerating ? (
                <>
                  <svg className="w-4 h-4 animate-spin text-white shrink-0" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Generating {selectedFormat === "jpg" ? "JPEG" : selectedFormat.toUpperCase()}...</span>
                </>
              ) : isPremium ? (
                <>
                  <Lock className="w-4 h-4 fill-white/10 shrink-0" />
                  <span>Pay {currencySymbol}{getSelectedPrice().toFixed(2)} securely</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-white shrink-0 animate-bounce" />
                  <span>Download {selectedFormat === "jpg" ? "JPEG" : selectedFormat.toUpperCase()} Free</span>
                </>
              )}
            </button>
            
            {/* Razorpay Trust Tagline */}
            {isPremium ? (
              <div className="flex items-center justify-center gap-1.5 text-[9px] sm:text-[10px] text-muted-foreground/80 font-bold select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Razorpay secured - UPI · Cards · Netbanking · Wallets</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-1.5 text-[9px] sm:text-[10px] text-muted-foreground/80 font-bold select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span>Format generated instantly - Ready for print & WhatsApp sharing</span>
              </div>
            )}
          </div>

          {/* Bottom spacing buffer to ensure full visibility and easy scrolling */}
          <div className="h-2 shrink-0" />

        </div>
      </DialogContent>
    </Dialog>
  );
}
