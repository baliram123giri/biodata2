"use client";

import { useState } from "react";
import { useThemeStore } from "@/store/useThemeStore";
import { useBiodataStore } from "@/store/useBiodataStore";
import type { DownloadFormat } from "@/components/biodata/DownloadDropdown";
import { getTemplateConfig } from "@/lib/frame-config";

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
 * Converts any URL to a Base64 data URL client-side with canvas fallback.
 */
async function imageUrlToBase64(url: string): Promise<string> {
  if (!url) return "";
  if (url.startsWith("data:")) return url;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    return new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width || 32;
        canvas.height = img.height || 32;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          reject(new Error("Canvas context is null"));
          return;
        }
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(objectUrl);
        try {
          resolve(canvas.toDataURL("image/png"));
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = (e) => {
        URL.revokeObjectURL(objectUrl);
        reject(e);
      };
      img.src = objectUrl;
    });
  } catch (fetchErr) {
    console.warn("Client fetch failed for base64 conversion, trying canvas...", fetchErr);
    try {
      return await new Promise<string>((resolve, reject) => {
        const img = new Image();
        img.setAttribute("crossOrigin", "anonymous");
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Canvas context is null"));
            return;
          }
          ctx.drawImage(img, 0, 0);
          try {
            resolve(canvas.toDataURL("image/png"));
          } catch (e) {
            reject(e);
          }
        };
        img.onerror = (e) => reject(e);
        img.src = url.includes("?") ? `${url}&cvs=true` : `${url}?cvs=true`;
      });
    } catch (canvasErr) {
      console.error("Canvas conversion failed too:", canvasErr);
      return url;
    }
  }
}

/**
 * Pre-fetch and convert any company logo & stickers to a Base64 data URL client-side.
 * This guarantees the server receives offline-ready data for perfect PDF/DOCX rendering.
 */
async function prepareFormDataWithBase64Logos(formData: any): Promise<any> {
  if (!formData) return formData;
  
  const clonedData = JSON.parse(JSON.stringify(formData));

  // 1. Resolve field logos (keep client-side resolution since server cannot fetch arbitrary remote field logos directly)
  const sections = ['personalDetails', 'educationDetails', 'familyDetails', 'contactDetails'];
  for (const sec of sections) {
    if (clonedData[sec] && Array.isArray(clonedData[sec])) {
      for (const field of clonedData[sec]) {
        // Strip options to significantly reduce request payload size
        if (field.options) {
          delete field.options;
        }
        
        if (field.logoUrl && field.logoUrl.startsWith("http")) {
          try {
            const base64 = await imageUrlToBase64(field.logoUrl);
            if (base64 && base64.startsWith("data:")) {
              field.logoUrl = base64;
            }
          } catch (e) {
            console.error(`Failed to pre-fetch logoUrl for field ${field.id}:`, e);
          }
        }

        // Also convert the company logo URL stored directly in field.logo
        if (field.logo && typeof field.logo === "string" && field.logo.startsWith("http")) {
          try {
            const base64 = await imageUrlToBase64(field.logo);
            if (base64 && base64.startsWith("data:")) {
              field.logo = base64;
            }
          } catch (e) {
            console.error(`Failed to pre-fetch logo for field ${field.id}:`, e);
          }
        }

      }
    }
  }

  // 2. Resolve stickers client-side and set their raw URL in resolvedUrl (without base64 conversion)
  if (clonedData.stickers && clonedData.stickers.length > 0) {
    try {
      const { STICKER_ASSETS } = require("@/lib/sticker-assets");
      for (const sticker of clonedData.stickers) {
        let asset = STICKER_ASSETS.find((a: any) => a.id === sticker.type);
        if (!asset && sticker.type) {
          asset = { id: sticker.type, type: "image", url: sticker.type };
        }
        const urlToResolve = sticker.resolvedUrl || (asset && asset.url);
        if (urlToResolve) {
          sticker.resolvedUrl = urlToResolve;
        }
      }
    } catch (err) {
      console.error("Error loading sticker assets for client-side resolution:", err);
    }
  }

  return clonedData;
}

/**
 * Pre-fetches background assets and builds fully-populated, offline-ready payload for PDF generation.
 */
