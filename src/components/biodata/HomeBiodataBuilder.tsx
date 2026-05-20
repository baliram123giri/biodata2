"use client";

import { useForm, FormProvider, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { biodataSchema, type BiodataFormValues } from "@/types/biodata";
import { BiodataForm } from "@/components/biodata/BiodataForm";

import { defaultBiodataValues } from "@/lib/default-biodata";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Download, RotateCcw, Sparkles, LayoutDashboard, Wand2, ArrowRight, Eye, Check } from "lucide-react";
import { DownloadDropdown, type DownloadFormat } from "@/components/biodata/DownloadDropdown";
import { useRouter } from "next/navigation";
import { useDownloadBiodata } from "@/hooks/useDownloadBiodata";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { useState, useEffect, useRef } from "react";

import { translations } from "@/lib/translations";
import { useBiodataStore } from "@/store/useBiodataStore";
import { useThemeStore } from "@/store/useThemeStore";
import dynamic from "next/dynamic";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { TemplateSelector } from "@/components/editor/TemplateSelector";
import { TEMPLATE_CONFIGS, getFrameImageUrl } from "@/lib/frame-config";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { PreviewLoader } from "@/components/biodata/PreviewLoader";

// Konva uses canvas — must be client-only
const KonvaPreview = dynamic(
  () => import("@/components/editor/KonvaPreview").then((mod) => mod.KonvaPreview),
  {
    ssr: false,
    loading: () => <PreviewLoader />
  }
);

/**
 * HomeBiodataBuilder — The full biodata creation experience embedded on the homepage.
 * Includes form, live preview, template picker, and download/export actions.
 */
