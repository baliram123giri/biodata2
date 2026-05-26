"use client";

import dynamicImport from "next/dynamic";
import { Suspense } from "react";

const PageProgressBar = dynamicImport(
  () => import("@/components/layout/PageProgressBar").then((mod) => mod.PageProgressBar),
  { ssr: false }
);

const Toaster = dynamicImport(
  () => import("sonner").then((mod) => mod.Toaster),
  { ssr: false }
);

export function ClientLayoutProviders() {
  return (
    <>
      <Suspense fallback={null}>
        <PageProgressBar />
      </Suspense>
      <Toaster richColors position="top-right" closeButton />
    </>
  );
}