export async function prepareDataForGeneration(
  formData: any,
  theme: any,
  templateId: string
): Promise<{ formData: any; theme: any }> {
  const storeState = useBiodataStore.getState();
  const mergedFormData = {
    ...formData,
    layout: storeState.formData?.layout || formData?.layout,
    stickers: storeState.formData?.stickers && storeState.formData.stickers.length > 0 
      ? storeState.formData.stickers 
      : (formData?.stickers || []),
  };

  const preparedFormData = await prepareFormDataWithBase64Logos(mergedFormData);

  // Background images can be extremely large (several MBs). Sending them client-side in the POST request body 
  // causes "413 Request Entity Too Large" errors on Nginx. Instead, we let the server fetch and convert them directly.
  let bgImageUrlBase64 = undefined;
  const bgUrl = theme.bgImageUrl || getTemplateConfig(templateId)?.bgConfig?.url;
  if (bgUrl && bgUrl.startsWith("data:")) {
    bgImageUrlBase64 = bgUrl;
  }

  const preparedTheme = {
    fontFamily: theme.fontFamily,
    fontWeight: theme.fontWeight,
    primaryColor: theme.primaryColor,
    secondaryColor: theme.secondaryColor,
    accentColor: theme.accentColor,
    fontSize: theme.fontSize,
    padding: theme.padding,
    paddingY: theme.paddingY,
    paddingTop: theme.paddingTop,
    paddingBottom: theme.paddingBottom,
    paddingLeft: theme.paddingLeft,
    paddingRight: theme.paddingRight,
    selectedPaletteName: theme.selectedPaletteName,
    bgColors: theme.bgColors,
    bgImageUrl: theme.bgImageUrl,
    bgImageUrlBase64: bgImageUrlBase64 || theme.bgImageUrlBase64,
    bgImageOpacity: theme.bgImageOpacity,
    bgImageScale: theme.bgImageScale,
    bgImageXOffset: theme.bgImageXOffset,
    bgImageYOffset: theme.bgImageYOffset,
    photoCornerRadius: theme.photoCornerRadius,
    photoBorderSize: theme.photoBorderSize,
    photoScale: theme.photoScale,
    photoRotation: theme.photoRotation,
    photoXOffset: theme.photoXOffset,
    photoYOffset: theme.photoYOffset,
  };

  return { formData: preparedFormData, theme: preparedTheme };
}

/**
 * Generate a PDF Blob directly from the server API.
 */
export async function generatePdfBlob(
  formData: any,
  templateId: string,
  theme: any
): Promise<Blob> {
  const { formData: preparedData, theme: preparedTheme } = await prepareDataForGeneration(formData, theme, templateId);
  const res = await fetch("/api/generate-pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      formData: preparedData,
      templateId,
      theme: preparedTheme,
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


export function dataURItoBlob(dataURI: string): Blob {
  const splitDataURI = dataURI.split(',');
  const byteString = splitDataURI[0].indexOf('base64') >= 0 ? atob(splitDataURI[1]) : decodeURI(splitDataURI[1]);
  const mimeString = splitDataURI[0].split(':')[1].split(';')[0];
  const ia = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ia], { type: mimeString });
}


