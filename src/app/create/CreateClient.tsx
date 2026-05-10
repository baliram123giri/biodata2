"use client";

import { useForm, FormProvider, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { biodataSchema, type BiodataFormValues } from "@/types/biodata";
import { BiodataForm } from "@/components/biodata/BiodataForm";

import { defaultBiodataValues } from "@/lib/default-biodata";

import { Button } from "@/components/ui/button";
import { Download, RotateCcw, Sparkles, ArrowLeft } from "lucide-react";
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

  // Handle hydration and initial load
  useEffect(() => {
    setIsHydrated(true);
    // Initialize form with stored data ONCE after mount
    methods.reset(storedData);
  }, []); // Run only once

  const methods = useForm<BiodataFormValues>({
    resolver: zodResolver(biodataSchema) as any,
    defaultValues: defaultBiodataValues,
    mode: "onChange",
  });

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

  // Handle template selection directly
  const handleTemplateChange = (id: string) => {
    setSelectedTemplate(id);
  };

  const currentLang = useWatch({ control: methods.control, name: "language" }) || "English";
  const t = translations[currentLang] || translations["English"];

  const templates = [
    { id: "royal", name: "Royal Gold", color: "bg-[#800000]" },
    { id: "ivory-elegance", name: "Ivory Elegance", color: "bg-[#7A5C2F]" },
  ];

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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

            {/* Form Side - Natural Scrolling */}
            <div className="lg:col-span-5 flex flex-col print:hidden">
              <BiodataForm />
            </div>

            {/* Preview Side - Sticky with Vertical Template Slider */}
            <div className="lg:col-span-7 sticky top-24 print:block print:static print:w-full">
              <div className="flex gap-4 items-start">
                {/* Main Preview */}
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

                {/* Vertical Template Slider */}
                <div className="w-20 shrink-0 flex flex-col gap-4 max-h-[600px] overflow-y-auto no-scrollbar py-2 pr-2 border-l border-primary/10 pl-4 print:hidden">
                  <span className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground text-center">Frames</span>
                  {templates.map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => handleTemplateChange(tpl.id)}
                      className={`group relative flex flex-col items-center gap-2 transition-all ${storedTemplate === tpl.id ? "scale-105" : "opacity-60 hover:opacity-100 hover:scale-105"
                        }`}
                    >
                      <div className={`w-12 h-16 rounded-md shadow-md border-2 ${storedTemplate === tpl.id ? "border-primary ring-2 ring-primary/20" : "border-transparent"
                        } ${tpl.color} flex items-center justify-center`}>
                        <span className="text-[10px] font-bold text-white uppercase transform -rotate-45">{tpl.id.split('')[0]}</span>
                      </div>
                      <span className={`text-[9px] font-bold text-center ${storedTemplate === tpl.id ? "text-primary" : "text-muted-foreground"
                        }`}>
                        {tpl.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Mobile Sticky Bottom Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t p-4 flex flex-col gap-3 z-50">
          <Button 
            onClick={() => router.push("/edit")}
            className="w-full rounded-full bg-gradient-to-r from-stitch-primary to-stitch-primary/80 text-white shadow-lg h-12 font-bold"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Edit in Designer
          </Button>
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

