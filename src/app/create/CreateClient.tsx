"use client";
 
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { biodataSchema, type BiodataFormValues } from "@/types/biodata";
import { BiodataForm } from "@/components/biodata/BiodataForm";
import { BiodataPreview } from "@/components/biodata/BiodataPreview";
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
import { useState } from "react";
 
import { translations } from "@/lib/translations";
 
export function CreateClient() {
  const [showResetDialog, setShowResetDialog] = useState(false);
  const methods = useForm<BiodataFormValues>({
    resolver: zodResolver(biodataSchema) as any,
    defaultValues: defaultBiodataValues,
    mode: "onChange",
  });
 
  const formData = methods.watch();
  const currentLang = formData.language || "English";
  const t = translations[currentLang] || translations["English"];

  const handleReset = () => {
    methods.reset(defaultBiodataValues);
    setShowResetDialog(false);
  };

  const handleDownload = () => {
    window.print();
  };
 
  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
 
          {/* Form Side - Natural Scrolling */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-primary">{t.title || "Create Your Biodata"}</h1>
              <p className="text-sm text-muted-foreground">Fill in your details below. The preview updates instantly.</p>
            </div>
 
            <FormProvider {...methods}>
              <BiodataForm />
            </FormProvider>
          </div>
 
          {/* Preview Side - Sticky */}
          <div className="lg:col-span-5 sticky top-24 hidden lg:block">
            <div className="flex flex-col gap-6 items-center">
              <BiodataPreview data={formData} />
              
              <div className="flex w-full gap-4">
                <Button variant="outline" size="sm" className="flex-1 rounded-full" onClick={() => setShowResetDialog(true)}>
                  <RotateCcw className="w-4 h-4 mr-2" /> {t.reset || "Reset"}
                </Button>
                <Button size="sm" className="flex-1 rounded-full shadow-lg text-white" onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" /> {t.downloadPdf || "Download PDF"}
                </Button>
              </div>
            </div>
          </div>
 
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t p-4 flex gap-4 z-50">
        <Button variant="outline" size="sm" className="flex-1 rounded-full" onClick={() => setShowResetDialog(true)}>
          <RotateCcw className="w-4 h-4 mr-2" /> {t.reset || "Reset"}
        </Button>
        <Button size="sm" className="flex-1 rounded-full shadow-lg text-white" onClick={handleDownload}>
          <Download className="w-4 h-4 mr-2" /> {t.download || "Download"}
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
