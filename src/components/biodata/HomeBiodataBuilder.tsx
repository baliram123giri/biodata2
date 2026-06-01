"use client";

import { useForm, FormProvider, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { biodataSchema, type BiodataFormValues } from "@/types/biodata";
import dynamic from "next/dynamic";
const BiodataForm = dynamic(() => import("@/components/biodata/BiodataForm").then(mod => mod.BiodataForm));

import { defaultBiodataValues } from "@/lib/default-biodata";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Download, RotateCcw, Sparkles, LayoutDashboard, Wand2, ArrowRight, Eye, Check, Loader2, Star, X, Crown, ShieldCheck } from "lucide-react";
import { DownloadDropdown, type DownloadFormat } from "@/components/biodata/DownloadDropdown";
import { useRouter } from "next/navigation";
import { useDownloadBiodata, generateJpgDataUrl } from "@/hooks/useDownloadBiodata";
const WhatsAppDeliveryCard = dynamic(() => import("@/components/biodata/WhatsAppDeliveryCard").then(mod => mod.WhatsAppDeliveryCard));
const FeedbackModal = dynamic(() => import("./FeedbackModal").then(mod => mod.FeedbackModal));
const PriceModal = dynamic(() => import("./PriceModal").then(mod => mod.PriceModal));
import { useRazorpayPayment } from "@/hooks/useRazorpayPayment";
import { toast } from "sonner";


import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { useState, useEffect, useRef } from "react";

import { translations, translateUI } from "@/lib/translations";
import { useBiodataStore } from "@/store/useBiodataStore";
import { useThemeStore } from "@/store/useThemeStore";


import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
const TemplateSelector = dynamic(() => import("@/components/editor/TemplateSelector").then(mod => mod.TemplateSelector));
import { getTemplateConfig, getFrameImageUrl } from "@/lib/frame-config";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { PreviewLoader } from "@/components/biodata/PreviewLoader";

// Konva uses canvas - must be client-only
const KonvaPreview = dynamic(
  () => import("@/components/editor/KonvaPreview").then((mod) => mod.KonvaPreview),
  {
    ssr: false,
    loading: () => <PreviewLoader />
  }
);

/**
 * HomeBiodataBuilder - The full biodata creation experience embedded on the homepage.
 * Includes form, live preview, template picker, and download/export actions.
 */
