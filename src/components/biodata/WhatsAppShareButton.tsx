"use client";

import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Check, Loader2, Share2, Download, ExternalLink } from "lucide-react";

/**
 * WhatsApp SVG icon with the brand color.
 */
function WhatsAppIcon({ className }: { className?: string }) {
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

type ShareStatus = "idle" | "generating" | "sharing" | "done" | "error";

interface WhatsAppShareButtonProps {
  /** Callback that generates the Konva canvas JPG and returns the data URL */
  onGenerateImage: () => Promise<string>;
  /** Name for the file (without extension) */
  fileName?: string;
  /** Visual variant */
  variant?: "primary" | "compact" | "icon";
  className?: string;
  /** Disable the button externally (e.g. while another download is running) */
  disabled?: boolean;
}

/**
 * Convert a data URL to a File object for the Web Share API.
 */
function dataUrlToFile(dataUrl: string, name: string): File {
  const [header, base64Data] = dataUrl.split(",");
  const mimeMatch = header.match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
  const binaryStr = atob(base64Data);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return new File([bytes], name, { type: mime });
}

/**
 * A premium WhatsApp share button that:
 * 1. Captures the Konva biodata preview as a JPG
 * 2. On mobile (Web Share API available): uses navigator.share() with the file
 * 3. On desktop: opens a guided dialog — download image, then open WhatsApp
 */
export function WhatsAppShareButton({
  onGenerateImage,
  fileName = "biodata",
  variant = "primary",
  className,
  disabled = false,
}: WhatsAppShareButtonProps) {
  const [status, setStatus] = useState<ShareStatus>("idle");
  const [showDesktopDialog, setShowDesktopDialog] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleShare = useCallback(async () => {
    if (disabled || status === "generating" || status === "sharing") return;

    setStatus("generating");

    try {
      const dataUrl = await onGenerateImage();
      if (!dataUrl) throw new Error("Failed to generate image");

      setStatus("sharing");

      // Check if Web Share API with file support is available (mainly mobile)
      const file = dataUrlToFile(dataUrl, `${fileName}.jpg`);
      const canShareFile =
        typeof navigator !== "undefined" &&
        typeof navigator.share === "function" &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] });

      if (canShareFile) {
        // Mobile: use native share sheet — sends image directly
        try {
          await navigator.share({
            files: [file],
            title: "Matrimonial Biodata",
            text: "Here is my matrimonial biodata 🙏",
          });
          setStatus("done");
          setTimeout(() => setStatus("idle"), 2500);
        } catch (shareErr: any) {
          if (shareErr?.name === "AbortError") {
            setStatus("idle");
          } else {
            throw shareErr;
          }
        }
      } else {
        // Desktop: show guided dialog
        setPreviewUrl(dataUrl);
        setShowDesktopDialog(true);
        setStatus("idle");
      }
    } catch (err: any) {
      console.error("WhatsApp share error:", err);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }, [disabled, status, onGenerateImage, fileName]);

  const handleDownloadFromDialog = useCallback(() => {
    if (!previewUrl) return;
    const link = document.createElement("a");
    link.href = previewUrl;
    link.download = `${fileName}.jpg`;
    link.click();
  }, [previewUrl, fileName]);

  const isLoading = status === "generating" || status === "sharing";

  // ── Icon-only variant (mobile bottom bar) ───────────────────────────
  if (variant === "icon") {
    return (
      <>
        <button
          onClick={handleShare}
          disabled={disabled || isLoading}
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 sm:gap-1 active:scale-95 transition-all w-9 sm:w-11 disabled:opacity-50 disabled:cursor-not-allowed",
            status === "done"
              ? "text-[#25D366]"
              : "text-muted-foreground hover:text-[#25D366]",
            className
          )}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-[#25D366]" />
          ) : status === "done" ? (
            <Check className="w-4 h-4 sm:w-5 sm:h-5 text-[#25D366]" />
          ) : (
            <WhatsAppIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
          <span className="text-[8px] sm:text-[9px] font-bold tracking-tight">
            {status === "done" ? "Sent!" : "Share"}
          </span>
        </button>

        <DesktopShareDialog
          open={showDesktopDialog}
          onOpenChange={setShowDesktopDialog}
          previewUrl={previewUrl}
          onDownload={handleDownloadFromDialog}
          fileName={fileName}
        />
      </>
    );
  }

  // ── Compact variant (desktop action bar alongside download) ─────────
  if (variant === "compact") {
    return (
      <>
        <button
          onClick={handleShare}
          disabled={disabled || isLoading}
          className={cn(
            "relative overflow-hidden rounded-2xl shadow-lg font-bold text-xs h-10 px-4 flex items-center gap-1.5 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-0 text-white transition-all active:scale-95",
            status === "done"
              ? "bg-[#0b5249]"
              : "bg-[#075E54] hover:bg-[#054C44]",
            className
          )}
        >
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent w-1/2 h-full animate-shine pointer-events-none" />
          <span className="relative flex items-center gap-1.5">
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{status === "generating" ? "Preparing..." : "Sharing..."}</span>
              </>
            ) : status === "done" ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Shared!</span>
              </>
            ) : status === "error" ? (
              <span>Retry</span>
            ) : (
              <>
                <WhatsAppIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">WhatsApp</span>
                <Share2 className="w-2.5 h-2.5 opacity-60 sm:hidden" />
              </>
            )}
          </span>
        </button>

        <DesktopShareDialog
          open={showDesktopDialog}
          onOpenChange={setShowDesktopDialog}
          previewUrl={previewUrl}
          onDownload={handleDownloadFromDialog}
          fileName={fileName}
        />
      </>
    );
  }

  // ── Primary variant (header bar) ────────────────────────────────────
  return (
    <>
      <button
        onClick={handleShare}
        disabled={disabled || isLoading}
        className={cn(
          "relative overflow-hidden text-xs font-semibold h-9 px-4 md:px-5 flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer rounded-md border-0 text-white transition-all active:scale-95",
          status === "done"
            ? "bg-[#0b5249]"
            : "bg-[#075E54] hover:bg-[#054C44]",
          className
        )}
      >
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent w-1/2 h-full animate-shine pointer-events-none" />
        <span className="relative flex items-center gap-2">
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="hidden sm:inline">
                {status === "generating" ? "Preparing..." : "Sharing..."}
              </span>
            </>
          ) : status === "done" ? (
            <>
              <Check className="w-4 h-4" />
              <span>Shared!</span>
            </>
          ) : (
            <>
              <WhatsAppIcon className="w-4 h-4" />
              <span>Share</span>
            </>
          )}
        </span>
      </button>

      <DesktopShareDialog
        open={showDesktopDialog}
        onOpenChange={setShowDesktopDialog}
        previewUrl={previewUrl}
        onDownload={handleDownloadFromDialog}
        fileName={fileName}
      />
    </>
  );
}


