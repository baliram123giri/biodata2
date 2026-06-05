"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, Copy, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface PopupBlockedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  copyText?: string;
  title?: string;
  description?: string;
}

export function PopupBlockedDialog({
  open,
  onOpenChange,
  url,
  copyText,
  title = "Popup Blocked by Browser",
  description = "Your browser blocked opening WhatsApp. This usually happens because the link was opened after generating the biodata. Click below to open it directly.",
}: PopupBlockedDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const textToCopy = copyText || url;
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
      toast.error("Failed to copy link.");
    }
  };

  const handleOpenDirectly = () => {
    // This is synchronous inside a user click, so it will not be blocked
    window.open(url, "_blank");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border border-amber-200/50 dark:border-amber-900/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5 text-amber-600 dark:text-amber-500">
            <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500" />
            </div>
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs leading-relaxed mt-2 text-stone-600 dark:text-stone-400">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100/50 dark:border-amber-900/20 rounded-xl p-3.5 my-1 text-xs text-stone-600 dark:text-stone-400">
          <p className="font-bold text-amber-800 dark:text-amber-400 mb-1">
            How to allow popups in the future:
          </p>
          <ul className="list-disc list-inside space-y-1 text-[11px]">
            <li>Look for the popup blocker icon in your browser's address bar.</li>
            <li>Click the icon and select <strong>"Always allow popups from this site"</strong>.</li>
          </ul>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCopy}
            className="flex-1 rounded-full text-xs font-bold h-10 flex items-center justify-center gap-1.5 cursor-pointer border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-[#2A1519]"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#25D366]" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Link</span>
              </>
            )}
          </Button>
          <Button
            type="button"
            onClick={handleOpenDirectly}
            className="flex-1 bg-gradient-primary hover:opacity-95 text-white border-0 rounded-full font-bold text-xs h-10 flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open WhatsApp</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
