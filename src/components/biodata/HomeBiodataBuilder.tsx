"use client";

import { useForm, FormProvider, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { biodataSchema, type BiodataFormValues } from "@/types/biodata";
import { BiodataForm } from "@/components/biodata/BiodataForm";

import { defaultBiodataValues } from "@/lib/default-biodata";

import { Button } from "@/components/ui/button";
import { Download, RotateCcw, Sparkles, LayoutDashboard, Wand2, ArrowRight, Eye } from "lucide-react";
import { useRouter } from "next/navigation";

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
  const { formData: storedData, selectedTemplate: storedTemplate, setFormData, setSelectedTemplate, resetStore } = useBiodataStore();
  const theme = useThemeStore();
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const router = useRouter();
  const [hasInitialized, setHasInitialized] = useState(false);
  const [showMobileBar, setShowMobileBar] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 450) {
        setShowMobileBar(true);
      } else {
        setShowMobileBar(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const methods = useForm<BiodataFormValues>({
    resolver: zodResolver(biodataSchema) as any,
    defaultValues: defaultBiodataValues,
    mode: "onChange",
  });

  // Handle hydration and initial load
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Sync store data to form ONCE when hydrated
  useEffect(() => {
    if (isHydrated && !hasInitialized && storedData) {
      methods.reset(storedData);
      setHasInitialized(true);
    }
  }, [isHydrated, hasInitialized, storedData, methods]);

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
    resetStore();
    methods.reset(defaultBiodataValues);
    setShowResetDialog(false);
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const currentData = methods.getValues();
      const nameField = currentData.personalDetails.find(f => f.id === "fullName")?.value || "biodata";

      const res = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formData: currentData,
          templateId: storedTemplate,
          theme: {
            fontFamily: theme.fontFamily,
            primaryColor: theme.primaryColor,
            secondaryColor: theme.secondaryColor,
            accentColor: theme.accentColor,
            fontSize: theme.fontSize,
            padding: theme.padding,
            selectedPaletteName: theme.selectedPaletteName,
          },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("PDF Generation failed:", errorData);
        throw new Error(`Server error: ${res.status} - ${errorData.details || errorData.error || "Unknown"}`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${nameField}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF Export Error:", err);
    } finally {
      setIsGenerating(false);
    }
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

          {/* Quick Action Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-primary/20 hover:bg-primary/5 hover:text-primary transition-all"
              onClick={() => methods.reset(defaultBiodataValues)}
            >
              <Sparkles className="w-4 h-4 mr-2 text-primary" /> Fill Sample Data
            </Button>
            
            {/* Mobile-only templates quick trigger */}
            <Sheet open={isMobileDrawerOpen} onOpenChange={setIsMobileDrawerOpen}>
              <SheetTrigger
                render={
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full border-primary/20 hover:bg-primary/5 hover:text-primary transition-all lg:hidden"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2 text-primary" /> Templates
                  </Button>
                }
              />
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

            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => setShowResetDialog(true)}
            >
              <RotateCcw className="w-4 h-4 mr-2" /> {t.reset || "Reset"}
            </Button>
            <Button
              size="sm"
              className="rounded-full shadow-lg text-white"
              onClick={handleDownload}
              disabled={isGenerating}
            >
              <Download className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-bounce' : ''}`} />
              {isGenerating ? (t.generating || 'Generating...') : (t.downloadPdf || "Download PDF")}
            </Button>
          </div>
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

                  <div className="flex flex-col w-full gap-3">
                    <Button
                      onClick={() => router.push("/edit")}
                      className="w-full rounded-full bg-gradient-to-r from-stitch-primary to-stitch-primary/80 text-white shadow-xl hover:shadow-stitch-primary/20 transition-all flex gap-2 h-11 text-sm font-bold"
                    >
                      <Sparkles className="w-4 h-4" />
                      Edit in Designer
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                    <div className="flex gap-4 w-full">
                      <Button variant="outline" size="sm" className="flex-1 rounded-full h-10" onClick={() => setShowResetDialog(true)} disabled={isGenerating}>
                        <RotateCcw className="w-4 h-4 mr-2" /> {t.reset || "Reset"}
                      </Button>
                      <Button size="sm" className="flex-1 rounded-full shadow-lg text-white h-10" onClick={handleDownload} disabled={isGenerating}>
                        <Download className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-bounce' : ''}`} />
                        {isGenerating ? (t.generating || 'Generating...') : (t.downloadPdf || "Download PDF")}
                      </Button>
                    </div>
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
          <div className="lg:hidden fixed bottom-4 left-4 right-4 bg-background/95 backdrop-blur-md border border-primary/10 py-2.5 px-4 rounded-3xl z-50 shadow-[0_10px_30px_rgba(0,0,0,0.15)] animate-in slide-in-from-bottom duration-300 flex items-center justify-between gap-4">
            
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
            <Button 
              size="sm" 
              onClick={handleDownload} 
              disabled={isGenerating}
              className="rounded-2xl shadow-lg bg-gradient-to-r from-stitch-primary to-stitch-primary/90 text-white font-bold text-xs h-10 px-4 flex gap-1.5 shrink-0"
            >
              <Download className={`w-3.5 h-3.5 ${isGenerating ? 'animate-bounce' : ''}`} />
              {isGenerating ? '...' : (t.download || "Download")}
            </Button>

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
            <DialogFooter className="flex gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setShowResetDialog(false)} className="rounded-full">{t.cancel || "Cancel"}</Button>
              <Button variant="destructive" onClick={handleReset} className="rounded-full">{t.yesReset || "Yes, Reset"}</Button>
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
    <div id="biodata-preview-home" className="bg-white overflow-hidden w-full aspect-[210/297] relative rounded-lg shadow-2xl ring-1 ring-black/5">
      <KonvaPreview liveFormData={formData as BiodataFormValues} templateId={storedTemplate} />
    </div>
  );
}
