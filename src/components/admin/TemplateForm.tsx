"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Upload,
  Paintbrush,
  ArrowLeft,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { LANGUAGES } from "@/lib/translations";

interface Template {
  id: string;
  name: string;
  description: string;
  defaultPrimary: string;
  defaultSecondary: string;
  defaultAccent: string;
  defaultPadding: number;
  defaultYPadding?: number | null;
  photoX: number;
  photoY: number;
  photoWidth: number;
  photoHeight: number;
  photoCornerRadius: number;
  photoShowBorder: boolean;
  frameType: string;
  frameBgType?: string | null;
  frameBgColor: string;
  frameBgGradientColors?: string[] | null;
  frameUrlTemplate?: string | null;
  frameOuterInset?: number | null;
  frameOuterStrokeWidth?: number | null;
  frameOuterCornerRadius?: number | null;
  frameInnerInset?: number | null;
  frameInnerStrokeWidth?: number | null;
  frameInnerCornerRadius?: number | null;
  frameHasCornerCurves?: boolean | null;
  frameGradientColors: string[];
  frameComponentId?: string | null;
  thumbnailUrl?: string | null;
  active: boolean;
  bgConfig?: any;
  language?: string | null;
  detailsLayout?: string | null;
  titleShape?: string | null;
}

interface TemplateFormProps {
  template?: Template | null;
  isEdit?: boolean;
}

import { GRADIENT_PRESETS } from "@/lib/gradient-presets";

const initialFormState = {
  name: "",
  description: "",
  defaultPrimary: "#9B1B30",
  defaultSecondary: "#333333",
  defaultAccent: "#C9A84C",
  defaultPadding: "60",
  defaultYPadding: "",
  photoX: "390",
  photoY: "100",
  photoWidth: "140",
  photoHeight: "175",
  photoCornerRadius: "0",
  photoShowBorder: true,
  frameType: "image",
  frameBgType: "solid",
  frameBgColor: "#ffffff",
  frameBgGradientColors: "#ffffff,#f9e8e8",
  frameOuterInset: "10",
  frameOuterStrokeWidth: "2",
  frameOuterCornerRadius: "0",
  frameInnerInset: "16",
  frameInnerStrokeWidth: "1",
  frameInnerCornerRadius: "0",
  frameHasCornerCurves: true,
  frameGradientColors: "#4F46E5,#06B6D4",
  frameComponentId: "new-generation-arch",
  frameFile: "",
  thumbnailFile: "",
  bgImageUrl: "",
  bgImageFile: "",
  bgImageX: "0",
  bgImageY: "0",
  bgImageWidth: "595",
  bgImageHeight: "842",
  bgImageOpacity: "0.1",
  language: "English",
  detailsLayout: "classic",
  titleShape: "simple",
};

