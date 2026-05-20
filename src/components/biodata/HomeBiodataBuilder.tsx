"use client";

import { useForm, FormProvider, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { biodataSchema, type BiodataFormValues } from "@/types/biodata";
import { BiodataForm } from "@/components/biodata/BiodataForm";

import { defaultBiodataValues } from "@/lib/default-biodata";

import { Button } from "@/components/ui/button";
import { Download, RotateCcw, Sparkles, LayoutDashboard, Wand2, ArrowRight, Eye } from "lucide-react";
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
import { useState, useEffect } from "react";

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

// Konva uses canvas — must be client-only
const KonvaPreview = dynamic(
  () => import("@/components/editor/KonvaPreview").then((mod) => mod.KonvaPreview),
  { ssr: false }
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

  // Get current template for the box preview
  const currentTemplate = TEMPLATE_CONFIGS[storedTemplate] || TEMPLATE_CONFIGS["royal"];

  return (
    <FormProvider {...methods}>
      <section id="builder" className="py-8 md:py-16 px-4 bg-gradient-to-b from-background via-accent/30 to-background scroll-mt-20">
        {/* Section Header */}
        <div className="container mx-auto max-w-[1400px] mb-10">
          <div className="flex flex-col items-center text-center gap-4 mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
              <Wand2 className="w-4 h-4" />
              Start Building Now
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
              Create Your Biodata <span className="text-primary">Right Here</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Fill in your details below, pick a template, and download your professional marriage biodata — all without leaving this page.
            </p>
          </div>
          {/* Quick Action Bar Removed */}
        </div>

        {/* Builder Content */}
        <div className="container mx-auto max-w-[1400px]">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-10 items-start">

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col md:grid md:grid-cols-12 gap-4 md:gap-10 items-start w-full">

              {/* Form Side */}
              <div className="md:col-span-5 flex flex-col w-full">
                <BiodataForm />
              </div>

              {/* Mobile Preview — shown AFTER the form on small screens (mobile only) */}
              <div id="mobile-preview-section" className="md:hidden w-full flex flex-col gap-4 items-center pt-2 pb-28">
                <EmbeddedPreviewSection storedTemplate={storedTemplate} />
                <Button
                  onClick={() => router.push("/edit")}
                  className="w-full rounded-full bg-gradient-to-r from-stitch-primary to-stitch-primary/80 text-white shadow-xl hover:shadow-stitch-primary/20 transition-all flex gap-2 h-11 text-sm font-bold"
                >
                  <Sparkles className="w-4 h-4" />
                  Edit in Designer
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              {/* Preview Side - Sticky (tablet and desktop) */}
              <div className="hidden md:block md:col-span-7 md:sticky md:top-24 w-full">
                <div className="flex-1 flex flex-col gap-6 items-center w-full">
                  <EmbeddedPreviewSection storedTemplate={storedTemplate} />

                  <div className="flex gap-3 items-center justify-center w-fit mx-auto mt-2">
                    <Button
                      onClick={() => router.push("/edit")}
                      className="rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md hover:shadow-indigo-500/20 transition-all flex gap-1.5 h-11 text-xs sm:text-sm font-bold items-center justify-center px-4 shrink-0 border-0"
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
                      className="rounded-full shadow-md bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white h-11 font-bold text-xs sm:text-sm px-4 shrink-0 border-0"
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

            {/* Right Side: Template Picker Box */}
            <div className="hidden lg:flex flex-col shrink-0 lg:sticky lg:top-24 z-30">
              <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <SheetTrigger
                  render={
                    <button className="group flex flex-col items-center gap-3 p-4 bg-white border border-primary/10 rounded-2xl shadow-sm hover:shadow-xl hover:border-primary/40 transition-all active:scale-95 text-center w-28" />
                  }
                >
                  <div className="p-2 rounded-full bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <LayoutDashboard className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">Frames</span>
                    <div className="w-16 h-20 rounded-lg shadow-inner border border-black/5 overflow-hidden relative mx-auto group-hover:ring-2 group-hover:ring-primary/20 transition-all">
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
                      <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <span className="text-[9px] font-black text-primary uppercase truncate w-full mt-1">{currentTemplate.name}</span>
                  </div>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 sm:max-w-sm overflow-y-auto">
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
                className="relative overflow-hidden rounded-full bg-stitch-primary text-stitch-on-primary hover:bg-stitch-primary/90"
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

/**
 * Isolated Preview Section — uses Konva canvas for instant, zero-flicker live preview.
 */
function EmbeddedPreviewSection({ storedTemplate }: { storedTemplate: string }) {
  const formData = useWatch();

  return (
    <div id="biodata-preview-home" className="bg-white overflow-hidden w-full aspect-[210/297] relative rounded-lg shadow-2xl ring-1 ring-black/5 pointer-events-none">
      <KonvaPreview liveFormData={formData as BiodataFormValues} templateId={storedTemplate} />
    </div>
  );
}
