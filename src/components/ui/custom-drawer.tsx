"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// CustomDrawer
// A lightweight drawer that uses CSS transforms + React portal.
// NEVER modifies body.overflow, so there is zero scroll-locking or page jump.
// ---------------------------------------------------------------------------

interface CustomDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: "right" | "bottom";
  /** Extra classes forwarded to the panel element */
  className?: string;
  children: React.ReactNode;
}

export function CustomDrawer({
  open,
  onOpenChange,
  side = "right",
  className,
  children,
}: CustomDrawerProps) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  // Server guard – createPortal needs document.body
  if (typeof window === "undefined") return null;

  return createPortal(
    <>
      {/* ── Backdrop ── */}
      <div
        aria-hidden="true"
        onClick={() => onOpenChange(false)}
        className={cn(
          "fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm",
          "transition-opacity duration-300",
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
      />

      {/* ── Panel ── */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          // base
          "fixed z-[201] bg-background shadow-2xl flex flex-col",
          "transition-transform duration-300 ease-in-out will-change-transform",
          // side = right
          side === "right" && [
            "top-0 right-0 h-full w-[82vw] sm:w-80 sm:max-w-sm border-l border-border",
            open ? "translate-x-0" : "translate-x-full",
          ],
          // side = bottom
          side === "bottom" && [
            "bottom-0 left-0 right-0 h-[80vh] rounded-t-3xl border-t border-border",
            open ? "translate-y-0" : "translate-y-full",
          ],
          // block pointer events only when fully closed
          !open && "pointer-events-none",
          className
        )}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label="Close drawer"
          className="absolute right-4 top-4 z-10 rounded-sm opacity-70 hover:opacity-100 transition-opacity cursor-pointer focus:outline-none"
        >
          <X className="h-4 w-4" />
        </button>

        {children}
      </div>
    </>,
    document.body
  );
}

// ---------------------------------------------------------------------------
// Convenience sub-components (styled divs – no Radix dependency)
// ---------------------------------------------------------------------------

export function CustomDrawerHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col space-y-2 text-center sm:text-left",
        className
      )}
      {...props}
    />
  );
}

export function CustomDrawerTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn("text-lg font-semibold text-foreground", className)}
      {...props}
    />
  );
}