export function TemplateForm({ template, isEdit = false }: TemplateFormProps) {
  const router = useRouter();
  const [isSubmitLoading, setIsSubmitLoading] = React.useState(false);
  const [formState, setFormState] = React.useState(initialFormState);
  const [isNameGenerating, setIsNameGenerating] = React.useState(false);
  const [isDescGenerating, setIsDescGenerating] = React.useState(false);
  const [dbBackgrounds, setDbBackgrounds] = React.useState<any[]>([]);
  // Preview-only photo – stored locally, never sent to server
  const [previewPhotoFile, setPreviewPhotoFile] = React.useState<string | null>(null);
  const previewPhotoInputRef = React.useRef<HTMLInputElement>(null);

  const handlePreviewPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Preview photo must be under 8 MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setPreviewPhotoFile(reader.result as string);
    reader.readAsDataURL(file);
  };

  React.useEffect(() => {
    const fetchBgs = async () => {
      try {
        const res = await fetch("/api/admin/backgrounds");
        const data = await res.json();
        if (res.ok) {
          setDbBackgrounds(data.backgrounds || []);
        }
      } catch (err) {
        console.error("Failed to load background SVGs in form:", err);
      }
    };
    fetchBgs();
  }, []);

  const streamTextSmoothly = (
    field: "name" | "description",
    reader: ReadableStreamDefaultReader<Uint8Array>
  ): Promise<void> => {
    const decoder = new TextDecoder("utf-8");
    let queue: string[] = [];
    let isFinished = false;

    // Clear the target field first
    setFormState(prev => ({ ...prev, [field]: "" }));

    return new Promise<void>((resolve, reject) => {
      // 15ms interval achieves standard 60fps refresh rate
      const interval = setInterval(() => {
        if (queue.length > 0) {
          // Dynamic batch size: names stream letter-by-letter, long descriptions stream in small batches
          const batchSize = field === "description" ? 3 : 1;
          const charsToAdd = queue.splice(0, batchSize).join("");
          setFormState(prev => ({
            ...prev,
            [field]: prev[field] + charsToAdd
          }));
        } else if (isFinished) {
          clearInterval(interval);
          resolve();
        }
      }, 15);

      // Read from stream in background and feed the animation queue
      (async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              isFinished = true;
              break;
            }
            const text = decoder.decode(value, { stream: true });
            queue.push(...text.split(""));
          }
        } catch (err) {
          clearInterval(interval);
          reject(err);
        }
      })();
    });
  };

  const handleGenerateName = async () => {
    setIsNameGenerating(true);
    try {
      const res = await fetch("/api/admin/templates/generate-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "name",
          frameType: formState.frameType,
          frameBgType: formState.frameBgType,
          frameBgColor: formState.frameBgColor,
          frameBgGradientColors: formState.frameBgGradientColors,
          defaultPrimary: formState.defaultPrimary,
          defaultSecondary: formState.defaultSecondary,
          defaultAccent: formState.defaultAccent,
          frameOuterInset: formState.frameOuterInset,
          frameOuterStrokeWidth: formState.frameOuterStrokeWidth,
          frameOuterCornerRadius: formState.frameOuterCornerRadius,
          frameInnerInset: formState.frameInnerInset,
          frameInnerStrokeWidth: formState.frameInnerStrokeWidth,
          frameInnerCornerRadius: formState.frameInnerCornerRadius,
          frameHasCornerCurves: formState.frameHasCornerCurves,
          frameGradientColors: formState.frameGradientColors,
          frameComponentId: formState.frameComponentId,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate name");
      }

      const reader = res.body?.getReader();
      if (!reader) return;

      await streamTextSmoothly("name", reader);
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setIsNameGenerating(false);
    }
  };

  const handleGenerateDescription = async () => {
    setIsDescGenerating(true);
    try {
      const res = await fetch("/api/admin/templates/generate-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "description",
          name: formState.name,
          frameType: formState.frameType,
          frameBgType: formState.frameBgType,
          frameBgColor: formState.frameBgColor,
          frameBgGradientColors: formState.frameBgGradientColors,
          defaultPrimary: formState.defaultPrimary,
          defaultSecondary: formState.defaultSecondary,
          defaultAccent: formState.defaultAccent,
          frameOuterInset: formState.frameOuterInset,
          frameOuterStrokeWidth: formState.frameOuterStrokeWidth,
          frameOuterCornerRadius: formState.frameOuterCornerRadius,
          frameInnerInset: formState.frameInnerInset,
          frameInnerStrokeWidth: formState.frameInnerStrokeWidth,
          frameInnerCornerRadius: formState.frameInnerCornerRadius,
          frameHasCornerCurves: formState.frameHasCornerCurves,
          frameGradientColors: formState.frameGradientColors,
          frameComponentId: formState.frameComponentId,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate description");
      }

      const reader = res.body?.getReader();
      if (!reader) return;

      await streamTextSmoothly("description", reader);
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setIsDescGenerating(false);
    }
  };

  React.useEffect(() => {
    if (template) {
      setFormState({
        name: template.name,
        description: template.description || "",
        defaultPrimary: template.defaultPrimary,
        defaultSecondary: template.defaultSecondary,
        defaultAccent: template.defaultAccent,
        defaultPadding: String(template.defaultPadding),
        defaultYPadding: template.defaultYPadding ? String(template.defaultYPadding) : "",
        photoX: String(template.photoX),
        photoY: String(template.photoY),
        photoWidth: String(template.photoWidth),
        photoHeight: String(template.photoHeight),
        photoCornerRadius: String(template.photoCornerRadius),
        photoShowBorder: template.photoShowBorder !== false,
        frameType: template.frameType,
        frameBgType: template.frameBgType || "solid",
        frameBgColor: template.frameBgColor || "#ffffff",
        frameBgGradientColors: template.frameBgGradientColors
          ? template.frameBgGradientColors.join(",")
          : "#ffffff,#f9e8e8",
        frameOuterInset: template.frameOuterInset ? String(template.frameOuterInset) : "10",
        frameOuterStrokeWidth: template.frameOuterStrokeWidth ? String(template.frameOuterStrokeWidth) : "2",
        frameOuterCornerRadius: template.frameOuterCornerRadius ? String(template.frameOuterCornerRadius) : "8",
        frameInnerInset: template.frameInnerInset ? String(template.frameInnerInset) : "16",
        frameInnerStrokeWidth: template.frameInnerStrokeWidth ? String(template.frameInnerStrokeWidth) : "1",
        frameInnerCornerRadius: template.frameInnerCornerRadius ? String(template.frameInnerCornerRadius) : "6",
        frameHasCornerCurves: template.frameHasCornerCurves !== false,
        frameGradientColors: template.frameGradientColors ? template.frameGradientColors.join(",") : "#4F46E5,#06B6D4",
        frameComponentId: template.frameComponentId || "new-generation-arch",
        frameFile: "",
        thumbnailFile: "",
        bgImageUrl: template.bgConfig ? (typeof template.bgConfig === "string" ? JSON.parse(template.bgConfig) : template.bgConfig).url || "" : "",
        bgImageFile: "",
        bgImageX: template.bgConfig ? String((typeof template.bgConfig === "string" ? JSON.parse(template.bgConfig) : template.bgConfig).x ?? 0) : "0",
        bgImageY: template.bgConfig ? String((typeof template.bgConfig === "string" ? JSON.parse(template.bgConfig) : template.bgConfig).y ?? 0) : "0",
        bgImageWidth: template.bgConfig ? String((typeof template.bgConfig === "string" ? JSON.parse(template.bgConfig) : template.bgConfig).width ?? 595) : "595",
        bgImageHeight: template.bgConfig ? String((typeof template.bgConfig === "string" ? JSON.parse(template.bgConfig) : template.bgConfig).height ?? 842) : "842",
        bgImageOpacity: template.bgConfig ? String((typeof template.bgConfig === "string" ? JSON.parse(template.bgConfig) : template.bgConfig).opacity ?? 1.0) : "1.0",
        language: template.language || "English",
        detailsLayout: template.detailsLayout || "classic",
        titleShape: template.titleShape || "simple",
      });
    }
  }, [template]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: "frameFile" | "thumbnailFile" | "bgImageFile") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormState(prev => ({
        ...prev,
        [fieldName]: reader.result as string
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitLoading(true);

    try {
      const payload: any = {
        name: formState.name,
        description: formState.description,
        defaultPrimary: formState.defaultPrimary,
        defaultSecondary: formState.defaultSecondary,
        defaultAccent: formState.defaultAccent,
        defaultPadding: parseInt(formState.defaultPadding) || 60,
        defaultYPadding: formState.defaultYPadding ? parseInt(formState.defaultYPadding) : null,
        photoX: parseInt(formState.photoX) || 390,
        photoY: parseInt(formState.photoY) || 100,
        photoWidth: parseInt(formState.photoWidth) || 140,
        photoHeight: parseInt(formState.photoHeight) || 175,
        photoCornerRadius: parseInt(formState.photoCornerRadius) || 8,
        photoShowBorder: formState.photoShowBorder !== false,
        frameType: formState.frameType,
        frameBgType: formState.frameBgType,
        frameBgColor: formState.frameBgColor,
        frameBgGradientColors: formState.frameBgGradientColors.split(",").map(c => c.trim()),
        language: formState.language,
        detailsLayout: formState.detailsLayout,
        titleShape: formState.titleShape,
      };

      if (formState.bgImageFile || formState.bgImageUrl || formState.bgImageX !== "0" || formState.bgImageY !== "0" || formState.bgImageWidth !== "595" || formState.bgImageHeight !== "842" || formState.bgImageOpacity !== "1") {
        payload.bgConfig = {
          url: formState.bgImageUrl || null,
          file: formState.bgImageFile || null,
          x: parseInt(formState.bgImageX) || 0,
          y: parseInt(formState.bgImageY) || 0,
          width: parseInt(formState.bgImageWidth) || 595,
          height: parseInt(formState.bgImageHeight) || 842,
          opacity: parseFloat(formState.bgImageOpacity) || 1.0,
        };
      } else {
        payload.bgConfig = null;
      }

      if (formState.frameType === "svg") {
        payload.frameOuterInset = parseInt(formState.frameOuterInset) || 10;
        payload.frameOuterStrokeWidth = parseInt(formState.frameOuterStrokeWidth) || 2;
        payload.frameOuterCornerRadius = parseInt(formState.frameOuterCornerRadius) || 8;
        payload.frameInnerInset = parseInt(formState.frameInnerInset) || 16;
        payload.frameInnerStrokeWidth = parseInt(formState.frameInnerStrokeWidth) || 1;
        payload.frameInnerCornerRadius = parseInt(formState.frameInnerCornerRadius) || 6;
        payload.frameHasCornerCurves = formState.frameHasCornerCurves === true;
      } else if (formState.frameType === "gradient") {
        payload.frameGradientColors = formState.frameGradientColors.split(",").map(c => c.trim());
        payload.frameOuterInset = parseInt(formState.frameOuterInset) || 10;
        payload.frameOuterStrokeWidth = parseInt(formState.frameOuterStrokeWidth) || 2;
        payload.frameOuterCornerRadius = parseInt(formState.frameOuterCornerRadius) || 8;
        payload.frameInnerInset = parseInt(formState.frameInnerInset) || 16;
        payload.frameInnerStrokeWidth = parseInt(formState.frameInnerStrokeWidth) || 1;
        payload.frameInnerCornerRadius = parseInt(formState.frameInnerCornerRadius) || 6;
      } else if (formState.frameType === "custom") {
        payload.frameComponentId = formState.frameComponentId;
      }

      if (formState.frameFile) {
        payload.frameFile = formState.frameFile;
      }

      // If a custom thumbnail was manually uploaded, use it directly. Otherwise, capture automatically.
      if (formState.thumbnailFile) {
        payload.thumbnailFile = formState.thumbnailFile;
      } else {
        try {
          const svgElement = document.getElementById("template-preview-svg");
          if (svgElement) {
            // Clone the SVG element
            const svgClone = svgElement.cloneNode(true) as SVGSVGElement;

            // Inline any external images (like Cloudinary frames) to prevent canvas staining and security blockers
            const imageElements = svgClone.getElementsByTagName("image");
            const fetchPromises: Promise<void>[] = [];

            for (let i = 0; i < imageElements.length; i++) {
              const img = imageElements[i];
              const href = img.getAttribute("href") || img.getAttribute("xlink:href");
              if (href && href.startsWith("http")) {
                const promise = fetch(href)
                  .then(res => res.blob())
                  .then(blob => {
                    return new Promise<void>((resolveBlob) => {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        img.setAttribute("href", reader.result as string);
                        resolveBlob();
                      };
                      reader.readAsDataURL(blob);
                    });
                  })
                  .catch(err => {
                    console.error("Failed to inline image in thumbnail generator:", href, err);
                  });
                fetchPromises.push(promise);
              }
            }

            await Promise.all(fetchPromises);

            // Convert cloned SVG to string
            const svgString = new XMLSerializer().serializeToString(svgClone);
            const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
            const URL = window.URL || window.webkitURL || window;
            const blobURL = URL.createObjectURL(svgBlob);

            const pngThumbnail = await new Promise<string | null>((resolve) => {
              const image = new Image();
              image.onload = () => {
                try {
                  const canvas = document.createElement("canvas");
                  canvas.width = 595;
                  canvas.height = 842;
                  const context = canvas.getContext("2d");
                  if (context) {
                    // White background
                    context.fillStyle = "#ffffff";
                    context.fillRect(0, 0, canvas.width, canvas.height);

                    context.drawImage(image, 0, 0, 595, 842);
                    const pngBase64 = canvas.toDataURL("image/png");
                    URL.revokeObjectURL(blobURL);
                    resolve(pngBase64);
                  } else {
                    URL.revokeObjectURL(blobURL);
                    resolve(null);
                  }
                } catch (err) {
                  console.error("Canvas rendering error:", err);
                  URL.revokeObjectURL(blobURL);
                  resolve(null);
                }
              };
              image.onerror = () => {
                URL.revokeObjectURL(blobURL);
                resolve(null);
              };
              image.src = blobURL;
            });

            if (pngThumbnail) {
              payload.thumbnailFile = pngThumbnail;
            }
          }
        } catch (thumbnailErr) {
          console.error("Automatic thumbnail generation failed:", thumbnailErr);
        }
      }

      const url = isEdit && template
        ? `/api/admin/templates/${template.id}`
        : "/api/admin/templates";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`Template ${isEdit ? "updated" : "created"} successfully!`);
        router.push("/admin/templates");
        router.refresh();
      } else {
        toast.error(data.error || "Failed to save template");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while saving template");
    } finally {
      setIsSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-4 text-foreground max-w-7xl mx-auto">
      {/* Header Panel */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/admin/templates")}
          className="rounded-lg cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
            <Paintbrush className="w-6 h-6 text-primary" />
            {isEdit ? "Edit Layout Template" : "Create New Layout Template"}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isEdit ? "Modify configuration tokens and replace assets." : "Specify layout configurations and upload design skins."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Form Settings */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border border-border bg-card rounded-xl shadow-sm overflow-hidden">
            <CardContent className="p-4">
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* General Settings */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-primary uppercase tracking-wider">1. General Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="tpl-name" className="text-xs font-bold text-muted-foreground">Template Name *</Label>
                      <div className="relative flex items-center">
                        <Input
                          id="tpl-name"
                          type="text"
                          required
                          value={formState.name}
                          onChange={e => setFormState({ ...formState, name: e.target.value })}
                          placeholder="e.g. Royal Heritage"
                          className="pr-10 focus-visible:ring-primary rounded-lg w-full"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={handleGenerateName}
                          disabled={isNameGenerating}
                          className="absolute right-1 w-8 h-8 rounded-md text-primary hover:text-primary/80 hover:bg-primary/5 cursor-pointer"
                          title="Stream generate name using Gemini"
                        >
                          {isNameGenerating ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Sparkles className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-muted-foreground">Template Language *</Label>
                      <Select
                        value={formState.language}
                        onValueChange={value => setFormState({ ...formState, language: value || "English" })}
                      >
                        <SelectTrigger className="w-full text-sm rounded-lg focus:ring-primary focus:border-primary bg-background border border-border h-10 px-3">
                          <SelectValue placeholder="Select Language" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border border-border rounded-lg shadow-md">
                          {LANGUAGES.map((lang) => (
                            <SelectItem key={lang} value={lang} className="cursor-pointer hover:bg-muted py-2 px-3 text-sm">
                              {lang}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-muted-foreground">Details Layout Style *</Label>
                      <Select
                        value={formState.detailsLayout}
                        onValueChange={value => setFormState({ ...formState, detailsLayout: value || "classic" })}
                      >
                        <SelectTrigger className="w-full text-sm rounded-lg focus:ring-primary focus:border-primary bg-background border border-border h-10 px-3">
                          <SelectValue placeholder="Select Layout" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border border-border rounded-lg shadow-md">
                          <SelectItem value="classic" className="cursor-pointer hover:bg-muted py-2 px-3 text-sm">Classic Row (Label : Value)</SelectItem>
                          <SelectItem value="two-column" className="cursor-pointer hover:bg-muted py-2 px-3 text-sm">Two-Column Grid (Compact)</SelectItem>
                          <SelectItem value="modern-boxed" className="cursor-pointer hover:bg-muted py-2 px-3 text-sm">Modern Boxed Cards</SelectItem>
                          <SelectItem value="elegant-divided" className="cursor-pointer hover:bg-muted py-2 px-3 text-sm">Elegant Divided Lines</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-muted-foreground">Title Banner Shape *</Label>
                      <Select
                        value={formState.titleShape}
                        onValueChange={value => setFormState({ ...formState, titleShape: value || "simple" })}
                      >
                        <SelectTrigger className="w-full text-sm rounded-lg focus:ring-primary focus:border-primary bg-background border border-border h-10 px-3">
                          <SelectValue placeholder="Select Banner" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border border-border rounded-lg shadow-md">
                          <SelectItem value="simple" className="cursor-pointer hover:bg-muted py-2 px-3 text-sm">Simple Title Text</SelectItem>
                          <SelectItem value="ribbon" className="cursor-pointer hover:bg-muted py-2 px-3 text-sm">Ribbon Banner Backing</SelectItem>
                          <SelectItem value="arch" className="cursor-pointer hover:bg-muted py-2 px-3 text-sm">Temple Dome Arch Border</SelectItem>
                          <SelectItem value="ornament" className="cursor-pointer hover:bg-muted py-2 px-3 text-sm">Ornamental Floral Ends</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <Label htmlFor="tpl-desc" className="text-xs font-bold text-muted-foreground">Description</Label>
                      <div className="relative flex items-start">
                        <Textarea
                          id="tpl-desc"
                          value={formState.description}
                          onChange={e => setFormState({ ...formState, description: e.target.value })}
                          placeholder="e.g. Traditional gold ornaments, crimson borders"
                          className="focus-visible:ring-primary rounded-lg min-h-[80px] pr-10"
                          rows={3}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={handleGenerateDescription}
                          disabled={isDescGenerating}
                          className="absolute right-1 top-1 w-8 h-8 rounded-md text-primary hover:text-primary/80 hover:bg-primary/5 cursor-pointer"
                          title="Stream generate description using Gemini"
                        >
                          {isDescGenerating ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Sparkles className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-muted-foreground">Primary Color Theme *</Label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={formState.defaultPrimary}
                          onChange={e => setFormState({ ...formState, defaultPrimary: e.target.value })}
                          className="w-10 h-10 border border-border rounded-lg cursor-pointer p-0.5"
                        />
                        <Input
                          type="text"
                          required
                          value={formState.defaultPrimary}
                          onChange={e => setFormState({ ...formState, defaultPrimary: e.target.value })}
                          className="flex-1 font-mono focus-visible:ring-primary rounded-lg"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-muted-foreground">Secondary Color Theme *</Label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={formState.defaultSecondary}
                          onChange={e => setFormState({ ...formState, defaultSecondary: e.target.value })}
                          className="w-10 h-10 border border-border rounded-lg cursor-pointer p-0.5"
                        />
                        <Input
                          type="text"
                          required
                          value={formState.defaultSecondary}
                          onChange={e => setFormState({ ...formState, defaultSecondary: e.target.value })}
                          className="flex-1 font-mono focus-visible:ring-primary rounded-lg"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-muted-foreground">Accent Color Theme *</Label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={formState.defaultAccent}
                          onChange={e => setFormState({ ...formState, defaultAccent: e.target.value })}
                          className="w-10 h-10 border border-border rounded-lg cursor-pointer p-0.5"
                        />
                        <Input
                          type="text"
                          required
                          value={formState.defaultAccent}
                          onChange={e => setFormState({ ...formState, defaultAccent: e.target.value })}
                          className="flex-1 font-mono focus-visible:ring-primary rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SliderInput
                      label="Page X-Padding"
                      id="tpl-padding"
                      min={0}
                      max={150}
                      value={formState.defaultPadding}
                      onChange={val => setFormState({ ...formState, defaultPadding: val })}
                    />
                    <SliderInput
                      label="Page Y-Padding (optional)"
                      id="tpl-ypadding"
                      min={0}
                      max={150}
                      value={formState.defaultYPadding}
                      onChange={val => setFormState({ ...formState, defaultYPadding: val })}
                      placeholder="Same as X-padding if blank"
                    />
                  </div>
                </div>

                {/* Photo Settings */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="text-sm font-bold text-primary uppercase tracking-wider">2. Photo Layout Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SliderInput
                      label="Photo X Coordinate"
                      id="photo-x"
                      min={0}
                      max={595}
                      value={formState.photoX}
                      onChange={val => setFormState({ ...formState, photoX: val })}
                    />
                    <SliderInput
                      label="Photo Y Coordinate"
                      id="photo-y"
                      min={0}
                      max={842}
                      value={formState.photoY}
                      onChange={val => setFormState({ ...formState, photoY: val })}
                    />
                    <SliderInput
                      label="Photo Width"
                      id="photo-w"
                      min={10}
                      max={400}
                      value={formState.photoWidth}
                      onChange={val => setFormState({ ...formState, photoWidth: val })}
                    />
                    <SliderInput
                      label="Photo Height"
                      id="photo-h"
                      min={10}
                      max={500}
                      value={formState.photoHeight}
                      onChange={val => setFormState({ ...formState, photoHeight: val })}
                    />
                    <SliderInput
                      label="Photo Corner Radius"
                      id="photo-radius"
                      min={0}
                      max={100}
                      value={formState.photoCornerRadius}
                      onChange={val => setFormState({ ...formState, photoCornerRadius: val })}
                      className="md:col-span-2"
                    />

                    {/* Photo Border Toggle */}
                    <div className="md:col-span-2 flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3">
                      <div>
                        <p className="text-xs font-bold text-foreground">Show Photo Border</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Display a coloured border ring around the profile photo
                        </p>
                      </div>
                      <Switch
                        id="photo-show-border"
                        checked={formState.photoShowBorder}
                        onCheckedChange={(checked: boolean) => setFormState({ ...formState, photoShowBorder: checked })}
                      />
                    </div>
                  </div>
                </div>

                {/* Frame Settings */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="text-sm font-bold text-primary uppercase tracking-wider">3. Frame Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-muted-foreground">Frame Rendering Type</Label>
                      <Select
                        value={formState.frameType}
                        onValueChange={value => setFormState({ ...formState, frameType: value || "" })}
                      >
                        <SelectTrigger className="w-full text-sm rounded-lg focus:ring-primary focus:border-primary bg-background border border-border h-10 px-3">
                          <SelectValue placeholder="Select frame type" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border border-border rounded-lg shadow-md">
                          <SelectItem value="image" className="cursor-pointer hover:bg-muted py-2 px-3 text-sm">Image (PNG / SVG asset with dynamic tinting)</SelectItem>
                          <SelectItem value="svg" className="cursor-pointer hover:bg-muted py-2 px-3 text-sm">Classic SVG (Border with double/single line frames)</SelectItem>
                          <SelectItem value="gradient" className="cursor-pointer hover:bg-muted py-2 px-3 text-sm">Gradient Border</SelectItem>
                          <SelectItem value="custom" className="cursor-pointer hover:bg-muted py-2 px-3 text-sm">Custom Component (SVG dome arch, etc.)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-muted-foreground">Background Style</Label>
                      <Select
                        value={formState.frameBgType}
                        onValueChange={value => setFormState({ ...formState, frameBgType: value || "solid" })}
                      >
                        <SelectTrigger className="w-full text-sm rounded-lg focus:ring-primary focus:border-primary bg-background border border-border h-10 px-3">
                          <SelectValue placeholder="Select background style" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border border-border rounded-lg shadow-md">
                          <SelectItem value="solid" className="cursor-pointer hover:bg-muted py-2 px-3 text-sm">Solid Color</SelectItem>
                          <SelectItem value="linear" className="cursor-pointer hover:bg-muted py-2 px-3 text-sm">Linear Gradient</SelectItem>
                          <SelectItem value="radial" className="cursor-pointer hover:bg-muted py-2 px-3 text-sm">Radial Gradient</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Background Color Config */}
                  <div className="border border-border rounded-xl p-4 bg-muted/10">
                    {formState.frameBgType === "solid" ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-muted-foreground">Solid Background Color</Label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={formState.frameBgColor}
                              onChange={e => setFormState({ ...formState, frameBgColor: e.target.value })}
                              className="w-10 h-10 border border-border rounded-lg cursor-pointer p-0.5"
                            />
                            <Input
                              type="text"
                              value={formState.frameBgColor}
                              onChange={e => setFormState({ ...formState, frameBgColor: e.target.value })}
                              className="flex-1 font-mono focus-visible:ring-primary rounded-lg"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-muted-foreground">Gradient Hex Colors (comma-separated)</Label>
                          <Input
                            type="text"
                            value={formState.frameBgGradientColors}
                            onChange={e => setFormState({ ...formState, frameBgGradientColors: e.target.value })}
                            placeholder="e.g. #ffffff,#f9e8e8"
                            className="font-mono focus-visible:ring-primary rounded-lg w-full"
                          />
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {formState.frameBgType === "linear" ? "Renders as a top-to-bottom linear gradient." : "Renders as a center-outwards radial gradient."}
                          </p>
                        </div>

                        <div className="space-y-2.5">
                          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Select Gradient Background Color Palette</Label>
                          <div className="flex flex-wrap gap-2 max-h-[220px] overflow-y-auto p-2 border border-border/80 rounded-xl bg-muted/20 shadow-inner">
                            {(() => {
                              const basePresets = GRADIENT_PRESETS.map(preset => {
                                const colorsArr = preset.colors.split(",");
                                const c1 = colorsArr[0]?.trim();
                                const c2 = colorsArr[1]?.trim() || c1;
                                const c3 = colorsArr[2]?.trim();

                                let bgStyle = "";
                                if (formState.frameBgType === "linear") {
                                  bgStyle = c3
                                    ? `linear-gradient(to bottom, ${c1}, ${c2}, ${c3})`
                                    : `linear-gradient(to bottom, ${c1}, ${c2})`;
                                } else {
                                  bgStyle = c3
                                    ? `radial-gradient(circle, ${c1}, ${c2}, ${c3})`
                                    : `radial-gradient(circle, ${c1}, ${c2})`;
                                }

                                return {
                                  name: preset.name,
                                  colors: preset.colors,
                                  style: { background: bgStyle }
                                };
                              });

                              const normalizeColors = (cStr: string) => cStr.toLowerCase().replace(/\s+/g, "");
                              const activeNormalized = normalizeColors(formState.frameBgGradientColors || "");
                              const isAlreadyInPresets = GRADIENT_PRESETS.some(p => normalizeColors(p.colors) === activeNormalized);

                              let finalPresets = [...basePresets];

                              if (!isAlreadyInPresets && activeNormalized) {
                                const colorsArr = formState.frameBgGradientColors.split(",");
                                if (colorsArr.length >= 1 && colorsArr[0].startsWith("#")) {
                                  const c1 = colorsArr[0].trim();
                                  const c2 = colorsArr[1]?.trim() || c1;
                                  const c3 = colorsArr[2]?.trim();

                                  let bgStyle = "";
                                  if (formState.frameBgType === "linear") {
                                    bgStyle = c3
                                      ? `linear-gradient(to bottom, ${c1}, ${c2}, ${c3})`
                                      : `linear-gradient(to bottom, ${c1}, ${c2})`;
                                  } else {
                                    bgStyle = c3
                                      ? `radial-gradient(circle, ${c1}, ${c2}, ${c3})`
                                      : `radial-gradient(circle, ${c1}, ${c2})`;
                                  }

                                  finalPresets.push({
                                    name: "Custom Gradient",
                                    colors: formState.frameBgGradientColors,
                                    style: { background: bgStyle }
                                  });
                                }
                              }

                              return finalPresets.map((preset, idx) => {
                                const isPresetActive = normalizeColors(formState.frameBgGradientColors) === normalizeColors(preset.colors);
                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setFormState({ ...formState, frameBgGradientColors: preset.colors })}
                                    className={cn(
                                      "w-8 h-8 rounded-full border shadow-sm transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 bg-background relative cursor-pointer",
                                      isPresetActive
                                        ? "ring-2 ring-primary ring-offset-2 border-primary scale-110 shadow-md z-10"
                                        : "border-border/80 hover:border-foreground"
                                    )}
                                    style={preset.style}
                                    title={preset.name}
                                  >
                                    {isPresetActive && (
                                      <span className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-white shadow-sm ring-1 ring-black/10" />
                                    )}
                                  </button>
                                );
                              });
                            })()}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Conditional Frame Fields */}
                  {formState.frameType === "image" && (
                    <div className="space-y-3.5 border border-border rounded-xl p-4 bg-muted/10">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-muted-foreground">Upload Frame Image File *</Label>
                        <div className="flex items-center gap-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById("frame-file-input")?.click()}
                            className="text-xs font-bold gap-1.5 cursor-pointer rounded-lg h-10"
                          >
                            <Upload className="w-4 h-4" />
                            Choose PNG/SVG Frame
                          </Button>
                          <input
                            id="frame-file-input"
                            type="file"
                            accept="image/png, image/svg+xml"
                            className="hidden"
                            onChange={e => handleFileChange(e, "frameFile")}
                          />
                          {formState.frameFile ? (
                            <span className="text-xs text-green-600 font-semibold">✓ Frame loaded (ready to upload)</span>
                          ) : template?.frameUrlTemplate ? (
                            <span className="text-xs text-muted-foreground truncate max-w-xs">Current: {template.frameUrlTemplate?.slice(0, 50)}...</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">No frame file selected</span>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          Tip: Upload a grayscale/white transparent PNG or an SVG frame. Cloudinary can automatically tint these using your theme colors.
                        </p>
                      </div>
                    </div>
                  )}

                  {(formState.frameType === "svg" || formState.frameType === "gradient") && (
                    <div className="space-y-4 border border-border rounded-xl p-4 bg-muted/10">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <SliderInput
                          label="Outer Frame Inset"
                          id="outer-inset"
                          min={0}
                          max={100}
                          value={formState.frameOuterInset}
                          onChange={val => setFormState({ ...formState, frameOuterInset: val })}
                        />
                        <SliderInput
                          label="Outer Stroke Width"
                          id="outer-stroke"
                          min={0}
                          max={20}
                          value={formState.frameOuterStrokeWidth}
                          onChange={val => setFormState({ ...formState, frameOuterStrokeWidth: val })}
                        />
                        <SliderInput
                          label="Outer Corner Radius"
                          id="outer-radius"
                          min={0}
                          max={100}
                          value={formState.frameOuterCornerRadius}
                          onChange={val => setFormState({ ...formState, frameOuterCornerRadius: val })}
                        />
                        <SliderInput
                          label="Inner Frame Inset"
                          id="inner-inset"
                          min={0}
                          max={100}
                          value={formState.frameInnerInset}
                          onChange={val => setFormState({ ...formState, frameInnerInset: val })}
                        />
                        <SliderInput
                          label="Inner Stroke Width"
                          id="inner-stroke"
                          min={0}
                          max={20}
                          value={formState.frameInnerStrokeWidth}
                          onChange={val => setFormState({ ...formState, frameInnerStrokeWidth: val })}
                        />
                        <SliderInput
                          label="Inner Corner Radius"
                          id="inner-radius"
                          min={0}
                          max={100}
                          value={formState.frameInnerCornerRadius}
                          onChange={val => setFormState({ ...formState, frameInnerCornerRadius: val })}
                        />
                      </div>

                      {formState.frameType === "svg" && (
                        <div className="flex items-center gap-2 mt-2">
                          <input
                            type="checkbox"
                            id="has-corner-curves"
                            checked={formState.frameHasCornerCurves}
                            onChange={e => setFormState({ ...formState, frameHasCornerCurves: e.target.checked })}
                            className="w-4 h-4 accent-primary rounded border-border"
                          />
                          <Label htmlFor="has-corner-curves" className="text-xs font-bold text-muted-foreground cursor-pointer select-none">
                            Include traditional corner loop curves in SVG outline
                          </Label>
                        </div>
                      )}

                      {formState.frameType === "gradient" && (
                        <div className="space-y-1.5">
                          <Label htmlFor="gradient-colors" className="text-xs font-bold text-muted-foreground">Gradient Hex Colors (comma-separated)</Label>
                          <Input
                            id="gradient-colors"
                            type="text"
                            value={formState.frameGradientColors}
                            onChange={e => setFormState({ ...formState, frameGradientColors: e.target.value })}
                            placeholder="e.g. #4F46E5,#06B6D4,#10B981"
                            className="font-mono focus-visible:ring-primary rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {formState.frameType === "custom" && (
                    <div className="space-y-3 border border-border rounded-xl p-4 bg-muted/10">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-muted-foreground">Custom Renderer Component ID</Label>
                        <Select
                          value={formState.frameComponentId}
                          onValueChange={value => setFormState({ ...formState, frameComponentId: value || "" })}
                        >
                          <SelectTrigger className="w-full text-sm rounded-lg focus:ring-primary focus:border-primary bg-background border border-border h-10 px-3">
                            <SelectValue placeholder="Select custom design theme" />
                          </SelectTrigger>
                          <SelectContent className="bg-card border border-border rounded-lg shadow-md">
                            <SelectItem value="new-generation-arch" className="cursor-pointer hover:bg-muted py-2 px-3 text-sm">New Generation Arch (Dome shape)</SelectItem>
                            <SelectItem value="ornate-grandeur" className="cursor-pointer hover:bg-muted py-2 px-3 text-sm">Ornate Grandeur Scroll</SelectItem>
                            <SelectItem value="green-shapes" className="cursor-pointer hover:bg-muted py-2 px-3 text-sm">Green Leaves Motif</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Background Watermark Image settings */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="text-sm font-bold text-primary uppercase tracking-wider">4. Background Watermark SVG</h3>
                  <p className="text-xs text-muted-foreground leading-normal">
                    Optionally upload an SVG file to render as a background watermark graphic behind the biodata text.
                  </p>
                  <div className="space-y-3">
                    <div className="space-y-3 p-4 border border-border rounded-xl bg-muted/10">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-muted-foreground">Select from Uploaded Backgrounds Library</Label>
                        <Select
                          value={formState.bgImageUrl || "none"}
                          onValueChange={(url: string | null) => {
                            if (!url || url === "none") {
                              setFormState({
                                ...formState,
                                bgImageUrl: "",
                                bgImageFile: ""
                              });
                            } else {
                              setFormState({
                                ...formState,
                                bgImageUrl: url,
                                bgImageFile: ""
                              });
                            }
                          }}
                        >
                          <SelectTrigger className="w-full text-sm rounded-lg focus:ring-primary focus:border-primary bg-background border border-border h-10 px-3 cursor-pointer">
                            <SelectValue placeholder=" - Select background SVG  -" />
                          </SelectTrigger>
                          <SelectContent className="bg-card border border-border rounded-lg shadow-md max-h-[250px] overflow-y-auto">
                            <SelectItem value="none" className="cursor-pointer hover:bg-muted py-2 px-3 text-sm"> - None (No Watermark)  -</SelectItem>
                            {dbBackgrounds.map((bg) => (
                              <SelectItem key={bg.id} value={bg.url || ""} className="cursor-pointer hover:bg-muted py-2 px-3 text-sm">
                                {bg.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-border/80"></div>
                        <span className="flex-shrink mx-4 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">or upload new one-off SVG</span>
                        <div className="flex-grow border-t border-border/80"></div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-muted-foreground">Upload Custom SVG Watermark</Label>
                        <Input
                          type="file"
                          accept="image/svg+xml"
                          onChange={(e) => handleFileChange(e, "bgImageFile")}
                          className="cursor-pointer focus-visible:ring-primary rounded-lg bg-background"
                        />
                        {formState.bgImageUrl && (
                          <p className="text-[10px] text-green-600 font-medium truncate mt-1">
                            Active Watermark: <a href={formState.bgImageUrl} target="_blank" rel="noreferrer" className="underline font-mono">{formState.bgImageUrl.substring(formState.bgImageUrl.lastIndexOf('/') + 1)}</a>
                          </p>
                        )}
                        {formState.bgImageFile && (
                          <p className="text-[10px] text-primary font-bold mt-1">
                            ✓ New SVG uploaded (base64 payload ready)
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <SliderInput
                        label="Background X Position"
                        id="bg-x"
                        min={-200}
                        max={595}
                        value={formState.bgImageX}
                        onChange={(val) => setFormState({ ...formState, bgImageX: val })}
                      />
                      <SliderInput
                        label="Background Y Position"
                        id="bg-y"
                        min={-200}
                        max={842}
                        value={formState.bgImageY}
                        onChange={(val) => setFormState({ ...formState, bgImageY: val })}
                      />
                      <SliderInput
                        label="Background Width"
                        id="bg-w"
                        min={10}
                        max={1200}
                        value={formState.bgImageWidth}
                        onChange={(val) => setFormState({ ...formState, bgImageWidth: val })}
                      />
                      <SliderInput
                        label="Background Height"
                        id="bg-h"
                        min={10}
                        max={1600}
                        value={formState.bgImageHeight}
                        onChange={(val) => setFormState({ ...formState, bgImageHeight: val })}
                      />
                      <div className="md:col-span-2 space-y-1.5">
                        <div className="flex justify-between items-center">
                          <Label className="text-xs font-bold text-muted-foreground">Background Opacity</Label>
                          <span className="text-xs font-mono text-primary font-bold">{parseFloat(formState.bgImageOpacity).toFixed(2)}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={formState.bgImageOpacity}
                          onChange={(e) => setFormState({ ...formState, bgImageOpacity: e.target.value })}
                          className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                      </div>
                    </div>

                    {(formState.bgImageUrl || formState.bgImageFile) && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => setFormState({
                          ...formState,
                          bgImageUrl: "",
                          bgImageFile: "",
                          bgImageX: "0",
                          bgImageY: "0",
                          bgImageWidth: "595",
                          bgImageHeight: "842",
                          bgImageOpacity: "1.0",
                        })}
                        className="w-full text-xs h-8 rounded-lg mt-1 cursor-pointer"
                      >
                        Clear Background Image
                      </Button>
                    )}
                  </div>
                </div>

                {/* Template Thumbnail Settings */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="text-sm font-bold text-primary uppercase tracking-wider">5. Template Thumbnail</h3>
                  <div className="space-y-3.5">
                    {/* Auto thumbnail notice */}
                    <div className="flex gap-3 items-center border border-primary/20 rounded-xl p-4 bg-primary/5">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-base font-bold shrink-0">✨</div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-primary">Smart Auto-Thumbnail Active</p>
                        <p className="text-xs text-muted-foreground leading-normal">
                          By default, the builder will automatically capture your live SVG layout. However, you can choose to upload a custom high-quality cover thumbnail below to override it.
                        </p>
                      </div>
                    </div>

                    {/* File Upload Control */}
                    <div className="space-y-2.5 p-4 border border-border rounded-xl bg-muted/10">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-muted-foreground">Upload Custom Mockup / Cover Image (JPEG/PNG)</Label>
                        <div className="flex flex-col gap-2.5">
                          <input
                            type="file"
                            accept="image/png, image/jpeg, image/jpg, image/webp"
                            id="custom-thumbnail-input"
                            onChange={(e) => handleFileChange(e, "thumbnailFile")}
                            className="hidden"
                          />
                          <div className="flex items-center gap-3">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById("custom-thumbnail-input")?.click()}
                              className="text-xs gap-1.5 h-9 cursor-pointer hover:bg-muted"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              Choose Image
                            </Button>
                            <span className="text-xs text-muted-foreground truncate max-w-[240px]">
                              {formState.thumbnailFile ? "✓ Custom image loaded" : "No file selected"}
                            </span>
                          </div>

                          {/* Live Selected Thumbnail Preview */}
                          {formState.thumbnailFile && (
                            <div className="relative w-28 aspect-[3/4] border border-primary/30 rounded-lg overflow-hidden bg-muted shadow-sm mt-1">
                              <img
                                src={formState.thumbnailFile}
                                alt="Custom uploaded thumbnail preview"
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => setFormState({ ...formState, thumbnailFile: "" })}
                                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600/90 text-white flex items-center justify-center text-[10px] font-bold shadow-md cursor-pointer hover:bg-red-700 transition-colors"
                                title="Remove custom thumbnail"
                              >
                                ×
                              </button>
                            </div>
                          )}

                          {/* Display existing db thumbnail if editing and no new one selected */}
                          {!formState.thumbnailFile && template?.thumbnailUrl && (
                            <div className="space-y-1 mt-1">
                              <p className="text-[10px] text-muted-foreground">Current active thumbnail in database:</p>
                              <div className="relative w-28 aspect-[3/4] border border-border rounded-lg overflow-hidden bg-muted shadow-sm">
                                <img
                                  src={template.thumbnailUrl}
                                  alt="Current template thumbnail"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/admin/templates")}
                    disabled={isSubmitLoading}
                    className="cursor-pointer rounded-lg"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitLoading}
                    className="font-bold cursor-pointer rounded-lg"
                  >
                    {isSubmitLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Template"
                    )}
                  </Button>
                </div>

              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Sticky Live Preview */}
        <div className="lg:col-span-5 relative">
          <div className="sticky top-6 space-y-4">
            <Card className="border border-border bg-card rounded-xl shadow-md overflow-hidden">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      Live Mockup Preview
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Real-time A4 rendering simulator (595x842 ratio)
                    </p>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-xs h-8 cursor-pointer gap-1">
                        Full View
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl bg-card border border-border p-6 rounded-xl overflow-hidden">
                      <DialogHeader>
                        <DialogTitle className="text-lg font-black text-primary">Full Template Mockup</DialogTitle>
                        <DialogDescription className="text-xs">
                          High fidelity simulated rendering of &quot;{formState.name || 'Untitled Template'}&quot; layout.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="flex justify-center py-4 bg-muted/10 rounded-lg border border-border">
                        <div className="h-[48vh] max-w-full aspect-[595/842] shadow-lg rounded-md overflow-hidden bg-white flex items-center justify-center border border-border/40 transition-all duration-300">
                          <TemplateSvgPreview formState={formState} template={template} previewPhotoFile={previewPhotoFile} />
                        </div>
                      </div>

                      <DialogFooter showCloseButton />
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Preview Photo Upload Strip */}
                <div className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-primary/40 bg-primary/[0.03] hover:bg-primary/[0.06] transition-colors">
                  <input
                    ref={previewPhotoInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    className="hidden"
                    onChange={handlePreviewPhotoChange}
                  />
                  {previewPhotoFile ? (
                    <>
                      <div className="relative w-10 h-14 rounded-md overflow-hidden border border-primary/30 shrink-0 shadow-sm">
                        <img src={previewPhotoFile} alt="Preview photo" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-green-600">✓ Preview photo loaded</p>
                        <p className="text-[10px] text-muted-foreground">Displayed in template preview only — not saved.</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => { setPreviewPhotoFile(null); if (previewPhotoInputRef.current) previewPhotoInputRef.current.value = ""; }}
                        className="text-[10px] h-7 px-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer shrink-0"
                      >
                        Remove
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-14 rounded-md border-2 border-dashed border-primary/30 bg-primary/5 flex items-center justify-center shrink-0">
                        <Upload className="w-4 h-4 text-primary/50" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-foreground">Upload Preview Photo</p>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">See how a real photo looks inside this template frame.</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => previewPhotoInputRef.current?.click()}
                        className="text-[10px] h-7 px-2.5 cursor-pointer shrink-0 font-bold"
                      >
                        Browse
                      </Button>
                    </>
                  )}
                </div>

                {/* SVG Preview container */}
                <div className="bg-muted/30 border border-border/60 rounded-xl p-4 flex justify-center items-center shadow-inner">
                  <div className="w-full max-w-[340px] aspect-[595/842] shadow-lg rounded-lg overflow-hidden bg-white border border-border/40 transition-all duration-300">
                    <TemplateSvgPreview formState={formState} template={template} previewPhotoFile={previewPhotoFile} />
                  </div>
                </div>

                <div className="text-[11px] text-muted-foreground bg-muted/20 border border-border/40 rounded-lg p-3 space-y-1.5">
                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                    <span className="text-xs">💡</span> Handy Tips:
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                    <li>Adjust <strong>Photo X & Y</strong> to move the profile photo.</li>
                    <li>Toggle between <strong>Classic SVG</strong>, <strong>Gradient</strong>, or <strong>Custom component</strong> to see frame changes instantly.</li>
                    <li>Verify that titles and mantras do not overlap with the photo box coordinates.</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function TemplateSvgPreview({ formState, template, previewPhotoFile }: { formState: typeof initialFormState; template: Template | null | undefined; previewPhotoFile?: string | null }) {
  const px = parseFloat(formState.photoX) || 390;
  const py = parseFloat(formState.photoY) || 100;
  const pw = parseFloat(formState.photoWidth) || 140;
  const ph = parseFloat(formState.photoHeight) || 175;
  const pr = parseFloat(formState.photoCornerRadius) || 8;

  const outerInset = parseFloat(formState.frameOuterInset) || 10;
  const outerStroke = parseFloat(formState.frameOuterStrokeWidth) || 2;
  const outerRadius = parseFloat(formState.frameOuterCornerRadius) || 8;

  const innerInset = parseFloat(formState.frameInnerInset) || 16;
  const innerStroke = parseFloat(formState.frameInnerStrokeWidth) || 1;
  const innerRadius = parseFloat(formState.frameInnerCornerRadius) || 6;

  const primaryColor = formState.defaultPrimary || "#9B1B30";
  const secondaryColor = formState.defaultSecondary || "#333333";
  const accentColor = formState.defaultAccent || "#C9A84C";
  const bgColor = formState.frameBgColor || "#ffffff";

  const paddingX = parseFloat(formState.defaultPadding) || 75;
  const paddingY = formState.defaultYPadding ? (parseFloat(formState.defaultYPadding) || paddingX) : paddingX;
  const cursorY = paddingY + 150;

  // Parse gradient colors safely
  const gradientColors = formState.frameGradientColors
    ? formState.frameGradientColors.split(",").map(c => c.trim())
    : ["#4F46E5", "#06B6D4"];

  const bgGradientColors = formState.frameBgGradientColors
    ? formState.frameBgGradientColors.split(",").map(c => c.trim())
    : ["#ffffff", "#f9e8e8"];

  // Use the stored frame URL as-is — no tint injection
  let frameImageSrc = formState.frameFile || template?.frameUrlTemplate || null;

  return (
    <svg
      id="template-preview-svg"
      viewBox="0 0 595 842"
      width="100%"
      height="100%"
      style={{
        backgroundColor: formState.frameBgType === "solid" ? bgColor : "transparent",
        display: "block"
      }}
      className="select-none"
    >
      <defs>
        {/* Gradient for frame border type */}
        <linearGradient id="live-preview-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          {gradientColors.map((color, idx, arr) => (
            <stop
              key={idx}
              offset={`${(idx / Math.max(1, arr.length - 1)) * 100}%`}
              stopColor={color || "#4F46E5"}
            />
          ))}
        </linearGradient>

        {/* Gradient for background (Linear) */}
        {formState.frameBgType === "linear" && (
          <linearGradient id="bg-linear-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            {bgGradientColors.map((color, idx, arr) => (
              <stop
                key={idx}
                offset={`${(idx / Math.max(1, arr.length - 1)) * 100}%`}
                stopColor={color || "#ffffff"}
              />
            ))}
          </linearGradient>
        )}

        {/* Gradient for background (Radial) */}
        {formState.frameBgType === "radial" && (
          <radialGradient id="bg-radial-grad" cx="50%" cy="50%" r="70%" fx="50%" fy="50%">
            {bgGradientColors.map((color, idx, arr) => (
              <stop
                key={idx}
                offset={`${(idx / Math.max(1, arr.length - 1)) * 100}%`}
                stopColor={color || "#ffffff"}
              />
            ))}
          </radialGradient>
        )}

        {/* Clip path for profile photo so custom shape works if round etc */}
        <clipPath id="photo-clip">
          <rect x={px} y={py} width={pw} height={ph} rx={pr} ry={pr} />
        </clipPath>
      </defs>

      {/* Page Base Background */}
      <rect
        width="595"
        height="842"
        fill={
          formState.frameBgType === "linear" ? "url(#bg-linear-grad)" :
            formState.frameBgType === "radial" ? "url(#bg-radial-grad)" :
              bgColor
        }
      />

      {/* Background Watermark Image rendering */}
      {(formState.bgImageFile || formState.bgImageUrl) && (
        <image
          href={formState.bgImageFile || formState.bgImageUrl}
          x={parseFloat(formState.bgImageX) || 0}
          y={parseFloat(formState.bgImageY) || 0}
          width={parseFloat(formState.bgImageWidth) || 595}
          height={parseFloat(formState.bgImageHeight) || 842}
          opacity={parseFloat(formState.bgImageOpacity) ?? 1.0}
          preserveAspectRatio="none"
        />
      )}

      {/* Frame Rendering logic */}
      {formState.frameType === "svg" && (
        <g>
          {/* Outer Border */}
          <rect
            x={outerInset}
            y={outerInset}
            width={595 - 2 * outerInset}
            height={842 - 2 * outerInset}
            fill="none"
            stroke={primaryColor}
            strokeWidth={outerStroke}
            rx={outerRadius}
            ry={outerRadius}
          />
          {/* Inner Border */}
          <rect
            x={innerInset}
            y={innerInset}
            width={595 - 2 * innerInset}
            height={842 - 2 * innerInset}
            fill="none"
            stroke={accentColor}
            strokeWidth={innerStroke}
            rx={innerRadius}
            ry={innerRadius}
          />
          {/* Corner curves loop decoration if enabled */}
          {formState.frameHasCornerCurves && (
            <g stroke={accentColor} strokeWidth={innerStroke} fill="none">
              {/* Top-Left Corner */}
              <path d={`M ${innerInset + 10} ${innerInset} A 10,10 0 0,0 ${innerInset} ${innerInset + 10}`} />
              <circle cx={innerInset + 8} cy={innerInset + 8} r="3" fill={accentColor} />

              {/* Top-Right Corner */}
              <path d={`M ${595 - innerInset - 10} ${innerInset} A 10,10 0 0,1 ${595 - innerInset} ${innerInset + 10}`} />
              <circle cx={595 - innerInset - 8} cy={innerInset + 8} r="3" fill={accentColor} />

              {/* Bottom-Left Corner */}
              <path d={`M ${innerInset + 10} ${842 - innerInset} A 10,10 0 0,1 ${innerInset} ${842 - innerInset - 10}`} />
              <circle cx={innerInset + 8} cy={842 - innerInset - 8} r="3" fill={accentColor} />

              {/* Bottom-Right Corner */}
              <path d={`M ${595 - innerInset - 10} ${842 - innerInset} A 10,10 0 0,0 ${595 - innerInset} ${842 - innerInset - 10}`} />
              <circle cx={595 - innerInset - 8} cy={842 - innerInset - 8} r="3" fill={accentColor} />
            </g>
          )}
        </g>
      )}

      {formState.frameType === "gradient" && (
        <g>
          {/* Outer Border */}
          <rect
            x={outerInset}
            y={outerInset}
            width={595 - 2 * outerInset}
            height={842 - 2 * outerInset}
            fill="none"
            stroke="url(#live-preview-grad)"
            strokeWidth={outerStroke}
            rx={outerRadius}
            ry={outerRadius}
          />
          {/* Inner Border */}
          <rect
            x={innerInset}
            y={innerInset}
            width={595 - 2 * innerInset}
            height={842 - 2 * innerInset}
            fill="none"
            stroke="url(#live-preview-grad)"
            strokeWidth={innerStroke}
            rx={innerRadius}
            ry={innerRadius}
          />
        </g>
      )}

      {formState.frameType === "image" && (
        <g>
          {frameImageSrc ? (
            /* Render active PNG image frame overlay scaled and tinted via SVG styling */
            <image
              href={frameImageSrc}
              x="0"
              y="0"
              width="595"
              height="842"
              preserveAspectRatio="none"
              style={{ filter: `drop-shadow(0px 0px 1px ${primaryColor})` }}
            />
          ) : (
            /* Mock illustration of ornate borders */
            <g stroke={primaryColor} strokeWidth="3" fill="none">
              <rect x="15" y="15" width="565" height="812" rx="12" strokeWidth="2" strokeDasharray="10, 5" />
              <rect x="25" y="25" width="545" height="792" rx="8" strokeWidth="1" opacity="0.6" />
              <path d="M 15 45 L 45 15 M 580 45 L 550 15 M 15 797 L 45 827 M 580 797 L 550 827" strokeWidth="3" stroke={accentColor} />
            </g>
          )}
        </g>
      )}

      {formState.frameType === "custom" && (
        <g>
          {formState.frameComponentId === "new-generation-arch" && (
            <g stroke={primaryColor} fill="none">
              {/* Elegant dome outline */}
              <path
                d="M 30,120 L 30,802 A 15,15 0 0,0 45,817 L 550,817 A 15,15 0 0,0 565,802 L 565,120 C 565,80 500,40 297,40 C 94,40 30,80 30,120 Z"
                strokeWidth="3"
              />
              <path
                d="M 40,125 L 40,792 A 10,10 0 0,0 50,802 L 545,802 A 10,10 0 0,0 555,792 L 555,125 C 555,90 495,52 297,52 C 99,52 40,90 40,125 Z"
                stroke={accentColor}
                strokeWidth="1.5"
                strokeDasharray="4,2"
              />
              {/* Dome crest decoration */}
              <circle cx="297" cy="25" r="4" fill={accentColor} stroke="none" />
              <path d="M 297,21 L 297,12 M 294,15 L 300,15" stroke={accentColor} strokeWidth="1.5" />
            </g>
          )}

          {formState.frameComponentId === "ornate-grandeur" && (
            <g stroke={primaryColor} fill="none">
              <rect x="25" y="25" width="545" height="792" rx="4" strokeWidth="2.5" />
              <rect x="33" y="33" width="529" height="776" rx="2" strokeWidth="1" stroke={accentColor} />

              {/* Detailed Scroll accents in corners */}
              <path d={`M 25 65 C 45 65, 45 45, 65 45`} strokeWidth="2" stroke={accentColor} />
              <path d={`M 570 65 C 550 65, 550 45, 530 45`} strokeWidth="2" stroke={accentColor} />
              <path d={`M 25 777 C 45 777, 45 797, 65 797`} strokeWidth="2" stroke={accentColor} />
              <path d={`M 570 777 C 550 777, 550 797, 530 797`} strokeWidth="2" stroke={accentColor} />
            </g>
          )}

          {formState.frameComponentId === "green-shapes" && (
            <g fill="none">
              <rect x="20" y="20" width="555" height="802" rx="6" stroke="#2E7D32" strokeWidth="2" />
              <rect x="28" y="28" width="539" height="786" rx="4" stroke={accentColor} strokeWidth="1" strokeDasharray="3, 3" />

              {/* Leaf motifs at corners */}
              <path d="M 20 20 Q 40 30, 30 50 Q 20 40, 20 20 Z" fill="#2E7D32" opacity="0.8" />
              <path d="M 575 20 Q 555 30, 565 50 Q 575 40, 575 20 Z" fill="#2E7D32" opacity="0.8" />
              <path d="M 20 822 Q 40 812, 30 792 Q 20 802, 20 822 Z" fill="#2E7D32" opacity="0.8" />
              <path d="M 575 822 Q 555 812, 565 792 Q 575 802, 575 822 Z" fill="#2E7D32" opacity="0.8" />
            </g>
          )}
        </g>
      )}

      {/* Decorative Mantra Header */}
      <g textAnchor="middle">
        <text
          x="297"
          y={paddingY + 15}
          fill={primaryColor}
          fontSize="14"
          fontWeight="bold"
          fontFamily="Georgia, serif"
        >
          {formState.name ? `|| Shree Ganeshay Namah ||` : `|| Header Mantra Place Holder ||`}
        </text>
        {/* Accent Underline divider */}
        <path d={`M 220 ${paddingY + 27} L 375 ${paddingY + 27}`} stroke={accentColor} strokeWidth="1.5" />
        <circle cx="297" cy={paddingY + 27} r="3" fill={primaryColor} />
      </g>

      {/* Profile Photo Area */}
      <g>
        {/* Accent outer glow border */}
        <rect
          x={px - 2}
          y={py - 2}
          width={pw + 4}
          height={ph + 4}
          fill="none"
          stroke={accentColor}
          strokeWidth="1.5"
          rx={pr + 1}
          ry={pr + 1}
        />
        {/* Photo background */}
        <rect
          x={px}
          y={py}
          width={pw}
          height={ph}
          fill="#FFFBF8"
          rx={pr}
          ry={pr}
        />

        {/* Clip-pathed content – real photo OR placeholder */}
        <g clipPath="url(#photo-clip)">
          {previewPhotoFile ? (
            /* Render the admin-uploaded preview photo */
            <image
              href={previewPhotoFile}
              x={px}
              y={py}
              width={pw}
              height={ph}
              preserveAspectRatio="xMidYMid slice"
            />
          ) : (
            /* Placeholder silhouette */
            <>
              <rect x={px} y={py} width={pw} height={ph} fill="rgba(201, 168, 76, 0.08)" />
              <path
                d={`M ${px + pw / 2} ${py + ph * 0.4} A ${pw * 0.2} ${pw * 0.2} 0 1 0 ${px + pw / 2} ${py + ph * 0.4001}`}
                fill="none"
                stroke={primaryColor}
                strokeWidth="3.5"
                opacity="0.4"
              />
              <path
                d={`M ${px + pw * 0.2} ${py + ph * 0.9} C ${px + pw * 0.2} ${py + ph * 0.65}, ${px + pw * 0.8} ${py + ph * 0.65}, ${px + pw * 0.8} ${py + ph * 0.9}`}
                fill="none"
                stroke={primaryColor}
                strokeWidth="3.5"
                opacity="0.4"
              />
              <rect
                x={px}
                y={py}
                width={pw}
                height={ph}
                fill="none"
                stroke={primaryColor}
                strokeWidth="1"
                opacity="0.25"
              />
              <text
                x={px + pw / 2}
                y={py + ph - 10}
                textAnchor="middle"
                fill={primaryColor}
                fontSize="10"
                fontWeight="bold"
                opacity="0.7"
              >
                PROFILE PHOTO
              </text>
            </>
          )}
        </g>

        {/* Primary border on top of photo */}
        <rect
          x={px}
          y={py}
          width={pw}
          height={ph}
          fill="none"
          stroke={primaryColor}
          strokeWidth="1"
          rx={pr}
          ry={pr}
          opacity="0.4"
        />
      </g>

      {/* Main Document Title */}
      <g>
        <text
          x={paddingX}
          y={paddingY + 95}
          fill={primaryColor}
          fontSize="24"
          fontWeight="900"
          fontFamily="Georgia, serif"
          letterSpacing="2"
        >
          BIODATA
        </text>
        <path d={`M ${paddingX} ${paddingY + 108} L ${paddingX + 120} ${paddingY + 108}`} stroke={primaryColor} strokeWidth="3" />
        <path d={`M ${paddingX} ${paddingY + 114} L ${paddingX + 65} ${paddingY + 114}`} stroke={accentColor} strokeWidth="1.5" />
      </g>

      {/* Simulated Biodata Details Text */}
      <g fill={secondaryColor} fontSize="11" fontFamily="system-ui, -apple-system, sans-serif">

        {/* Section 1: Personal Details */}
        <text x={paddingX} y={cursorY} fill={primaryColor} fontSize="12" fontWeight="bold" letterSpacing="0.5">
          PERSONAL DETAILS
        </text>

        <text x={paddingX} y={cursorY + 25} fontWeight="semibold">Full Name</text>
        <text x={paddingX + 105} y={cursorY + 25} opacity="0.95">: Rahul Anil Sharma</text>

        <text x={paddingX} y={cursorY + 48} fontWeight="semibold">Date of Birth</text>
        <text x={paddingX + 105} y={cursorY + 48} opacity="0.95">: 15 October 1995</text>

        <text x={paddingX} y={cursorY + 71} fontWeight="semibold">Time of Birth</text>
        <text x={paddingX + 105} y={cursorY + 71} opacity="0.95">: 10:15 AM</text>

        <text x={paddingX} y={cursorY + 94} fontWeight="semibold">Place of Birth</text>
        <text x={paddingX + 105} y={cursorY + 94} opacity="0.95">: Mumbai, Maharashtra</text>

        <text x={paddingX} y={cursorY + 117} fontWeight="semibold">Rashi / Nakshatra</text>
        <text x={paddingX + 105} y={cursorY + 117} opacity="0.95">: Leo (Simha) / Poorva Phalguni</text>

        <text x={paddingX} y={cursorY + 140} fontWeight="semibold">Height</text>
        <text x={paddingX + 105} y={cursorY + 140} opacity="0.95">: 5 ft 10 in (178 cm)</text>

        {/* Section 2: Education and Career */}
        <text x={paddingX} y={cursorY + 190} fill={primaryColor} fontSize="12" fontWeight="bold" letterSpacing="0.5">
          PROFESSIONAL DETAILS
        </text>

        <text x={paddingX} y={cursorY + 215} fontWeight="semibold">Education</text>
        <text x={paddingX + 105} y={cursorY + 215} opacity="0.95">: B.Tech in Computer Science</text>

        <text x={paddingX} y={cursorY + 238} fontWeight="semibold">College</text>
        <text x={paddingX + 105} y={cursorY + 238} opacity="0.95">: IIT Bombay</text>

        <text x={paddingX} y={cursorY + 261} fontWeight="semibold">Occupation</text>
        <text x={paddingX + 105} y={cursorY + 261} opacity="0.95">: Senior Software Engineer</text>

        <text x={paddingX} y={cursorY + 284} fontWeight="semibold">Annual Income</text>
        <text x={paddingX + 105} y={cursorY + 284} opacity="0.95" fill={primaryColor} fontWeight="bold">: ₹ 28,00,000 PA</text>

        {/* Section 3: Family Background */}
        <text x={paddingX} y={cursorY + 335} fill={primaryColor} fontSize="12" fontWeight="bold" letterSpacing="0.5">
          FAMILY BACKGROUND
        </text>

        <text x={paddingX} y={cursorY + 360} fontWeight="semibold">Father's Name</text>
        <text x={paddingX + 105} y={cursorY + 360} opacity="0.95">: Mr. Anil Kumar Sharma (Businessperson)</text>

        <text x={paddingX} y={cursorY + 383} fontWeight="semibold">Mother's Name</text>
        <text x={paddingX + 105} y={cursorY + 383} opacity="0.95">: Mrs. Sunita Sharma (Homemaker)</text>

        <text x={paddingX} y={cursorY + 406} fontWeight="semibold">Siblings</text>
        <text x={paddingX + 105} y={cursorY + 406} opacity="0.95">: 1 Younger Sister (Married)</text>

        <text x={paddingX} y={cursorY + 429} fontWeight="semibold">Family Values</text>
        <text x={paddingX + 105} y={cursorY + 429} opacity="0.95">: Moderate / Traditional</text>

        {/* Section 4: Contact Details */}
        <text x={paddingX} y={cursorY + 480} fill={primaryColor} fontSize="12" fontWeight="bold" letterSpacing="0.5">
          CONTACT DETAILS
        </text>

        <text x={paddingX} y={cursorY + 505} fontWeight="semibold">Mobile Number</text>
        <text x={paddingX + 105} y={cursorY + 505} opacity="0.95">: +91 98765 43210</text>

        <text x={paddingX} y={cursorY + 528} fontWeight="semibold">Email Address</text>
        <text x={paddingX + 105} y={cursorY + 528} opacity="0.95" fill={primaryColor}>: rahul.sharma@example.com</text>

        <text x={paddingX} y={cursorY + 551} fontWeight="semibold">Residential Address</text>
        <text x={paddingX + 105} y={cursorY + 551} opacity="0.95">: 402, Royal Palms, Bandra West, Mumbai</text>

      </g>

      {/* Decorative footer elements */}
      <line x1={paddingX - 15} y1={842 - paddingY - 10} x2={595 - paddingX + 15} y2={842 - paddingY - 10} stroke={primaryColor} strokeWidth="0.5" opacity="0.3" />
    </svg>
  );
}

interface SliderInputProps {
  label: string;
  id: string;
  min: number;
  max: number;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

function SliderInput({ label, id, min, max, value, onChange, placeholder, className }: SliderInputProps) {
  const numValue = parseFloat(value) || 0;

  return (
    <div className={cn("space-y-1.5 bg-muted/5 border border-border/20 p-2.5 rounded-lg", className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-xs font-bold text-muted-foreground">{label}</Label>
        <span className="text-[10px] font-mono font-bold text-primary bg-primary/5 px-1.5 py-0.5 rounded">{numValue}px</span>
      </div>
      <div className="flex items-center gap-3">
        <Input
          id={id}
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-20 focus-visible:ring-primary rounded-lg text-xs h-8 px-2"
        />
        <Slider
          value={[numValue]}
          min={min}
          max={max}
          step={1}
          onValueChange={([val]) => onChange(String(val))}
          className="flex-1 cursor-pointer py-1"
        />
      </div>
    </div>
  );
}
