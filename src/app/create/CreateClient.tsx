"use client";
 
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { biodataSchema, type BiodataFormValues } from "@/types/biodata";
import { BiodataForm } from "@/components/biodata/BiodataForm";
import { BiodataPreview } from "@/components/biodata/BiodataPreview";
import { defaultBiodataValues } from "@/lib/default-biodata";
 
export function CreateClient() {
  const methods = useForm<BiodataFormValues>({
    resolver: zodResolver(biodataSchema) as any,
    defaultValues: defaultBiodataValues,
    mode: "onChange",
  });
 
  const formData = methods.watch();
 
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
 
          {/* Form Side - Natural Scrolling */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-primary">Create Your Biodata</h1>
              <p className="text-sm text-muted-foreground">Fill in your details below. The preview updates instantly.</p>
            </div>
 
            <FormProvider {...methods}>
              <BiodataForm />
            </FormProvider>
          </div>
 
          {/* Preview Side - Sticky */}
          <div className="lg:col-span-5 sticky top-24 hidden lg:block">
            <div className="flex justify-center items-start">
              <BiodataPreview data={formData} />
            </div>
          </div>
 
        </div>
      </div>
    </div>
  );
}
