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
  if (!formData) return formData;
  try {
    const cloned = JSON.parse(JSON.stringify(formData));
    const sections = ["personalDetails", "educationDetails", "familyDetails", "contactDetails"];
    for (const secKey of sections) {
      const fields = cloned[secKey];
      if (fields && Array.isArray(fields)) {
        for (const field of fields) {
          if (field.type === "company" || field.id === "companyName") {
            let rawLogo = field.logo;
            
            if (!rawLogo) {
              const cleanName = (field.value || "").trim().toLowerCase();
              const popular = [
                { name: "tcs", domain: "tcs.com" },
                { name: "tata consultancy services", domain: "tcs.com" },
                { name: "infosys", domain: "infosys.com" },
                { name: "wipro", domain: "wipro.com" },
                { name: "cognizant", domain: "cognizant.com" },
                { name: "accenture", domain: "accenture.com" },
                { name: "google", domain: "google.com" },
                { name: "microsoft", domain: "microsoft.com" },
                { name: "amazon", domain: "amazon.com" },
                { name: "flipkart", domain: "flipkart.com" },
                { name: "reliance", domain: "ril.com" },
                { name: "tata motors", domain: "tatamotors.com" },
                { name: "hdfc bank", domain: "hdfcbank.com" },
                { name: "hdfc", domain: "hdfcbank.com" },
                { name: "icici bank", domain: "icicibank.com" },
                { name: "icici", domain: "icicibank.com" },
                { name: "sbi", domain: "sbi.co.in" },
                { name: "state bank of india", domain: "sbi.co.in" },
                { name: "l&t", domain: "larsentoubro.com" },
                { name: "larsen & toubro", domain: "larsentoubro.com" },
                { name: "mahindra", domain: "mahindra.com" },
                { name: "government of india", domain: "india.gov.in" },
                { name: "meta", domain: "meta.com" },
                { name: "apple", domain: "apple.com" },
                { name: "netflix", domain: "netflix.com" },
              ];
              const foundPopular = popular.find(p => cleanName.includes(p.name) || p.name.includes(cleanName));
              if (foundPopular) {
                rawLogo = `https://icon.horse/icon/${foundPopular.domain}`;
              }
            }
            
            if (!rawLogo) {
              rawLogo = fields.find((f: any) => f.id === "companyLogo")?.value;
              if ((field.value || "").toLowerCase() !== "google" && rawLogo && rawLogo.includes("google.com")) {
                rawLogo = undefined;
              }
            }
            
            if (!rawLogo && (field.value || "").includes(".")) {
              const potentialDomain = (field.value || "").replace(/https?:\/\//, "").split("/")[0].trim();
              rawLogo = `https://icon.horse/icon/${potentialDomain}`;
            }
            
            if (rawLogo && rawLogo.startsWith("http")) {
              console.log("Client-side pre-fetching logo for PDF generation:", rawLogo);
              try {
                const proxyUrl = `/api/proxy-logo?url=${encodeURIComponent(rawLogo)}`;
                const res = await fetch(proxyUrl);
                if (res.ok) {
                  const blob = await res.blob();
                  const base64 = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(blob);
                  });
                  field.logo = base64;
                }
              } catch (err) {
                console.error("Client logo pre-fetch error:", err);
              }
            }
          }
        }
      }
    }
    return cloned;
  } catch (e) {
    console.error("Error in prepareFormDataWithBase64Logos:", e);
    return formData;
  }
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

    // ── Combo Pack Export: Trigger PDF, DOCX, JPG, and PNG sequentially ──
    if (format === "combo") {
      try {
        await handleDownload(formData, templateId, "pdf", nameField);
        await new Promise(r => setTimeout(r, 800));
        await handleDownload(formData, templateId, "docx", nameField);
        await new Promise(r => setTimeout(r, 800));
        await handleDownload(formData, templateId, "jpg", nameField);
        await new Promise(r => setTimeout(r, 800));
        await handleDownload(formData, templateId, "png", nameField);
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
      const apiUrl = format === "docx" ? "/api/generate-docx" : "/api/generate-pdf";
      const fileExt = format === "docx" ? "docx" : "pdf";

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
