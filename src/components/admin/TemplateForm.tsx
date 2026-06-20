"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { cn, getClientImageUrl } from "@/lib/utils";
import { ENGLISH_FONTS } from "@/lib/konva-fonts";
import { useBiodataStore } from "@/store/useBiodataStore";
import {
  Loader2,
  Upload,
  Paintbrush,
  ArrowLeft,
  Sparkles,
  FileText,
  Palette,
  Layers,
  Image as ImageIcon,
  User,
  Save,
  CheckCircle,
  Eye,
  RefreshCw,
  HelpCircle,
  Settings,
  Plus,
  Maximize2,
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  DollarSign,
  Tag,
  BadgePercent,
  Crown,
  Move,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const KonvaTemplateDesigner = dynamic(
  () => import("./KonvaTemplateDesigner").then(mod => mod.KonvaTemplateDesigner),
  { ssr: false }
);
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
import { Switch } from "@/components/ui/switch";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Slider } from "@/components/ui/slider";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from "@/components/ui/tabs";
import { LANGUAGES, translations } from "@/lib/translations";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { BiodataForm } from "@/components/biodata/BiodataForm";
import { defaultBiodataValues } from "@/lib/default-biodata";
import { processPDFField } from "@/lib/pdf-data-utils";
import type { BiodataFormValues } from "@/types/biodata";
import { useQueryClient } from "@tanstack/react-query";
import { useColorizedFrameImage } from "@/hooks/useColorizedFrameImage";

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
  isPremium?: boolean | null;
  isDefault?: boolean | null;
  price?: number | null;
  discountPrice?: number | null;
  currency?: string | null;
  pdfPrice?: number | null;
  pdfDiscountPrice?: number | null;
  jpgPrice?: number | null;
  jpgDiscountPrice?: number | null;
  pngPrice?: number | null;
  pngDiscountPrice?: number | null;
  comboPrice?: number | null;
  comboDiscountPrice?: number | null;
  previewPhotoUrl?: string | null;
  rawInput?: any;
  religion?: string | null;
  gender?: string | null;
}

interface TemplateFormProps {
  template?: Template | null;
  isEdit?: boolean;
}

import { GRADIENT_PRESETS } from "@/lib/gradient-presets";

const compressAndStorePhoto = (base64Str: string, key: string, callback: (compressed: string) => void) => {
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    const MAX_WIDTH = 300;
    const MAX_HEIGHT = 400;
    let width = img.width;
    let height = img.height;

    if (width > height) {
      if (width > MAX_WIDTH) {
        height *= MAX_WIDTH / width;
        width = MAX_WIDTH;
      }
    } else {
      if (height > MAX_HEIGHT) {
        width *= MAX_HEIGHT / height;
        height = MAX_HEIGHT;
      }
    }
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(img, 0, 0, width, height);
      const compressed = canvas.toDataURL("image/jpeg", 0.7);
      try {
        localStorage.setItem(key, compressed);
      } catch (e) {
        console.warn("Failed to save to localStorage", e);
      }
      callback(compressed);
    }
  };
  img.src = base64Str;
};

const initialFormState = {
  name: "",
  description: "",
  defaultPrimary: "#9B1B30",
  defaultSecondary: "#333333",
  defaultAccent: "#C9A84C",
  defaultPadding: "60",
  defaultYPadding: "",
  defaultFontFamily: "noto",
  defaultFontWeight: "medium",
    defaultAlignment: "center",
  photoX: "390",
  photoY: "100",
  photoWidth: "100",
  photoHeight: "130",
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
  frameUrlTemplate: "",
  thumbnailFile: "",
  bgImageUrl: "",
  bgImageFile: "",
  bgImageX: "0",
  bgImageY: "0",
  bgImageWidth: "350",
  bgImageHeight: "350",
  bgImageOpacity: "0.1",
  defaultPaddingTop: "",
  defaultPaddingRight: "",
  defaultPaddingLeft: "",
  defaultFontSize: "9",
  language: "English",
  detailsLayout: "classic",
  titleShape: "simple",
  imageFrameOffset: "0",
  frameImageX: "0",
  frameImageY: "0",
  frameImageWidth: "595",
  frameImageHeight: "842",
  sectionOffsets: "{}",
  sectionStyles: "{}",
  enableSvgTint: true,
  // Pricing
  isPremium: false,
  isDefault: false,
  price: "",
  discountPrice: "",
  currency: "INR",
  pdfPrice: "",
  pdfDiscountPrice: "",
  jpgPrice: "",
  jpgDiscountPrice: "",
  pngPrice: "",
  pngDiscountPrice: "",
  comboPrice: "",
  comboDiscountPrice: "",
};

export function TemplateForm({ template, isEdit = false }: TemplateFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitLoading, setIsSubmitLoading] = React.useState(false);
  const [formState, setFormState] = React.useState(initialFormState);
  const [isNameGenerating, setIsNameGenerating] = React.useState(false);
  const [isDescGenerating, setIsDescGenerating] = React.useState(false);
  const [isAiFilling, setIsAiFilling] = React.useState(false);
  const [aiGender, setAiGender] = React.useState<"male" | "female" | "both">("male");
  const [aiReligion, setAiReligion] = React.useState("Hindu");
  const [dbBackgrounds, setDbBackgrounds] = React.useState<any[]>([]);
  
  // Admin AI Photo Generator states
  const [adminAiGender, setAdminAiGender] = React.useState<"male" | "female">("male");
  const [adminAiStyle, setAdminAiStyle] = React.useState<"traditional" | "professional">("traditional");
  const [adminAiAge, setAdminAiAge] = React.useState("26");
  const [adminAiReligion, setAdminAiReligion] = React.useState((template as any)?.religion || "Hindu");
  const [isAdminAiGenerating, setIsAdminAiGenerating] = React.useState(false);
  const [adminAiResultUrl, setAdminAiResultUrl] = React.useState("");
  
  // Admin AI Frame Generator states
  const [isAiFrameGenerating, setIsAiFrameGenerating] = React.useState(false);
  const [aiFrameTheme, setAiFrameTheme] = React.useState("floral");
  const [aiFrameColor, setAiFrameColor] = React.useState("gold and white");
  const [aiFramePadding, setAiFramePadding] = React.useState(40);
  const [aiFrameAdditionalPrompt, setAiFrameAdditionalPrompt] = React.useState("");

  const handleAdminGenerateAiFrame = async () => {
    setIsAiFrameGenerating(true);
    try {
      const res = await fetch("/api/generate-frame", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: aiFrameTheme,
          color: aiFrameColor,
          additionalPrompt: aiFrameAdditionalPrompt,
        })
      });
      
      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let streamContent = "";
      let lastUpdateTime = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        streamContent += decoder.decode(value, { stream: true });

        const now = Date.now();
        if (now - lastUpdateTime > 200) {
          lastUpdateTime = now;
          
          let cleanSvg = streamContent.trim();
          cleanSvg = cleanSvg.replace(/^```(svg|xml)?\n?/i, "");
          
          if (cleanSvg.includes("<svg") && !cleanSvg.includes("</svg>")) {
             cleanSvg += "</svg>";
          }
          
          try {
            const innerSvgBase64 = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(cleanSvg)));
            const wrapperSvgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 595 842" width="595" height="842">
  <image href="${innerSvgBase64}" x="0" y="0" width="595" height="842" preserveAspectRatio="xMidYMid slice" />
  <rect x="${aiFramePadding}" y="${aiFramePadding}" width="${595 - 2 * aiFramePadding}" height="${842 - 2 * aiFramePadding}" fill="#ffffff" fill-opacity="0.88" rx="15" />
</svg>`;
            
            setFormState(prev => ({
              ...prev,
              bgImageUrl: "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(wrapperSvgString))),
              bgImageFile: "",
              bgImageX: "0",
              bgImageY: "0",
              bgImageWidth: "595",
              bgImageHeight: "842",
              bgImageOpacity: "1"
            }));
          } catch (e) {
            // Ignore parse errors during stream
          }
        }
      }

      // Final complete parsing
      let finalSvg = streamContent.trim();
      const svgMatch = finalSvg.match(/<svg[\s\S]*<\/svg>/i);
      if (svgMatch) {
        finalSvg = svgMatch[0];
      } else {
        finalSvg = finalSvg.replace(/^```(svg|xml)?\n?/i, "").replace(/\n?```$/i, "");
      }

      const finalInnerSvgBase64 = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(finalSvg)));
      const finalWrapperSvgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 595 842" width="595" height="842">
  <image href="${finalInnerSvgBase64}" x="0" y="0" width="595" height="842" preserveAspectRatio="xMidYMid slice" />
  <rect x="${aiFramePadding}" y="${aiFramePadding}" width="${595 - 2 * aiFramePadding}" height="${842 - 2 * aiFramePadding}" fill="#ffffff" fill-opacity="0.88" rx="15" />
