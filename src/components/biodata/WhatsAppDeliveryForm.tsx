"use client";

import React, { useState } from "react";
import * as Checkbox from "@radix-ui/react-checkbox";
import { Check, Lock, Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBiodataStore } from "@/store/useBiodataStore";
import { useThemeStore } from "@/store/useThemeStore";
import { generatePdfBlob, prepareDataForGeneration } from "@/hooks/useDownloadBiodata";
import { translateUI } from "@/lib/translations";
import { PopupBlockedDialog } from "@/components/ui/popup-blocked-dialog";

interface WhatsAppDeliveryFormProps {
  onSubmitWhatsApp?: (phoneNumber: string, countryCode: string) => Promise<{ success: boolean; error?: string; fallback?: boolean; whatsappUrl?: string }>;
  isGenerating?: boolean;
}

export function WhatsAppDeliveryForm({ onSubmitWhatsApp, isGenerating = false }: WhatsAppDeliveryFormProps) {
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
        const formData = storeData.formData;
        const selectedTemplate = storeData.selectedTemplate;
        const { formData: preparedFormData, theme: preparedTheme } = await prepareDataForGeneration(formData, themeData, selectedTemplate);

        const response = await fetch("/api/whatsapp-deliver", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phoneNumber, countryCode, formData: preparedFormData, templateId: selectedTemplate, theme: preparedTheme }),
        });

        if (!response.ok) {
          const errorJson = await response.json();
          throw new Error(errorJson.details || errorJson.error || "Failed to deliver PDF via WhatsApp Cloud API");
        }

        const resJson = await response.json();

        if (resJson.fallback) {
          const nameField = preparedFormData.personalDetails?.find((f: any) => f.id === "fullName")?.value || "biodata";
          const pdfBlob = await generatePdfBlob(preparedFormData, selectedTemplate, preparedTheme);

          const getTemplateMessage = (name: string, url?: string) => {
            let msg = `*Matrimonial Biodata* 💍\n\n`;
            msg += `Hello! 🙏 Please find attached the matrimonial biodata of *${name}* for your review.\n\n`;
            msg += `We hope you find the profile suitable. Looking forward to connecting and discussing further.\n\n`;
            if (url) msg += `📄 View PDF Online: ${url}\n\n`;
            msg += `Created via biodata99.com`;
            return msg;
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
          } catch (uploadErr) { console.warn("tmpfiles.org upload failed, trying file.io", uploadErr); }

          if (!downloadUrl) {
            try {
              const body = new FormData();
              body.append("file", pdfBlob, `${nameField}.pdf`);
              body.append("expiry", "1d");
              const uploadRes = await fetch("https://file.io", { method: "POST", body });
              if (uploadRes.ok) {
                const uploadJson = await uploadRes.json();
                if (uploadJson.success) downloadUrl = uploadJson.link;
              }
            } catch (uploadErr) { console.warn("file.io upload failed/blocked", uploadErr); }
          }

          setStatus("redirecting");
          const formattedNum = `${countryCode.replace("+", "")}${phoneNumber.trim()}`;
          const shareText = getTemplateMessage(nameField, downloadUrl);
          const shareTextEncoded = encodeURIComponent(shareText);
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
      console.error(err);
      setErrorMessage(err instanceof Error ? err.message : translateUI("failedToDeliver", currentLang));
      setStatus("error");
    }
  };

  const isLoading = status === "generating" || status === "uploading" || status === "redirecting";

  return (
    <>
      <form onSubmit={handleSend} className="space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          {/* Input Row */}
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

          {/* Checkbox row */}
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

          {/* Action Button */}
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

          {/* Error message */}
          {status === "error" && (
            <p className="text-xs font-semibold text-red-600 text-center animate-pulse">{errorMessage}</p>
          )}
        </div>

        {/* Privacy Notice Banner */}
        <div className="bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 flex items-start gap-2.5 mt-4">
          <Lock className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-stone-500 font-semibold leading-normal">
            {translateUI("whatsappPrivacyNotice", currentLang)}
          </p>
        </div>
      </form>

      <PopupBlockedDialog open={showBlockedDialog} onOpenChange={setShowBlockedDialog} url={blockedPopupUrl} />
    </>
  );
}