export function HomeBiodataBuilder() {
  const { formData: storedData, selectedTemplate: storedTemplate, customTemplates, setFormData, setSelectedTemplate, resetStore, resetFormDataOnly, resetDesignOnly } = useBiodataStore();
  const theme = useThemeStore();
  const prevTemplateRef = useRef<string | null>(null);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const { handleDownload: triggerDownload, isGenerating } = useDownloadBiodata();
  const { startPayment, SandboxModal, isProcessing: isPaymentProcessing, paymentStep, paymentIdInfo, setPaymentStep, setIsProcessing } = useRazorpayPayment();
  const [isHydrated, setIsHydrated] = useState(false);


  // Rating & Feedback Modal states
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [pendingDownloadFormat, setPendingDownloadFormat] = useState<DownloadFormat | null>(null);
  const [filename, setFilename] = useState("biodata");
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleNavigateToEdit = () => {
    setIsNavigating(true);
    router.push("/edit");
  };
  const [hasInitialized, setHasInitialized] = useState(false);
  const [showMobileBar, setShowMobileBar] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY || document.documentElement.scrollTop;
      const customSection = document.getElementById("photo-customization-section");

      if (customSection) {
        const rect = customSection.getBoundingClientRect();
        // Hide the mobile sticky bar once the user scrolls back up and reaches 
        // the Photo & Customization section (meaning the section top is visible, rect.top >= 0).
        // Show persistently only when they scroll past it (rect.top < 0).
        setShowMobileBar(rect.top < 0);
      } else {
        // Fallback if the element is not yet rendered
        setShowMobileBar(scrollPos > 400);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Execute immediately on mount
    handleScroll();

    // Run repeated checks for the first 1.5s to capture scroll-restoration timing instantly
    const interval = setInterval(handleScroll, 100);
    const timeout = setTimeout(() => clearInterval(interval), 1500);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  const methods = useForm<BiodataFormValues>({
    resolver: zodResolver(biodataSchema) as any,
    defaultValues: defaultBiodataValues,
    mode: "onBlur",
  });

  // Handle hydration and initial load: preserves form data values, but resets template, theme, and stickers when landing back on the homepage
  useEffect(() => {
    setIsHydrated(true);

    // Load dynamic templates from database on initial page load
    useBiodataStore.getState().fetchInitialTemplate?.();
    useBiodataStore.getState().fetchCustomStickers?.();

    const performHomeReset = () => {
      // 1. Reset template, layout and stickers in biodata store while preserving form values
      useBiodataStore.getState().resetDesignOnly();
      // 2. Reset custom theme settings (colors, background, fonts, padding, etc.)
      useThemeStore.getState().resetTheme();
      
      // 3. Reset form methods to the preserved stored data
      const currentStoredData = useBiodataStore.getState().formData;
      methods.reset(currentStoredData);
    };

    // Register a listener for when hydration completes
    const unsub = useBiodataStore.persist.onFinishHydration(() => {
      performHomeReset();
    });

    // If store is already hydrated, run reset immediately
    if (useBiodataStore.persist.hasHydrated()) {
      performHomeReset();
    } else {
      const currentStoredData = useBiodataStore.getState().formData;
      methods.reset(currentStoredData || defaultBiodataValues);
    }

    setHasInitialized(true);

    return () => unsub();
  }, [methods]);

  // Synchronize theme padding and palette with selected template defaults from database
  useEffect(() => {
    if (!isHydrated) return;
    const config = getTemplateConfig(storedTemplate);
    if (!config) return;

    const configKey = `${storedTemplate}_${config.defaultPrimary}_${config.defaultSecondary}_${config.defaultAccent}`;
    if (configKey !== prevTemplateRef.current) {
      prevTemplateRef.current = configKey;

      // Resolve background colors
      let bgColors: string[] = ["#ffffff"];
      if (config.bgGradientColors && config.bgGradientColors.length > 0) {
        bgColors = config.bgGradientColors;
      } else if (config.frame.type === "gradient") {
        bgColors = config.frame.gradientColors;
      } else if (config.frame.bgColor) {
        bgColors = [config.frame.bgColor];
      }

      // Apply template's colors
      theme.setPalette({
        name: "None",
        primary: config.defaultPrimary,
        secondary: config.defaultSecondary,
        accent: config.defaultAccent || "",
        bgColors: bgColors,
      });

      // Apply template's default padding
      if (config.defaultPadding !== undefined && config.defaultPadding !== null) {
        theme.setPadding(config.defaultPadding);
      }
      theme.setPaddingY(config.defaultYPadding !== null && config.defaultYPadding !== undefined ? config.defaultYPadding : undefined);
      
      // Apply template's default font size
      theme.setFontSize(config.fontSize || 9);
    }
  }, [storedTemplate, customTemplates, isHydrated, theme]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const subscription = methods.watch((value) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (value) setFormData(value as BiodataFormValues);
      }, 400);
    });
    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, [methods, setFormData]);

  const currentLang = useWatch({ control: methods.control, name: "language" }) || "English";
  const t = translations[currentLang] || translations["English"];

  const handleReset = () => {
    resetFormDataOnly();
    methods.reset(defaultBiodataValues);
    setShowResetDialog(false);
  };

  const handleDownload = async () => {
    const currentData = methods.getValues();
    const nameField =
      currentData.personalDetails?.find((f: any) => f.id === "fullName")?.value ||
      "biodata";
    const cleanName = nameField.replace(/[^a-zA-Z0-9\s-_]/g, "").trim() || "biodata";
    setFilename(cleanName);

    setIsPriceModalOpen(true);
  };

  const processPremiumPaymentAndDownload = async (currentData: any, format: DownloadFormat, modalFilename: string, couponCode?: string) => {
    try {
      const fullName = currentData.personalDetails?.find((f: any) => f.id === "fullName")?.value || modalFilename || "";
      // Robust email lookup to capture the proper email address (including custom labels or IDs)
      const contactFields = currentData.contactDetails || [];
      const emailField = contactFields.find((f: any) => 
        f.id === "email" || 
        f.id === "emailId" ||
        f.id?.toLowerCase()?.includes("email") ||
        f.id?.toLowerCase()?.includes("mail") ||
        (f.label || "").toLowerCase().includes("email") ||
        (f.label || "").toLowerCase().includes("mail") ||
        (f.label || "").toLowerCase().includes("e-mail") ||
        (f.value || "").includes("@")
      );
      const properEmail = emailField?.value || "";
      const phoneField = contactFields.find((f: any) => 
        f.id === "mobileNumber" || 
        f.id === "whatsappNumber" ||
        f.id?.toLowerCase()?.includes("phone") ||
        f.id?.toLowerCase()?.includes("mobile") ||
        (f.label || "").toLowerCase().includes("phone") ||
        (f.label || "").toLowerCase().includes("mobile") ||
        (f.label || "").toLowerCase().includes("contact")
      );
      const properPhone = phoneField?.value || "";
      
      let finalPrice = 29;
      if (format === "combo") finalPrice = activeTemplate?.comboDiscountPrice ?? activeTemplate?.comboPrice ?? 99;
      else if (format === "pdf") finalPrice = activeTemplate?.pdfDiscountPrice ?? activeTemplate?.pdfPrice ?? 49;
      else if (format === "jpg") finalPrice = activeTemplate?.jpgDiscountPrice ?? activeTemplate?.jpgPrice ?? 19;
      else if (format === "png") finalPrice = activeTemplate?.pngDiscountPrice ?? activeTemplate?.pngPrice ?? 29;

      await startPayment({
        amount: finalPrice,
        format,
        templateId: storedTemplate,
        customerName: fullName,
        customerEmail: properEmail,
        customerPhone: properPhone,
        currency: activeTemplate?.currency || "INR",
        couponCode: couponCode,
        onDownload: async () => {
          const result = await triggerDownload(currentData, storedTemplate, format, modalFilename);
          if (result && !result.success) {
            throw result.error || new Error("Download failed");
          }
          setIsFeedbackOpen(true);
        }
      });
    } catch (paymentErr) {
      console.error("Payment failed or cancelled:", paymentErr);
    }
  };

  const handleFeedbackSubmit = async (modalRating: number, modalFilename: string, modalComment: string) => {
    setIsFeedbackOpen(false);

    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: modalFilename,
          rating: modalRating,
          comment: modalComment,
        }),
      });
    } catch (err) {
      console.error("Failed to save feedback:", err);
    }
  };

  const handleSkipDownload = async () => {
    setIsFeedbackOpen(false);
  };


  /** Generate a JPG data URL for the WhatsApp share button */
  const handleGenerateShareImage = async (): Promise<string> => {
    return await generateJpgDataUrl();
  };

  // Manage drawer open state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Show floating template picker only while the builder section is in view
  const builderRef = useRef<HTMLElement>(null);
  const [isBuilderVisible, setIsBuilderVisible] = useState(false);

  useEffect(() => {
    const el = builderRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsBuilderVisible(entry.isIntersecting),
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Get current template for the box preview
  const currentTemplate = getTemplateConfig(storedTemplate);
  const activeTemplate = customTemplates.find((t) => t.id === storedTemplate) || currentTemplate;

  return (
    <FormProvider {...methods}>
      {/* Custom slow-floating style tag for premium designer look */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes gentle-float {
          0%, 100% { transform: translateY(-50%) translateX(0); }
          50% { transform: translateY(-52%) translateX(-3px); }
        }
        .animate-gentle-float {
          animation: gentle-float 4s ease-in-out infinite;
        }
      `}} />

      {/* Desktop Floating Sticky Template Trigger - only visible when builder section is in view */}
      <div className={cn(
        "hidden lg:flex fixed right-0 top-1/2 z-40 animate-gentle-float transition-all duration-500",
        isBuilderVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full pointer-events-none"
      )}>
        <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <SheetTrigger asChild>
            <button
              className="premium-gold-docked-tab group flex flex-col items-center gap-3 p-4 border-0 shadow-[-4px_4px_20px_rgba(252,224,104,0.3)] hover:shadow-[-6px_6px_28px_rgba(252,224,104,0.45)] hover:-translate-x-1 transition-all duration-300 w-20 text-center select-none active:scale-95 cursor-pointer"
            >
              <div className="p-2 rounded-full bg-stone-100/80 text-stone-500 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <LayoutDashboard className="w-5 h-5" />
              </div>

              <div className="w-12 h-16 rounded-md shadow-sm border border-stone-200/70 overflow-hidden relative mx-auto group-hover:ring-2 group-hover:ring-primary/30 transition-all shrink-0">
                {activeTemplate.thumbnailUrl ? (
                  <Image
                    src={activeTemplate.thumbnailUrl}
                    alt={activeTemplate.name}
                    fill
                    sizes="48px"
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
                    loading="lazy"
                  />
                ) : currentTemplate.frame.type === "image" ? (
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${getFrameImageUrl(currentTemplate.frame, currentTemplate.defaultPrimary)})`,
                      backgroundColor: currentTemplate.frame.bgColor
                    }}
                  />
                ) : currentTemplate.frame.type === "gradient" ? (
                  <div
                    className="absolute inset-0"
                    style={{ background: `linear-gradient(135deg, ${currentTemplate.frame.gradientColors.join(", ")})` }}
                  />
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{ backgroundColor: currentTemplate.defaultPrimary }}
                  />
                )}
              </div>

              <span className="text-[10px] font-black text-stone-500 uppercase tracking-wider group-hover:text-primary transition-colors mt-0.5 leading-none">
                Templates
              </span>
            </button>
          </SheetTrigger>
          <SheetContent side="right" aria-describedby={undefined} className="w-80 sm:max-w-sm flex flex-col h-full p-0 gap-0">
            <SheetHeader className="p-6 pb-4 border-b border-stone-100 dark:border-stone-900/50">
              <SheetTitle className="flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-primary" />
                Pick a Template
              </SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto p-6 pt-4">
              <TemplateSelector onSelect={() => setIsDrawerOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <section ref={builderRef} id="builder" className="py-8 md:py-16 px-4 bg-gradient-to-b from-background via-accent/30 to-background scroll-mt-20">
        {/* Section Header */}
        <div className="container mx-auto max-w-[1400px] mb-10">
          <div className="flex flex-col items-center text-center gap-4 mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
              <Wand2 className="w-4 h-4" />
              Start Building Now
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground font-sans">
              Create Your Biodata <span className="text-gradient-primary">Right Here</span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground font-semibold max-w-2xl">
              Fill in your details below, pick a template, and download your professional marriage biodata - all without leaving this page.
            </p>
          </div>
        </div>

        {/* Builder Content */}
        <div className="container mx-auto max-w-6xl">
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col md:grid md:grid-cols-12 gap-4 md:gap-10 items-start w-full">

            {/* Form Side */}
            <div className="md:col-span-6 flex flex-col w-full md:premium-gold-border md:p-8 md:shadow-xl p-0 shadow-none bg-transparent">
              <BiodataForm hideSliders />
            </div>

            {/* Mobile Preview - shown AFTER the form on small screens (mobile only) */}
            <div id="mobile-preview-section" className="md:hidden w-full flex flex-col gap-4 items-center pt-2 pb-2">
              <EmbeddedPreviewSection storedTemplate={storedTemplate} />
              <Button
                onClick={handleNavigateToEdit}
                disabled={isNavigating}
                className="w-full rounded-full bg-gradient-primary transition-all flex items-center justify-center gap-2 h-11 text-sm font-bold border-0 disabled:opacity-70"
              >
                {isNavigating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Opening Designer...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Edit in Designer
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>

            {/* Preview Side - Sticky (tablet and desktop) */}
            <div className="hidden md:block md:col-span-5 md:sticky md:top-24 w-full">
              <div className="flex-1 flex flex-col gap-6 items-center w-full">
                <EmbeddedPreviewSection storedTemplate={storedTemplate} />

                <div className="flex gap-3 items-center justify-center w-fit mx-auto mt-2">
                  <Button
                    onClick={handleNavigateToEdit}
                    disabled={isNavigating}
                    className="rounded-full bg-gradient-primary transition-all flex gap-1.5 h-11 text-xs sm:text-sm font-bold items-center justify-center px-4 shrink-0 border-0 disabled:opacity-70"
                  >
                    {isNavigating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span>{isNavigating ? translateUI("loading", currentLang) : translateUI("editInDesigner", currentLang)}</span>
                    {!isNavigating && <ArrowRight className="w-3.5 h-3.5" />}
                  </Button>

                  <DownloadDropdown
                    onDownload={handleDownload}
                    isGenerating={isGenerating}
                    labels={{ download: t.download, downloadPdf: t.downloadPdf, generating: t.generating }}
                    variant="compact"
                    className="rounded-full bg-gradient-primary transition-all h-11 font-bold text-xs sm:text-sm px-4 shrink-0 border-0"
                    isPremium={activeTemplate?.isPremium}
                    price={activeTemplate?.price}
                    discountPrice={activeTemplate?.discountPrice}
                    currency={activeTemplate?.currency}
                  />

                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full h-11 border border-rose-200 hover:bg-rose-50/50 text-rose-600 hover:text-rose-700 font-bold text-xs sm:text-sm px-4 shrink-0 transition-colors bg-white"
                    onClick={() => setShowResetDialog(true)}
                    disabled={isGenerating}
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1 text-rose-500" /> {t.reset || "Reset"}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Get on WhatsApp Widget (Matching mockup) */}
          <div className="mt-6 md:mt-32 px-2 sm:px-4 w-full flex justify-center">
            <WhatsAppDeliveryCard
              onTriggerDownload={handleDownload}
              isGenerating={isGenerating}
            />
          </div>
        </div>

        {/* Mobile Sticky Bottom Bar */}
        {showMobileBar && (
          <div className={cn(
            "lg:hidden fixed bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 bg-white/40 backdrop-blur-2xl border border-white/50 py-2 sm:py-2.5 px-2.5 sm:px-4 rounded-3xl z-40 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.5),_0_8px_32px_rgba(0,0,0,0.12)] transition-all duration-300 flex items-center justify-between gap-2",
            isMobileDrawerOpen ? "opacity-0 pointer-events-none translate-y-10" : "animate-in slide-in-from-bottom"
          )}>

            {/* Left Icons Grid */}
            <div className="flex items-center justify-around flex-1 pr-1 sm:pr-2 border-r border-muted-foreground/10">

              {/* Templates Option */}
              <Sheet open={isMobileDrawerOpen} onOpenChange={setIsMobileDrawerOpen}>
                <SheetTrigger asChild>
                  <button className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 text-muted-foreground hover:text-primary active:scale-95 transition-all w-12 sm:w-14">
                    <LayoutDashboard className="w-5 h-5 sm:w-[22px] sm:h-[22px] text-muted-foreground group-hover:text-primary" />
                    <span className="text-[9.5px] sm:text-[10.5px] font-bold tracking-tight">{translateUI("templates", currentLang)}</span>
                  </button>
                </SheetTrigger>
                <SheetContent side="bottom" aria-describedby={undefined} className="h-[80vh] flex flex-col p-0 gap-0 rounded-t-3xl">
                  <SheetHeader className="p-6 pb-4 border-b border-stone-100 dark:border-stone-900/50">
                    <SheetTitle className="flex items-center gap-2">
                      <LayoutDashboard className="w-5 h-5 text-primary" />
                      {translateUI("pickTemplate", currentLang)}
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto p-6 pt-4">
                    <TemplateSelector />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Preview Option */}
              <button
                onClick={() => {
                  const el = document.getElementById('mobile-preview-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 text-muted-foreground hover:text-primary active:scale-95 transition-all w-9 sm:w-11"
              >
                <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-[8px] sm:text-[9px] font-bold tracking-tight">{translateUI("preview", currentLang)}</span>
              </button>

              {/* Designer Option */}
              <button
                onClick={handleNavigateToEdit}
                disabled={isNavigating}
                className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 text-muted-foreground hover:text-primary active:scale-95 transition-all w-9 sm:w-11 disabled:opacity-50"
              >
                {isNavigating ? (
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
                <span className="text-[8px] sm:text-[9px] font-bold tracking-tight">{translateUI("design", currentLang)}</span>
              </button>


              {/* Reset Option */}
              <button
                onClick={() => setShowResetDialog(true)}
                disabled={isGenerating}
                className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 text-muted-foreground hover:text-destructive active:scale-95 transition-all w-9 sm:w-11 disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-[8px] sm:text-[9px] font-bold tracking-tight">{translateUI("reset", currentLang)}</span>
              </button>

            </div>

            {/* Right Download Button */}
            <DownloadDropdown
              onDownload={handleDownload}
              isGenerating={isGenerating}
              labels={{ download: t.download, generating: t.generating }}
              variant="compact"
              isPremium={activeTemplate?.isPremium}
              price={activeTemplate?.price}
              discountPrice={activeTemplate?.discountPrice}
              currency={activeTemplate?.currency}
            />

          </div>
        )}

        {/* Reset Confirmation Dialog */}
        <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{t.reset || "Reset"} All Fields?</DialogTitle>
              <DialogDescription>
                {t.resetDescription || "This will clear all the information you've entered and revert to the default template. This action cannot be undone."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2 sm:gap-0 mt-4">
              <Button variant="outline" onClick={() => setShowResetDialog(false)} className="rounded-full">{t.cancel || "Cancel"}</Button>
              <Button
                onClick={handleReset}
                className="relative overflow-hidden rounded-full bg-gradient-primary border-0"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-1/2 h-full animate-shine pointer-events-none" />
                <span className="relative">{t.yesReset || "Yes, Reset"}</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <FeedbackModal
          isOpen={isFeedbackOpen}
          onOpenChange={setIsFeedbackOpen}
          initialName={filename}
          onSubmit={handleFeedbackSubmit}
          onSkip={handleSkipDownload}
          isPremium={activeTemplate?.isPremium}
          price={activeTemplate?.price}
          discountPrice={activeTemplate?.discountPrice}
          currency={activeTemplate?.currency}
          downloadFormat={pendingDownloadFormat}
          pdfPrice={activeTemplate?.pdfPrice}
          pdfDiscountPrice={activeTemplate?.pdfDiscountPrice}
          jpgPrice={activeTemplate?.jpgPrice}
          jpgDiscountPrice={activeTemplate?.jpgDiscountPrice}
          pngPrice={activeTemplate?.pngPrice}
          pngDiscountPrice={activeTemplate?.pngDiscountPrice}
          comboPrice={(activeTemplate as any)?.comboPrice}
          comboDiscountPrice={(activeTemplate as any)?.comboDiscountPrice}
        />
        <PriceModal
          isOpen={isPriceModalOpen}
          onOpenChange={setIsPriceModalOpen}
          isPremium={activeTemplate?.isPremium}
          isGenerating={isGenerating}
          onSelectFormat={async (format, couponCode) => {
            const currentData = methods.getValues();
            if (activeTemplate?.isPremium) {
              setIsPriceModalOpen(false);
              await processPremiumPaymentAndDownload(currentData, format, filename, couponCode);
            } else {
              try {
                await triggerDownload(currentData, storedTemplate, format, filename);
              } catch (err) {
                console.error("Free download failed:", err);
              } finally {
                setIsPriceModalOpen(false);
                setIsFeedbackOpen(true);
              }
            }
          }}
          currency={activeTemplate?.currency}

          price={activeTemplate?.price}
          discountPrice={activeTemplate?.discountPrice}

          pdfPrice={activeTemplate?.pdfPrice}
          pdfDiscountPrice={activeTemplate?.pdfDiscountPrice}
          jpgPrice={activeTemplate?.jpgPrice}
          jpgDiscountPrice={activeTemplate?.jpgDiscountPrice}
          pngPrice={activeTemplate?.pngPrice}
          pngDiscountPrice={activeTemplate?.pngDiscountPrice}
          comboPrice={(activeTemplate as any)?.comboPrice}
          comboDiscountPrice={(activeTemplate as any)?.comboDiscountPrice}
        />
        <SandboxModal />

        {/* Full-screen secure checkout loading screen */}
        <Dialog open={isPaymentProcessing}>
          <DialogContent aria-describedby={undefined} className="max-w-[90%] sm:max-w-xs p-6 border-0 bg-background/95 backdrop-blur-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] rounded-3xl flex flex-col items-center justify-center gap-4 text-center [&>button]:hidden ring-1 ring-border/50">
            {paymentStep === "download_failed" ? (
              <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mb-2">
                  <X className="w-8 h-8 text-rose-600" />
                </div>
                <div className="space-y-2">
                  <DialogTitle className="text-base font-black text-rose-600 uppercase tracking-wider text-rose-600">
                    DOWNLOAD FAILED
                  </DialogTitle>
                  <div className="text-[11.5px] text-muted-foreground font-semibold leading-relaxed bg-rose-50 p-3.5 rounded-xl border border-rose-100/80">
                    Your payment was successful, but something went wrong on our end while preparing your file.
                    <br /><br />
                    We're sorry for the trouble! Your amount will be automatically refunded within 3 to 7 working days.
                  </div>
                </div>
                {paymentIdInfo && (
                  <div className="w-full bg-stone-100 p-2.5 rounded-lg flex flex-col gap-1 items-center border border-stone-200">
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">TRANSACTION ID</span>
                    <span className="text-xs font-mono font-bold text-foreground select-all">{paymentIdInfo}</span>
                  </div>
                )}
                <Button 
                  onClick={() => {
                    setIsProcessing(false);
                    setPaymentStep("idle");
                  }}
                  className="w-full rounded-full bg-stone-900 hover:bg-stone-800 text-white font-bold h-11 mt-2"
                >
                  Close Window
                </Button>
              </div>
            ) : (
              <>
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 border-t-emerald-600 animate-spin" />
                  {paymentStep === "downloading" ? (
                    <Download className="w-6 h-6 text-emerald-600 animate-bounce" />
                  ) : paymentStep === "verifying" ? (
                    <ShieldCheck className="w-6 h-6 text-emerald-600 animate-pulse" />
                  ) : (
                    <Crown className="w-6 h-6 text-emerald-600 fill-emerald-500/10 animate-pulse" />
                  )}
                </div>
                <div className="space-y-1 select-none">
                  <DialogTitle className="text-sm font-black text-foreground uppercase tracking-wide">
                    {paymentStep === "downloading"
                      ? "Generating Document..."
                      : paymentStep === "verifying"
                      ? "Verifying Payment..."
                      : "Securing Checkout..."}
                  </DialogTitle>
                  <DialogDescription className="text-[10px] text-muted-foreground font-semibold leading-relaxed">
                    {paymentStep === "downloading"
                      ? "Payment successful! Creating your high-quality biodata and downloading now."
                      : paymentStep === "verifying"
                      ? "Confirming transaction with payment gateway. Please do not close or refresh."
                      : "Opening payment gateway. Please do not close or refresh this page."}
                  </DialogDescription>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </section>

    </FormProvider>
  );
}

function EmbeddedPreviewSection({ storedTemplate }: { storedTemplate: string }) {
  const formData = useWatch();
  const [isClientMounted, setIsClientMounted] = useState(false);
  const customTemplates = useBiodataStore((state) => state.customTemplates);

  useEffect(() => {
    setIsClientMounted(true);
  }, []);

  return (
    <div id="biodata-preview-home" className="bg-white overflow-hidden w-full aspect-[210/297] relative rounded-lg shadow-2xl ring-1 ring-black/5 pointer-events-none flex items-center justify-center">
      {!isClientMounted || customTemplates.length === 0 ? (
        <PreviewLoader />
      ) : (
        <KonvaPreview liveFormData={formData as BiodataFormValues} templateId={storedTemplate} />
      )}
    </div>
  );
}