export function HomeBiodataBuilder() {
  const { formData: storedData, selectedTemplate: storedTemplate, setFormData, setSelectedTemplate, resetStore, resetFormDataOnly } = useBiodataStore();
  const theme = useThemeStore();
  const [showResetDialog, setShowResetDialog] = useState(false);
  const { handleDownload: triggerDownload, isGenerating } = useDownloadBiodata();
  const [isHydrated, setIsHydrated] = useState(false);
  const router = useRouter();
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
    mode: "onChange",
  });

  // Handle hydration and initial load (resets form details so homepage stays clean, but preserves selected template/theme)
  useEffect(() => {
    setIsHydrated(true);

    // Register a listener for when hydration completes
    const unsub = useBiodataStore.persist.onFinishHydration(() => {
      resetFormDataOnly();
    });

    // If store is already hydrated, run reset immediately
    if (useBiodataStore.persist.hasHydrated()) {
      resetFormDataOnly();
    }

    methods.reset(defaultBiodataValues);
    setHasInitialized(true);

    return () => unsub();
  }, [resetFormDataOnly, methods]);

  // Debounced store update
  useEffect(() => {
    const subscription = methods.watch((value) => {
      const timer = setTimeout(() => {
        if (value) setFormData(value as BiodataFormValues);
      }, 2000);
      return () => clearTimeout(timer);
    });
    return () => subscription.unsubscribe();
  }, [methods, setFormData]);

  const currentLang = useWatch({ control: methods.control, name: "language" }) || "English";
  const t = translations[currentLang] || translations["English"];

  const handleReset = () => {
    resetFormDataOnly();
    methods.reset(defaultBiodataValues);
    setShowResetDialog(false);
  };

  const handleDownload = async (format: DownloadFormat = "pdf") => {
    const currentData = methods.getValues();
    await triggerDownload(currentData, storedTemplate, format);
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
  const currentTemplate = TEMPLATE_CONFIGS[storedTemplate] || TEMPLATE_CONFIGS["royal"];

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

      {/* Desktop Floating Sticky Template Trigger — only visible when builder section is in view */}
      <div className={cn(
        "hidden lg:flex fixed right-0 top-1/2 z-40 animate-gentle-float transition-all duration-500",
        isBuilderVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full pointer-events-none"
      )}>
        <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <SheetTrigger
            render={
              <button
                className="group flex flex-col items-center gap-2.5 p-3.5 bg-white/80 backdrop-blur-xl border border-stone-300/80 border-r-0 rounded-l-2xl shadow-[-4px_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[-6px_6px_28px_rgba(0,0,0,0.12)] hover:bg-white/90 hover:-translate-x-1 transition-all duration-300 w-16 text-center select-none active:scale-95 cursor-pointer"
              />
            }
          >
            <div className="p-1.5 rounded-full bg-stone-100/80 text-stone-500 group-hover:bg-primary group-hover:text-white transition-all duration-300">
              <LayoutDashboard className="w-4 h-4" />
            </div>

            <div className="w-9 h-12 rounded-md shadow-sm border border-stone-200/70 overflow-hidden relative mx-auto group-hover:ring-2 group-hover:ring-primary/30 transition-all shrink-0">
              {currentTemplate.frame.type === "image" ? (
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

            <span className="text-[8px] font-black text-stone-500 uppercase tracking-widest group-hover:text-primary transition-colors mt-0.5 leading-none">
              Themes
            </span>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 sm:max-w-sm overflow-y-auto px-6">
            <SheetHeader className="mb-6">
              <SheetTitle className="flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-primary" />
                Pick a Template
              </SheetTitle>
            </SheetHeader>
            <TemplateSelector onSelect={() => setIsDrawerOpen(false)} />
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
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
              Create Your Biodata <span className="text-gradient-primary">Right Here</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Fill in your details below, pick a template, and download your professional marriage biodata — all without leaving this page.
            </p>
          </div>
          {/* Quick Action Bar Removed */}
        </div>

        {/* Builder Content */}
        <div className="container mx-auto max-w-6xl">
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col md:grid md:grid-cols-12 gap-4 md:gap-10 items-start w-full">

            {/* Form Side */}
            <div className="md:col-span-6 flex flex-col w-full">
              <BiodataForm />
            </div>

            {/* Mobile Preview — shown AFTER the form on small screens (mobile only) */}
            <div id="mobile-preview-section" className="md:hidden w-full flex flex-col gap-4 items-center pt-2 pb-28">
              <EmbeddedPreviewSection storedTemplate={storedTemplate} />
              <Button
                onClick={() => router.push("/edit")}
                className="w-full rounded-full bg-gradient-primary transition-all flex items-center justify-center gap-2 h-11 text-sm font-bold border-0"
              >
                <Sparkles className="w-4 h-4" />
                Edit in Designer
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {/* Preview Side - Sticky (tablet and desktop) */}
            <div className="hidden md:block md:col-span-5 md:sticky md:top-24 w-full">
              <div className="flex-1 flex flex-col gap-6 items-center w-full">
                <EmbeddedPreviewSection storedTemplate={storedTemplate} />

                <div className="flex gap-3 items-center justify-center w-fit mx-auto mt-2">
                  <Button
                    onClick={() => router.push("/edit")}
                    className="rounded-full bg-gradient-primary transition-all flex gap-1.5 h-11 text-xs sm:text-sm font-bold items-center justify-center px-4 shrink-0 border-0"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Edit in Designer</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>

                  <DownloadDropdown
                    onDownload={handleDownload}
                    isGenerating={isGenerating}
                    labels={{ download: t.download, downloadPdf: t.downloadPdf, generating: t.generating }}
                    variant="compact"
                    className="rounded-full bg-gradient-primary transition-all h-11 font-bold text-xs sm:text-sm px-4 shrink-0 border-0"
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
        </div>

        {/* Mobile Sticky Bottom Bar */}
        {showMobileBar && (
          <div className="lg:hidden fixed bottom-4 left-4 right-4 bg-white/40 backdrop-blur-2xl border border-white/50 py-2.5 px-4 rounded-3xl z-50 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.5),_0_8px_32px_rgba(0,0,0,0.12)] animate-in slide-in-from-bottom duration-300 flex items-center justify-between gap-4">

            {/* Left Icons Grid */}
            <div className="flex items-center justify-between flex-1 pr-2 border-r border-muted-foreground/10">

              {/* Templates Option */}
              <Sheet open={isMobileDrawerOpen} onOpenChange={setIsMobileDrawerOpen}>
                <SheetTrigger
                  render={
                    <button className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary active:scale-95 transition-all w-11" />
                  }
                >
                  <LayoutDashboard className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                  <span className="text-[9px] font-bold tracking-tight">Themes</span>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[80vh] overflow-y-auto rounded-t-3xl">
                  <SheetHeader className="mb-6">
                    <SheetTitle className="flex items-center gap-2">
                      <LayoutDashboard className="w-5 h-5 text-primary" />
                      Pick a Template
                    </SheetTitle>
                  </SheetHeader>
                  <TemplateSelector onSelect={() => setIsMobileDrawerOpen(false)} />
                </SheetContent>
              </Sheet>

              {/* Preview Option */}
              <button
                onClick={() => {
                  const el = document.getElementById('mobile-preview-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary active:scale-95 transition-all w-11"
              >
                <Eye className="w-5 h-5" />
                <span className="text-[9px] font-bold tracking-tight">Preview</span>
              </button>

              {/* Designer Option */}
              <button
                onClick={() => router.push("/edit")}
                className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary active:scale-95 transition-all w-11"
              >
                <Sparkles className="w-5 h-5" />
                <span className="text-[9px] font-bold tracking-tight">Design</span>
              </button>

              {/* Reset Option */}
              <button
                onClick={() => setShowResetDialog(true)}
                disabled={isGenerating}
                className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-destructive active:scale-95 transition-all w-11 disabled:opacity-50"
              >
                <RotateCcw className="w-5 h-5" />
                <span className="text-[9px] font-bold tracking-tight">Reset</span>
              </button>

            </div>

            {/* Right Download Button */}
            <DownloadDropdown
              onDownload={handleDownload}
              isGenerating={isGenerating}
              labels={{ download: t.download, generating: t.generating }}
              variant="compact"
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
      </section>
    </FormProvider>
  );
}

function EmbeddedPreviewSection({ storedTemplate }: { storedTemplate: string }) {
  const formData = useWatch();
  const [isClientMounted, setIsClientMounted] = useState(false);

  useEffect(() => {
    setIsClientMounted(true);
  }, []);

  return (
    <div id="biodata-preview-home" className="bg-white overflow-hidden w-full aspect-[210/297] relative rounded-lg shadow-2xl ring-1 ring-black/5 pointer-events-none flex items-center justify-center">
      {!isClientMounted ? (
        <PreviewLoader />
      ) : (
        <KonvaPreview liveFormData={formData as BiodataFormValues} templateId={storedTemplate} />
      )}
    </div>
  );
}
