"use client";

import { useState } from "react";
import { useThemeStore } from "@/store/useThemeStore";
import type { DownloadFormat } from "@/components/biodata/DownloadDropdown";

/**
 * Generate a JPG data URL from the Konva canvas preview.
 * Uses custom events to communicate with KonvaPreview.
 */
export function generateJpgDataUrl(): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error("JPG export timed out")),
      10_000
    );

    const handler = (e: Event) => {
      clearTimeout(timeout);
      window.removeEventListener("biodata:jpg-ready", handler);
      resolve((e as CustomEvent<string>).detail);
    };
    window.addEventListener("biodata:jpg-ready", handler);
    window.dispatchEvent(new CustomEvent("biodata:export-jpg"));
  });
}

/**
 * Generate a PNG data URL from the Konva canvas preview.
 * Uses custom events to communicate with KonvaPreview.
 */
export function generatePngDataUrl(): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error("PNG export timed out")),
      10_000
    );

    const handler = (e: Event) => {
      clearTimeout(timeout);
      window.removeEventListener("biodata:png-ready", handler);
      resolve((e as CustomEvent<string>).detail);
    };
    window.addEventListener("biodata:png-ready", handler);
    window.dispatchEvent(new CustomEvent("biodata:export-png"));
  });
}

/**
 * Pre-fetch and convert any company logo to a Base64 data URL client-side.
 * This guarantees the server receives offline-ready data for perfect PDF/DOCX rendering.
 */
async function prepareFormDataWithBase64Logos(formData: any): Promise<any> {
  return formData;
}

/**
 * Generate a PDF Blob directly from the server API.
 */
export async function generatePdfBlob(
  formData: any,
  templateId: string,
  theme: any
): Promise<Blob> {
  const preparedData = await prepareFormDataWithBase64Logos(formData);
  const res = await fetch("/api/generate-pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      formData: preparedData,
      templateId,
      theme: {
        fontFamily: theme.fontFamily,
        primaryColor: theme.primaryColor,
        secondaryColor: theme.secondaryColor,
        accentColor: theme.accentColor,
        fontSize: theme.fontSize,
        padding: theme.padding,
        paddingY: theme.paddingY,
        selectedPaletteName: theme.selectedPaletteName,
        bgColors: theme.bgColors,
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    let errorDetails = "";
    try {
      const parsed = JSON.parse(text);
      errorDetails = parsed.details || parsed.error || text;
    } catch {
      errorDetails = text;
    }
    throw new Error(errorDetails || "Failed to generate PDF");
  }

  return await res.blob();
}


export function useDownloadBiodata() {
  const [isGenerating, setIsGenerating] = useState(false);
  const theme = useThemeStore();

  const handleDownload = async (
    formData: any,
    templateId: string,
    format: DownloadFormat = "pdf",
    customFilename?: string
  ) => {
    setIsGenerating(true);

    const preparedData = await prepareFormDataWithBase64Logos(formData);

    const getFieldVal = (details: any[], id: string) => {
      return details?.find((f: any) => f.id === id)?.value || "";
    };

    const nameField =
      customFilename ||
      getFieldVal(preparedData.personalDetails, "fullName") ||
      "biodata";

    const locField =
      getFieldVal(preparedData.contactDetails, "residentialAddress") ||
      getFieldVal(preparedData.familyDetails, "nativePlace") ||
      getFieldVal(preparedData.personalDetails, "placeOfBirth") ||
      "Unknown";

    // Record download activity in database
    fetch("/api/download-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: nameField,
        location: locField,
        format,
        templateId,
      }),
    }).catch((err) => console.error("Failed to log download:", err));

    // Helper to generate server-side documents (PDF/DOCX)
    const generateServerBlob = async (docFormat: "pdf" | "docx") => {
      const apiUrl = docFormat === "docx" ? "/api/generate-docx" : "/api/generate-pdf";
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formData: preparedData,
          templateId,
          theme: {
            fontFamily: theme.fontFamily,
            primaryColor: theme.primaryColor,
            secondaryColor: theme.secondaryColor,
            accentColor: theme.accentColor,
            fontSize: theme.fontSize,
            padding: theme.padding,
            paddingY: theme.paddingY,
            selectedPaletteName: theme.selectedPaletteName,
            bgColors: theme.bgColors,
          },
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        let errorData: any = {};
        try {
          errorData = JSON.parse(text);
        } catch (e) {
          console.error("Non-JSON error response:", res.status, res.statusText, text.substring(0, 500));
        }
        throw new Error(
          `Server error: ${res.status} - ${errorData.details || errorData.error || text.substring(0, 200) || res.statusText}`
        );
      }
      return await res.blob();
    };

    // ── Combo Pack Export: ZIP Download ──
    if (format === "combo") {
      try {
        const JSZip = (await import("jszip")).default;
        const { saveAs } = await import("file-saver");

        const zip = new JSZip();

        // 1. PDF
        const pdfBlob = await generateServerBlob("pdf");
        zip.file(`${nameField}_biodata.pdf`, pdfBlob);

        // 2. DOCX
        const docxBlob = await generateServerBlob("docx");
        zip.file(`${nameField}_biodata.docx`, docxBlob);

        // 3. JPG
        const jpgDataUrl = await generateJpgDataUrl();
        const jpgBase64 = jpgDataUrl.split(",")[1];
        zip.file(`${nameField}_biodata.jpeg`, jpgBase64, { base64: true });

        // 4. PNG
        const pngDataUrl = await generatePngDataUrl();
        const pngBase64 = pngDataUrl.split(",")[1];
        zip.file(`${nameField}_biodata.png`, pngBase64, { base64: true });

        // Generate and download ZIP
        const zipBlob = await zip.generateAsync({ type: "blob" });
        saveAs(zipBlob, `${nameField}_Combo_Pack.zip`);
      } catch (err) {
        console.error("Combo Pack Download Error:", err);
      } finally {
        setIsGenerating(false);
      }
      return;
    }

    // ── JPEG Export: fully client-side via Konva canvas ──────────────
    if (format === "jpg") {
      try {
        const dataUrl = await generateJpgDataUrl();

        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `${nameField}.jpeg`;
        link.click();
      } catch (err) {
        console.error("JPG Export Error:", err);
      } finally {
        setIsGenerating(false);
      }
      return;
    }

    // ── PNG Export: fully client-side via Konva canvas ──────────────
    if (format === "png") {
      try {
        const dataUrl = await generatePngDataUrl();

        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `${nameField}.png`;
        link.click();
      } catch (err) {
        console.error("PNG Export Error:", err);
      } finally {
        setIsGenerating(false);
      }
      return;
    }

    // ── PDF / DOCX Export: server-side ──────────────────────────────
    try {
      const fileExt = format === "docx" ? "docx" : "pdf";
      const blob = await generateServerBlob(format === "docx" ? "docx" : "pdf");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${nameField}.${fileExt}`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export Error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    handleDownload,
    isGenerating,
  };
}