export function useDownloadBiodata() {
  const [isGenerating, setIsGenerating] = useState(false);
  const theme = useThemeStore();

  const handleDownload = async (
    formData: any,
    templateId: string,
    format: DownloadFormat = "pdf",
    customFilename?: string,
    orderId?: string
  ): Promise<{ success: boolean; error?: any }> => {
    setIsGenerating(true);

    const { formData: preparedData, theme: preparedTheme } = await prepareDataForGeneration(formData, theme, templateId);

    const getFieldVal = (details: any[], id: string) => {
      return details?.find((f: any) => f.id === id)?.value || "";
    };

    const nameField =
      customFilename ||
      getFieldVal(preparedData.personalDetails, "fullName") ||
      "biodata";

    // Extract proper name for database logging, preserving Unicode characters
    const actualName =
      getFieldVal(preparedData.personalDetails, "fullName") ||
      preparedData.personalDetails?.[0]?.value ||
      customFilename ||
      "biodata";
    const nameFieldForLog = actualName.trim() || "biodata";

    const timestamp = Date.now();

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
        name: nameFieldForLog,
        location: locField,
        format,
        templateId,
        orderId,
      }),
    }).catch((err) => console.error("Failed to log download:", err));

    // Helper to generate server-side documents (PDF)
    const generateServerBlob = async () => {
      const apiUrl = "/api/generate-pdf";
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formData: preparedData,
          templateId,
          theme: preparedTheme,
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
        const pdfBlob = await generateServerBlob();
        zip.file(`${nameField}_${timestamp}_biodata.pdf`, pdfBlob);

        // 3. JPG
        const jpgDataUrl = await generateJpgDataUrl();
        const jpgBase64 = jpgDataUrl.split(",")[1];
        zip.file(`${nameField}_${timestamp}_biodata.jpeg`, jpgBase64, { base64: true });

        // 4. PNG
        const pngDataUrl = await generatePngDataUrl();
        const pngBase64 = pngDataUrl.split(",")[1];
        zip.file(`${nameField}_${timestamp}_biodata.png`, pngBase64, { base64: true });

        // Generate and download ZIP
        const zipBlob = await zip.generateAsync({ type: "blob" });
        saveAs(zipBlob, `${nameField}_${timestamp}_Combo_Pack.zip`);
        return { success: true };
      } catch (err) {
        console.error("Combo Pack Download Error:", err instanceof Error ? err.message : String(err));
        return { success: false, error: err };
      } finally {
        setIsGenerating(false);
      }
    }

    // ── JPEG Export: fully client-side via Konva canvas ──────────────
    if (format === "jpg") {
      try {
        const dataUrl = await generateJpgDataUrl();
        const blob = dataURItoBlob(dataUrl);
        const { saveAs } = await import("file-saver");
        saveAs(blob, `${nameField}_${timestamp}.jpeg`);
        return { success: true };
      } catch (err) {
        console.error("JPG Export Error:", err instanceof Error ? err.message : String(err));
        return { success: false, error: err };
      } finally {
        setIsGenerating(false);
      }
    }

    // ── PNG Export: fully client-side via Konva canvas ──────────────
    if (format === "png") {
      try {
        const dataUrl = await generatePngDataUrl();
        const blob = dataURItoBlob(dataUrl);
        const { saveAs } = await import("file-saver");
        saveAs(blob, `${nameField}_${timestamp}.png`);
      } catch (err) {
        console.error("PNG Export Error:", err instanceof Error ? err.message : String(err));
        return { success: false, error: err };
      } finally {
        setIsGenerating(false);
      }
      return { success: true };
    }

    // ── PDF Export: server-side ──────────────────────────────
    try {
      const blob = await generateServerBlob();
      const { saveAs } = await import("file-saver");
      saveAs(blob, `${nameField}_${timestamp}.pdf`);
    } catch (err) {
      console.error("Export Error:", err instanceof Error ? err.message : String(err));
      return { success: false, error: err };
    } finally {
      setIsGenerating(false);
    }
    
    return { success: true };
  };

  const sendWhatsAppDelivery = async (
    phoneNumber: string,
    countryCode: string,
    formData: any,
    templateId: string,
    themeData: any
  ): Promise<{ success: boolean; error?: string; fallback?: boolean; whatsappUrl?: string }> => {
    try {
      const { formData: preparedFormData, theme: preparedTheme } = await prepareDataForGeneration(formData, themeData, templateId);

      const response = await fetch("/api/whatsapp-deliver", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber,
          countryCode,
          formData: preparedFormData,
          templateId,
          theme: preparedTheme,
        }),
      });

      if (!response.ok) {
        const errorJson = await response.json();
        throw new Error(errorJson.details || errorJson.error || "Failed to deliver PDF via WhatsApp Cloud API");
      }

      const resJson = await response.json();

      if (resJson.fallback) {
        const nameField =
          preparedFormData.personalDetails?.find((f: any) => f.id === "fullName")?.value ||
          "biodata";

        const pdfBlob = await generatePdfBlob(preparedFormData, templateId, preparedTheme);
        
        const getTemplateMessage = (name: string, url?: string) => {
          let msg = `*Matrimonial Biodata* 💍\n\n`;
          msg += `Hello! 🙏 Please find attached the matrimonial biodata of *${name}* for your review.\n\n`;
          msg += `We hope you find the profile suitable. Looking forward to connecting and discussing further.\n\n`;
          if (url) {
            msg += `📄 View PDF Online: ${url}\n\n`;
          }
          msg += `Created via biodata99.com`;
          return msg;
        };

        let downloadUrl = "";

        try {
          const body = new FormData();
          body.append("file", pdfBlob, `${nameField}.pdf`);

          const uploadRes = await fetch("https://tmpfiles.org/api/v1/upload", {
            method: "POST",
            body: body,
          });

          if (uploadRes.ok) {
            const uploadJson = await uploadRes.json();
            if (uploadJson.status === "success" && uploadJson.data?.url) {
              downloadUrl = uploadJson.data.url.replace("https://tmpfiles.org/", "https://tmpfiles.org/dl/");
            }
          }
        } catch (uploadErr) {
          console.warn("tmpfiles.org upload failed, trying file.io", uploadErr);
        }

        if (!downloadUrl) {
          try {
            const body = new FormData();
            body.append("file", pdfBlob, `${nameField}.pdf`);
            body.append("expiry", "1d");

            const uploadRes = await fetch("https://file.io", {
              method: "POST",
              body: body,
            });

            if (uploadRes.ok) {
              const uploadJson = await uploadRes.json();
              if (uploadJson.success) {
                downloadUrl = uploadJson.link;
              }
            }
          } catch (uploadErr) {
            console.warn("file.io upload failed/blocked", uploadErr);
          }
        }

        const formattedNum = `${countryCode.replace("+", "")}${phoneNumber.trim()}`;
        const shareText = getTemplateMessage(nameField, downloadUrl);
        const shareTextEncoded = encodeURIComponent(shareText);

        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        const whatsappUrl = isMobile
          ? `whatsapp://send?phone=${formattedNum}&text=${shareTextEncoded}`
          : `https://web.whatsapp.com/send?phone=${formattedNum}&text=${shareTextEncoded}`;

        return { success: true, fallback: true, whatsappUrl };
      }

      return { success: true };
    } catch (err: any) {
      console.error("sendWhatsAppDelivery error:", err);
      return { success: false, error: err instanceof Error ? err.message : "Failed to deliver WhatsApp message" };
    }
  };

  return {
    handleDownload,
    sendWhatsAppDelivery,
    isGenerating,
  };
}
