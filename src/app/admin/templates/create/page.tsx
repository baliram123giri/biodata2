"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

const TemplateForm = dynamic(() => import("@/components/admin/TemplateForm").then(mod => mod.TemplateForm), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-foreground">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground font-semibold">Loading editor form...</p>
    </div>
  )
});

export default function AdminTemplateCreate() {
  return <TemplateForm isEdit={false} />;
}
