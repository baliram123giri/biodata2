"use client";

import React, { useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Share2, Link, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { PopupBlockedDialog } from "@/components/ui/popup-blocked-dialog";

interface ShareButtonProps {
  url: string;
  title: string;
  className?: string;
}

export function ShareButton({ url, title, className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [blockedPopupUrl, setBlockedPopupUrl] = useState("");
  const [showBlockedDialog, setShowBlockedDialog] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(`Check out this article: "${title}"\n`);
    const tweetUrl = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`;
    const opened = window.open(tweetUrl, "_blank");
    if (!opened || opened.closed || typeof opened.closed === "undefined") {
      setBlockedPopupUrl(tweetUrl);
      setShowBlockedDialog(true);
    }
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(`Check out this article: "${title}" - ${url}`);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${text}`;
    const opened = window.open(whatsappUrl, "_blank");
    if (!opened || opened.closed || typeof opened.closed === "undefined") {
      setBlockedPopupUrl(whatsappUrl);
      setShowBlockedDialog(true);
    }
  };

  const shareOnFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    const opened = window.open(fbUrl, "_blank");
    if (!opened || opened.closed || typeof opened.closed === "undefined") {
      setBlockedPopupUrl(fbUrl);
      setShowBlockedDialog(true);
    }
  };

  return (
    <>
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "rounded-full border-[#C9A84C]/35 hover:bg-[#FBF5E6]/40 text-[#8A7233] dark:text-[#E6C97A] font-semibold gap-1.5 transition-all duration-300",
            className
          )}
        >
          <Share2 className="w-3.5 h-3.5" />
          Share Article
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-3 bg-white dark:bg-[#1E0D11] border border-[#C9A84C]/30 rounded-xl shadow-xl z-50">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/80 px-2 pb-1.5 border-b border-[#C9A84C]/10 mb-1">
            Spread the Word
          </p>
          
          <button
            onClick={handleCopy}
            className="flex items-center gap-2.5 w-full text-left px-2.5 py-2 text-xs font-semibold rounded-lg hover:bg-stone-50 dark:hover:bg-[#2A1519] text-foreground transition-colors cursor-pointer border-0 bg-transparent"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-[#25D366]" />
                <span className="text-[#25D366] font-bold">Link Copied!</span>
              </>
            ) : (
              <>
                <Link className="w-4 h-4 text-[#C9A84C]" />
                <span>Copy Article Link</span>
              </>
            )}
          </button>

          <button
            onClick={shareOnWhatsApp}
            className="flex items-center gap-2.5 w-full text-left px-2.5 py-2 text-xs font-semibold rounded-lg hover:bg-[#25D366]/5 dark:hover:bg-[#25D366]/10 text-foreground transition-colors cursor-pointer border-0 bg-transparent"
          >
            <svg className="w-4 h-4 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            <span>Share on WhatsApp</span>
          </button>

          <button
            onClick={shareOnTwitter}
            className="flex items-center gap-2.5 w-full text-left px-2.5 py-2 text-xs font-semibold rounded-lg hover:bg-[#1DA1F2]/5 dark:hover:bg-[#1DA1F2]/10 text-foreground transition-colors cursor-pointer border-0 bg-transparent"
          >
            <svg className="w-4 h-4 text-[#1DA1F2]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span>Share on X / Twitter</span>
          </button>

          <button
            onClick={shareOnFacebook}
            className="flex items-center gap-2.5 w-full text-left px-2.5 py-2 text-xs font-semibold rounded-lg hover:bg-[#1877F2]/5 dark:hover:bg-[#1877F2]/10 text-foreground transition-colors cursor-pointer border-0 bg-transparent"
          >
            <svg className="w-4 h-4 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span>Share on Facebook</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>

    <PopupBlockedDialog
      open={showBlockedDialog}
      onOpenChange={setShowBlockedDialog}
      url={blockedPopupUrl}
    />
    </>
  );
}
