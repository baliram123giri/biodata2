"use client";

import React, { useState } from "react";
import * as Checkbox from "@radix-ui/react-checkbox";
import { Check, Lock, Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBiodataStore } from "@/store/useBiodataStore";
import { useThemeStore } from "@/store/useThemeStore";
import { generatePdfBlob } from "@/hooks/useDownloadBiodata";

// Inline WhatsApp SVG with custom sizing
function WhatsAppLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

interface WhatsAppDeliveryCardProps {
  onTriggerDownload?: (format: "pdf" | "jpg") => Promise<void>;
  isGenerating?: boolean;
  className?: string;
}

export function WhatsAppDeliveryCard({
  onTriggerDownload,
  isGenerating = false,
  className,
}: WhatsAppDeliveryCardProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [optIn, setOptIn] = useState(true);
  const [status, setStatus] = useState<"idle" | "generating" | "uploading" | "redirecting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) {
      setErrorMessage("Please enter your mobile number");
      setStatus("error");
      return;
    }
    if (!/^\d{10}$/.test(phoneNumber.trim())) {
      setErrorMessage("Please enter a valid 10-digit number");
      setStatus("error");
      return;
    }

    setStatus("generating");
    setErrorMessage("");

    try {
      // 1. Retrieve details from stores
      const storeData = useBiodataStore.getState();
      const themeData = useThemeStore.getState();
      const formData = storeData.formData;
      const selectedTemplate = storeData.selectedTemplate;

      // 2. Call the server-side whatsapp-deliver API
      const response = await fetch("/api/whatsapp-deliver", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber,
          countryCode,
          formData,
          templateId: selectedTemplate,
          theme: themeData,
        }),
      });

      if (!response.ok) {
        const errorJson = await response.json();
        throw new Error(errorJson.details || errorJson.error || "Failed to deliver PDF via WhatsApp Cloud API");
      }

      const resJson = await response.json();

      // 3. Check if server requested Client-Side fallback
      if (resJson.fallback) {
        const nameField =
          formData.personalDetails?.find((f: any) => f.id === "fullName")?.value ||
          "biodata";

        // Generate PDF Blob on client
        const pdfBlob = await generatePdfBlob(formData, selectedTemplate, themeData);
        // Prefilled template message builder
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

        // Change status to uploading client-side for desktop/non-compatible browsers
        setStatus("uploading");

        let downloadUrl = "";
        
        // 1. Try uploading to tmpfiles.org (high rate limits, CORS supported)
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
              // Convert to direct download url by adding /dl/
              downloadUrl = uploadJson.data.url.replace("https://tmpfiles.org/", "https://tmpfiles.org/dl/");
            }
          }
        } catch (uploadErr) {
          console.warn("tmpfiles.org upload failed, trying file.io", uploadErr);
        }

        // 2. Try file.io if tmpfiles.org failed
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

        setStatus("redirecting");

        // Construct direct WhatsApp link
        const formattedNum = `${countryCode.replace("+", "")}${phoneNumber.trim()}`;
        const shareText = getTemplateMessage(nameField, downloadUrl);
        const shareTextEncoded = encodeURIComponent(shareText);

        // Open WhatsApp Web/App
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
          window.open(`whatsapp://send?phone=${formattedNum}&text=${shareTextEncoded}`, "_blank");
        } else {
          window.open(`https://web.whatsapp.com/send?phone=${formattedNum}&text=${shareTextEncoded}`, "_blank");
        }
      }

      setStatus("success");
      setTimeout(() => setStatus("idle"), 5000);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err instanceof Error ? err.message : "Failed to deliver. Please try again.");
      setStatus("error");
    }
  };

  const isLoading = status === "generating" || status === "uploading" || status === "redirecting";



  return (
    <div
      className={cn(
        "bg-white border border-stone-200/80 rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-left w-full max-w-2xl mx-auto transition-all hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)]",
        className
      )}
    >
      {/* Header section */}
      <div className="flex items-start gap-4 mb-5">
        <div className="w-12 h-12 rounded-[16px] bg-[#E8F8EF] flex items-center justify-center shrink-0">
          <WhatsAppLogo className="w-6 h-6 text-[#25D366]" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-black text-[#062B36] tracking-tight mb-1">
            Get Your Marriage Biodata Delivered on WhatsApp — Instantly
          </h3>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
              <div className="w-4 h-4 rounded-full bg-[#E8F8EF] flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-[#25D366]" />
              </div>
              Instant PDF delivery
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
              <div className="w-4 h-4 rounded-full bg-[#E8F8EF] flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-[#25D366]" />
              </div>
              No quality loss
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
              <div className="w-4 h-4 rounded-full bg-[#E8F8EF] flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-[#25D366]" />
              </div>
              Works on all phones
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSend} className="space-y-4">
        {/* Input Row */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black tracking-widest text-muted-foreground/80 uppercase block">
            WhatsApp Number
          </label>
          <div className="flex gap-2">
            <div className="relative shrink-0">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="h-11 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold text-stone-700 focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none pr-8 cursor-pointer select-none"
              >
                <option value="+91">IN +91</option>
                <option value="+1">US +1</option>
                <option value="+44">UK +44</option>
                <option value="+971">AE +971</option>
                <option value="+61">AU +61</option>
              </select>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <div className="flex-1 relative">
              <input
                type="tel"
                placeholder="9999999999"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10));
                  if (status === "error") setStatus("idle");
                }}
                className="w-full h-11 px-4 py-2 border border-stone-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-stone-300"
              />
            </div>
          </div>
        </div>

        {/* Checkbox row */}
        <div className="flex items-start gap-2.5">
          <Checkbox.Root
            id="opt-in"
            checked={optIn}
            onCheckedChange={(checked) => setOptIn(checked === true)}
            className="w-4.5 h-4.5 rounded bg-stone-100 border border-stone-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer data-[state=checked]:bg-[#25D366] data-[state=checked]:border-[#25D366] transition-colors mt-0.5"
          >
            <Checkbox.Indicator>
              <Check className="w-3 h-3 text-white stroke-[3.5]" />
            </Checkbox.Indicator>
          </Checkbox.Root>
          <label
            htmlFor="opt-in"
            className="text-xs font-semibold text-stone-600 leading-normal select-none cursor-pointer"
          >
            Yes, send me my biodata and updates on WhatsApp. I can opt-out anytime.
          </label>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={isLoading || isGenerating}
          className={cn(
            "w-full h-11 rounded-full text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] border-0 cursor-pointer relative overflow-hidden",
            status === "success"
              ? "bg-[#128C7E]"
              : "bg-[#25D366] hover:bg-[#20BD5A] hover:shadow-[#25D366]/20"
          )}
        >
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent w-1/2 h-full animate-shine pointer-events-none" />
          {status === "generating" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating & Delivering...
            </>
          ) : status === "success" ? (
            <>
              <Check className="w-4 h-4" />
              PDF Delivered to WhatsApp!
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Get Biodata on WhatsApp
            </>
          )}
        </button>

        {/* Error message */}
        {status === "error" && (
          <p className="text-xs font-semibold text-red-600 text-center animate-pulse">
            {errorMessage}
          </p>
        )}

        {/* Privacy Notice Banner */}
        <div className="bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-stone-500 font-semibold leading-normal">
            Your number is used only to send your biodata. We never share it or store it after delivery.
          </p>
        </div>
      </form>
    </div>
  );
}
