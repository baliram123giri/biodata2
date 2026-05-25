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
 * Generate a PDF Blob directly from the server API.
 */
export async function generatePdfBlob(
  formData: any,
  templateId: string,
  theme: any
): Promise<Blob> {
  const res = await fetch("/api/generate-pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      formData,
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

    const getFieldVal = (details: any[], id: string) => {
      return details?.find((f: any) => f.id === id)?.value || "";
    };

    const nameField =
      customFilename ||
      getFieldVal(formData.personalDetails, "fullName") ||
      "biodata";

    const locField =
      getFieldVal(formData.contactDetails, "residentialAddress") ||
      getFieldVal(formData.familyDetails, "nativePlace") ||
      getFieldVal(formData.personalDetails, "placeOfBirth") ||
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

    // ── PDF / DOCX Export: server-side ──────────────────────────────
    try {
      const apiUrl = format === "docx" ? "/api/generate-docx" : "/api/generate-pdf";
      const fileExt = format === "docx" ? "docx" : "pdf";

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formData,
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

      const blob = await res.blob();
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
