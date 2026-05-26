"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { TemplateForm } from "@/components/admin/TemplateForm";
import { toast } from "sonner";

export default function AdminTemplateEdit() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [template, setTemplate] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!id) return;

    fetch(`/api/admin/templates/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.template) {
          setTemplate(data.template);
        } else {
          toast.error(data.error || "Template not found");
          router.push("/admin/templates");
        }
      })
      .catch(err => {
        console.error(err);
        toast.error("An error occurred while loading template");
        router.push("/admin/templates");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id, router]);

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
