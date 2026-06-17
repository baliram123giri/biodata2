"use client";

// "use client" + direct render = full SSR HTML (form inputs, labels, all text)
// Client hydration adds interactivity. This is the correct pattern for SEO.

import React, { useState } from "react";
import * as Checkbox from "@radix-ui/react-checkbox";
import { Check, Lock, Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBiodataStore } from "@/store/useBiodataStore";
import { useThemeStore } from "@/store/useThemeStore";
import { generatePdfBlob, prepareDataForGeneration } from "@/hooks/useDownloadBiodata";
import { translateUI } from "@/lib/translations";
import { PopupBlockedDialog } from "@/components/ui/popup-blocked-dialog";

function WhatsAppLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

interface WhatsAppDeliveryCardProps {
  onSubmitWhatsApp?: (phoneNumber: string, countryCode: string) => Promise<{ success: boolean; error?: string; fallback?: boolean; whatsappUrl?: string }>;
  isGenerating?: boolean;
  className?: string;
}

export function WhatsAppDeliveryCard({
  onSubmitWhatsApp,
  isGenerating = false,
  className,
}: WhatsAppDeliveryCardProps) {
  const currentLang = useBiodataStore(state => state.formData?.language) || "English";
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [optIn, setOptIn] = useState(true);
  const [status, setStatus] = useState<"idle" | "generating" | "uploading" | "redirecting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [blockedPopupUrl, setBlockedPopupUrl] = useState("");
  const [showBlockedDialog, setShowBlockedDialog] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) { setErrorMessage(translateUI("enterMobileNumber", currentLang)); setStatus("error"); return; }
    if (!/^\d{10}$/.test(phoneNumber.trim())) { setErrorMessage(translateUI("enterValidNumber", currentLang)); setStatus("error"); return; }

    setStatus("generating");
    setErrorMessage("");

    try {
      if (onSubmitWhatsApp) {
        const resJson = await onSubmitWhatsApp(phoneNumber, countryCode);
        if (!resJson.success) throw new Error(resJson.error || "Failed to deliver WhatsApp message");
        if (resJson.fallback && resJson.whatsappUrl) {
          setStatus("redirecting");
          const opened = window.open(resJson.whatsappUrl, "_blank");
          if (!opened || opened.closed || typeof opened.closed === "undefined") {
            setBlockedPopupUrl(resJson.whatsappUrl);
            setShowBlockedDialog(true);
          }
        }
        setStatus("success");
        setTimeout(() => setStatus("idle"), 5000);
      } else {
        const storeData = useBiodataStore.getState();
        const themeData = useThemeStore.getState();
        const { formData: preparedFormData, theme: preparedTheme } = await prepareDataForGeneration(storeData.formData, themeData, storeData.selectedTemplate);

        const response = await fetch("/api/whatsapp-deliver", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phoneNumber, countryCode, formData: preparedFormData, templateId: storeData.selectedTemplate, theme: preparedTheme }),
        });

        if (!response.ok) {
          const errorJson = await response.json();
          throw new Error(errorJson.details || errorJson.error || "Failed to deliver PDF via WhatsApp Cloud API");
        }

        const resJson = await response.json();

        if (resJson.fallback) {
          const nameField = preparedFormData.personalDetails?.find((f: any) => f.id === "fullName")?.value || "biodata";
          const pdfBlob = await generatePdfBlob(preparedFormData, storeData.selectedTemplate, preparedTheme);

          const getTemplateMessage = (name: string, url?: string) => {
            let msg = `*Matrimonial Biodata* 💍\n\nHello! 🙏 Please find attached the matrimonial biodata of *${name}* for your review.\n\nWe hope you find the profile suitable. Looking forward to connecting and discussing further.\n\n`;
            if (url) msg += `📄 View PDF Online: ${url}\n\n`;
            return msg + `Created via biodata99.com`;
          };

          setStatus("uploading");
          let downloadUrl = "";

          try {
            const body = new FormData();
            body.append("file", pdfBlob, `${nameField}.pdf`);
            const uploadRes = await fetch("https://tmpfiles.org/api/v1/upload", { method: "POST", body });
            if (uploadRes.ok) {
              const uploadJson = await uploadRes.json();
              if (uploadJson.status === "success" && uploadJson.data?.url) {
                downloadUrl = uploadJson.data.url.replace("https://tmpfiles.org/", "https://tmpfiles.org/dl/");
              }
            }
          } catch { /* try next */ }

          if (!downloadUrl) {
            try {
              const body = new FormData();
              body.append("file", pdfBlob, `${nameField}.pdf`);
              body.append("expiry", "1d");
              const uploadRes = await fetch("https://file.io", { method: "POST", body });
              if (uploadRes.ok) { const j = await uploadRes.json(); if (j.success) downloadUrl = j.link; }
            } catch { /* ignore */ }
          }

          setStatus("redirecting");
          const formattedNum = `${countryCode.replace("+", "")}${phoneNumber.trim()}`;
          const shareTextEncoded = encodeURIComponent(getTemplateMessage(nameField, downloadUrl));
          const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
          const whatsappUrl = isMobile
            ? `whatsapp://send?phone=${formattedNum}&text=${shareTextEncoded}`
            : `https://web.whatsapp.com/send?phone=${formattedNum}&text=${shareTextEncoded}`;

          const opened = window.open(whatsappUrl, "_blank");
          if (!opened || opened.closed || typeof opened.closed === "undefined") {
            setBlockedPopupUrl(whatsappUrl);
            setShowBlockedDialog(true);
          }
        }

        setStatus("success");
        setTimeout(() => setStatus("idle"), 5000);
      }
    } catch (err: any) {
      setErrorMessage(err instanceof Error ? err.message : translateUI("failedToDeliver", currentLang));
      setStatus("error");
    }
  };

  const isLoading = status === "generating" || status === "uploading" || status === "redirecting";

  return (
    <>
      <div className={cn(
        "bg-white border border-stone-200/80 rounded-[24px] p-4 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-left w-full max-w-2xl mx-auto transition-all hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] flex flex-col",
        className
      )}>
        {/* Header */}
        <div className="flex items-start gap-4 mb-5">
          <div className="w-12 h-12 rounded-[16px] bg-[#E8F8EF] flex items-center justify-center shrink-0">
            <WhatsAppLogo className="w-6 h-6 text-[#25D366]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-black text-[#062B36] tracking-tight mb-1">
              {translateUI("whatsappCardTitle", currentLang)}
            </h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              {[
                translateUI("instantPdfDelivery", currentLang),
                translateUI("noQualityLoss", currentLang),
                translateUI("worksOnAllPhones", currentLang),
              ].map((label) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                  <div className="w-4 h-4 rounded-full bg-[#E8F8EF] flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-[#25D366]" />
                  </div>
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form — all SSR-rendered */}
        <form onSubmit={handleSend} className="space-y-4 flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="whatsapp-number-input" className="text-[10px] font-black tracking-widest text-stone-600 uppercase block">
                {translateUI("whatsappNumber", currentLang)}
              </label>
              <div className="flex gap-2">
                <div className="relative shrink-0">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    aria-label="Country Code Select"
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
                    id="whatsapp-number-input"
                    type="tel"
                    placeholder="9999999999"
                    value={phoneNumber}
                    onChange={(e) => { setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10)); if (status === "error") setStatus("idle"); }}
                    className="w-full h-11 px-4 py-2 border border-stone-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-stone-300"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Checkbox.Root
                id="opt-in"
                checked={optIn}
                onCheckedChange={(checked) => setOptIn(checked === true)}
                className="w-4.5 h-4.5 rounded bg-stone-100 border border-stone-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer data-[state=checked]:bg-[#075E54] data-[state=checked]:border-[#075E54] transition-colors mt-0.5"
              >
                <Checkbox.Indicator>
                  <Check className="w-3 h-3 text-white stroke-[3.5]" />
                </Checkbox.Indicator>
              </Checkbox.Root>
              <label htmlFor="opt-in" className="text-xs font-semibold text-stone-600 leading-normal select-none cursor-pointer">
                {translateUI("whatsappConsentLabel", currentLang)}
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading || isGenerating}
              className={cn(
                "w-full h-11 rounded-full text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] border-0 cursor-pointer relative overflow-hidden",
                status === "success" ? "bg-[#0b5249]" : "bg-[#075E54] hover:bg-[#054C44] hover:shadow-[#075E54]/20"
              )}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent w-1/2 h-full animate-shine pointer-events-none" />
              {status === "generating" ? (
                <><Loader2 className="w-4 h-4 animate-spin" />{translateUI("generatingDelivering", currentLang)}</>
              ) : status === "success" ? (
                <><Check className="w-4 h-4" />{translateUI("pdfDelivered", currentLang)}</>
              ) : (
                <><Send className="w-4 h-4" />{translateUI("getBiodataOnWhatsapp", currentLang)}</>
              )}
            </button>

            {status === "error" && (
              <p className="text-xs font-semibold text-red-600 text-center animate-pulse">{errorMessage}</p>
            )}
          </div>

          <div className="bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 flex items-start gap-2.5 mt-4">
            <Lock className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-stone-500 font-semibold leading-normal">
              {translateUI("whatsappPrivacyNotice", currentLang)}
            </p>
          </div>
        </form>
      </div>

      <PopupBlockedDialog open={showBlockedDialog} onOpenChange={setShowBlockedDialog} url={blockedPopupUrl} />
    </>
  );
}
