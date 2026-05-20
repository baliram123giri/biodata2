"use client";

import { useState } from "react";
import { useThemeStore } from "@/store/useThemeStore";
import type { DownloadFormat } from "@/components/biodata/DownloadDropdown";

export function useDownloadBiodata() {
  const [isGenerating, setIsGenerating] = useState(false);
  const theme = useThemeStore();

  const handleDownload = async (
    formData: any,
    templateId: string,
    format: DownloadFormat = "pdf"
  ) => {
    setIsGenerating(true);
    try {
      const nameField = formData.personalDetails?.find((f: any) => f.id === "fullName")?.value || "biodata";
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
        console.error("Generation failed:", errorData);
        throw new Error(`Server error: ${res.status} - ${errorData.details || errorData.error || res.statusText}`);
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
