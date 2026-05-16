"use client";

import { useForm, FormProvider, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { biodataSchema, type BiodataFormValues } from "@/types/biodata";
import { BiodataForm } from "@/components/biodata/BiodataForm";

import { defaultBiodataValues } from "@/lib/default-biodata";

import { Button } from "@/components/ui/button";
import { Download, RotateCcw, Sparkles, ArrowLeft, LayoutDashboard } from "lucide-react";
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

export function CreateClient() {
  const { formData: storedData, selectedTemplate: storedTemplate, setFormData, setSelectedTemplate, resetStore } = useBiodataStore();
  const theme = useThemeStore();
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const router = useRouter();
  const [hasInitialized, setHasInitialized] = useState(false);

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
      }, 2000); // 2 second delay for store persistence
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
      <div className="min-h-screen bg-background pb-32">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b flex items-center px-6 h-16 shrink-0 justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-primary/10 text-primary shrink-0"
              onClick={() => router.push("/")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-primary leading-tight">{t.title || "Create Your Biodata"}</h1>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Step 1: Fill Your Details</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full hidden md:flex border-primary/20 hover:bg-primary/5 hover:text-primary transition-all"
              onClick={() => methods.reset(defaultBiodataValues)}
            >
              <Sparkles className="w-4 h-4 mr-2 text-primary" /> Fill Sample
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full hidden sm:flex"
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
        </header>

        <div className="container mx-auto px-4 py-8 max-w-[1400px]">
          <div className="flex flex-col lg:flex-row gap-10 items-start">

            {/* Main Content Area */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              {/* Form Side - Natural Scrolling */}
              <div className="lg:col-span-5 flex flex-col print:hidden">
                <BiodataForm />
              </div>

              {/* Preview Side - Sticky */}
              <div className="lg:col-span-7 sticky top-24 print:block print:static print:w-full">
                <div className="flex-1 flex flex-col gap-6 items-center print:w-full">
                  <PreviewSection storedTemplate={storedTemplate} />

                  <div className="flex flex-col w-full gap-3 print:hidden">
                    <Button
                      onClick={() => router.push("/edit")}
                      className="w-full rounded-full bg-gradient-to-r from-stitch-primary to-stitch-primary/80 text-white shadow-xl hover:shadow-stitch-primary/20 transition-all flex gap-2 h-11 text-sm font-bold"
                    >
                      <Sparkles className="w-4 h-4" />
                      Edit in Designer
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

            {/* Right Side: Template Picker Box & Sidebar */}
            <div className="hidden lg:flex flex-col shrink-0 sticky top-24 z-30">
              <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <SheetTrigger>
                  <button className="group flex flex-col items-center gap-3 p-4 bg-white border border-primary/10 rounded-2xl shadow-sm hover:shadow-xl hover:border-primary/40 transition-all active:scale-95 text-center w-28">
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
                  </button>
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
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t p-4 flex flex-col gap-3 z-50">
          <div className="flex gap-3 w-full">
            <Sheet open={isMobileDrawerOpen} onOpenChange={setIsMobileDrawerOpen}>
              <SheetTrigger>
                <Button variant="outline" className="flex-1 rounded-full h-12 font-bold border-primary/20">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Templates
                </Button>
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
            <Button
              onClick={() => router.push("/edit")}
              className="flex-[2] rounded-full bg-gradient-to-r from-stitch-primary to-stitch-primary/80 text-white shadow-lg h-12 font-bold"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Edit in Designer
            </Button>
          </div>
          <div className="flex gap-4 w-full">
            <Button variant="outline" size="sm" className="flex-1 rounded-full h-10" onClick={() => setShowResetDialog(true)} disabled={isGenerating}>
              <RotateCcw className="w-4 h-4 mr-2" /> {t.reset || "Reset"}
            </Button>
            <Button size="sm" className="flex-1 rounded-full shadow-lg text-white h-10" onClick={handleDownload} disabled={isGenerating}>
              <Download className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-bounce' : ''}`} />
              {isGenerating ? (t.generating || 'Generating...') : (t.download || "Download")}
            </Button>
          </div>
        </div>

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

      </div>
    </FormProvider>
  );
}

/**
 * Isolated Preview Section — uses Konva canvas for instant, zero-flicker live preview.
 * Passes live form data via useWatch() for truly real-time rendering.
 */
function PreviewSection({ storedTemplate }: { storedTemplate: string }) {
  const formData = useWatch();

  return (
    <div id="biodata-preview" className="bg-white overflow-hidden w-full aspect-[210/297] print:shadow-none relative rounded-xl shadow-2xl border border-primary/5 mx-auto">
      <KonvaPreview liveFormData={formData as BiodataFormValues} templateId={storedTemplate} />
    </div>
  );
}