// ═══════════════════════════════════════════════════════════════════════
// Desktop Share Dialog — a polished 2-step guided flow
// ═══════════════════════════════════════════════════════════════════════

function DesktopShareDialog({
  open,
  onOpenChange,
  previewUrl,
  onDownload,
  fileName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  previewUrl: string | null;
  onDownload: () => void;
  fileName: string;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [imageDownloaded, setImageDownloaded] = useState(false);

  const handleReset = () => {
    setStep(1);
    setImageDownloaded(false);
    onOpenChange(false);
  };

  const handleDownloadAndAdvance = () => {
    onDownload();
    setImageDownloaded(true);
    // Auto-advance to step 2 after a brief moment
    setTimeout(() => setStep(2), 600);
  };

  const openWhatsAppWeb = () => {
    const text = encodeURIComponent(
      "Here is my matrimonial biodata 🙏\n\nCreated with Biodata99"
    );
    window.open(`https://web.whatsapp.com/send?text=${text}`, "_blank");
    handleReset();
  };

  const openWhatsAppMobile = () => {
    const text = encodeURIComponent(
      "Here is my matrimonial biodata 🙏\n\nCreated with Biodata99"
    );
    window.open(`whatsapp://send?text=${text}`, "_blank");
    handleReset();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleReset(); else onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#075E54]/10 flex items-center justify-center">
              <WhatsAppIcon className="w-4.5 h-4.5 text-[#075E54]" />
            </div>
            Share on WhatsApp
          </DialogTitle>
          <DialogDescription className="text-xs leading-relaxed">
            {step === 1
              ? "Download your biodata image, then share it on WhatsApp with family and friends."
              : "Image saved! Now open WhatsApp and attach the image to share it."}
          </DialogDescription>
        </DialogHeader>

        {/* Image Preview */}
        {previewUrl && (
          <div className="flex justify-center my-3">
            <div className="relative group">
              <div className="w-36 aspect-[210/297] rounded-xl overflow-hidden shadow-xl ring-1 ring-black/10 transition-transform group-hover:scale-[1.02]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Biodata Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* File name badge */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white shadow-md rounded-full px-3 py-1 text-[9px] font-bold text-muted-foreground border border-stone-100 whitespace-nowrap">
                {fileName}.jpg
              </div>
            </div>
          </div>
        )}

        {/* Step Indicators */}
        <div className="flex items-center gap-3 px-2 mt-1">
          <div className="flex items-center gap-2 flex-1">
            <div
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-300",
                step >= 1 || imageDownloaded
                  ? "bg-[#075E54] text-white shadow-sm scale-100"
                  : "bg-stone-100 text-stone-400 scale-95"
              )}
            >
              {imageDownloaded ? <Check className="w-3 h-3" /> : "1"}
            </div>
            <span className={cn(
              "text-[11px] font-bold transition-colors",
              step === 1 ? "text-stitch-on-surface" : "text-muted-foreground"
            )}>
              Save Image
            </span>
          </div>
          <div className="flex-1 h-px bg-stone-200 relative overflow-hidden rounded-full">
            <div
              className={cn(
                "absolute inset-y-0 left-0 bg-[#075E54] transition-all duration-500",
                step >= 2 ? "w-full" : "w-0"
              )}
            />
          </div>
          <div className="flex items-center gap-2 flex-1 justify-end">
            <span className={cn(
              "text-[11px] font-bold transition-colors",
              step === 2 ? "text-stitch-on-surface" : "text-muted-foreground"
            )}>
              Send
            </span>
            <div
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-300",
                step >= 2
                  ? "bg-[#075E54] text-white shadow-sm scale-100"
                  : "bg-stone-100 text-stone-400 scale-95"
              )}
            >
              2
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2 mt-1">
          {step === 1 ? (
            <Button
              onClick={handleDownloadAndAdvance}
              className="relative overflow-hidden flex-1 bg-gradient-primary border-0 rounded-full font-bold text-sm h-11"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-1/2 h-full animate-shine pointer-events-none" />
              <span className="relative flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download Image
              </span>
            </Button>
          ) : (
            <div className="flex flex-col gap-2 w-full">
              <Button
                onClick={openWhatsAppWeb}
                className="hidden sm:flex flex-1 bg-[#075E54] hover:bg-[#054C44] text-white border-0 rounded-full font-bold text-sm h-11 items-center justify-center gap-2 cursor-pointer w-full"
              >
                <WhatsAppIcon className="w-4 h-4" />
                Open WhatsApp Web
                <ExternalLink className="w-3 h-3 opacity-60" />
              </Button>
              <Button
                onClick={openWhatsAppMobile}
                className="sm:hidden flex flex-1 bg-[#075E54] hover:bg-[#054C44] text-white border-0 rounded-full font-bold text-sm h-11 items-center justify-center gap-2 cursor-pointer w-full"
              >
                <WhatsAppIcon className="w-4 h-4" />
                Open WhatsApp
                <ExternalLink className="w-3 h-3 opacity-60" />
              </Button>
              <button
                onClick={() => setStep(1)}
                className="text-[11px] text-muted-foreground hover:text-stitch-on-surface font-medium text-center py-1 cursor-pointer transition-colors"
              >
                ← Download again
              </button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
