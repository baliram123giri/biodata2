"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { TemplateForm } from "@/components/admin/TemplateForm";
import { toast } from "sonner";

import { useQuery } from "@tanstack/react-query";

export default function AdminTemplateEdit() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: template, isLoading, isError, error } = useQuery({
    queryKey: ["admin", "template", id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/templates/${id}`);
      if (!res.ok) {
        throw new Error("Failed to load template data");
      }
      const data = await res.json();
      if (!data.template) {
        throw new Error(data.error || "Template not found");
      }
      return data.template;
    },
    staleTime: Infinity, // Cache until page refresh
    enabled: !!id,
  });

  React.useEffect(() => {
    if (isError && error) {
      toast.error(error.message || "An error occurred while loading template");
      router.push("/admin/templates");
    }
  }, [isError, error, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-foreground">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-semibold">Loading template data...</p>
      </div>
    );
  }

  return (
    <div className="py-6">
      <TemplateForm template={template} isEdit={true} />
    </div>
  );
}