</svg>`;

      setFormState(prev => ({
        ...prev,
        bgImageUrl: "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(finalWrapperSvgString))),
        bgImageFile: "",
        bgImageX: "0",
        bgImageY: "0",
        bgImageWidth: "595",
        bgImageHeight: "842",
        bgImageOpacity: "1"
      }));

      toast.success("✓ AI Background SVG Frame Applied!");
    } catch (err) {
      toast.error("Error generating frame");
    } finally {
      setIsAiFrameGenerating(false);
    }
  };

  const parsedRawInput = React.useMemo(() => {
    if (template?.rawInput) {
      try {
        return typeof template.rawInput === "string" ? JSON.parse(template.rawInput) : template.rawInput;
      } catch (e) {
        return null;
      }
    }
    return null;
  }, [template?.rawInput]);

  const methods = useForm<BiodataFormValues>({
    defaultValues: parsedRawInput || defaultBiodataValues,
  });

  // Preview-only photo – stored locally, never sent to server
  const [previewPhotoFile, setPreviewPhotoFile] = React.useState<string | null>(null);
  const previewPhotoInputRef = React.useRef<HTMLInputElement>(null);
  const designerRef = React.useRef<any>(null);
  const [previewMode, setPreviewMode] = React.useState<"designer" | "svg">("designer");
  const [isDrawerCollapsed, setIsDrawerCollapsed] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("info");

  React.useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 320);
    return () => clearTimeout(timer);
  }, [isDrawerCollapsed, activeTab]);

  const handleDesignerChange = (updatedFields: Partial<typeof formState>) => {
    setFormState(prev => ({
      ...prev,
      ...updatedFields
    }));
  };

  const handlePreviewPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Preview photo must be under 8 MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Str = reader.result as string;
      setPreviewPhotoFile(base64Str);
      if (typeof window !== "undefined") {
        const key = template?.id ? `matrimony_designer_preview_photo_${template.id}` : "matrimony_designer_preview_photo_new";
        compressAndStorePhoto(base64Str, key, (compressed) => {
          setPreviewPhotoFile(compressed);
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadPreview = async () => {
    try {
      let dataUrl: string | null = null;
      const originalMode = previewMode;

      // If we are not in designer mode, temporarily swap so designer is mounted & stage is loaded
      if (originalMode !== "designer") {
        setPreviewMode("designer");
        await new Promise((resolve) => setTimeout(resolve, 350));
      }

      if (designerRef.current?.captureThumbnail) {
        dataUrl = await designerRef.current.captureThumbnail();
      }

      // Restore original preview mode
      if (originalMode !== "designer") {
        setPreviewMode(originalMode);
      }

      if (!dataUrl) {
        toast.error("Failed to capture template preview from designer stage.");
        return;
      }

      // Download the image using file-saver
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const { saveAs } = await import("file-saver");
      const fileName = `${formState.name || "template"}_preview_hq_${Date.now()}.png`;
      saveAs(blob, fileName);
      toast.success("✓ High-Quality template preview downloaded!");
    } catch (err) {
      console.error("Failed to download template preview:", err);
      toast.error("Error generating high quality template preview");
    }
  };

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const key = template?.id ? `matrimony_designer_preview_photo_${template.id}` : "matrimony_designer_preview_photo_new";
      const saved = localStorage.getItem(key);
      if (saved) {
        setPreviewPhotoFile(saved);
      } else if (template?.previewPhotoUrl) {
        setPreviewPhotoFile(template.previewPhotoUrl);
      } else {
        setPreviewPhotoFile(null);
      }
    }
  }, [template?.id, template?.previewPhotoUrl]);

  // Synchronize language state bi-directionally between formState and mock fields (methods) via subscription
  React.useEffect(() => {
    const subscription = methods.watch((value, { name }) => {
      if (name === "language" && value.language && value.language !== formState.language) {
        setFormState(prev => ({ ...prev, language: value.language || "English" }));
      }
    });
    return () => subscription.unsubscribe();
  }, [methods, formState.language]);

  React.useEffect(() => {
    const newLang = formState.language || "English";
    const t = translations[newLang] || translations["English"];
    
    // Sync Hook Form language
    if (methods.getValues("language") !== newLang) {
      methods.setValue("language", newLang);
    }

    // Translate default fields in React Hook Form state
    const currentMantra = methods.getValues("mantra");
    const currentTitle = methods.getValues("title");
    
    // Check if the current mantra or title match the default values of any supported language translation
    const isDefaultMantra = !currentMantra || Object.values(translations).some(trans => trans.mantra === currentMantra);
    const isDefaultTitle = !currentTitle || Object.values(translations).some(trans => trans.title === currentTitle);
    
    if (isDefaultMantra && t.mantra) {
      methods.setValue("mantra", t.mantra, { shouldDirty: true });
    }
    if (isDefaultTitle && t.title) {
      methods.setValue("title", t.title, { shouldDirty: true });
    }

    // Translate other standard default field labels
    const sectionsToTranslate = ["personalDetails", "educationDetails", "familyDetails", "contactDetails"] as const;
    sectionsToTranslate.forEach((section) => {
      const fields = methods.getValues(section);
      if (fields && Array.isArray(fields)) {
        fields.forEach((field, index) => {
          if (field.isDefault && t[field.id]) {
            methods.setValue(`${section}.${index}.label` as any, t[field.id], { shouldDirty: true });
          }
        });
      }
    });
  }, [formState.language, methods]);

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

  // AI Fill: generate realistic dummy biodata via Gemini
  const handleAiFill = async () => {
    setIsAiFilling(true);
    const toastId = toast.loading("🤖 AI is generating realistic biodata...", { duration: 60000 });
    try {
      const fillGender = aiGender === "both" ? "male" : aiGender;
      const res = await fetch("/api/ai-fill-biodata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gender: fillGender, religion: aiReligion, language: methods.getValues("language") || formState.language || "English" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "AI generation failed");

      const d = json.data;

      // Merge AI values into existing field structure (keeps field metadata like options, type, id)
      const mergeValues = (fields: any[], aiObj: Record<string, string>) =>
        fields.map(f => ({ ...f, value: aiObj[f.id] !== undefined ? String(aiObj[f.id]) : f.value }));

      const currentVals = methods.getValues();

      methods.setValue("mantra", d.mantra || currentVals.mantra, { shouldDirty: true });
      methods.setValue("title", d.title || currentVals.title, { shouldDirty: true });
      methods.setValue(
        "personalDetails",
        mergeValues(currentVals.personalDetails, d.personalDetails || {}),
        { shouldDirty: true }
      );
      methods.setValue(
        "educationDetails",
        mergeValues(currentVals.educationDetails, d.educationDetails || {}),
        { shouldDirty: true }
      );
      methods.setValue(
        "familyDetails",
        mergeValues(currentVals.familyDetails, d.familyDetails || {}),
        { shouldDirty: true }
      );
      methods.setValue(
        "contactDetails",
        mergeValues(currentVals.contactDetails, d.contactDetails || {}),
        { shouldDirty: true }
      );

      toast.dismiss(toastId);
      toast.success("✨ AI biodata generated! Preview updated.", { duration: 3000 });
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(err.message || "Failed to generate AI data. Check GEMINI_API_KEY.");
    } finally {
      setIsAiFilling(false);
    }
  };

  const handleAdminGenerateAiPhoto = async () => {
    setIsAdminAiGenerating(true);
    const toastId = toast.loading("🤖 Generating premium preview portrait...", { duration: 60000 });
    try {
      const res = await fetch("/api/generate-portrait", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gender: adminAiGender,
          style: adminAiStyle,
          age: adminAiAge,
          religion: adminAiReligion,
        })
      });
      const data = await res.json();
      toast.dismiss(toastId);
      if (data.success && data.url) {
        setAdminAiResultUrl(data.url);
        toast.success("✨ AI portrait generated!");
      } else {
        toast.error(data.error || "Failed to generate portrait");
      }
    } catch (err) {
      toast.dismiss(toastId);
      console.error("Error generating admin AI photo:", err);
      toast.error("Failed to generate AI photo");
    } finally {
      setIsAdminAiGenerating(false);
    }
  };

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
      const bgConf = template.bgConfig ? (typeof template.bgConfig === "string" ? JSON.parse(template.bgConfig) : template.bgConfig) : null;
      setFormState({
        name: template.name,
        description: template.description || "",
        defaultPrimary: template.defaultPrimary,
        defaultSecondary: template.defaultSecondary,
        defaultAccent: template.defaultAccent,
        defaultPadding: String(template.defaultPadding),
        defaultYPadding: template.defaultYPadding ? String(template.defaultYPadding) : "",
        
        defaultFontFamily: bgConf?.fontFamily || "noto",
        defaultFontWeight: bgConf?.fontWeight || "medium",

        defaultAlignment: bgConf?.alignment || "center",

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
        frameUrlTemplate: template.frameUrlTemplate || "",
        thumbnailFile: "",
        bgImageUrl: bgConf?.url || "",
        bgImageFile: "",
        bgImageX: bgConf ? String(bgConf.x ?? 0) : "0",
        bgImageY: bgConf ? String(bgConf.y ?? 0) : "0",
        bgImageWidth: bgConf ? String(bgConf.width ?? 350) : "350",
        bgImageHeight: bgConf ? String(bgConf.height ?? 350) : "350",
        bgImageOpacity: bgConf ? String(bgConf.opacity ?? 1.0) : "1.0",
        defaultPaddingTop: (template as any).defaultPaddingTop ? String((template as any).defaultPaddingTop) : "",
        defaultPaddingRight: (template as any).defaultPaddingRight ? String((template as any).defaultPaddingRight) : "",
        defaultPaddingLeft: (template as any).defaultPaddingLeft ? String((template as any).defaultPaddingLeft) : "",
        defaultFontSize: (template as any).defaultFontSize ? String((template as any).defaultFontSize) : "9",
        frameImageX: bgConf?.frameImageX ? String(bgConf.frameImageX) : "0",
        frameImageY: bgConf?.frameImageY ? String(bgConf.frameImageY) : "0",
        frameImageWidth: bgConf?.frameImageWidth ? String(bgConf.frameImageWidth) : "595",
        frameImageHeight: bgConf?.frameImageHeight ? String(bgConf.frameImageHeight) : "842",
        imageFrameOffset: bgConf?.imageFrameOffset || "0",
        enableSvgTint: bgConf?.enableSvgTint !== false,
        language: template.language || "English",
        detailsLayout: template.detailsLayout || "classic",
        titleShape: template.titleShape || "simple",
        sectionOffsets: bgConf?.sectionOffsets || "{}",
        sectionStyles: bgConf?.sectionStyles || "{}",
        // Pricing
        isPremium: template.isPremium === true,
        isDefault: (template as any).isDefault === true,
        price: template.price !== null && template.price !== undefined ? String(template.price) : "",
        discountPrice: template.discountPrice !== null && template.discountPrice !== undefined ? String(template.discountPrice) : "",
        currency: template.currency || "INR",
        pdfPrice: (template as any).pdfPrice !== null && (template as any).pdfPrice !== undefined ? String((template as any).pdfPrice) : "",
        pdfDiscountPrice: (template as any).pdfDiscountPrice !== null && (template as any).pdfDiscountPrice !== undefined ? String((template as any).pdfDiscountPrice) : "",
        jpgPrice: (template as any).jpgPrice !== null && (template as any).jpgPrice !== undefined ? String((template as any).jpgPrice) : "",
        jpgDiscountPrice: (template as any).jpgDiscountPrice !== null && (template as any).jpgDiscountPrice !== undefined ? String((template as any).jpgDiscountPrice) : "",
        pngPrice: (template as any).pngPrice !== null && (template as any).pngPrice !== undefined ? String((template as any).pngPrice) : "",
        pngDiscountPrice: (template as any).pngDiscountPrice !== null && (template as any).pngDiscountPrice !== undefined ? String((template as any).pngDiscountPrice) : "",
        comboPrice: (template as any).comboPrice !== null && (template as any).comboPrice !== undefined ? String((template as any).comboPrice) : "",
        comboDiscountPrice: (template as any).comboDiscountPrice !== null && (template as any).comboDiscountPrice !== undefined ? String((template as any).comboDiscountPrice) : "",
      });
      if ((template as any).gender) {
        setAiGender((template as any).gender as "male" | "female" | "both");
      }
      if (template.religion) {
        setAiReligion(template.religion);
      }
    }
  }, [template]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: "frameFile" | "thumbnailFile" | "bgImageFile") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5MB");
      return;
    }

    const allowedExtensions = ["jpg", "jpeg", "png", "webp", "svg"];
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
    if (!allowedExtensions.includes(fileExtension)) {
      toast.error("Invalid file format. Only JPG, JPEG, PNG, WEBP, and SVG are allowed.");
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
        defaultPadding: parseInt(formState.defaultPaddingLeft) || parseInt(formState.defaultPadding) || 60,
        defaultPaddingTop: formState.defaultPaddingTop ? parseInt(formState.defaultPaddingTop) : null,
        defaultPaddingRight: formState.defaultPaddingRight ? parseInt(formState.defaultPaddingRight) : null,
        defaultPaddingLeft: formState.defaultPaddingLeft ? parseInt(formState.defaultPaddingLeft) : null,
        defaultFontSize: formState.defaultFontSize ? parseInt(formState.defaultFontSize) : null,
        defaultYPadding: formState.defaultPaddingTop ? parseInt(formState.defaultPaddingTop) : (formState.defaultYPadding ? parseInt(formState.defaultYPadding) : null),
        photoX: parseInt(formState.photoX) || 390,
        photoY: parseInt(formState.photoY) || 100,
        photoWidth: parseInt(formState.photoWidth) || 100,
        photoHeight: parseInt(formState.photoHeight) || 130,
        photoCornerRadius: parseInt(formState.photoCornerRadius) || 8,
        photoShowBorder: formState.photoShowBorder !== false,
        frameType: formState.frameType,
        frameBgType: formState.frameBgType,
        frameBgColor: formState.frameBgColor,
        frameBgGradientColors: formState.frameBgGradientColors.split(",").map(c => c.trim()),
        language: formState.language,
        detailsLayout: formState.detailsLayout,
        titleShape: formState.titleShape,
        religion: aiReligion,
        gender: aiGender,
        rawInput: methods.getValues(),
        // Pricing
        isPremium: (formState as any).isPremium === true,
        isDefault: (formState as any).isDefault === true,
        currency: (formState as any).currency || "INR",
        pdfPrice: (formState as any).pdfPrice !== "" && (formState as any).pdfPrice !== undefined ? parseFloat((formState as any).pdfPrice) : null,
        pdfDiscountPrice: (formState as any).pdfDiscountPrice !== "" && (formState as any).pdfDiscountPrice !== undefined ? parseFloat((formState as any).pdfDiscountPrice) : null,
        jpgPrice: (formState as any).jpgPrice !== "" && (formState as any).jpgPrice !== undefined ? parseFloat((formState as any).jpgPrice) : null,
        jpgDiscountPrice: (formState as any).jpgDiscountPrice !== "" && (formState as any).jpgDiscountPrice !== undefined ? parseFloat((formState as any).jpgDiscountPrice) : null,
        pngPrice: (formState as any).pngPrice !== "" && (formState as any).pngPrice !== undefined ? parseFloat((formState as any).pngPrice) : null,
        pngDiscountPrice: (formState as any).pngDiscountPrice !== "" && (formState as any).pngDiscountPrice !== undefined ? parseFloat((formState as any).pngDiscountPrice) : null,
        comboPrice: (formState as any).comboPrice !== "" && (formState as any).comboPrice !== undefined ? parseFloat((formState as any).comboPrice) : null,
        comboDiscountPrice: (formState as any).comboDiscountPrice !== "" && (formState as any).comboDiscountPrice !== undefined ? parseFloat((formState as any).comboDiscountPrice) : null,
      };

      // Automatically assign the lowest available general price for store badges
      if (payload.isPremium) {
        const prices = [payload.pdfPrice, payload.jpgPrice, payload.pngPrice, payload.comboPrice].filter(p => typeof p === "number" && !isNaN(p));
        const discountPrices = [payload.pdfDiscountPrice, payload.jpgDiscountPrice, payload.pngDiscountPrice, payload.comboDiscountPrice].filter(p => typeof p === "number" && !isNaN(p));
        
        payload.price = prices.length > 0 ? Math.min(...prices) : null;
        payload.discountPrice = discountPrices.length > 0 ? Math.min(...discountPrices) : null;
      } else {
        payload.price = null;
        payload.discountPrice = null;
      }

      payload.bgConfig = {
        url: formState.bgImageUrl || null,
        file: formState.bgImageFile || null,
        x: parseInt(formState.bgImageX) || 0,
        y: parseInt(formState.bgImageY) || 0,
        width: parseInt(formState.bgImageWidth) || 595,
        height: parseInt(formState.bgImageHeight) || 842,
        opacity: parseFloat(formState.bgImageOpacity) || 1.0,
        fontFamily: formState.defaultFontFamily,
        fontWeight: formState.defaultFontWeight,
        fontSize: parseInt(formState.defaultFontSize) || 9,
        alignment: formState.defaultAlignment,
        sectionOffsets: formState.sectionOffsets || "{}",
        sectionStyles: formState.sectionStyles || "{}",
        imageFrameOffset: formState.imageFrameOffset || "0",
        frameImageX: parseInt(formState.frameImageX) || 0,
        frameImageY: parseInt(formState.frameImageY) || 0,
        frameImageWidth: parseInt(formState.frameImageWidth) || 595,
        frameImageHeight: parseInt(formState.frameImageHeight) || 842,
        enableSvgTint: formState.enableSvgTint,
      };

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
      } else if (formState.frameUrlTemplate) {
        payload.frameUrlTemplate = formState.frameUrlTemplate;
      }

      if (previewPhotoFile && previewPhotoFile.startsWith("data:")) {
        payload.previewPhotoFile = previewPhotoFile;
      } else if (template?.previewPhotoUrl) {
        payload.previewPhotoUrl = template.previewPhotoUrl;
      }

      // If a custom thumbnail was manually uploaded, use it directly. Otherwise, capture automatically.
      if (formState.thumbnailFile) {
        payload.thumbnailFile = formState.thumbnailFile;
      } else {
        try {
          let pngThumbnail: string | null = null;

          // Try to export directly from Konva Stage first for pixel-perfect fidelity
          if (designerRef.current && typeof designerRef.current.captureThumbnail === "function") {
            pngThumbnail = await designerRef.current.captureThumbnail();
          }

          // Fallback to SVG-cloning logic if Konva Stage capture was not successful or unavailable
          if (!pngThumbnail) {
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

              pngThumbnail = await new Promise<string | null>((resolve) => {
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
            }
          }

          if (pngThumbnail) {
            payload.thumbnailFile = pngThumbnail;
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
        if (!isEdit && data.template?.id && typeof window !== "undefined") {
          const tempPhoto = localStorage.getItem("matrimony_designer_preview_photo_new");
          if (tempPhoto) {
            localStorage.setItem(`matrimony_designer_preview_photo_${data.template.id}`, tempPhoto);
          }
        }
        queryClient.invalidateQueries({ queryKey: ["admin", "templates"] });
        if (isEdit && template?.id) {
          queryClient.invalidateQueries({ queryKey: ["admin", "template", template.id] });
        }
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
    <form onSubmit={handleSubmit} className="fixed inset-0 z-50 flex flex-col bg-background text-foreground font-sans overflow-hidden">
      {/* Sleek Canva-style Header Control Bar */}
      <header className="w-full shrink-0 bg-card border-b border-border shadow-md flex flex-col md:flex-row justify-between items-center px-4 md:px-6 py-2 md:py-0 md:h-16 select-none z-30 gap-2">
        <div className="flex items-center justify-between w-full md:w-auto gap-2 md:gap-4">
          <Button
            type="button"
            variant="ghost"
            className="group gap-2 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-full font-medium transition-all flex items-center border border-border shadow-sm shrink-0"
            onClick={() => router.push("/admin/templates")}
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            <span className="font-bold tracking-wide">Exit Studio</span>
          </Button>

          <div className="h-6 w-[1px] bg-border hidden md:block" />

          {/* Interactive Document Title */}
          <div className="flex flex-col items-start min-w-0 flex-1 md:flex-none">
            <input
              type="text"
              value={formState.name}
              onChange={e => setFormState({ ...formState, name: e.target.value })}
              className="bg-transparent border-0 text-xs md:text-sm font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary rounded px-1.5 py-0.5 hover:bg-muted transition-colors w-full md:w-48 truncate"
              placeholder="Template Title"
              title="Click to rename"
            />
            <span className="text-[8px] md:text-[10px] text-primary font-black uppercase tracking-widest px-1.5 truncate">
              Matrimonial Template Builder
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-2 md:gap-3.5">
          <div className="flex items-center gap-1 bg-muted/50 p-0.5 md:p-1 border border-border rounded-full shrink-0">
            <Button
              type="button"
              variant={previewMode === "designer" ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setPreviewMode("designer");
                setTimeout(() => window.dispatchEvent(new Event("resize")), 100);
              }}
              className={cn(
                "text-[9px] md:text-[10.5px] h-6 md:h-7 px-2.5 md:px-4 font-black cursor-pointer rounded-full border-0 transition-all",
                previewMode === "designer"
                  ? "bg-primary text-white shadow-lg"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              🎨 Designer Layer
            </Button>
            <Button
              type="button"
              variant={previewMode === "svg" ? "default" : "ghost"}
              size="sm"
              onClick={() => setPreviewMode("svg")}
              className={cn(
                "text-[9px] md:text-[10.5px] h-6 md:h-7 px-2.5 md:px-4 font-black cursor-pointer rounded-full border-0 transition-all",
                previewMode === "svg"
                  ? "bg-primary text-white shadow-lg"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              📄 High-Fidelity SVG
            </Button>
          </div>

          <div className="h-5 w-[1px] bg-border hidden md:block" />

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownloadPreview}
            className="text-[9px] md:text-[10.5px] h-6 md:h-7 px-2.5 md:px-4 font-black cursor-pointer rounded-full border border-primary/30 text-primary hover:bg-primary/5 transition-all flex items-center gap-1 shrink-0"
            title="Download high quality PNG preview of current design template state"
          >
            <Download className="w-3 h-3 md:w-3.5 md:h-3.5 text-primary" />
            <span>Download HQ</span>
          </Button>



          <Button
            type="submit"
            disabled={isSubmitLoading}
            className="font-black bg-primary text-white hover:bg-primary/95 shadow-lg shadow-primary/20 rounded-full text-[10px] md:text-xs px-3.5 md:px-6 py-2 md:py-2.5 flex items-center gap-1.5 cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 shrink-0"
          >
            {isSubmitLoading ? (
              <>
                <Loader2 className="w-3 h-3 md:w-3.5 md:h-3.5 animate-spin" />
                <span className="hidden sm:inline">Saving...</span>
                <span className="sm:hidden">Save</span>
              </>
            ) : (
              <>
                <Save className="w-3 h-3 md:w-3.5 md:h-3.5" />
                <span>Save</span>
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Full-height workspace content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative bg-background">

        {/* FAR LEFT: Standalone icon toolbar */}
        <div className="flex flex-row lg:flex-col items-center justify-start gap-1.5 p-2 w-full lg:w-[84px] shrink-0 h-auto lg:h-full bg-card border-b lg:border-b-0 lg:border-r border-border shadow-xl select-none z-20 overflow-x-auto overflow-y-hidden lg:overflow-x-hidden lg:overflow-y-auto scrollbar-none">
          {[
            { value: "info",    Icon: FileText,      label: "Info" },
            { value: "fields",  Icon: ClipboardList, label: "Fields" },
            { value: "style",   Icon: Palette,       label: "Style" },
            { value: "frame",   Icon: Layers,        label: "Frame" },
            { value: "photo",   Icon: User,          label: "Photo" },
            { value: "pricing", Icon: DollarSign,    label: "Price" },
          ].map(({ value, Icon, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setActiveTab(value);
                const el = document.getElementById(`tab-trigger-${value}`);
                if (el) el.click();
              }}
              className={cn(
                "flex flex-row lg:flex-col items-center justify-center gap-1.5 py-2 lg:py-4 px-3 lg:px-2 w-auto lg:w-full rounded-xl transition-all duration-300 cursor-pointer border-0 bg-transparent text-xs md:text-sm shrink-0",
                "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                activeTab === value && "bg-primary/10 text-primary font-bold"
              )}
              id={`dock-btn-${value}`}
            >
              <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
              <span className="text-[9px] lg:text-[10px] font-black tracking-wide">{label}</span>
            </button>
          ))}

          {/* Save tab at bottom/right */}
          <button
            type="button"
            onClick={() => {
              setActiveTab("save");
              const el = document.getElementById("tab-trigger-save");
              if (el) el.click();
            }}
            className={cn(
              "flex flex-row lg:flex-col items-center justify-center gap-1.5 py-2 lg:py-4 px-3 lg:px-2 w-auto lg:w-full rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-300 cursor-pointer border-0 bg-transparent mt-0 lg:mt-auto text-xs md:text-sm shrink-0",
              activeTab === "save" && "bg-primary/10 text-primary font-bold"
            )}
          >
            <Save className="w-4 h-4 lg:w-5 lg:h-5" />
            <span className="text-[9px] lg:text-[10px] font-black tracking-wide">Save</span>
          </button>
        </div>

        {/* Sleek Canva-style vertical layout dock */}
        <Tabs defaultValue="info" orientation="vertical" className="flex flex-col lg:flex-row gap-0 flex-1 h-full items-stretch min-w-0">
          
          {/* Hidden TabsList — Radix needs these triggers for state, real UI is the standalone dock above */}
          <TabsList className="hidden">
            <TabsTrigger id="tab-trigger-info"    value="info">Info</TabsTrigger>
            <TabsTrigger id="tab-trigger-fields"  value="fields">Fields</TabsTrigger>
            <TabsTrigger id="tab-trigger-style"   value="style">Style</TabsTrigger>
            <TabsTrigger id="tab-trigger-frame"   value="frame">Frame</TabsTrigger>
            <TabsTrigger id="tab-trigger-photo"   value="photo">Photo</TabsTrigger>
            <TabsTrigger id="tab-trigger-pricing" value="pricing">Price</TabsTrigger>
            <TabsTrigger id="tab-trigger-save"    value="save">Save</TabsTrigger>
          </TabsList>

          {/* MIDDLE COLUMN: Slidable Parameters Panel Drawer */}
          <div className={cn(
            "shrink-0 w-full lg:w-[400px] bg-card border-b lg:border-b-0 lg:border-r border-border flex flex-col z-10 transition-all duration-300 relative",
            isDrawerCollapsed 
              ? "h-0 lg:h-full lg:w-0 overflow-hidden border-b-0 lg:border-r-0" 
              : "h-[45vh] lg:h-full lg:w-[400px]"
          )}>
            {/* Collapse Toggle handle button (floating on edge) */}
            {!isDrawerCollapsed && (
              <button
                type="button"
                onClick={() => setIsDrawerCollapsed(true)}
                className="absolute right-4 lg:-right-3 bottom-2 lg:top-1/2 lg:-translate-y-1/2 z-30 w-12 lg:w-6 h-6 lg:h-12 bg-card border border-border hover:bg-muted hover:text-foreground rounded-t-md lg:rounded-r-md flex items-center justify-center text-muted-foreground cursor-pointer shadow-lg transition-all duration-200"
                title="Collapse Parameters"
              >
                <ChevronLeft className="w-4 h-4 rotate-90 lg:rotate-0" />
              </button>
            )}

            <div className="p-6 pb-4 border-b border-border shrink-0 select-none">
              <h2 className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Settings className="w-4 h-4 text-primary animate-spin" style={{ animationDuration: "12s" }} />
                Parameters Drawer
              </h2>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
                Customize Design Settings
              </p>
            </div>


            <div className="flex-1 overflow-y-auto p-6 pt-4 custom-scrollbar">

                  {/* Tab 1: General Info */}
                  <TabsContent value="info" className="space-y-4 animate-in fade-in duration-200">
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-primary uppercase tracking-wider">1. General Information</h3>
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
                          onValueChange={value => {
                            const lang = value || "English";
                            setFormState({
                              ...formState,
                              language: lang,
                              // Reset to default font when switching away from English
                              defaultFontFamily: lang !== "English" ? "noto" : formState.defaultFontFamily,
                            });
                          }}
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

                      {/* English-only font picker */}
                      {formState.language === "English" && (
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-muted-foreground">
                            Font Family <span className="text-[10px] font-normal text-muted-foreground/60">(English only)</span>
                          </Label>
                          <Select
                            value={formState.defaultFontFamily || "noto"}
                            onValueChange={value => setFormState({ ...formState, defaultFontFamily: value })}
                          >
                            <SelectTrigger className="w-full text-sm rounded-lg focus:ring-primary focus:border-primary bg-background border border-border h-11 px-3">
                              <SelectValue>
                                {(() => {
                                  const f = ENGLISH_FONTS.find(f => f.key === (formState.defaultFontFamily || "noto"));
                                  return f ? (
                                    <span className="flex items-center gap-2">
                                      <span style={{ fontFamily: f.family }} className="text-base font-bold">Aa</span>
                                      <span>{f.label}</span>
                                      <span className="text-[10px] text-muted-foreground ml-auto">{f.category}</span>
                                    </span>
                                  ) : "Select Font";
                                })()}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="bg-card border border-border rounded-lg shadow-md">
                              {ENGLISH_FONTS.map(font => (
                                <SelectItem
                                  key={font.key}
                                  value={font.key}
                                  className="cursor-pointer hover:bg-muted py-2.5 px-3"
                                >
                                  <span className="flex items-center gap-3 w-full">
                                    <span
                                      style={{ fontFamily: font.family }}
                                      className="text-lg font-bold w-8 text-center leading-none"
                                    >
                                      Aa
                                    </span>
                                    <span className="flex flex-col">
                                      <span className="text-sm font-semibold">{font.label}</span>
                                      <span className="text-[10px] text-muted-foreground">{font.category}</span>
                                    </span>
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

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

                      <div className="space-y-1.5 flex flex-col">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="tpl-desc" className="text-xs font-bold text-muted-foreground">Description (WYSIWYG)</Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleGenerateDescription}
                            disabled={isDescGenerating}
                            className="h-6 px-2 text-[10px] rounded-md text-primary hover:text-primary/80 hover:bg-primary/5 cursor-pointer font-bold flex items-center gap-1"
                            title="Stream generate description using Gemini"
                          >
                            {isDescGenerating ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <>
                                <Sparkles className="w-3 h-3" />
                                AI Generate
                              </>
                            )}
                          </Button>
                        </div>
                        <RichTextEditor
                          value={formState.description}
                          onChange={val => setFormState({ ...formState, description: val })}
                          placeholder="e.g. Traditional gold ornaments, crimson borders"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* Tab: Test Fields / Mock Data */}
                  <TabsContent value="fields" className="space-y-4 animate-in fade-in duration-200">
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2 items-center">
                        <h3 className="text-sm font-bold text-primary uppercase tracking-wider flex-1">Test Biodata Fields</h3>

                        {/* AI Fill Controls */}
                        <div className="flex items-center gap-1.5 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-pink-500/10 border border-violet-300/30 rounded-lg px-2 py-1">
                          <Sparkles className="w-3 h-3 text-violet-500 shrink-0" />
                          <select
                            value={aiGender}
                            onChange={e => setAiGender(e.target.value as "male" | "female" | "both")}
                            className="text-[10px] bg-transparent border-0 outline-none cursor-pointer font-semibold text-violet-600 dark:text-violet-400 pr-1"
                            title="Gender"
                          >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="both">Both</option>
                          </select>
                          <span className="text-muted-foreground/50 text-[10px]">·</span>
                          <select
                            value={aiReligion}
                            onChange={e => setAiReligion(e.target.value)}
                            className="text-[10px] bg-transparent border-0 outline-none cursor-pointer font-semibold text-violet-600 dark:text-violet-400 pr-1"
                            title="Religion"
                          >
                            {["Hindu", "Muslim", "Sikh", "Christian", "Jain", "Buddhist", "Other"].map(r => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>
                          <Button
                            type="button"
                            size="sm"
                            disabled={isAiFilling}
                            onClick={handleAiFill}
                            className="h-6 px-2 text-[10px] font-bold cursor-pointer bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white border-0 shadow-sm gap-1"
                          >
                            {isAiFilling ? (
                              <><Loader2 className="w-3 h-3 animate-spin" /> Generating...</>
                            ) : (
                              <><Sparkles className="w-3 h-3" /> AI Fill</>
                            )}
                          </Button>
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => methods.reset(defaultBiodataValues)}
                          className="text-[10px] h-7 px-2 cursor-pointer font-bold"
                        >
                          Reset
                        </Button>
                      </div>
                      
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Fill in dynamic mock data using the same biodata editor form. Your changes will mirror on the canvas live.
                      </p>

                      <div 
                        className="border border-border rounded-xl p-4 bg-muted/5 max-h-[70vh] overflow-y-auto custom-scrollbar"
                        onSubmit={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <FormProvider {...methods}>
                          <BiodataForm asDiv />
                        </FormProvider>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Tab 2: Theme & Colors */}
                  <TabsContent value="style" className="space-y-4 animate-in fade-in duration-200">
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-primary uppercase tracking-wider">2. Theme Styling & Colors</h3>
                      
                      <div className="space-y-3">
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



                      {/* PAGE PADDING & TYPOGRAPHY SECTION */}
                      <div className="space-y-3.5 pt-3 border-t border-border/80">
                        <SliderInput
                          label="Top Padding"
                          id="tpl-padding-top"
                          min={0}
                          max={200}
                          value={formState.defaultPaddingTop || formState.defaultYPadding || formState.defaultPadding || "60"}
                          onChange={val => setFormState({ ...formState, defaultPaddingTop: val })}
                        />
                        <SliderInput
                          label="Left Padding"
                          id="tpl-padding-left"
                          min={0}
                          max={150}
                          value={formState.defaultPaddingLeft || formState.defaultPadding || "60"}
                          onChange={val => setFormState({ ...formState, defaultPaddingLeft: val })}
                        />
                        <SliderInput
                          label="Right Padding"
                          id="tpl-padding-right"
                          min={0}
                          max={150}
                          value={formState.defaultPaddingRight || formState.defaultPadding || "60"}
                          onChange={val => setFormState({ ...formState, defaultPaddingRight: val })}
                        />
                        <SliderInput
                          label="Base Font Size"
                          id="tpl-font-size"
                          min={9}
                          max={24}
                          value={formState.defaultFontSize || "9"}
                          onChange={val => setFormState({ ...formState, defaultFontSize: val })}
                        />
                      </div>
                      {/* Background & Watermark section moved from Back tab */}
                      <div className="pt-4 border-t border-border/80 space-y-4">
                        <div className="space-y-4">
                      <h3 className="text-sm font-bold text-primary uppercase tracking-wider">4. Background & Watermark Graphic</h3>
                      
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

                      {/* Background Color Config */}
                      <div className="border border-border rounded-xl p-4 bg-muted/10 space-y-4">
                        {formState.frameBgType === "solid" ? (
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
                            </div>

                            <div className="space-y-2">
                              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Palette Presets</Label>
                              <div className="flex flex-wrap gap-2 max-h-[140px] overflow-y-auto p-2 border border-border/80 rounded-xl bg-muted/20 shadow-inner">
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
                                          "w-7 h-7 rounded-full border shadow-sm transition-all hover:scale-110 bg-background relative cursor-pointer",
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

                      {/* Watermark Section */}
                      <div className="space-y-3.5 border border-border rounded-xl p-4 bg-muted/10">
                        <h4 className="text-xs font-bold text-foreground">Watermark SVG Graphic</h4>
                        
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-muted-foreground">Select from Backgrounds Library</Label>
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
                            <SelectContent className="bg-card border border-border rounded-lg shadow-md max-h-[200px] overflow-y-auto">
                              <SelectItem value="none" className="cursor-pointer hover:bg-muted py-2 px-3 text-sm"> - None (No Watermark)  -</SelectItem>
                              {dbBackgrounds.map((bg) => (
                                <SelectItem key={bg.id} value={bg.url || ""} className="cursor-pointer hover:bg-muted py-2 px-3 text-sm">
                                  {bg.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="relative flex py-1.5 items-center">
                          <div className="flex-grow border-t border-border/85"></div>
                          <span className="flex-shrink mx-3 text-[9px] text-muted-foreground font-bold uppercase tracking-wider">or upload SVG</span>
                          <div className="flex-grow border-t border-border/85"></div>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-muted-foreground">Upload Custom SVG Watermark</Label>
                          <Input
                            type="file"
                            accept="image/svg+xml"
                            onChange={(e) => handleFileChange(e, "bgImageFile")}
                            className="cursor-pointer focus-visible:ring-primary rounded-lg bg-background text-xs h-9 px-2"
                          />
                          {formState.bgImageUrl && (
                            <p className="text-[10px] text-green-600 font-medium truncate mt-1">
                              ✓ Active: {formState.bgImageUrl.substring(formState.bgImageUrl.lastIndexOf('/') + 1)}
                            </p>
                          )}
                          {formState.bgImageFile && (
                            <p className="text-[10px] text-primary font-bold mt-1">
                              ✓ Custom SVG file uploaded
                            </p>
                          )}
                        </div>

                        {(formState.bgImageUrl || formState.bgImageFile) && (
                          <div className="space-y-3.5 pt-3 border-t border-border/50">
                            <div className="grid grid-cols-2 gap-3">
                              <SliderInput
                                label="Background Width"
                                id="bg-width"
                                min={10}
                                max={1200}
                                value={formState.bgImageWidth || "350"}
                                onChange={(val) => setFormState({ ...formState, bgImageWidth: val })}
                              />
                              <SliderInput
                                label="Background Height"
                                id="bg-height"
                                min={10}
                                max={1200}
                                value={formState.bgImageHeight || "350"}
                                onChange={(val) => setFormState({ ...formState, bgImageHeight: val })}
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <SliderInput
                                label="Background Position X"
                                id="bg-x"
                                min={-500}
                                max={1000}
                                value={formState.bgImageX || "0"}
                                onChange={(val) => setFormState({ ...formState, bgImageX: val })}
                              />
                              <SliderInput
                                label="Background Position Y"
                                id="bg-y"
                                min={-500}
                                max={1200}
                                value={formState.bgImageY || "0"}
                                onChange={(val) => setFormState({ ...formState, bgImageY: val })}
                              />
                            </div>

                            <div className="space-y-1.5 bg-muted/5 border border-border/20 p-2.5 rounded-lg">
                              <div className="flex justify-between items-center">
                                <Label className="text-xs font-bold text-muted-foreground">Background Opacity</Label>
                                <span className="text-[10px] font-mono font-bold text-primary bg-primary/5 px-1.5 py-0.5 rounded">
                                  {(parseFloat(formState.bgImageOpacity) || 0).toFixed(2)}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <Input
                                  type="number"
                                  min={0}
                                  max={1}
                                  step={0.01}
                                  value={formState.bgImageOpacity}
                                  onChange={(e) => setFormState({ ...formState, bgImageOpacity: e.target.value })}
                                  className="w-20 focus-visible:ring-primary rounded-lg text-xs h-8 px-2"
                                />
                                <Slider
                                  value={[parseFloat(formState.bgImageOpacity) || 0]}
                                  min={0}
                                  max={1}
                                  step={0.01}
                                  onValueChange={([val]) => setFormState({ ...formState, bgImageOpacity: String(val) })}
                                  className="flex-1 cursor-pointer py-1"
                                />
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                  designerRef.current?.selectElement("watermark");
                                }}
                                className="flex-1 text-xs h-8 rounded-lg cursor-pointer gap-1.5"
                              >
                                <Move className="w-3.5 h-3.5" />
                                Adjust Watermark
                              </Button>
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
                                  bgImageWidth: "350",
                                  bgImageHeight: "350",
                                  bgImageOpacity: "1.0",
                                })}
                                className="flex-1 text-xs h-8 rounded-lg cursor-pointer"
                              >
                                Clear Watermark
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Tab 3: Frame Decorators */}
                  <TabsContent value="frame" className="space-y-4 animate-in fade-in duration-200">
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-primary uppercase tracking-wider">3. Outer Border Frame Skins</h3>
                      
                      <div className="space-y-3">
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
                      </div>

                      {/* Conditional Frame Fields */}
                      {formState.frameType === "image" && (
                        <div className="space-y-3.5 border border-border rounded-xl p-4 bg-muted/10">
                          <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-muted-foreground">Upload Frame Image File *</Label>
                            <div className="flex flex-col gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => document.getElementById("frame-file-input")?.click()}
                                className="text-xs font-bold gap-1.5 cursor-pointer rounded-lg h-9 w-full"
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
                                <span className="text-xs text-green-600 font-semibold text-center block mt-1">✓ Frame loaded (ready to upload)</span>
                              ) : template?.frameUrlTemplate ? (
                                <span className="text-[10px] text-muted-foreground text-center block truncate mt-1">Current: {template.frameUrlTemplate?.slice(0, 40)}...</span>
                              ) : (
                                <span className="text-xs text-muted-foreground text-center block mt-1">No frame file selected</span>
                              )}
                              {(formState.frameFile || template?.frameUrlTemplate) && (
                                <Button
                                  type="button"
                                  variant="secondary"
                                  onClick={() => {
                                    designerRef.current?.selectElement("frame");
                                  }}
                                  className="text-xs font-bold gap-1.5 cursor-pointer rounded-lg h-9 w-full mt-2"
                                >
                                  <Move className="w-4 h-4" />
                                  Adjust & Stretch Frame on Canvas
                                </Button>
                              )}
                            </div>
                            <p className="text-[10px] text-muted-foreground leading-normal mt-2">
                              Tip: Upload a grayscale/white transparent PNG or an SVG frame.
                            </p>
                          </div>
                        </div>
                      )}

                      {formState.frameType === "image" && (
                        <div className="space-y-4 border border-border rounded-xl p-4 bg-muted/10 mt-4">
                          <SliderInput
                            label="Stretch Frame (px) to hide borders"
                            id="image-frame-offset"
                            min={0}
                            max={60}
                            value={formState.imageFrameOffset}
                            onChange={val => setFormState({ ...formState, imageFrameOffset: val })}
                          />
                          <p className="text-[10px] text-muted-foreground leading-tight">Increase this to stretch downloaded frames past the edges, hiding any built-in transparent borders or watermarks.</p>
                        </div>
                      )}

                      {formState.frameType === "image" && (
                        <div className="flex items-center justify-between border border-border rounded-xl p-4 bg-muted/10 mt-4">
                          <div className="space-y-0.5">
                            <Label htmlFor="enable-svg-tint-switch" className="text-xs font-bold text-foreground">Allow Frame Theme Customization</Label>
                            <p className="text-[10px] text-muted-foreground leading-normal max-w-[280px]">
                              If enabled, the SVG frame's colors will change automatically to match the selected theme colors.
                            </p>
                          </div>
                          <Switch
                            id="enable-svg-tint-switch"
                            checked={formState.enableSvgTint}
                            onCheckedChange={checked => setFormState({ ...formState, enableSvgTint: checked })}
                          />
                        </div>
                      )}



                      {(formState.frameType === "svg" || formState.frameType === "gradient") && (
                        <div className="space-y-4 border border-border rounded-xl p-4 bg-muted/10">
                          <div className="space-y-3">
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
                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
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
                            <div className="space-y-1.5 pt-2 border-t border-border/50">
                              <Label htmlFor="gradient-colors" className="text-xs font-bold text-muted-foreground">Gradient Hex Colors (comma-separated)</Label>
                              <Input
                                id="gradient-colors"
                                type="text"
                                value={formState.frameGradientColors}
                                onChange={e => setFormState({ ...formState, frameGradientColors: e.target.value })}
                                placeholder="e.g. #4F46E5,#06B6D4,#10B981"
                                className="font-mono focus-visible:ring-primary rounded-lg w-full"
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

                      <div className="relative flex py-1.5 items-center mt-4">
                        <div className="flex-grow border-t border-border/85"></div>
                        <span className="flex-shrink mx-3 text-[9px] text-muted-foreground font-bold uppercase tracking-wider">or generate Frame with AI</span>
                        <div className="flex-grow border-t border-border/85"></div>
                      </div>

                      <div className="space-y-3 bg-slate-100/50 dark:bg-slate-900/30 p-3 rounded-lg border border-slate-200/80 dark:border-slate-800/50">
                        <p className="text-[10px] text-slate-600 dark:text-slate-400">
                          Generate beautiful luxury A4 biodata backgrounds using AI:
                        </p>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-[9px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">Theme/Style</Label>
                            <Select
                              value={aiFrameTheme}
                              onValueChange={(val: any) => setAiFrameTheme(val)}
                            >
                              <SelectTrigger className="w-full text-xs rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 h-8 px-2 cursor-pointer">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 rounded-lg shadow-md">
                                <SelectItem value="floral" className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 text-xs">Floral / Nature</SelectItem>
                                <SelectItem value="mandala" className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 text-xs">Royal Mandala</SelectItem>
                                <SelectItem value="minimalist" className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 text-xs">Elegant Minimalist</SelectItem>
                                <SelectItem value="watercolor" className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 text-xs">Soft Watercolor</SelectItem>
                                <SelectItem value="vintage" className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 text-xs">Classic Vintage</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[9px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">Color Palette</Label>
                            <Select
                              value={aiFrameColor}
                              onValueChange={(val: any) => setAiFrameColor(val)}
                            >
                              <SelectTrigger className="w-full text-xs rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 h-8 px-2 cursor-pointer">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 rounded-lg shadow-md">
                                <SelectItem value="gold and white" className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 text-xs">Gold & White</SelectItem>
                                <SelectItem value="rose gold and cream" className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 text-xs">Rose Gold & Cream</SelectItem>
                                <SelectItem value="maroon and gold" className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 text-xs">Maroon & Gold</SelectItem>
                                <SelectItem value="emerald and gold" className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 text-xs">Emerald & Gold</SelectItem>
                                <SelectItem value="navy blue and silver" className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 text-xs">Navy & Silver</SelectItem>
                                <SelectItem value="pastel peach and white" className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 text-xs">Peach & White</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-1 pt-1">
                          <Label className="text-[9px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">Additional Prompt (Optional)</Label>
                          <Textarea
                            value={aiFrameAdditionalPrompt}
                            onChange={(e) => setAiFrameAdditionalPrompt(e.target.value)}
                            placeholder="e.g. Include red roses, peacock feathers, ancient pillars..."
                            className="w-full text-xs min-h-[60px] rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 resize-none p-2"
                          />
                        </div>

                        <div className="space-y-1 pt-1">
                          <div className="flex justify-between items-center">
                            <Label className="text-[9px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">Content Cover Padding (px)</Label>
                            <span className="text-[10px] text-slate-600 font-medium">{aiFramePadding}px</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="150" 
                            value={aiFramePadding} 
                            onChange={(e) => setAiFramePadding(parseInt(e.target.value))}
                            className="w-full accent-emerald-500"
                          />
                          <p className="text-[9px] text-slate-500">Adds a solid white semi-transparent reading area in the center.</p>
                        </div>

                        <Button
                          type="button"
                          onClick={handleAdminGenerateAiFrame}
                          disabled={isAiFrameGenerating}
                          className="w-full h-8 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 text-white font-bold cursor-pointer text-[10.5px] transition-all flex items-center justify-center gap-1.5"
                        >
                          {isAiFrameGenerating ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin text-white" />
                              <span>Generating Frame...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3 h-3 text-white fill-white" />
                              <span>Generate AI Background</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Tab 4: Background & Watermark */}
                  {/* Tab 5: Profile Photo Layout */}
                  <TabsContent value="photo" className="space-y-4 animate-in fade-in duration-200">
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-primary uppercase tracking-wider">5. Profile Photo Frame Coordinates</h3>

                      {/* Test Profile Photo Uploader */}
                      <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/80 dark:bg-slate-950/40 flex flex-col gap-4">
                        <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                          Test Preview Photo (Optional AI Generator)
                        </Label>
                        
                        <div className="flex items-center gap-3">
                          {previewPhotoFile ? (
                            <>
                              <div className="relative w-10 h-12 rounded overflow-hidden border border-primary/30 shrink-0 shadow-sm">
                                <img src={previewPhotoFile} alt="Matrimonial template editor preview test portrait" className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-grow flex flex-col">
                                <p className="text-[10px] font-bold text-green-600 dark:text-green-400">✓ Test Photo Loaded</p>
                                <p className="text-[9px] text-slate-500 dark:text-slate-400">Fills photo frame on stage</p>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setPreviewPhotoFile(null);
                                  if (previewPhotoInputRef.current) previewPhotoInputRef.current.value = "";
                                  if (typeof window !== "undefined") {
                                    const key = template?.id ? `matrimony_designer_preview_photo_${template.id}` : "matrimony_designer_preview_photo_new";
                                    localStorage.removeItem(key);
                                  }
                                }}
                                className="text-[9px] h-7 px-2.5 text-red-500 dark:text-red-400 hover:text-red-600 hover:bg-red-50/50 dark:hover:bg-red-950/20 cursor-pointer"
                              >
                                Remove
                              </Button>
                            </>
                          ) : (
                            <>
                              <div className="w-10 h-12 rounded border border-dashed border-slate-300 dark:border-slate-700 bg-slate-100/40 dark:bg-slate-800/40 flex items-center justify-center shrink-0">
                                <Upload className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                              </div>
                              <div className="flex-grow flex flex-col">
                                <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Upload Test Portrait</p>
                                <p className="text-[9px] text-slate-400 dark:text-slate-500">Test framing & sizing live</p>
                              </div>
                              <Button
                                type="button"
                                onClick={() => previewPhotoInputRef.current?.click()}
                                className="text-[10px] h-7 px-3.5 cursor-pointer font-bold border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 transition-all duration-200"
                              >
                                Browse
                              </Button>
                            </>
                          )}
                        </div>

                        <div className="border-t border-slate-200 dark:border-slate-800 my-1" />

                        {/* Admin AI Portrait Controls */}
                        <div className="space-y-3 bg-slate-100/50 dark:bg-slate-900/30 p-3 rounded-lg border border-slate-200/80 dark:border-slate-800/50">
                          <p className="text-[10px] text-slate-600 dark:text-slate-400">
                            Or generate a free, premium Indian matrimonial passport portrait using Flux:
                          </p>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <Label className="text-[9px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">Gender</Label>
                              <Select
                                value={adminAiGender}
                                onValueChange={(val: any) => setAdminAiGender(val)}
                              >
                                <SelectTrigger className="w-full text-xs rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 h-8 px-2 cursor-pointer">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 rounded-lg shadow-md">
                                  <SelectItem value="male" className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 text-xs">Groom (Male)</SelectItem>
                                  <SelectItem value="female" className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 text-xs">Bride (Female)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-1">
                              <Label className="text-[9px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">Attire Style</Label>
                              <Select
                                value={adminAiStyle}
                                onValueChange={(val: any) => setAdminAiStyle(val)}
                              >
                                <SelectTrigger className="w-full text-xs rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 h-8 px-2 cursor-pointer">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 rounded-lg shadow-md">
                                  <SelectItem value="traditional" className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 text-xs">Traditional</SelectItem>
                                  <SelectItem value="professional" className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 text-xs">Formal Suit</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <Label className="text-[9px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">Target Age</Label>
                              <select
                                value={adminAiAge}
                                onChange={(e) => setAdminAiAge(e.target.value)}
                                className="w-full p-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 font-semibold focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer rounded-lg"
                              >
                                {[22, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35].map(a => (
                                  <option key={a} value={a}>{a} Years Old</option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-1">
                              <Label className="text-[9px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">Religion context</Label>
                              <Select
                                value={adminAiReligion}
                                onValueChange={(val: any) => setAdminAiReligion(val)}
                              >
                                <SelectTrigger className="w-full text-xs rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 h-8 px-2 cursor-pointer">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 rounded-lg shadow-md">
                                  <SelectItem value="Hindu" className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 text-xs">Hindu</SelectItem>
                                  <SelectItem value="Muslim" className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 text-xs">Muslim</SelectItem>
                                  <SelectItem value="Sikh" className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 text-xs">Sikh</SelectItem>
                                  <SelectItem value="Christian" className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 text-xs">Christian</SelectItem>
                                  <SelectItem value="Jain" className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 text-xs">Jain</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <Button
                            type="button"
                            onClick={handleAdminGenerateAiPhoto}
                            disabled={isAdminAiGenerating}
                            className="w-full h-8 rounded-lg bg-gradient-to-r from-pink-500 via-purple-500 to-amber-500 hover:opacity-90 text-white font-bold cursor-pointer text-[10.5px] transition-all flex items-center justify-center gap-1.5"
                          >
                            {isAdminAiGenerating ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin text-white" />
                                <span>Generating Portrait...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3 h-3 text-[#E6C97A] fill-[#E6C97A]" />
                                <span>Generate AI Portrait</span>
                              </>
                            )}
                          </Button>

                          {adminAiResultUrl && (
                            <div className="flex flex-col gap-2.5 mt-2.5 bg-white dark:bg-slate-950 p-2.5 border border-slate-200 dark:border-slate-800 rounded-lg animate-in zoom-in duration-200">
                              <div className="relative aspect-[3/4] w-20 mx-auto rounded overflow-hidden border border-slate-200 dark:border-slate-800">
                                <img src={adminAiResultUrl} alt="Generated AI demo portrait photo" className="w-full h-full object-cover" />
                              </div>
                              <Button
                                type="button"
                                onClick={() => {
                                  setPreviewPhotoFile(adminAiResultUrl);
                                  if (typeof window !== "undefined") {
                                    const key = template?.id ? `matrimony_designer_preview_photo_${template.id}` : "matrimony_designer_preview_photo_new";
                                    localStorage.setItem(key, adminAiResultUrl);
                                  }
                                  setAdminAiResultUrl("");
                                  toast.success("✓ AI portrait set as preview template photo!");
                                }}
                                className="w-full h-7 rounded bg-primary hover:bg-primary/95 text-white font-bold cursor-pointer text-[10px]"
                              >
                                Apply to Template Preview
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-3.5">
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
                        />

                        {/* Photo Border Toggle */}
                        <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3">
                          <div>
                            <p className="text-xs font-bold text-foreground">Show Photo Border</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              Display a coloured border ring around the photo
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
                  </TabsContent>

                  {/* Tab 7: Pricing */}
                  <TabsContent value="pricing" className="space-y-5 animate-in fade-in duration-200">
                    <div className="space-y-5">
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-amber-500" />
                        <h3 className="text-sm font-bold text-primary uppercase tracking-wider">7. Template Pricing</h3>
                      </div>

                      {/* Premium Toggle */}
                      <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-gradient-to-r from-amber-50/60 to-yellow-50/60 dark:from-amber-950/20 dark:to-yellow-950/20">
                        <div className="space-y-0.5">
                          <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            <Crown className="w-3.5 h-3.5 text-amber-500" />
                            Premium Template
                          </Label>
                          <p className="text-[10.5px] text-muted-foreground">Mark this template as premium. Free templates have no price.</p>
                        </div>
                        <Switch
                          id="isPremium-switch"
                          checked={(formState as any).isPremium === true}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              // Auto-fill default values when turned on if they are currently empty
                              setFormState({
                                ...formState,
                                isPremium: true,
                                pdfPrice: (formState as any).pdfPrice || "59",
                                pdfDiscountPrice: (formState as any).pdfDiscountPrice || "39",
                                jpgPrice: (formState as any).jpgPrice || "49",
                                jpgDiscountPrice: (formState as any).jpgDiscountPrice || "29",
                                pngPrice: (formState as any).pngPrice || "49",
                                pngDiscountPrice: (formState as any).pngDiscountPrice || "29",
                                comboPrice: (formState as any).comboPrice || "149",
                                comboDiscountPrice: (formState as any).comboDiscountPrice || "79",
                              } as any);
                            } else {
                              setFormState({ ...formState, isPremium: false } as any);
                            }
                          }}
                          className="data-[state=checked]:bg-amber-500"
                        />
                      </div>

                      {/* Price fields — shown only when isPremium is on */}
                      {(formState as any).isPremium && (
                        <div className="space-y-4 p-4 rounded-xl border border-amber-200/60 dark:border-amber-800/30 bg-muted/30">

                          {/* Currency Selector */}
                          <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-muted-foreground">Currency</Label>
                            <Select
                              value={(formState as any).currency || "INR"}
                              onValueChange={(val) => setFormState({ ...formState, currency: val } as any)}
                            >
                              <SelectTrigger id="currency-select" className="w-full text-sm rounded-lg focus:ring-primary bg-background border border-border h-10 px-3">
                                <SelectValue placeholder="Select Currency" />
                              </SelectTrigger>
                              <SelectContent className="bg-card border border-border rounded-lg shadow-md">
                                <SelectItem value="INR" className="cursor-pointer hover:bg-muted py-2 px-3 text-sm">₹ INR — Indian Rupee</SelectItem>
                                <SelectItem value="USD" className="cursor-pointer hover:bg-muted py-2 px-3 text-sm">$ USD — US Dollar</SelectItem>
                                <SelectItem value="EUR" className="cursor-pointer hover:bg-muted py-2 px-3 text-sm">€ EUR — Euro</SelectItem>
                                <SelectItem value="GBP" className="cursor-pointer hover:bg-muted py-2 px-3 text-sm">£ GBP — British Pound</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {/* Format-Wise Pricing */}
                          <div className="space-y-4 p-4 rounded-xl border border-border bg-background">
                            <div>
                              <Label className="text-xs font-black uppercase tracking-wider text-primary">Format-Wise Pricing</Label>
                              <p className="text-[10px] text-muted-foreground mt-0.5">Define prices for each download format below.</p>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                              {/* PDF Pricing */}
                              <div className="p-4 rounded-lg border border-border bg-muted/20 space-y-4">
                                <span className="text-[11px] font-black text-red-600 dark:text-red-400 uppercase tracking-wide">PDF Document Price Overrides</span>
                                <div className="space-y-3">
                                  <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold text-muted-foreground">Price</Label>
                                    <div className="relative">
                                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                                        {(formState as any).currency === "USD" ? "$" : (formState as any).currency === "EUR" ? "€" : (formState as any).currency === "GBP" ? "£" : "₹"}
                                      </span>
                                      <Input
                                        type="number"
                                        value={(formState as any).pdfPrice}
                                        onChange={(e) => setFormState({ ...formState, pdfPrice: e.target.value } as any)}
                                        placeholder="Default Template Price"
                                        className="pl-7 focus-visible:ring-primary rounded-lg w-full h-10 text-sm"
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold text-muted-foreground">Sale / Discount Price</Label>
                                    <div className="relative">
                                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                                        {(formState as any).currency === "USD" ? "$" : (formState as any).currency === "EUR" ? "€" : (formState as any).currency === "GBP" ? "£" : "₹"}
                                      </span>
                                      <Input
                                        type="number"
                                        value={(formState as any).pdfDiscountPrice}
                                        onChange={(e) => setFormState({ ...formState, pdfDiscountPrice: e.target.value } as any)}
                                        placeholder="Default Template Sale Price"
                                        className="pl-7 focus-visible:ring-primary rounded-lg w-full h-10 text-sm"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* JPG Pricing */}
                              <div className="p-4 rounded-lg border border-border bg-muted/20 space-y-4">
                                <span className="text-[11px] font-black text-green-600 dark:text-green-400 uppercase tracking-wide">JPEG Image Price Overrides</span>
                                <div className="space-y-3">
                                  <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold text-muted-foreground">Price</Label>
                                    <div className="relative">
                                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                                        {(formState as any).currency === "USD" ? "$" : (formState as any).currency === "EUR" ? "€" : (formState as any).currency === "GBP" ? "£" : "₹"}
                                      </span>
                                      <Input
                                        type="number"
                                        value={(formState as any).jpgPrice}
                                        onChange={(e) => setFormState({ ...formState, jpgPrice: e.target.value } as any)}
                                        placeholder="Default Template Price"
                                        className="pl-7 focus-visible:ring-primary rounded-lg w-full h-10 text-sm"
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold text-muted-foreground">Sale / Discount Price</Label>
                                    <div className="relative">
                                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                                        {(formState as any).currency === "USD" ? "$" : (formState as any).currency === "EUR" ? "€" : (formState as any).currency === "GBP" ? "£" : "₹"}
                                      </span>
                                      <Input
                                        type="number"
                                        value={(formState as any).jpgDiscountPrice}
                                        onChange={(e) => setFormState({ ...formState, jpgDiscountPrice: e.target.value } as any)}
                                        placeholder="Default Template Sale Price"
                                        className="pl-7 focus-visible:ring-primary rounded-lg w-full h-10 text-sm"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* PNG Pricing */}
                              <div className="p-4 rounded-lg border border-border bg-muted/20 space-y-4">
                                <span className="text-[11px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-wide">PNG Image Price Overrides</span>
                                <div className="space-y-3">
                                  <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold text-muted-foreground">Price</Label>
                                    <div className="relative">
                                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                                        {(formState as any).currency === "USD" ? "$" : (formState as any).currency === "EUR" ? "€" : (formState as any).currency === "GBP" ? "£" : "₹"}
                                      </span>
                                      <Input
                                        type="number"
                                        value={(formState as any).pngPrice}
                                        onChange={(e) => setFormState({ ...formState, pngPrice: e.target.value } as any)}
                                        placeholder="Default Template Price"
                                        className="pl-7 focus-visible:ring-primary rounded-lg w-full h-10 text-sm"
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold text-muted-foreground">Sale / Discount Price</Label>
                                    <div className="relative">
                                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                                        {(formState as any).currency === "USD" ? "$" : (formState as any).currency === "EUR" ? "€" : (formState as any).currency === "GBP" ? "£" : "₹"}
                                      </span>
                                      <Input
                                        type="number"
                                        value={(formState as any).pngDiscountPrice}
                                        onChange={(e) => setFormState({ ...formState, pngDiscountPrice: e.target.value } as any)}
                                        placeholder="Default Template Sale Price"
                                        className="pl-7 focus-visible:ring-primary rounded-lg w-full h-10 text-sm"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Combo Pack Pricing */}
                              <div className="p-4 rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-500/[0.04] space-y-4">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wide">Combo Pack (All Formats)</span>
                                  <span className="text-[9px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded-full uppercase">PDF + Word + JPEG + PNG</span>
                                </div>
                                <div className="space-y-3">
                                  <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold text-muted-foreground">Original Price</Label>
                                    <div className="relative">
                                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                                        {(formState as any).currency === "USD" ? "$" : (formState as any).currency === "EUR" ? "€" : (formState as any).currency === "GBP" ? "£" : "₹"}
                                      </span>
                                      <Input
                                        type="number"
                                        value={(formState as any).comboPrice}
                                        onChange={(e) => setFormState({ ...formState, comboPrice: e.target.value } as any)}
                                        placeholder="e.g. 199"
                                        className="pl-7 focus-visible:ring-primary rounded-lg w-full h-10 text-sm"
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold text-muted-foreground">Offer Price</Label>
                                    <div className="relative">
                                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                                        {(formState as any).currency === "USD" ? "$" : (formState as any).currency === "EUR" ? "€" : (formState as any).currency === "GBP" ? "£" : "₹"}
                                      </span>
                                      <Input
                                        type="number"
                                        value={(formState as any).comboDiscountPrice}
                                        onChange={(e) => setFormState({ ...formState, comboDiscountPrice: e.target.value } as any)}
                                        placeholder="e.g. 79"
                                        className="pl-7 focus-visible:ring-primary rounded-lg w-full h-10 text-sm"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Free Template Info */}
                      {!(formState as any).isPremium && (
                        <div className="flex gap-3 items-center border border-border rounded-xl p-4 bg-muted/20">
                          <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-600 font-black text-sm shrink-0">FREE</div>
                          <div className="space-y-0.5">
                            <p className="text-xs font-bold text-foreground">Free Template</p>
                            <p className="text-[10.5px] text-muted-foreground">This template will be available to all users at no cost. Toggle Premium above to add pricing.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Tab 8: Template Thumbnail & Actions */}
                  <TabsContent value="save" className="space-y-4 animate-in fade-in duration-200">
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-primary uppercase tracking-wider">6. Save Matrimonial Template</h3>

                      {/* Default Template Switch */}
                      <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30">
                        <div className="space-y-0.5">
                          <Label className="text-xs font-bold text-foreground">Default Template</Label>
                          <p className="text-[10.5px] text-muted-foreground">Make this the default template loaded when users open the editor.</p>
                        </div>
                        <Switch
                          id="isDefault-switch"
                          checked={(formState as any).isDefault === true}
                          onCheckedChange={(checked) => setFormState({ ...formState, isDefault: checked } as any)}
                        />
                      </div>

                      {/* Smart Auto-Thumbnail */}
                      <div className="flex gap-3 items-center border border-primary/20 rounded-xl p-4 bg-primary/5">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-base font-bold shrink-0">✨</div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-primary">Smart Auto-Thumbnail Active</p>
                          <p className="text-[10.5px] text-muted-foreground leading-relaxed">
                            The designer automatically captures and generates an exact vector layout thumbnail upon saving. To override it, select a custom file below.
                          </p>
                        </div>
                      </div>

                      {/* Custom Upload */}
                      <div className="space-y-2.5 p-4 border border-border rounded-xl bg-muted/10">
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
                              className="text-xs gap-1.5 h-9 cursor-pointer hover:bg-muted w-full"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              Choose Custom Cover Image
                            </Button>
                          </div>
                          
                          {formState.thumbnailFile && (
                            <div className="text-center">
                              <span className="text-xs text-green-600 font-semibold block mb-1">✓ Custom image loaded</span>
                              <div className="relative w-24 mx-auto aspect-[3/4] border border-primary/30 rounded-lg overflow-hidden bg-muted shadow-sm">
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
                            </div>
                          )}

                          {!formState.thumbnailFile && template?.thumbnailUrl && (
                            <div className="space-y-1 text-center mt-1">
                              <p className="text-[10px] text-muted-foreground">Current active thumbnail in database:</p>
                              <div className="relative w-24 mx-auto aspect-[3/4] border border-border rounded-lg overflow-hidden bg-muted shadow-sm">
                                <img
                                  src={template.thumbnailUrl}
                                  alt="Current active template thumbnail image"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Submit Action Buttons */}
                      <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => router.push("/admin/templates")}
                          disabled={isSubmitLoading}
                          className="cursor-pointer rounded-lg flex-1 text-xs"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={isSubmitLoading}
                          className="font-bold cursor-pointer rounded-lg flex-1 text-xs"
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

                    </div>
                  </TabsContent>
            </div>
          </div>

          {/* RIGHT COLUMN: Spacious Canva-style premium design workspace canvas board */}
          <div className="flex-grow h-full bg-background relative flex flex-col z-10">
            
            {/* Checkered pattern design sheet canvas wrapper */}
            <div className="flex-1 relative flex items-center justify-center bg-muted/20 overflow-hidden">
              
              {/* Floating collapse toggle when drawer is closed */}
              {isDrawerCollapsed && (
                <button
                  type="button"
                  onClick={() => {
                    setIsDrawerCollapsed(false);
                    setTimeout(() => window.dispatchEvent(new Event("resize")), 100);
                  }}
                  className="absolute left-1/2 lg:left-4 -translate-x-1/2 lg:translate-x-0 top-4 lg:top-1/2 lg:-translate-y-1/2 z-30 w-16 lg:w-8 h-8 lg:h-16 bg-card border border-border hover:bg-muted hover:text-foreground rounded-2xl flex items-center justify-center text-muted-foreground cursor-pointer shadow-2xl transition-all duration-200"
                  title="Expand Parameters"
                >
                  <ChevronRight className="w-5 h-5 text-primary animate-pulse -rotate-90 lg:rotate-0" />
                </button>
              )}
              
              {/* Premium engineering grid background - adapts to dark/light theme */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.12] dark:opacity-[0.16]" style={{
                backgroundImage: `
                  linear-gradient(to right, currentColor 1px, transparent 1px),
                  linear-gradient(to bottom, currentColor 1px, transparent 1px)
                `,
                backgroundSize: "24px 24px"
              }} />

              {/* The absolute centered designer canvas aspect container */}
              <div className={cn(
                "transition-all duration-300 relative flex items-center justify-center",
                previewMode === "designer"
                  ? "w-full h-full"
                  : "h-full aspect-[595/842] max-h-full max-w-full shadow-2xl bg-white border border-border"
              )}>
                <OptimizedPreviewArea
                  control={methods.control}
                  formState={formState}
                  handleDesignerChange={handleDesignerChange}
                  previewPhotoFile={previewPhotoFile}
                  template={template}
                  designerRef={designerRef}
                  previewMode={previewMode}
                />
              </div>

            </div>

            <input
              ref={previewPhotoInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
              onChange={handlePreviewPhotoChange}
            />

          </div>

        </Tabs>
      </div>
    </form>
  );
}

interface OptimizedPreviewAreaProps {
  control: any;
  formState: any;
  handleDesignerChange: any;
  previewPhotoFile: any;
  template: any;
  designerRef: any;
  previewMode: "designer" | "svg";
}

function OptimizedPreviewArea({
  control,
  formState,
  handleDesignerChange,
  previewPhotoFile,
  template,
  designerRef,
  previewMode,
}: OptimizedPreviewAreaProps) {
  // Watch necessary preview fields in an isolated manner
  const watchPersonal = useWatch({ control, name: "personalDetails" });
  const watchEducation = useWatch({ control, name: "educationDetails" });
  const watchFamily = useWatch({ control, name: "familyDetails" });
  const watchContact = useWatch({ control, name: "contactDetails" });
  const watchMantra = useWatch({ control, name: "mantra" });
  const watchTitle = useWatch({ control, name: "title" });
  const watchLanguage = useWatch({ control, name: "language" });

  // Use a debounced local state so that fast typing inside inputs does not cause any lag
  const [debouncedValues, setDebouncedValues] = React.useState<any>({
    personalDetails: watchPersonal,
    educationDetails: watchEducation,
    familyDetails: watchFamily,
    contactDetails: watchContact,
    mantra: watchMantra,
    title: watchTitle,
    language: watchLanguage,
  });

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValues({
        personalDetails: watchPersonal,
        educationDetails: watchEducation,
        familyDetails: watchFamily,
        contactDetails: watchContact,
        mantra: watchMantra,
        title: watchTitle,
        language: watchLanguage,
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [watchPersonal, watchEducation, watchFamily, watchContact, watchMantra, watchTitle, watchLanguage]);

  const currentLang = formState.language || "English";
  const t = translations[currentLang] || translations["English"];

  const getDummyVal = (id: string, defaultVal: string) => {
    const dummies: Record<string, Record<string, string>> = {
      "English": {
        "fullName": "Rahul Anil Sharma",
        "dateOfBirth": "15 October 1995",
        "timeOfBirth": "10:15 AM",
        "placeOfBirth": "Mumbai, Maharashtra",
        "height": "5 ft 10 in",
        "education": "B.Tech in Computer Science",
        "occupation": "Senior Software Engineer",
        "annualIncome": "₹ 28,00,000 PA",
        "fatherName": "Mr. Anil Kumar Sharma",
        "motherName": "Mrs. Sunita Sharma",
        "nativePlace": "Pune, Maharashtra",
        "mobileNumber": "+91 98765 43210",
        "email": "rahul.sharma@example.com",
        "maritalStatus": "Single",
        "bloodGroup": "B+",
        "complexion": "Fair",
        "religion": "Hindu",
        "caste": "Sharma",
        "gotra": "Bharadwaja",
        "rashi": "Mesh (Aries)",
        "nakshatra": "Ashwini",
        "manglik": "No",
        "college": "IIT Bombay",
        "companyName": "Google Inc",
        "fatherOccupation": "Business",
        "motherOccupation": "Homemaker",
        "totalBrothers": "1",
        "totalSisters": "0",
        "residentialAddress": "Flat 402, Royal Residency, Andheri West, Mumbai",
      },
      "हिंदी": {
        "fullName": "राहुल अनिल शर्मा",
        "dateOfBirth": "15 अक्टूबर 1995",
        "timeOfBirth": "10:15 AM",
        "placeOfBirth": "मुंबई, महाराष्ट्र",
        "height": "5 फीट 10 इंच",
        "education": "बी.टेक कंप्यूटर साइंस",
        "occupation": "वरिष्ठ सॉफ्टवेयर इंजीनियर",
        "annualIncome": "₹ 28,00,000 प्रति वर्ष",
        "fatherName": "श्री अनिल कुमार शर्मा",
        "motherName": "श्रीमती सुनीता शर्मा",
        "nativePlace": "पुणे, महाराष्ट्र",
        "mobileNumber": "+91 98765 43210",
        "email": "rahul.sharma@example.com",
        "maritalStatus": "अविवाहित",
        "bloodGroup": "B+",
        "complexion": "गोरा",
        "religion": "हिंदू",
        "caste": "शर्मा",
        "gotra": "भारद्वाज",
        "rashi": "मेष",
        "nakshatra": "अश्विनी",
        "manglik": "नहीं",
        "college": "आईआईटी बॉम्बे",
        "companyName": "गूगल",
        "fatherOccupation": "व्यवसाय",
        "motherOccupation": "गृहणी",
        "totalBrothers": "1",
        "totalSisters": "0",
        "residentialAddress": "फ्लैट 402, रॉयल रेजीडेंसी, अंधेरी वेस्ट, मुंबई",
      },
      "मराठी": {
        "fullName": "राहुल अनिल शर्मा",
        "dateOfBirth": "15 ऑक्टोबर 1995",
        "timeOfBirth": "10:15 AM",
        "placeOfBirth": "मुंबई, महाराष्ट्र",
        "height": "5 फूट 10 इंच",
        "education": "बी.टेक संगणक शास्त्र",
        "occupation": "वरिष्ठ सॉफ्टवेअर इंजिनिअर",
        "annualIncome": "₹ 28,00,000 प्रति वर्ष",
        "fatherName": "श्री अनिल कुमार शर्मा",
        "motherName": "श्रीमती सुनीता शर्मा",
        "nativePlace": "पुणे, महाराष्ट्र",
        "mobileNumber": "+91 98765 43210",
        "email": "rahul.sharma@example.com",
        "maritalStatus": "अविवाहित",
        "bloodGroup": "B+",
        "complexion": "गोरा",
        "religion": "हिंदू",
        "caste": "शर्मा",
        "gotra": "भारद्वाज",
        "rashi": "मेष",
        "nakshatra": "अश्विनी",
        "manglik": "नाही",
        "college": "आयआयटी मुंबई",
        "companyName": "गुगल",
        "fatherOccupation": "व्यवसाय",
        "motherOccupation": "गृहिणी",
        "totalBrothers": "1",
        "totalSisters": "0",
        "residentialAddress": "फ्लॅट 402, रॉयल रेसिडेन्सी, अंधेरी वेस्ट, मुंबई",
      },
      "ગુજરાતી": {
        "fullName": "રાહુલ અનિલ શર્મા",
        "dateOfBirth": "15 ઓક્ટોબર 1995",
        "timeOfBirth": "10:15 AM",
        "placeOfBirth": "મુંબઈ, મહારાષ્ટ્ર",
        "height": "5 ફૂટ 10 ઇંચ",
        "education": "બી.ટેક કમ્પ્યુટર સાયન્સ",
        "occupation": "સીનિયર સોફ્ટવેર એન્જિનિયર",
        "annualIncome": "₹ 28,00,000 પ્રતિ વર્ષ",
        "fatherName": "શ્રી અનિલ કુમાર શર્મા",
        "motherName": "શ્રીમતી સુનીતા શર્મા",
        "nativePlace": "પુણે, મહારાષ્ટ્ર",
        "mobileNumber": "+91 98765 43210",
        "email": "rahul.sharma@example.com",
        "maritalStatus": "અપરિણીત",
        "bloodGroup": "B+",
        "complexion": "ગોરો",
        "religion": "હિન્દુ",
        "caste": "શર્મા",
        "gotra": "ભારદ્વાજ",
        "rashi": "મેષ",
        "nakshatra": "અશ્વિની",
        "manglik": "ના",
        "college": "આઈઆઈટી બોમ્બે",
        "companyName": "ગુગલ",
        "fatherOccupation": "વ્યવસાય",
        "motherOccupation": "ગૃહિણી",
        "totalBrothers": "1",
        "totalSisters": "0",
        "residentialAddress": "ફ્લેટ 402, રોયલ રેસીડેન્સી, અંધેરી વેસ્ટ, મુંબઈ",
      },
      "বাংলা": {
        "fullName": "রাহুল অনিল শর্মা",
        "dateOfBirth": "15 অক্টোবর ১৯৯৫",
        "timeOfBirth": "10:15 AM",
        "placeOfBirth": "মুম্বাই, মহারাষ্ট্র",
        "height": "5 ফুট 10 ইঞ্চি",
        "education": "বি.টেক কম্পিউটার সায়েন্স",
        "occupation": "সিনিয়র সফটওয়্যার ইঞ্জিনিয়ার",
        "annualIncome": "₹ 28,00,000 প্রতি বছর",
        "fatherName": "শ্রী অনিল কুমার শর্মা",
        "motherName": "শ্রীমতী সুনীতা শর্মা",
        "nativePlace": "পুনে, বাংলা",
        "mobileNumber": "+91 98765 43210",
        "email": "rahul.sharma@example.com",
        "maritalStatus": "অবিবাহিত",
        "bloodGroup": "B+",
        "complexion": "ফর্সা",
        "religion": "हिंदू",
        "caste": "শর্মা",
        "gotra": "ভরদ্বাজ",
        "rashi": "মেষ",
        "nakshatra": "অশ্বিনী",
        "manglik": "না",
        "college": "আইআইটি বোম্বে",
        "companyName": "গুগল",
        "fatherOccupation": "ব্যবসা",
        "motherOccupation": "गृहणी",
        "totalBrothers": "1",
        "totalSisters": "0",
        "residentialAddress": "ফ্ল্যাট ৪০২, রয়্যাল রেসিডেন্সি, আন্ধেরি ওয়েস্ট, মুম্বাই",
      },
      "தமிழ்": {
        "fullName": "ராகுல் அனில் சர்மா",
        "dateOfBirth": "15 அக்டோபர் 1995",
        "timeOfBirth": "முற்பகல் 10:15",
        "placeOfBirth": "மும்பை, மகாராஷ்டிரா",
        "height": "5 அடி 10 அங்குலம்",
        "education": "பி.டெக் கணினி அறிவியல்",
        "occupation": "மூத்த மென்பொருள் பொறியாளர்",
        "annualIncome": "₹ 28,00,000 ஆண்டுக்கு",
        "fatherName": "திரு. அனில் குமார் சர்மா",
        "motherName": "திருமதி. சுனிதா சர்மா",
        "nativePlace": "புனே, மகாராஷ்டிரா",
        "mobileNumber": "+91 98765 43210",
        "email": "rahul.sharma@example.com",
        "maritalStatus": "திருமணமாகாதவர்",
        "bloodGroup": "B+",
        "complexion": "சிகப்பு",
        "religion": "இந்து",
        "caste": "சர்மா",
        "gotra": "பாரத்வாஜ்",
        "rashi": "மேஷம்",
        "nakshatra": "அஸ்வினி",
        "manglik": "இல்லை",
        "college": "ஐஐடி பம்பாய்",
        "companyName": "கூகிள்",
        "fatherOccupation": "தொழில்",
        "motherOccupation": "இல்லத்தரசி",
        "totalBrothers": "1",
        "totalSisters": "0",
        "residentialAddress": "பிளாட் 402, ராயல் ரெசிடென்சி, அந்தேரி மேற்கு, மும்பை",
      },
      "తెలుగు": {
        "fullName": "రాహుల్ అనిల్ శర్మ",
        "dateOfBirth": "15 అక్టోబర్ 1995",
        "timeOfBirth": "ఉదయం 10:15",
        "placeOfBirth": "ముంబై, మహారాష్ట్ర",
        "height": "5 అడుగుల 10 అంగుళాలు",
        "education": "బి.టెక్ కంప్యూటర్ సైన్స్",
        "occupation": "సీనియర్ సాఫ్ట్‌వేర్ ఇంజనీర్",
        "annualIncome": "₹ 28,00,000 సంవత్సరానికి",
        "fatherName": "శ్రీ అనిల్ కుమార్ శర్మ",
        "motherName": "శ్రీమతి సునీత శర్మ",
        "nativePlace": "పూణే, మహారాష్ట్ర",
        "mobileNumber": "+91 98765 43210",
        "email": "rahul.sharma@example.com",
        "maritalStatus": "అవివాహితుడు",
        "bloodGroup": "B+",
        "complexion": "తెలుపు",
        "religion": "హిందూ",
        "caste": "శర్మ",
        "gotra": "భారద్వాజ",
        "rashi": "మేషం",
        "nakshatra": "అశ్విని",
        "manglik": "లేదు",
        "college": "ఐఐటి బాంబే",
        "companyName": "గూగుల్",
        "fatherOccupation": "వ్యాపారం",
        "motherOccupation": "గృహిణి",
        "totalBrothers": "1",
        "totalSisters": "0",
        "residentialAddress": "ఫ్లాట్ 402, రాయల్ రెసిడెన్సీ, అంధేరి వెస్ట్, ముంబై",
      },
      "ಕನ್ನಡ": {
        "fullName": "ರಾಹುಲ್ ಅನಿಲ್ ಶರ್ಮ",
        "dateOfBirth": "15 ಅಕ್ಟೋಬರ್ 1995",
        "timeOfBirth": "ಬೆಳಿಗ್ಗೆ 10:15",
        "placeOfBirth": "ಮುಂಬೈ, ಮಹಾರಾಷ್ಟ್ರ",
        "height": "5 ಅಡಿ 10 ಇಂಚು",
        "education": "ಬಿ.ಟೆಕ್ ಕಂಪ್ಯೂಟರ್ ಸೈನ್ಸ್",
        "occupation": "ಹಿರಿಯ ಸಾಫ್ಟ್‌ವೇರ್ ಎಂಜಿನಿಯರ್",
        "annualIncome": "₹ 28,00,000 ವಾರ್ಷಿಕ",
        "fatherName": "ಶ್ರೀ ಅನಿಲ್ ಕುಮาร์ ಶರ್ಮ",
        "motherName": "ಶ್ರೀಮತಿ ಸುನೀತ ಶರ್ಮ",
        "nativePlace": "ಪುಣೆ, ಮಹಾರಾಷ್ಟ್ರ",
        "mobileNumber": "+91 98765 43210",
        "email": "rahul.sharma@example.com",
        "maritalStatus": "ಅವಿವಾಹಿತ",
        "bloodGroup": "B+",
        "complexion": "ಗೌರವರ್ಣ",
        "religion": "ಹಿಂದೂ",
        "caste": "ಶರ್ಮ",
        "gotra": "ಭರದ್ವಾಜ",
        "rashi": "ಮೇಷ",
        "nakshatra": "ಅಶ್ವಿನಿ",
        "manglik": "ಇಲ್ಲ",
        "college": "ಐ意ಟಿ ಮುಂಬೈ",
        "companyName": "ಗೂಗಲ್",
        "fatherOccupation": "ವ್ಯವಸಾಯ",
        "motherOccupation": "ಗೃಹಿಣಿ",
        "totalBrothers": "1",
        "totalSisters": "0",
        "residentialAddress": "ಫ್ಲಾಟ್ 402, ರಾಯಲ್ ರೆಸಿಡೆನ್ಸಿ, ಅಂಧೇರಿ ವೆಸ್ಟ್, ಮುಂಬೈ",
      },
      "Urdu": {
        "fullName": "راہول انیل شرما",
        "dateOfBirth": "15 اکتوبر 1995",
        "timeOfBirth": "10:15 صبح",
        "placeOfBirth": "ممبئی، مہاراشٹر",
        "height": "5 فٹ 10 انچ",
        "education": "بی ٹیک کمپیوٹر سائنس",
        "occupation": "سینئر سافٹ ویئر انجینئر",
        "annualIncome": "₹ 28,00,000 سالانہ",
        "fatherName": "جناب انیلکمار شرما",
        "motherName": "محترمہ سنیتا شرما",
        "nativePlace": "پونے، مہاراشٹر",
        "mobileNumber": "+91 98765 43210",
        "email": "rahul.sharma@example.com",
        "maritalStatus": "غیر شادی شدہ",
        "bloodGroup": "B+",
        "complexion": "گورا",
        "religion": "ہندو",
        "caste": "شرما",
        "gotra": "بھاردواج",
        "rashi": "میش",
        "nakshatra": "اشونی",
        "manglik": "نہیں",
        "college": "آئی آئی ٹی بمبئی",
        "companyName": "گوگل",
        "fatherOccupation": "کاروبار",
        "motherOccupation": "گھریلو خاتون",
        "totalBrothers": "1",
        "totalSisters": "0",
        "residentialAddress": "فلیٹ 402، رائل ریزیڈنسی، اندھیری ویسٹ, ممبئی",
      }
    };
    return dummies[currentLang]?.[id] || dummies["English"][id] || "";
  };

  const mockSections = React.useMemo(() => {
    const renderSectionData = (key: string, title: string, fields: any[]) => {
      if (!fields || fields.length === 0) return null;

      // Merge empty user inputs with beautiful mock values so that sections don't vanish!
      const filledFields = fields.map(f => {
        const dummyVal = getDummyVal(f.id, "");
        return {
          ...f,
          value: f.value !== undefined && f.value !== "" ? f.value : dummyVal
        };
      });

      const processedFields = filledFields
        .map(f => processPDFField(f, filledFields, debouncedValues, t))
        .filter(f => !f.shouldSkip && f.displayValue && f.displayValue !== "Not Specified");

      return { key, title, fields: processedFields };
    };

    return [
      renderSectionData("personal", t.personal || "Personal Details", debouncedValues.personalDetails || []),
      renderSectionData("educationSec", t.educationSec || "Education & Career", debouncedValues.educationDetails || []),
      renderSectionData("family", t.family || "Family Details", debouncedValues.familyDetails || []),
      renderSectionData("contact", t.contact || "Contact Details", debouncedValues.contactDetails || []),
    ].filter(Boolean) as any[];
  }, [
    currentLang,
    debouncedValues.personalDetails,
    debouncedValues.educationDetails,
    debouncedValues.familyDetails,
    debouncedValues.contactDetails,
  ]);

  const currentPreviewMantra = debouncedValues.mantra === defaultBiodataValues.mantra 
    ? (translations[currentLang]?.mantra || debouncedValues.mantra) 
    : debouncedValues.mantra;
    
  const currentPreviewTitle = debouncedValues.title === defaultBiodataValues.title 
    ? (translations[currentLang]?.title || debouncedValues.title) 
    : debouncedValues.title;

  const stickers = useBiodataStore(s => s.formData?.stickers);
  const mantraSticker = stickers?.find(s => s.isMantra);
  const mantraSignUrl = getClientImageUrl(mantraSticker?.type) || null;

  return previewMode === "designer" ? (
    <>
      <KonvaTemplateDesigner
        formState={formState}
        onChange={handleDesignerChange}
        previewPhotoFile={previewPhotoFile}
        template={template}
        designerRef={designerRef}
        sections={mockSections}
        mantra={currentPreviewMantra}
        title={currentPreviewTitle}
        mantraSignUrl={mantraSignUrl}
      />
      <div style={{ position: "absolute", left: "-9999px", top: "-9999px", width: "595px", height: "842px", opacity: 0, pointerEvents: "none" }}>
        <TemplateSvgPreview
          formState={formState}
          template={template}
          previewPhotoFile={previewPhotoFile}
          sections={mockSections}
          mantra={currentPreviewMantra}
          title={currentPreviewTitle}
          mantraSignUrl={mantraSignUrl}
        />
      </div>
    </>
  ) : (
    <TemplateSvgPreview
      formState={formState}
      template={template}
      previewPhotoFile={previewPhotoFile}
      sections={mockSections}
      mantra={currentPreviewMantra}
      title={currentPreviewTitle}
      mantraSignUrl={mantraSignUrl}
    />
  );
}

function TemplateSvgPreview({
  formState,
  template,
  previewPhotoFile,
  sections: propSections,
  mantra,
  title,
  mantraSignUrl,
}: {
  formState: typeof initialFormState;
  template: Template | null | undefined;
  previewPhotoFile?: string | null;
  sections?: any[];
  mantra?: string;
  title?: string;
  mantraSignUrl?: string | null;
}) {
  const A4_W = 595;
  const A4_H = 842;

  const px = parseFloat(formState.photoX) || 390;
  const py = parseFloat(formState.photoY) || 100;
  const pw = parseFloat(formState.photoWidth) || 100;
  const ph = parseFloat(formState.photoHeight) || 130;
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

    const getNum = (val: any, fallback: number) => {
    if (val === undefined || val === null || val === "") return fallback;
    const n = parseFloat(val);
    return isNaN(n) ? fallback : n;
  };

  const basePad = getNum(formState.defaultPadding, 60);
  const baseYPad = getNum(formState.defaultYPadding, basePad);

  const paddingTop = getNum(formState.defaultPaddingTop, baseYPad);
  const paddingLeft = getNum(formState.defaultPaddingLeft, basePad);
  const paddingRight = getNum(formState.defaultPaddingRight, basePad);

  // Parse gradient colors safely
  const gradientColors = formState.frameGradientColors
    ? formState.frameGradientColors.split(",").map(c => c.trim())
    : ["#4F46E5", "#06B6D4"];

  const bgGradientColors = formState.frameBgGradientColors
    ? formState.frameBgGradientColors.split(",").map(c => c.trim())
    : ["#ffffff", "#f9e8e8"];

  // Use the stored frame URL as-is — no tint injection
  let frameImageSrc = formState.frameFile || template?.frameUrlTemplate || null;

  // Use the colorization hook to get a tinted SVG data URL in SVG preview
  const tintedFrameImage = useColorizedFrameImage(
    frameImageSrc,
    "",
    formState.enableSvgTint ? primaryColor : "",
    "",
    formState.enableSvgTint ? accentColor : ""
  );

  // Mirrored state parsing from designer
  const sectionOffsets = React.useMemo(() => {
    try { return JSON.parse(formState.sectionOffsets || "{}"); } catch { return {}; }
  }, [formState.sectionOffsets]);

  const sectionStyles = React.useMemo(() => {
    try { return JSON.parse(formState.sectionStyles || "{}"); } catch { return {}; }
  }, [formState.sectionStyles]);

  const currentLang = formState.language || "English";
  const t = translations[currentLang] || translations["English"];

  // Pre-load the selected English font so SVG <text> elements render correctly
  const [fontTick, setFontTick] = React.useState(0);
  React.useEffect(() => {
    const fontKey = formState.defaultFontFamily || "noto";
    const fontDef = ENGLISH_FONTS.find(f => f.key === fontKey);
    if (fontDef && currentLang === "English") {
      import("@/lib/konva-fonts").then(({ loadKonvaFonts }) => {
        loadKonvaFonts([fontDef.family])
          .then(() => setFontTick(t => t + 1))
          .catch(() => {});
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState.defaultFontFamily, currentLang]);


  const sections = React.useMemo(() => {
    if (propSections && propSections.length > 0) {
      return propSections;
    }
    const lang = formState.language || "English";
    const getDummyVal = (key: string, defaultVal: string) => {
      const dummies: Record<string, Record<string, string>> = {
        "English": {
          "p1": "Rahul Anil Sharma",
          "p2": "15 October 1995",
          "p3": "10:15 AM",
          "p4": "Mumbai, Maharashtra",
          "p5": "5 ft 10 in",
          "e1": "B.Tech in Computer Science",
          "e2": "Senior Software Engineer",
          "e3": "₹ 28,00,000 PA",
          "f1": "Mr. Anil Kumar Sharma",
          "f2": "Mrs. Sunita Sharma",
          "f3": "Pune, Maharashtra",
          "c1": "+91 98765 43210",
          "c2": "rahul.sharma@example.com",
        },
        "हिंदी": {
          "p1": "राहुल अनिल शर्मा",
          "p2": "15 अक्टूबर 1995",
          "p3": "10:15 AM",
          "p4": "मुंबई, महाराष्ट्र",
          "p5": "5 फीट 10 इंच",
          "e1": "बी.टेक कंप्यूटर साइंस",
          "e2": "वरिष्ठ सॉफ्टवेयर इंजीनियर",
          "e3": "₹ 28,00,000 प्रति वर्ष",
          "f1": "श्री अनिल कुमार शर्मा",
          "f2": "श्रीमती सुनीता शर्मा",
          "f3": "पुणे, महाराष्ट्र",
          "c1": "+91 98765 43210",
          "c2": "rahul.sharma@example.com",
        },
        "मराठी": {
          "p1": "राहुल अनिल शर्मा",
          "p2": "15 ऑक्टोबर 1995",
          "p3": "10:15 AM",
          "p4": "मुंबई, महाराष्ट्र",
          "p5": "5 फूट 10 इंच",
          "e1": "बी.टेक संगणक शास्त्र",
          "e2": "वरिष्ठ सॉफ्टवेअर इंजिनिअर",
          "e3": "₹ 28,00,000 प्रति वर्ष",
          "f1": "श्री अनिल कुमार शर्मा",
          "f2": "श्रीमती सुनीता शर्मा",
          "f3": "पुणे, महाराष्ट्र",
          "c1": "+91 98765 43210",
          "c2": "rahul.sharma@example.com",
        },
        "ગુજરાતી": {
          "p1": "રાહુલ અનિલ શર્મા",
          "p2": "15 ઓક્ટોબર 1995",
          "p3": "10:15 AM",
          "p4": "મુંબઈ, મહારાષ્ટ્ર",
          "p5": "5 ફૂટ 10 ઇંચ",
          "e1": "બી.ટેક કમ્પ્યુટર સાયન્સ",
          "e2": "સીનિયર સોફ્ટવેર એન્જિનિયર",
          "e3": "₹ 28,00,000 પ્રતિ વર્ષ",
          "f1": "શ્રી અનિલ કુમાર શર્મા",
          "f2": "શ્રીમતી સુનીતા શર્મા",
          "f3": "પુણે, મહારાષ્ટ્ર",
          "c1": "+91 98765 43210",
          "c2": "rahul.sharma@example.com",
        },
        "বাংলা": {
          "p1": "রাহুল অনিল শর্মা",
          "p2": "15 অক্টোবর ১৯৯৫",
          "p3": "10:15 AM",
          "p4": "মুম্বাই, মহারাষ্ট্র",
          "p5": "5 ফুট 10 ইঞ্চি",
          "e1": "বি.টেক কম্পিউটার সায়েন্স",
          "e2": "সিনিয়র সফটওয়্যার ইঞ্জিনিয়ার",
          "e3": "₹ 28,00,000 প্রতি বছর",
          "f1": "শ্রী অনিল কুমার শর্মা",
          "f2": "শ্রীমতী সুনীতা শর্মা",
          "f3": "পুনে, महाराष्ट्र",
          "c1": "+91 98765 43210",
          "c2": "rahul.sharma@example.com",
        },
        "தமிழ்": {
          "p1": "ராகுல் அனில் சர்மா",
          "p2": "15 அக்டோபர் 1995",
          "p3": "முற்பகல் 10:15",
          "p4": "மும்பை, மகாராஷ்டிரா",
          "p5": "5 அடி 10 அங்குலம்",
          "e1": "பி.டெக் கணினி அறிவியல்",
          "e2": "மூத்த மென்பொருள் பொறியாளர்",
          "e3": "₹ 28,00,000 ஆண்டுக்கு",
          "f1": "திரு. அனில் குமார் சர்மா",
          "f2": "திருமதி. சுனிதா சர்மா",
          "f3": "புனே, மகாராஷ்டிரா",
          "c1": "+91 98765 43210",
          "c2": "rahul.sharma@example.com",
        },
        "తెలుగు": {
          "p1": "రాహుల్ అనిల్ శర్మ",
          "p2": "15 అక్టోబర్ 1995",
          "p3": "ఉదయం 10:15",
          "p4": "ముంబై, మహారాష్ట్ర",
          "p5": "5 అడుగుల 10 అంగుళాలు",
          "e1": "బి.టెక్ కంప్యూటర్ సైన్స్",
          "e2": "సీనియర్ సాఫ్ట్‌వేర్ ఇంజనీర్",
          "e3": "₹ 28,00,000 సంవత్సరానికి",
          "f1": "శ్రీ అనిల్ కుమార్ శర్మ",
          "f2": "శ్రీమతి సునీత శర్మ",
          "f3": "పూణే, మహారాష్ట్ర",
          "c1": "+91 98765 43210",
          "c2": "rahul.sharma@example.com",
        },
        "ಕನ್ನಡ": {
          "p1": "ರಾಹುಲ್ ಅನಿಲ್ ಶರ್ಮ",
          "p2": "15 ಅಕ್ಟೋಬರ್ 1995",
          "p3": "ಬೆಳಿಗ್ಗೆ 10:15",
          "p4": "ಮುಂಬೈ, ಮುಂಬಯಿ",
          "p5": "5 ಅಡಿ 10 ಇಂಚು",
          "e1": "ಬಿ.ಟೆಕ್ ಕಂಪ್ಯೂಟರ್ ಸೈನ್ಸ್",
          "e2": "ಹಿರಿಯ ಸಾಫ್ಟ್‌ವೇರ್ ಎಂಜಿನಿಯರ್",
          "e3": "₹ 28,00,000 ವಾರ್ಷಿಕ",
          "f1": "ಶ್ರೀ ಅನಿಲ್ ಕುಮาร์ ಶರ್ಮ",
          "f2": "ಶ್ರೀಮತಿ ಸುನೀತ ಶರ್ಮ",
          "f3": "ಪುಣೆ, ಮಹಾರಾಷ್ಟ್ರ",
          "c1": "+91 98765 43210",
          "c2": "rahul.sharma@example.com",
        },
        "ਪੰਜਾਬੀ": {
          "p1": "ਰਾਹੁਲ ਅਨਿਲ ਸ਼ਰਮਾ",
          "p2": "15 ਅਕਤੂਬਰ 1995",
          "p3": "ਸਵੇਰੇ 10:15",
          "p4": "ਮੁੰਬਈ, ਮਹਾਰਾਸ਼ਟਰ",
          "p5": "5 ਫੁੱਟ 10 ਇੰਚ",
          "e1": "ਬੀ.ਟੈਕ ਕੰਪਿਊਟਰ ਸਾਇੰਸ",
          "e2": "ਸੀਨੀਅਰ ਸਾਫਟਵੇਅਰ ਇੰਜੀਨੀਅਰ",
          "e3": "₹ 28,00,000 ਸਾਲਾਨਾ",
          "f1": "ਸ਼੍ਰੀ ਅਨਿਲ ਕੁਮਾਰ ਸ਼ਰਮਾ",
          "f2": "ਸ਼੍ਰੀਮਤੀ ਸੁਨੀਤਾ ਸ਼ਰਮਾ",
          "f3": "ਪੁਣੇ, ਮਹਾਰਾਸ਼ਟਰ",
          "c1": "+91 98765 43210",
          "c2": "rahul.sharma@example.com",
        },
        "Urdu": {
          "p1": "راہول انیل شرما",
          "p2": "15 اکتوبر 1995",
          "p3": "10:15 صبح",
          "p4": "ممبئی، مہاراشٹر",
          "p5": "5 فٹ 10 انچ",
          "e1": "بی ٹیک کمپیوٹر سائنس",
          "e2": "سینئر سافٹ ویئر انجینئر",
          "e3": "₹ 28,00,000 سالانہ",
          "f1": "جناب انیل کمار شرما",
          "f2": "محترمہ سنیتا شرما",
          "f3": "پونے، مہاراشٹر",
          "c1": "+91 98765 43210",
          "c2": "rahul.sharma@example.com",
        }
      };
      return dummies[lang]?.[key] || dummies["English"][key] || defaultVal;
    };

    return [
      {
        key: "personal",
        title: t.personal || "Personal Details",
        fields: [
          { id: "p1", displayLabel: t.fullName || "Full Name", displayValue: getDummyVal("p1", "Rahul Anil Sharma") },
          { id: "p2", displayLabel: t.dateOfBirth || "Date of Birth", displayValue: getDummyVal("p2", "15 October 1995") },
          { id: "p3", displayLabel: t.timeOfBirth || "Time of Birth", displayValue: getDummyVal("p3", "10:15 AM") },
          { id: "p4", displayLabel: t.placeOfBirth || "Place of Birth", displayValue: getDummyVal("p4", "Mumbai, Maharashtra") },
          { id: "p5", displayLabel: t.height || "Height", displayValue: getDummyVal("p5", "5 ft 10 in") },
        ],
      },
      {
        key: "educationSec",
        title: t.educationSec || "Education & Career",
        fields: [
          { id: "e1", displayLabel: t.education || "Education", displayValue: getDummyVal("e1", "B.Tech in Computer Science") },
          { id: "e2", displayLabel: t.occupation || "Occupation", displayValue: getDummyVal("e2", "Senior Software Engineer") },
          { id: "e3", displayLabel: t.annualIncome || "Annual Income", displayValue: getDummyVal("e3", "₹ 28,00,000 PA") },
        ],
      },
      {
        key: "family",
        title: t.family || "Family Background",
        fields: [
          { id: "f1", displayLabel: t.fatherName || "Father's Name", displayValue: getDummyVal("f1", "Mr. Anil Kumar Sharma") },
          { id: "f2", displayLabel: t.motherName || "Mother's Name", displayValue: getDummyVal("f2", "Mrs. Sunita Sharma") },
          { id: "f3", displayLabel: t.nativePlace || "Native Place", displayValue: getDummyVal("f3", "Pune, Maharashtra") },
        ],
      },
      {
        key: "contact",
        title: t.contact || "Contact Details",
        fields: [
          { id: "c1", displayLabel: t.mobile || "Mobile", displayValue: getDummyVal("c1", "+91 98765 43210") },
          { id: "c2", displayLabel: t.email || "Email", displayValue: getDummyVal("c2", "rahul.sharma@example.com") },
        ],
      },
    ];
  }, [t, propSections, formState.language]);

  const layout = React.useMemo(() => {
    const MANTRA_STICKER_EXTRA = mantraSignUrl ? 50 : 0;
    let cursorY = paddingTop + 20 + MANTRA_STICKER_EXTRA;
    const baseFontSize = getNum(formState.defaultFontSize, 9);
    
    // Header mantra & document title space offset
    cursorY += baseFontSize * 2; // Mantra
    if (title) {
      cursorY += baseFontSize * 2.8; // Title
    }


    const LABEL_WIDTH = 130;
    const COLON_WIDTH = 20;
    const LINE_SPACING = baseFontSize * 0.5 + 2;
    const contentWidth = A4_W - paddingLeft - paddingRight - 10;
    const sectionLayouts: any[] = [];

    sections.forEach((sec, secIdx) => {
      const secKey = `sec-${secIdx}`;
      const style = sectionStyles[secKey] || {};
      const secFontSize = style.fontSize ? Number(style.fontSize) : baseFontSize;
      const secLineSpacing = secFontSize * 0.5 + 2;

      const titleY = cursorY;
      cursorY += Math.round(secFontSize * 1.4) + secLineSpacing + 16;
      const fieldLayouts: any[] = [];

      let i = 0;
      while (i < sec.fields.length) {
        const field = sec.fields[i];
        const valText = String(field.displayValue);

        let rowWidth = contentWidth;
        if (
          cursorY >= py - 15 &&
          cursorY <= py + ph + 15
        ) {
          rowWidth = px - paddingLeft - 20; // Flow text left of photo area
        }

        const isTwoCol = formState.detailsLayout === "two-column";
        const nextField = sec.fields[i + 1];
        const canPair =
          isTwoCol &&
          nextField &&
          valText.length < 16 &&
          field.displayLabel.length < 13 &&
          nextField.displayValue.length < 16 &&
          nextField.displayLabel.length < 13 &&
          !(
            cursorY >= py - 15 &&
            cursorY <= py + ph + 15
          );

        if (canPair) {
          const halfW = (rowWidth - 12) / 2;
          const labelW = Math.round(halfW * 0.45);
          const valueW = halfW - labelW - 10;

          fieldLayouts.push({
            id: field.id,
            label: field.displayLabel,
            value: valText,
            y: cursorY,
            availableWidth: valueW,
            isHalf: true,
            colIndex: 0,
            halfW,
            labelW,
          });

          fieldLayouts.push({
            id: nextField.id,
            label: nextField.displayLabel,
            value: String(nextField.displayValue),
            y: cursorY,
            availableWidth: valueW,
            isHalf: true,
            colIndex: 1,
            halfW,
            labelW,
          });

          cursorY += secFontSize * 1.35 + secLineSpacing;
          i += 2;
        } else {
          const valueW = rowWidth - LABEL_WIDTH - COLON_WIDTH;
          const valW = valText.length * secFontSize * 0.6;
          const lines = Math.ceil(valW / valueW) || 1;
          const rowHeight = Math.max(secFontSize, lines * secFontSize * 1.1);

          fieldLayouts.push({
            id: field.id,
            label: field.displayLabel,
            value: valText,
            y: cursorY,
            availableWidth: valueW,
            isHalf: false,
          });
          cursorY += rowHeight + secLineSpacing;
          i += 1;
        }
      }

      sectionLayouts.push({
        key: sec.key,
        titleText: sec.title,
        titleY,
        fields: fieldLayouts,
      });
      cursorY += secFontSize * 1.5;
    });

    return { sectionLayouts, fSize: baseFontSize };
  }, [sections, paddingTop, paddingLeft, paddingRight, formState.defaultFontSize, formState.detailsLayout, px, py, ph, sectionStyles, title, mantraSignUrl]);



  const headerOffset = sectionOffsets["header"] || { x: 0, y: 0 };

  // Resolve the selected font family name for SVG preview text elements
  const svgFontFamily = ENGLISH_FONTS.find(f => f.key === (formState.defaultFontFamily || "noto"))?.family ?? "serif";

  return (
    <svg
      key={`${svgFontFamily}-${fontTick}`}
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

      {(() => {
        const src = formState.bgImageFile || formState.bgImageUrl;
        if (!src) return null;
        return (
          <image
            href={src}
            x={parseFloat(formState.bgImageX) || 0}
            y={parseFloat(formState.bgImageY) || 0}
            width={parseFloat(formState.bgImageWidth) || 595}
            height={parseFloat(formState.bgImageHeight) || 842}
            opacity={parseFloat(formState.bgImageOpacity) ?? 1.0}
            preserveAspectRatio="none"
          />
        );
      })()}

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

      {formState.frameType === "image" && frameImageSrc && (() => {
        // Fallback to offset if older template, but prefer new absolute values
        const offset = parseInt(formState.imageFrameOffset) || 0;
        const fallbackX = -offset;
        const fallbackY = -offset;
        const fallbackW = 595 + (offset * 2);
        const fallbackH = 842 + (offset * 2);
        
        const isDefault = formState.frameImageX === "0" && formState.frameImageY === "0" && formState.frameImageWidth === "595" && formState.frameImageHeight === "842";
        
        const x = isDefault && offset !== 0 ? fallbackX : (parseInt(formState.frameImageX) || fallbackX);
        const y = isDefault && offset !== 0 ? fallbackY : (parseInt(formState.frameImageY) || fallbackY);
        const width = isDefault && offset !== 0 ? fallbackW : (parseInt(formState.frameImageWidth) || fallbackW);
        const height = isDefault && offset !== 0 ? fallbackH : (parseInt(formState.frameImageHeight) || fallbackH);
        
        const finalFrameSrc = (tintedFrameImage && tintedFrameImage.src) ? tintedFrameImage.src : (frameImageSrc || "");

        return (
          <g>
            {/* Render active PNG/SVG image frame overlay scaled and tinted via SVG styling */}
            <image
              href={finalFrameSrc}
              x={x}
              y={y}
              width={width}
              height={height}
              preserveAspectRatio="none"
              style={{ filter: `drop-shadow(0px 0px 1px ${primaryColor})` }}
            />
          </g>
        );
      })()}

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

      {/* Decorative Mantra Header and title */}
      <g transform={`translate(${headerOffset.x}, ${headerOffset.y})`}>
        {(() => {
          const align = sectionStyles["header"]?.textAlign || "center";
          const textX = align === "left"
            ? 30
            : align === "right"
              ? A4_W - 30
              : A4_W / 2;
          const textAnchor = align === "left" ? "start" : align === "right" ? "end" : "middle";

          return (
            <text
              x={textX}
              y={paddingTop + 10 + (mantraSignUrl ? 50 : 0) + layout.fSize * 1.2}
              fill={primaryColor}
              fontSize={layout.fSize * 1.2}
              fontWeight="bold"
              fontFamily={svgFontFamily}
              textAnchor={textAnchor}
            >
              {mantra || (currentLang === "हिंदी" ? "॥ श्री गणेशाय नमः ॥" : "|| Shree Ganeshay Namah ||")}
            </text>
          );
        })()}
        
        {mantraSignUrl && (
          <image
            x={(A4_W - 45) / 2}
            y={paddingTop + 10}
            width="45"
            height="45"
            href={mantraSignUrl}
          />
        )}
        
        {/* Title Rendering */}
        {title && (() => {
          const titleY = paddingTop + 10 + (mantraSignUrl ? 50 : 0) + layout.fSize * 2;
          const titleHeight = layout.fSize * 2;
          const titleVal = title;
          const align = sectionStyles["header"]?.textAlign || "center";
          const textX = align === "left" ? 30 : align === "right" ? A4_W - 30 : A4_W / 2;
          const textAnchor = align === "left" ? "start" : align === "right" ? "end" : "middle";

          if (formState.titleShape === "ribbon") {
            const titleLen = titleVal.length;
            const ribbonW = Math.min(Math.max(titleLen * layout.fSize * 1.05 + 60, 180), A4_W - 60);
            const ribbonH = layout.fSize * 2.8;
            const ribbonX = (A4_W - ribbonW) / 2;
            const ribbonY = titleY - 4;
            const ribbonTextX = ribbonX + ribbonW / 2;

            return (
              <g>
                <rect
                  x={ribbonX}
                  y={ribbonY}
                  width={ribbonW}
                  height={ribbonH}
                  fill={primaryColor}
                  rx="6"
                  ry="6"
                  stroke={accentColor || primaryColor}
                  strokeWidth="2"
                />
                <text
                  x={ribbonTextX}
                  y={ribbonY + (ribbonH - titleHeight) / 2 + layout.fSize * 1.8}
                  fill="#ffffff"
                  fontSize={layout.fSize * 1.8}
                  fontWeight="bold"
                  fontFamily={svgFontFamily}
                  textAnchor="middle"
                >
                  {titleVal}
                </text>
              </g>
            );
          } else if (formState.titleShape === "arch") {
            return (
              <g>
                <path
                  d={`M ${A4_W / 2 - 120},${titleY - 8} C ${A4_W / 2 - 80},${titleY - 24} ${A4_W / 2 - 30},${titleY - 30} ${A4_W / 2},${titleY - 30} C ${A4_W / 2 + 30},${titleY - 30} ${A4_W / 2 + 80},${titleY - 24} ${A4_W / 2 + 120},${titleY - 8}`}
                  stroke={accentColor || primaryColor}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />
                <text
                  x={A4_W / 2}
                  y={titleY + layout.fSize * 2}
                  fill={primaryColor}
                  fontSize={layout.fSize * 2}
                  fontWeight="bold"
                  fontFamily={svgFontFamily}
                  textAnchor="middle"
                >
                  {titleVal}
                </text>
              </g>
            );
          } else if (formState.titleShape === "ornament") {
            return (
              <g>
                <text
                  x={A4_W / 2}
                  y={titleY + layout.fSize * 2}
                  fill={primaryColor}
                  fontSize={layout.fSize * 2}
                  fontWeight="bold"
                  fontFamily={svgFontFamily}
                  textAnchor="middle"
                >
                  {titleVal}
                </text>
                <line
                  x1={A4_W / 2 - 90}
                  y1={titleY + titleHeight + 4}
                  x2={A4_W / 2 + 90}
                  y2={titleY + titleHeight + 4}
                  stroke={accentColor || primaryColor}
                  strokeWidth="1.5"
                />
              </g>
            );
          } else {
            return (
              <text
                x={textX}
                y={titleY + layout.fSize * 2}
                fill={primaryColor}
                fontSize={layout.fSize * 2.2}
                fontWeight="bold"
                fontFamily={svgFontFamily}
                textAnchor={textAnchor}
              >
                {titleVal}
              </text>
            );
          }
        })()}
      </g>

      {/* Profile Photo Area */}
      <g>
        {/* Accent outer glow border */}
        {formState.photoShowBorder !== false && (
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
        )}
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
        {formState.photoShowBorder !== false && (
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
        )}
      </g>

      {/* Details sections */}
      {layout.sectionLayouts.map((sec: any, secIdx: number) => {
        const secKey = sec.key || `sec-${secIdx}`;
        const offset = sectionOffsets[secKey] || sectionOffsets[`sec-${secIdx}`] || { x: 0, y: 0 };
        const style = sectionStyles[secKey] || sectionStyles[`sec-${secIdx}`] || {};
        const titleColor = style.titleColor || primaryColor;
        const fieldColor = style.fieldColor || secondaryColor;
        const fSize = style.fontSize ? Number(style.fontSize) : layout.fSize;
        const fontStyle = style.fontStyle || "bold";
        const textTransform = style.textTransform || "none";
        const applyTransform = (text: string) => {
          if (textTransform === "uppercase") return text.toUpperCase();
          if (textTransform === "lowercase") return text.toLowerCase();
          if (textTransform === "capitalize") return text.replace(/\b\w/g, c => c.toUpperCase());
          return text;
        };

        return (
          <g key={secKey} transform={`translate(${offset.x}, ${offset.y})`}>
            {/* Modern Boxed Card Background */}
            {formState.detailsLayout === "modern-boxed" && (() => {
              const lastField = sec.fields[sec.fields.length - 1];
              const boxHeight = lastField ? (lastField.y + fSize * 1.45 - sec.titleY + 12) : 50;
              return (
                <rect
                  x={paddingLeft - 8}
                  y={sec.titleY - 8}
                  width={A4_W - paddingLeft - paddingRight + 16}
                  height={boxHeight}
                  fill={titleColor + "06"}
                  stroke={titleColor + "1a"}
                  strokeWidth="1.2"
                  rx="10"
                  ry="10"
                />
              );
            })()}

              {/* Section Header Underline Decoration */}
              {(() => {
                const align = style.textAlign || "left";
                let x1, x2;
                const barY = sec.titleY + Math.round(fSize * 1.4) + 8;
                if (align === "center") {
                  const mid = A4_W / 2;
                  x1 = mid - 10;
                  x2 = mid + 10;
                } else if (align === "right") {
                  const end = A4_W - paddingRight;
                  x1 = end - 20;
                  x2 = end;
                } else {
                  x1 = paddingLeft;
                  x2 = paddingLeft + 20;
                }
                return (
                  <line
                    x1={x1}
                    y1={barY}
                    x2={x2}
                    y2={barY}
                    stroke={accentColor || titleColor}
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                );
              })()}
              {(() => {
                const align = style.textAlign || "left";
                const textX = align === "left" ? paddingLeft : align === "right" ? A4_W - paddingRight : A4_W / 2;
                const textAnchor = align === "left" ? "start" : align === "right" ? "end" : "middle";

                return (
                  <text
                    x={textX}
                    y={sec.titleY + 2 + Math.round(fSize * 1.4)}
                    fill={titleColor}
                    fontSize={Math.round(fSize * 1.4)}
                    fontWeight={fontStyle === "bold" ? "bold" : "normal"}
                    fontFamily={svgFontFamily}
                    textAnchor={textAnchor}
                  >
                    {applyTransform(sec.titleText)}
                  </text>
                );
              })()}

              {/* Section Fields */}
              {sec.fields.map((field: any) => {
                const colX = field.isHalf 
                  ? (field.colIndex === 0 
                      ? (paddingLeft + 10) 
                      : (paddingLeft + 10 + field.halfW + 10))
                  : (paddingLeft + 10);
                const lblW = field.isHalf ? field.labelW : 130;
                const valX = colX + lblW + 15;
                const colonX = colX + lblW + 5;

                const align = style.textAlign || "left";

                if (align === "center" || align === "right") {
                  const fullText = `${applyTransform(field.label)}: ${applyTransform(field.value)}`;
                  const targetX = field.isHalf
                    ? (align === "right" ? colX + field.halfW : colX + field.halfW / 2)
                    : (align === "right" ? A4_W - paddingRight - 10 : A4_W / 2);
                  const textAnchor = align === "right" ? "end" : "middle";
                  return (
                    <g key={field.id}>
                      <text
                        x={targetX}
                        y={field.y + fSize}
                        fill={fieldColor}
                        fontSize={fSize}
                        fontWeight={fontStyle === "bold" ? "bold" : "normal"}
                        fontFamily={svgFontFamily}
                        textAnchor={textAnchor}
                      >
                        {fullText}
                      </text>
                    </g>
                  );
                }

                return (
                  <g key={field.id}>
                    <text
                      x={colX}
                      y={field.y + fSize}
                      fill={fieldColor}
                      fontSize={fSize}
                      fontWeight={fontStyle === "bold" ? "bold" : "normal"}
                      fontFamily={svgFontFamily}
                    >
                      {applyTransform(field.label)}
                    </text>
                    <text
                      x={colonX}
                      y={field.y + fSize}
                      fill={fieldColor}
                      fontSize={fSize}
                      fontFamily={svgFontFamily}
                    >
                      :
                    </text>
                    <text
                      x={valX}
                      y={field.y + fSize}
                      width={field.availableWidth}
                      fill={fieldColor}
                      fontSize={fSize}
                      fontWeight="bold"
                      fontFamily={svgFontFamily}
                    >
                      {applyTransform(field.value)}
                    </text>

                    {/* Elegant Divider underline */}
                    {formState.detailsLayout === "elegant-divided" && (!field.isHalf || field.colIndex === 1) && (
                      <line
                        x1={colX}
                        y1={field.y + fSize * 1.35 + 2}
                        x2={colX + (field.isHalf ? field.halfW : (A4_W - paddingLeft - paddingRight - 20))}
                        y2={field.y + fSize * 1.35 + 2}
                        stroke={fieldColor + "15"}
                        strokeWidth="0.8"
                        strokeDasharray="2, 2"
                      />
                    )}
                  </g>
                );
              })}
          </g>
        );
      })}

      {/* Decorative footer elements */}
      <line x1={paddingLeft - 15} y1={842 - paddingTop - 10} x2={595 - paddingRight + 15} y2={842 - paddingTop - 10} stroke={primaryColor} strokeWidth="0.5" opacity="0.3" />
      
      {/* Bottom watermark branding */}
      <text
        x={A4_W / 2}
        y={A4_H - 30}
        fill="#cccccc"
        fontSize="8"
        fontFamily={svgFontFamily}
        textAnchor="middle"
      >
        www.biodata99.com
      </text>
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
