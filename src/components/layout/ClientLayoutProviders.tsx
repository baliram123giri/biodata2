"use client";

import dynamicImport from "next/dynamic";
import { Suspense, useEffect } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";

const PageProgressBar = dynamicImport(
  () => import("@/components/layout/PageProgressBar").then((mod) => mod.PageProgressBar),
  { ssr: false }
);

const Toaster = dynamicImport(
  () => import("sonner").then((mod) => mod.Toaster),
  { ssr: false }
);

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
    </TooltipProvider>
  );
}
