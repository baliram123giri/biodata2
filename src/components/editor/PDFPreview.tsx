"use client";

import React, { useEffect, useCallback } from "react";
import { usePDF } from "@react-pdf/renderer";
import { PDFViewer } from "@embedpdf/react-pdf-viewer";
import { useBiodataStore } from "@/store/useBiodataStore";
import { useThemeStore } from "@/store/useThemeStore";
import RoyalPDF from "../templates/classic/Royal/RoyalPDF";
import IvoryElegancePDF from "../templates/classic/IvoryElegance/IvoryElegancePDF";

export function PDFPreview() {
  const { formData, selectedTemplate } = useBiodataStore();
  const theme = useThemeStore();

  // When "None" is selected, strip colors so templates use their built-in defaults
  const pdfTheme = theme.selectedPaletteName === null
    ? { ...theme, primaryColor: undefined, secondaryColor: undefined, accentColor: undefined }
    : theme;
  const disabledCategories: string[] = ['annotation', "document-open", "document", "selection", 'pointer', "panel", "page", 'print', 'export', 'form', 'redaction', 'shapes', 'insert', 'search', 'annotation-markup', 'annotation-highlight', 'open', 'close', 'security', 'screenshot', 'fullscreen', 'save', 'download', 'menu', 'file', 'navigation', 'thumbnails', 'bookmarks', 'sidebar', 'spread', 'page-layout', 'outline', 'layers', 'attachments']
  // Two permanent slots with separate stable keys
  const [slotA, setSlotA] = React.useState<string | null>(null);
  const [slotB, setSlotB] = React.useState<string | null>(null);
  const [keyA, setKeyA] = React.useState(0);
  const [keyB, setKeyB] = React.useState(0);
  const [frontSlot, setFrontSlot] = React.useState<"A" | "B">("A");
  const [isFirstLoad, setIsFirstLoad] = React.useState(true);

  const [instance, updateInstance] = usePDF({
    document: selectedTemplate === "ivory-elegance"
      ? <IvoryElegancePDF data={formData} theme={pdfTheme} />
      : <RoyalPDF data={formData} theme={pdfTheme} />
  });

  useEffect(() => {
    updateInstance(
      selectedTemplate === "ivory-elegance"
        ? <IvoryElegancePDF data={formData} theme={pdfTheme} />
        : <RoyalPDF data={formData} theme={pdfTheme} />
    );
  }, [formData, theme, selectedTemplate, updateInstance]);


  // Convert blob → data URL → load into the BACK slot only
  useEffect(() => {
    if (!instance.url) return;

    fetch(instance.url)
      .then(res => res.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;

          if (isFirstLoad) {
            setSlotA(dataUrl);
            setKeyA(1);
            setFrontSlot("A");
            setIsFirstLoad(false);
          } else if (frontSlot === "A") {
            // Front is A → load into back slot B
            setSlotB(dataUrl);
            setKeyB(prev => prev + 1);
          } else {
            // Front is B → load into back slot A
            setSlotA(dataUrl);
            setKeyA(prev => prev + 1);
          }
        };
        reader.readAsDataURL(blob);
      });
  }, [instance.url]);

  // When back slot signals ready, flip it to front
  const handleBackReady = useCallback(() => {
    setFrontSlot(prev => prev === "A" ? "B" : "A");
  }, []);

  return (
    <div className="w-full h-full bg-white overflow-hidden relative">
      {/* First-load spinner */}
      {isFirstLoad && instance.loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white">
          <div className="w-10 h-10 rounded-full border-4 border-stitch-primary/20 border-t-stitch-primary animate-spin" />
        </div>
      )}

      {/* Slot A — always mounted */}
      <div
        className="absolute inset-0"
        style={{ zIndex: frontSlot === "A" ? 20 : 10 }}
      >
        {slotA && (
          <PDFViewer
            key={`A-${keyA}`}
            config={{
              src: slotA,
              disabledCategories
            }}
            style={{ width: '100%', height: '100%' }}
            onReady={frontSlot !== "A" ? handleBackReady : undefined}
          />
        )}
      </div>

      {/* Slot B — always mounted */}
      <div
        className="absolute inset-0"
        style={{ zIndex: frontSlot === "B" ? 20 : 10 }}
      >
        {slotB && (
          <PDFViewer
            key={`B-${keyB}`}
            config={{
              src: slotB,
              disabledCategories
            }}
            style={{ width: '100%', height: '100%' }}
            onReady={frontSlot !== "B" ? handleBackReady : undefined}
          />
        )}
      </div>
    </div>
  );
}
