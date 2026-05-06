"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { biodataSchema, type BiodataFormValues } from "@/types/biodata";
import { BiodataForm } from "@/components/biodata/BiodataForm";

import { defaultBiodataValues } from "@/lib/default-biodata";

import { Button } from "@/components/ui/button";
import { Download, RotateCcw, Printer } from "lucide-react";

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
import { generatePDF } from "@/lib/pdf-utils";
import { useBiodataStore } from "@/store/useBiodataStore";
import { pdf } from "@react-pdf/renderer";
import { BiodataPDF } from "@/components/biodata/BiodataPDF";
import dynamic from "next/dynamic";

const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  { ssr: false }
);

export function CreateClient() {
  const { formData: storedData, selectedTemplate: storedTemplate, setFormData, setSelectedTemplate, resetStore } = useBiodataStore();
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

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

  const formData = methods.watch();

  // Update store when form changes
  useEffect(() => {
    const subscription = methods.watch((value) => {
      // Sync form state to Zustand store
      if (value) setFormData(value as BiodataFormValues);
    });
    return () => subscription.unsubscribe();
  }, [methods, setFormData]);

  const currentLang = formData.language || "English";
  const t = translations[currentLang] || translations["English"];

  const templates = [
    { id: "classic1", name: "Classic 1", color: "bg-primary" },
  ];

  const handleReset = () => {
    resetStore();
    methods.reset(defaultBiodataValues);
    setShowResetDialog(false);
  };


  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const nameField = formData.personalDetails.find(f => f.id === "fullName")?.value || "biodata";
      const doc = <BiodataPDF data={formData} templateId={storedTemplate} />;
      const blob = await pdf(doc).toBlob();
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
    <div className="min-h-screen bg-background pb-32">
      {/* Hidden Export Container - Fixed A4 width for perfect PDF generation */}
      {/* <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', width: '210mm' }}>
        <div id="pdf-export-element" className="bg-white">
          <BiodataPDF data={formData} templateId={storedTemplate} />
        </div>
      </div> */}

      <div className="container mx-auto px-4 py-6 max-w-[1400px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* Form Side - Natural Scrolling */}
          <div className="lg:col-span-4 flex flex-col print:hidden">
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-primary">{t.title || "Create Your Biodata"}</h1>
              <p className="text-sm text-muted-foreground">Fill in your details below. The preview updates instantly.</p>
            </div>

            <FormProvider {...methods}>
              <BiodataForm />
            </FormProvider>
          </div>

          {/* Preview Side - Sticky with Vertical Template Slider */}
          <div className="lg:col-span-8 sticky top-24 hidden lg:block print:block print:static print:w-full">
            <div className="flex gap-4 items-start">
              {/* Main Preview */}
              <div className="flex-1 flex flex-col gap-6 items-center print:w-full">
                <div id="biodata-preview" className="bg-white overflow-hidden w-full aspect-[210/297] print:shadow-none relative rounded-xl shadow-2xl border border-primary/5 mx-auto ">
                  <PDFViewer
                    key={storedTemplate}
                    width="100%"
                    height="100%"
                    style={{
                      border: 'none',
                      overflow: 'hidden',

                      backgroundColor: "white",
                      //@ts-ignore
                      pointerEvents: 'none',
                    }}
                    showToolbar={false}
                  >
                    <BiodataPDF data={formData} templateId={storedTemplate} />
                  </PDFViewer>
                </div>

                <div className="flex w-full gap-4 print:hidden">
                  <Button variant="outline" size="sm" className="flex-1 rounded-full" onClick={() => setShowResetDialog(true)} disabled={isGenerating}>
                    <RotateCcw className="w-4 h-4 mr-2" /> {t.reset || "Reset"}
                  </Button>
                  <Button size="sm" className="flex-1 rounded-full shadow-lg text-white" onClick={handleDownload} disabled={isGenerating}>
                    <Download className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-bounce' : ''}`} />
                    {isGenerating ? 'Generating...' : (t.downloadPdf || "Download PDF")}
                  </Button>
                </div>
              </div>

              {/* Vertical Template Slider */}
              <div className="w-20 shrink-0 flex flex-col gap-4 max-h-[600px] overflow-y-auto no-scrollbar py-2 pr-2 border-l border-primary/10 pl-4 print:hidden">
                <span className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground text-center">Frames</span>
                {templates.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => setSelectedTemplate(tpl.id)}
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
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t p-4 flex gap-4 z-50">
        <Button variant="outline" size="sm" className="flex-1 rounded-full" onClick={() => setShowResetDialog(true)} disabled={isGenerating}>
          <RotateCcw className="w-4 h-4 mr-2" /> {t.reset || "Reset"}
        </Button>
        <Button size="sm" className="flex-1 rounded-full shadow-lg text-white" onClick={handleDownload} disabled={isGenerating}>
          <Download className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-bounce' : ''}`} />
          {isGenerating ? 'Generating...' : (t.download || "Download")}
        </Button>
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

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          nav, header, footer, .lg\\:col-span-7, .lg\\:hidden, button, .sticky {
            display: none !important;
          }
          .lg\\:col-span-5 {
            position: relative !important;
            top: 0 !important;
            display: block !important;
            width: 100% !important;
          }
          body {
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
}
