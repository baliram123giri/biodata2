"use client";

import dynamicImport from "next/dynamic";
import { Suspense, useEffect, useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CameraOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const PageProgressBar = dynamicImport(
  () => import("@/components/layout/PageProgressBar").then((mod) => mod.PageProgressBar),
  { ssr: false }
);

const Toaster = dynamicImport(
  () => import("sonner").then((mod) => mod.Toaster),
  { ssr: false }
);

// Lightweight client sub-component that isolates all state and prevents the main layout
// from re-rendering during screenshot detection and alert states.
function ScreenshotProtection() {
  const [showWarning, setShowWarning] = useState(false);
  const [isScreenShielded, setIsScreenShielded] = useState(false);

  useEffect(() => {
    // Robust check if on mobile/tablet device (strictly checks touch-based mobile and iPads, excluding desktop windows)
    const isMobile = () => {
      if (typeof window === "undefined") return false;
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const isIPad = typeof navigator !== "undefined" && navigator.maxTouchPoints && navigator.maxTouchPoints > 1 && userAgent.includes("Macintosh");
      return isMobileUA || isIPad;
    };

    let wasBlurred = false;
    let blurTime = 0;
    let isMetaPressed = false;
    let isShiftPressed = false;
    let wasScreenshotShortcutPressed = false;

    const handleBlur = () => {
      // If the active element is a form input/dropdown/interactive button, 
      // do not flag this as a screenshot blur.
      if (typeof document !== "undefined" && document.activeElement) {
        const tag = document.activeElement.tagName.toLowerCase();
        if (
          ["input", "select", "textarea", "button"].includes(tag) || 
          document.activeElement.getAttribute("role") === "combobox" ||
          document.activeElement.getAttribute("role") === "listbox"
        ) {
          return;
        }
      }

      blurTime = Date.now();
      wasBlurred = true;

      // On mobile only, we use focus/blur cycles to detect system screenshot/multitasking overlays.
      if (isMobile()) {
        setIsScreenShielded(true);
      }
    };

    const handleFocus = () => {
      setIsScreenShielded(false);
      
      // Reset modifier key states on focus restore
      isMetaPressed = false;
      isShiftPressed = false;

      if (isMobile()) {
        if (wasBlurred) {
          const timeDiff = Date.now() - blurTime;
          // Trigger if blurred for a typical screenshot/multitasking window duration (down to 150ms)
          if (timeDiff > 150 && timeDiff < 15000) {
            setShowWarning(true);
          }
          wasBlurred = false;
        }
      } else if (wasScreenshotShortcutPressed) {
        setShowWarning(true);
        wasScreenshotShortcutPressed = false;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setIsScreenShielded(false);
        isMetaPressed = false;
        isShiftPressed = false;

        if (isMobile() && wasBlurred) {
          const timeDiff = Date.now() - blurTime;
          if (timeDiff > 150 && timeDiff < 15000) {
            setShowWarning(true);
          }
          wasBlurred = false;
        } else if (wasScreenshotShortcutPressed) {
          setShowWarning(true);
          wasScreenshotShortcutPressed = false;
        }
      } else {
        // Tab became hidden (app-switch, tab-switch, minimize)
        wasBlurred = false; // Reset mobile blur tracker to prevent false warnings on app restore
        
        if (isMobile()) {
          setIsScreenShielded(true);
        } else {
          // On desktop, if the tab is hidden, reset the screenshot shortcut state
          wasScreenshotShortcutPressed = false;
          setIsScreenShielded(false);
        }
      }
    };

    const isPrintScreenKey = (e: KeyboardEvent) => {
      return (
        e.key === "PrintScreen" ||
        e.key === "Snapshot" ||
        e.key === "Print" ||
        e.key === "SysReq" ||
        e.keyCode === 44 ||
        e.code === "PrintScreen"
      );
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Meta" || e.key === "OS") {
        isMetaPressed = true;
      }
      if (e.key === "Shift") {
        isShiftPressed = true;
      }

      // Proactive trigger: If Win/Cmd + Shift are held, show warning and shield immediately
      // before they can complete the shortcut (e.g. Win + Shift + S)
      if (isMetaPressed && isShiftPressed) {
        setShowWarning(true);
        setIsScreenShielded(true);
        try {
          navigator.clipboard.writeText("").catch(() => {});
        } catch (_) {}
      }

      // 1. PrintScreen key variations (keydown)
      if (isPrintScreenKey(e)) {
        setShowWarning(true);
        setIsScreenShielded(true);
        try {
          navigator.clipboard.writeText("").catch(() => {});
        } catch (_) {}
      }

      // 2. Win + Shift + S (Windows Snipping Tool) or Command + Shift + S
      if (e.shiftKey && e.metaKey && e.key.toLowerCase() === "s") {
        setShowWarning(true);
        setIsScreenShielded(true);
        try {
          navigator.clipboard.writeText("").catch(() => {});
        } catch (_) {}
      }

      // 3. Cmd + Shift + 3 / 4 / 5 (Mac Screenshot)
      if (e.shiftKey && e.metaKey && ["3", "4", "5"].includes(e.key)) {
        setShowWarning(true);
        setIsScreenShielded(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Meta" || e.key === "OS") {
        isMetaPressed = false;
      }
      if (e.key === "Shift") {
        isShiftPressed = false;
      }

      // 4. PrintScreen key variations (keyup) - often keydown is blocked by OS, but keyup still fires
      if (isPrintScreenKey(e)) {
        setShowWarning(true);
        setIsScreenShielded(true);
        try {
          navigator.clipboard.writeText("").catch(() => {});
        } catch (_) {}
      }
    };

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
    <>
      <div 
        style={{
          display: isScreenShielded ? "flex" : "none",
          pointerEvents: isScreenShielded ? "auto" : "none"
        }}
        className="fixed inset-0 z-[99999] bg-background/98 backdrop-blur-3xl flex-col items-center justify-center select-none"
      >
        <div className="text-center space-y-6 px-6">
          <CameraOff className="w-16 h-16 text-primary mx-auto animate-pulse" />
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-foreground">Content Shield Active</h2>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed font-semibold">
              Screenshotting is disabled to protect template designs.
            </p>
          </div>
          <button
            onClick={() => {
              setIsScreenShielded(false);
              setShowWarning(false);
            }}
            className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all cursor-pointer pointer-events-auto"
          >
            Go Back to Editor
          </button>
        </div>
      </div>

      <Dialog open={showWarning} onOpenChange={setShowWarning}>
        <DialogContent showCloseButton={false} className="max-w-md p-6 bg-card border border-border rounded-2xl shadow-xl flex flex-col items-center text-center">
          <DialogHeader className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center mb-4 text-red-600 dark:text-red-400">
              <CameraOff className="w-8 h-8" />
            </div>
            <DialogTitle className="text-xl font-bold text-foreground">
              Screenshot Not Allowed!
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-2 max-w-sm leading-relaxed">
              Screenshotting biodata templates is disabled to protect design rights. Please use the official <strong>Download</strong> button to get a high-quality PDF/JPG document.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="w-full mt-6 flex justify-center">
            <button
              onClick={() => {
                setShowWarning(false);
                setIsScreenShielded(false);
              }}
              className="w-full inline-flex items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/95 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer"
            >
              I Understand
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ClientLayoutProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        activeEl instanceof HTMLInputElement &&
        activeEl.type === "number" &&
        activeEl.contains(event.target as Node)
      ) {
        activeEl.blur();
      }
    };

    document.addEventListener("wheel", handleWheel);
    return () => {
      document.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return (
    <TooltipProvider>
      <Suspense fallback={null}>
        <PageProgressBar />
      </Suspense>
      <Toaster richColors position="top-right" closeButton />
      {children}
      <ScreenshotProtection />
    </TooltipProvider>
  );
}
