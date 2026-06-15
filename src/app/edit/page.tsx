"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Undo2,
  Redo2,
  Share2,
  Download,
  LayoutDashboard,
  Palette,
  Frame,
  Image as ImageIcon,
  Sparkles,
  Type as TypeIcon,
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  Maximize,
  RefreshCcw,
  Layers,
  PanelLeft,
  PanelRight,
  Sliders,
  X,
  Star,
  Crown,
  Loader2,
  ShieldCheck,
  Trash2,
  Globe,
  SlidersHorizontal,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import dynamic from "next/dynamic";
import { ImageUpload } from "@/components/ImageUpload";

import { PreviewLoader } from "@/components/biodata/PreviewLoader";

const KonvaPreview = dynamic(
  () => import("../../components/editor/KonvaPreview").then(mod => mod.KonvaPreview),
  {
    ssr: false,
    loading: () => <PreviewLoader />
  }
);

import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChromePicker } from "react-color";
import { TemplateSelector } from "@/components/editor/TemplateSelector";
import { StickerSelector } from "@/components/editor/StickerSelector";
import { BackgroundSelector } from "@/components/editor/BackgroundSelector";
import { TemplateFilter } from "@/components/editor/TemplateFilter";
import { useBiodataStore } from "@/store/useBiodataStore";
import { getTemplateConfig } from "@/lib/frame-config";
import { useThemeStore, FontFamily, FontWeight, Alignment, PALETTES } from "@/store/useThemeStore";
import { useStore } from "zustand";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { biodataSchema, type BiodataFormValues } from "@/types/biodata";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { defaultBiodataValues } from "@/lib/default-biodata";
const BiodataForm = dynamic(() => import("@/components/biodata/BiodataForm").then(mod => mod.BiodataForm));
import { cn } from "@/lib/utils";
import { Logo } from "@/components/layout/Logo";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { DownloadDropdown, type DownloadFormat } from "@/components/biodata/DownloadDropdown";
import { useDownloadBiodata, generateJpgDataUrl } from "@/hooks/useDownloadBiodata";
const FeedbackModal = dynamic(() => import("@/components/biodata/FeedbackModal").then(mod => mod.FeedbackModal));
const PriceModal = dynamic(() => import("@/components/biodata/PriceModal").then(mod => mod.PriceModal));
import { useRazorpayPayment } from "@/hooks/useRazorpayPayment";
const WhatsAppDeliveryCard = dynamic(() => import("@/components/biodata/WhatsAppDeliveryCard").then(mod => mod.WhatsAppDeliveryCard));
import { GRADIENT_PRESETS } from "@/lib/gradient-presets";
import { translateUI } from "@/lib/translations";
export default function EditPage() {
  return (
    <React.Suspense fallback={<PreviewLoader />}>
      <EditPageContent />
    </React.Suspense>
  );
}

function EditPageContent() {
  const router = useRouter();
  const {
    formData,
    selectedTemplate,
    customTemplates,
    setFormData
  } = useBiodataStore();
  const methods = useForm<BiodataFormValues>({
    resolver: zodResolver(biodataSchema) as any,
    defaultValues: defaultBiodataValues,
    mode: "onBlur",
  });
  
  console.log("=== EditPageContent Render ===");
  console.log("isMounted:", typeof window !== "undefined" ? "yes" : "no", "formData community:", formData?.community);

  const searchParams = useSearchParams();
  const templateParam = searchParams.get('template');

  const theme = useThemeStore();
  const prevTemplateRef = useRef<string | null>(null);
  const biodataHistory = useStore(useBiodataStore.temporal, (state) => state);
  const themeHistory = useStore(useThemeStore.temporal, (state) => state);

  const activeTemplate = customTemplates.find((t) => t.id === selectedTemplate) || getTemplateConfig(selectedTemplate);
  const defaultPaddingLeft = activeTemplate?.defaultPaddingLeft !== undefined ? activeTemplate.defaultPaddingLeft : (activeTemplate?.defaultPadding ?? 60);
  const defaultPaddingRight = activeTemplate?.defaultPaddingRight !== undefined ? activeTemplate.defaultPaddingRight : (activeTemplate?.defaultPadding ?? 60);
  const defaultPaddingTop = activeTemplate?.defaultPaddingTop !== undefined ? activeTemplate.defaultPaddingTop : (activeTemplate?.defaultYPadding !== undefined ? activeTemplate.defaultYPadding : defaultPaddingLeft);
  const canUndo = biodataHistory.pastStates.length > 0 || themeHistory.pastStates.length > 0;
  const canRedo = biodataHistory.futureStates.length > 0 || themeHistory.futureStates.length > 0;
  const currentLang = methods.watch("language") || formData.language || "English";




  const handleUndo = () => {
    if (biodataHistory.pastStates.length > 0) biodataHistory.undo();
    if (themeHistory.pastStates.length > 0) themeHistory.undo();
  };

  const handleRedo = () => {
    if (biodataHistory.futureStates.length > 0) biodataHistory.redo();
    if (themeHistory.futureStates.length > 0) themeHistory.redo();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [biodataHistory, themeHistory]);
  const [isMounted, setIsMounted] = useState(false);
  const [isStoreHydrated, setIsStoreHydrated] = useState(false);
  const [hasInitializedForm, setHasInitializedForm] = useState(false);
  const [isInitialTemplateLoading, setIsInitialTemplateLoading] = useState(true);

  // Monitor store hydration
  useEffect(() => {
    if (useBiodataStore.persist.hasHydrated()) {
      setIsStoreHydrated(true);
    }
    const unsub = useBiodataStore.persist.onFinishHydration(() => {
      setIsStoreHydrated(true);
    });
    return () => unsub();
  }, []);

  // Rating & Feedback Modal states
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [pendingDownloadFormat, setPendingDownloadFormat] = useState<DownloadFormat | null>(null);
  const [hasRated, setHasRated] = useState(false);
  const [filename, setFilename] = useState("biodata");
  const [pendingAction, setPendingAction] = useState<"download" | "whatsapp">("download");
  const pendingWhatsAppRef = useRef<{
    phoneNumber: string;
    countryCode: string;
    resolve: (res: any) => void;
    reject: (err: any) => void;
  } | null>(null);

  const handlePriceModalOpenChange = (open: boolean) => {
    setIsPriceModalOpen(open);
    if (!open) {
      if (pendingWhatsAppRef.current) {
        pendingWhatsAppRef.current.resolve({ success: false, error: "Payment cancelled" });
        pendingWhatsAppRef.current = null;
      }
      setPendingAction("download");
    }
  };

  // AI Photo Generator states removed (migrated to BiodataForm)

  // Sync store data to form ONCE when mounted/hydrated.
  // IMPORTANT: Read from useBiodataStore.getState() directly (not reactive formData) to avoid
  // a race condition where the reactive snapshot is captured BEFORE the HomeBiodataBuilder's
  // unmount cleanup has saved the user's community/mantra/title selections to the store.
  // The setTimeout(0) yields to the event loop, ensuring all React unmount cleanups complete first.
  useEffect(() => {
    if (!isMounted || !isStoreHydrated || hasInitializedForm) return;

    const timer = setTimeout(() => {
      // Read the LATEST store state at the time of initialization, not the reactive snapshot
      const latestFormData = useBiodataStore.getState().formData;
      methods.reset({ ...defaultBiodataValues, ...latestFormData });
      setHasInitializedForm(true);
    }, 0);

    return () => clearTimeout(timer);
  }, [isMounted, isStoreHydrated, hasInitializedForm, methods]);

  useEffect(() => {
    if (!hasInitializedForm) return;

    let timer: NodeJS.Timeout;
    const subscription = methods.watch(() => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const currentValues = methods.getValues();
        setFormData(currentValues);
      }, 400);
    });
    return () => {
      subscription.unsubscribe();
      const currentValues = methods.getValues();
      setFormData(currentValues);
      clearTimeout(timer);
    };
  }, [methods, setFormData, hasInitializedForm]);

  const { handleDownload: triggerDownload, sendWhatsAppDelivery, isGenerating } = useDownloadBiodata();
  const { startPayment, SandboxModal, isProcessing: isPaymentProcessing, paymentStep, paymentIdInfo, setPaymentStep, setIsProcessing } = useRazorpayPayment();

  const processPremiumPaymentAndDownload = async (currentData: any, format: DownloadFormat, modalFilename: string, couponCode?: string) => {
    try {
      const fullName = currentData.personalDetails?.find((f: any) => f.id === "fullName")?.value || modalFilename || "";
      const contactFields = currentData.contactDetails || [];
      const emailField = contactFields.find((f: any) =>
        f.id === "email" ||
        f.id === "emailId" ||
        f.id?.toLowerCase()?.includes("email") ||
        f.id?.toLowerCase()?.includes("mail") ||
        (f.label || "").toLowerCase().includes("email") ||
        (f.label || "").toLowerCase().includes("mail") ||
        (f.label || "").toLowerCase().includes("e-mail") ||
        (f.value || "").includes("@")
      );
      const properEmail = emailField?.value || "";
      const phoneField = contactFields.find((f: any) =>
        f.id === "mobileNumber" ||
        f.id === "whatsappNumber" ||
        f.id?.toLowerCase()?.includes("phone") ||
        f.id?.toLowerCase()?.includes("mobile") ||
        (f.label || "").toLowerCase().includes("phone") ||
        (f.label || "").toLowerCase().includes("mobile") ||
        (f.label || "").toLowerCase().includes("contact")
      );
      const properPhone = phoneField?.value || "";

      let finalPrice = 29;
      if (format === "pdf") finalPrice = activeTemplate?.pdfDiscountPrice ?? activeTemplate?.pdfPrice ?? 49;
      else if (format === "jpg") finalPrice = activeTemplate?.jpgDiscountPrice ?? activeTemplate?.jpgPrice ?? 19;
      else if (format === "png") finalPrice = activeTemplate?.pngDiscountPrice ?? activeTemplate?.pngPrice ?? 19;
      else if (format === "combo") finalPrice = (activeTemplate as any)?.comboDiscountPrice ?? (activeTemplate as any)?.comboPrice ?? 79;

      await startPayment({
        amount: finalPrice,
        format,
        templateId: selectedTemplate,
        customerName: fullName,
        customerEmail: properEmail,
        customerPhone: properPhone,
        currency: activeTemplate?.currency || "INR",
        couponCode: couponCode,
        onDownload: async (orderId: string) => {
          const result = await triggerDownload(currentData, selectedTemplate, format, modalFilename, orderId);
          if (result && !result.success) {
            throw result.error || new Error("Download failed");
          }

          if (pendingAction === "whatsapp" && pendingWhatsAppRef.current) {
            try {
              const res = await sendWhatsAppDelivery(
                pendingWhatsAppRef.current.phoneNumber,
                pendingWhatsAppRef.current.countryCode,
                currentData,
                selectedTemplate,
                theme
              );
              pendingWhatsAppRef.current.resolve(res);
            } catch (err: any) {
              pendingWhatsAppRef.current.reject(err);
            } finally {
              pendingWhatsAppRef.current = null;
            }
          }

          setIsFeedbackOpen(true);
        }
      });
    } catch (paymentErr) {
      console.error("Payment failed or cancelled:", paymentErr);
      if (pendingWhatsAppRef.current) {
        pendingWhatsAppRef.current.resolve({ success: false, error: "Payment failed or cancelled" });
        pendingWhatsAppRef.current = null;
      }
    }
  };

  const handleSubmitWhatsApp = (phoneNumber: string, countryCode: string) => {
    return new Promise<{ success: boolean; error?: string; fallback?: boolean; whatsappUrl?: string }>(async (resolve, reject) => {
      const currentData = {
        ...useBiodataStore.getState().formData,
        ...methods.getValues(),
        stickers: useBiodataStore.getState().formData.stickers,
        layout: useBiodataStore.getState().formData.layout,
      };
      const nameField =
        currentData.personalDetails?.find((f: any) => f.id === "fullName")?.value ||
        "biodata";
      const cleanName = nameField.replace(/[\\/:*?"<>|]/g, "").trim() || "biodata";
      setFilename(cleanName);

      if (activeTemplate?.isPremium) {
        pendingWhatsAppRef.current = { phoneNumber, countryCode, resolve, reject };
        setPendingAction("whatsapp");
        setIsPriceModalOpen(true);
      } else {
        // Free template: send immediately
        try {
          const res = await sendWhatsAppDelivery(phoneNumber, countryCode, currentData, selectedTemplate, theme);
          resolve(res);
          setIsFeedbackOpen(true);
        } catch (err: any) {
          reject(err);
        }
      }
    });
  };

  const [displayZoom, setDisplayZoom] = useState(1);
  useEffect(() => {
    const handler = (e: Event) => setDisplayZoom((e as CustomEvent).detail as number);
    window.addEventListener("biodata:scale-changed", handler);
    return () => window.removeEventListener("biodata:scale-changed", handler);
  }, []);

  const [selectedStickersCount, setSelectedStickersCount] = useState(0);

  useEffect(() => {
    const handleSelection = (e: Event) => {
      const selected = (e as CustomEvent).detail || [];
      setSelectedStickersCount(selected.length);
    };
    window.addEventListener("biodata:selection-changed", handleSelection);
    return () => window.removeEventListener("biodata:selection-changed", handleSelection);
  }, []);

  const [activeTab, setActiveTab] = useState<"templates" | "fields" | "theme" | "spacing" | "photo" | "graphics" | "whatsapp">("fields");
  const [isLeftOpen, setIsLeftOpen] = useState(true);
  const [isRightOpen, setIsRightOpen] = useState(true);
  const [drawerTranslateY, setDrawerTranslateY] = useState(0);
  const [isDraggingDrawer, setIsDraggingDrawer] = useState(false);
  const touchStartY = useRef(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleDrawerTouchStart = (e: React.TouchEvent) => {
    if (window.innerWidth >= 1024) return;
    touchStartY.current = e.touches[0].clientY;
    setIsDraggingDrawer(true);
  };

  const handleDrawerTouchMove = (e: React.TouchEvent) => {
    if (window.innerWidth >= 1024 || !isDraggingDrawer) return;
    const currentY = e.touches[0].clientY;
    const diffY = currentY - touchStartY.current;
    if (diffY > 0) {
      setDrawerTranslateY(diffY);
    }
  };

  const handleDrawerTouchEnd = () => {
    if (window.innerWidth >= 1024) return;
    setIsDraggingDrawer(false);
    if (drawerTranslateY > 120) {
      setIsRightOpen(false);
    }
    setDrawerTranslateY(0);
  };

  const handleTabClick = (tab: typeof activeTab) => {
    if (activeTab === tab && isRightOpen) {
      setIsRightOpen(false);
    } else {
      setActiveTab(tab);
      setIsRightOpen(true);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
    if (window.innerWidth < 1024) {
      setIsLeftOpen(false);
    }
  };

  const handleZoomIn = () => window.dispatchEvent(new CustomEvent("biodata:zoom-in"));
  const handleZoomOut = () => window.dispatchEvent(new CustomEvent("biodata:zoom-out"));

  const handleFitToScreen = () => window.dispatchEvent(new CustomEvent("biodata:fit-screen"));

  // Fetch initial template only after store hydration is complete to prevent race conditions
  useEffect(() => {
    if (!isStoreHydrated) return;
    setIsInitialTemplateLoading(true);
    useBiodataStore.getState().fetchInitialTemplate(templateParam).finally(() => {
      setIsInitialTemplateLoading(false);
    });
  }, [isStoreHydrated, templateParam]);

  // Fix hydration issues and layout listening
  useEffect(() => {
    setIsMounted(true);

    if (window.innerWidth < 1024) {
      setIsLeftOpen(false);
      setIsRightOpen(!!templateParam || !!searchParams.get('tab'));
    }

    // Disable browser pull-to-refresh on this page
    const originalBodyStyle = document.body.style.overscrollBehaviorY;
    const originalHtmlStyle = document.documentElement.style.overscrollBehaviorY;
    document.body.style.overscrollBehaviorY = "none";
    document.documentElement.style.overscrollBehaviorY = "none";

    return () => {
      document.body.style.overscrollBehaviorY = originalBodyStyle;
      document.documentElement.style.overscrollBehaviorY = originalHtmlStyle;
    };
  }, []);

  // Handle initial tab selection from query parameters
  useEffect(() => {
    if (!isMounted) return;
    const tabParam = searchParams.get('tab');
    const validTabs = ["templates", "fields", "theme", "spacing", "photo", "graphics", "whatsapp"];
    if (tabParam && validTabs.includes(tabParam)) {
      setActiveTab(tabParam as any);
      setIsRightOpen(true);
    }
  }, [isMounted, searchParams]);

  // Synchronize theme padding and palette with selected template defaults from database
  useEffect(() => {
    if (!isMounted) return;
    const config = activeTemplate;
    if (!config) return;

    const configKey = `${selectedTemplate}_${config.defaultPrimary}_${config.defaultSecondary}_${config.defaultAccent}`;
    if (configKey !== prevTemplateRef.current) {
      prevTemplateRef.current = configKey;

      // Resolve background colors
      let bgColors: string[] = ["#ffffff"];
      if (config.bgGradientColors && config.bgGradientColors.length > 0) {
        bgColors = config.bgGradientColors;
      } else if (config.frame.type === "gradient") {
        bgColors = config.frame.gradientColors;
      } else if (config.frame.bgColor) {
        bgColors = [config.frame.bgColor];
      }

      // Apply template's colors
      theme.setPalette({
        name: "None",
        primary: config.defaultPrimary,
        secondary: config.defaultSecondary,
        accent: config.defaultAccent || "",
        bgColors: bgColors,
      });

      // Apply template's default padding
      if (config.defaultPadding !== undefined && config.defaultPadding !== null) {
        theme.setPadding(config.defaultPadding);
      }
      theme.setPaddingY(config.defaultYPadding !== null && config.defaultYPadding !== undefined ? config.defaultYPadding : undefined);
      
      // Apply template's default font size
      theme.setFontSize(config.fontSize || 9);

      // Reset any manual padding or photo transformation overrides so template defaults apply
      theme.resetOverrides();
    }
  }, [selectedTemplate, customTemplates, isMounted, activeTemplate]);

  useEffect(() => {
    if (isMounted) {
      handleFitToScreen();
      const handleResize = () => handleFitToScreen();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [isMounted]);

  useEffect(() => {
    if (isMounted) {
      // Intentionally removed auto fit-to-screen on sidebar toggle to prevent resetting user's pan/zoom position
    }
  }, [isRightOpen, isMounted]);

  if (!isMounted) {
    return (
      <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#f5f5f0]">
        {/* ── Header skeleton ─────────────────────────────── */}
        <header className="h-14 shrink-0 bg-white border-b border-stone-200 flex items-center justify-between px-4 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-20 h-8 bg-stone-200 rounded-full animate-pulse" />
            <div className="w-px h-6 bg-stone-200" />
            <div className="w-24 h-6 bg-stone-100 rounded-md animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-stone-100 rounded-full animate-pulse" />
            <div className="w-8 h-8 bg-stone-100 rounded-full animate-pulse" />
            <div className="w-px h-6 bg-stone-200" />
            <div className="w-28 h-9 bg-stone-200 rounded-full animate-pulse" />
          </div>
        </header>

        {/* ── Body ────────────────────────────────────────── */}
        <div className="flex-1 flex overflow-hidden">

          {/* Left icon nav skeleton (desktop only) */}
          <div className="hidden lg:flex w-16 shrink-0 flex-col items-center py-4 gap-3 bg-white border-r border-stone-200">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div className="w-9 h-9 bg-stone-100 rounded-xl animate-pulse" />
                <div className="w-10 h-2 bg-stone-100 rounded animate-pulse" />
              </div>
            ))}
          </div>

          {/* Canvas area */}
          <main className="flex-1 relative overflow-hidden flex items-center justify-center">
            {/* Grid background */}
            <div className="absolute inset-0" style={{
              backgroundImage: `linear-gradient(to right,rgba(0,0,0,0.04) 1px,transparent 1px),linear-gradient(to bottom,rgba(0,0,0,0.04) 1px,transparent 1px)`,
              backgroundSize: "24px 24px",
              backgroundColor: "#f5f5f0"
            }} />

            {/* A4 page skeleton */}
            <div className="relative shadow-2xl rounded-sm overflow-hidden bg-white animate-pulse"
              style={{ width: 280, height: 396 }}>
              {/* Frame lines */}
              <div className="absolute inset-[8px] border border-stone-200 rounded-none" />
              <div className="absolute inset-[14px] border border-stone-100 rounded-none" />

              {/* Header area */}
              <div className="absolute top-6 left-0 right-0 flex flex-col items-center gap-2 px-8">
                <div className="w-3/5 h-2.5 bg-stone-200 rounded" />
                <div className="w-4/5 h-4 bg-stone-100 rounded" />
              </div>

              {/* Photo placeholder */}
              <div className="absolute top-20 right-8 w-16 h-20 bg-stone-100 rounded" />

              {/* Content lines */}
              <div className="absolute top-20 left-8 right-28 flex flex-col gap-2">
                {[0.8, 0.65, 0.9, 0.7, 0.75, 0.6, 0.85, 0.7, 0.65].map((w, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <div className="w-12 h-1.5 bg-stone-200 rounded shrink-0" />
                    <div className="h-1.5 bg-stone-100 rounded" style={{ width: `${w * 100}%` }} />
                  </div>
                ))}
              </div>

              {/* Section 2 lines */}
              <div className="absolute top-60 left-8 right-8 flex flex-col gap-2">
                <div className="w-1/3 h-2.5 bg-stone-200 rounded mb-1" />
                {[0.7, 0.55, 0.8, 0.6].map((w, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <div className="w-12 h-1.5 bg-stone-200 rounded shrink-0" />
                    <div className="h-1.5 bg-stone-100 rounded" style={{ width: `${w * 100}%` }} />
                  </div>
                ))}
              </div>

              {/* Shine sweep */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_1.8s_infinite]" />
            </div>

            {/* Floating zoom bar */}
            <div className="absolute bottom-5 right-5 flex items-center gap-1 bg-white/90 px-3 py-1.5 rounded-full shadow border border-stone-200 animate-pulse">
              <div className="w-5 h-5 bg-stone-100 rounded-full" />
              <div className="w-5 h-5 bg-stone-100 rounded-full" />
              <div className="w-10 h-3 bg-stone-100 rounded" />
              <div className="w-5 h-5 bg-stone-100 rounded-full" />
            </div>
          </main>

          {/* Right panel skeleton (desktop only) */}
          <aside className="hidden lg:flex w-80 shrink-0 flex-col bg-white border-l border-stone-200">
            {/* Panel header */}
            <div className="px-6 py-5 border-b border-stone-100 flex flex-col gap-2">
              <div className="w-28 h-5 bg-stone-200 rounded-md animate-pulse" />
              <div className="w-40 h-3 bg-stone-100 rounded animate-pulse" />
            </div>
            {/* Panel content */}
            <div className="flex-1 p-6 flex flex-col gap-4 overflow-hidden">
              {/* Template grid preview */}
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-2 animate-pulse">
                    <div className="w-full aspect-[595/842] bg-stone-100 rounded-xl border border-stone-200" />
                    <div className="h-2.5 bg-stone-100 rounded w-3/4" />
                    <div className="h-2 bg-stone-50 rounded w-1/2" />
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    );
  }


  const handleDownload = async () => {
    const nameField =
      formData.personalDetails?.find((f: any) => f.id === "fullName")?.value ||
      "biodata";
    const cleanName = nameField.replace(/[\\/:*?"<>|]/g, "").trim() || "biodata";
    setFilename(cleanName);

    setIsPriceModalOpen(true);
  };

  const handleFeedbackSubmit = async (modalRating: number, modalFilename: string, modalComment: string) => {
    setHasRated(true);
    setIsFeedbackOpen(false);

    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: modalFilename,
          rating: modalRating,
          comment: modalComment,
        }),
      });
    } catch (err) {
      console.error("Failed to save feedback:", err);
    }
  };

  const handleSkipDownload = async () => {
    setIsFeedbackOpen(false);
  };

  /** Generate a JPG data URL for WhatsApp sharing */
  const handleGenerateShareImage = async (): Promise<string> => {
    return await generateJpgDataUrl();
  };



  const getFontFamily = (font: FontFamily) => {
    switch (font) {
      case "noto": return "var(--font-noto-serif), serif";
      case "inter": return "var(--font-inter), sans-serif";
      case "playfair": return "var(--font-playfair), serif";
      default: return "var(--font-noto-serif), serif";
    }
  };

  const getFontWeight = (weight: FontWeight) => {
    switch (weight) {
      case "regular": return "400";
      case "medium": return "600"; // Many fonts use 600 for medium
      case "bold": return "700";
      default: return "400";
    }
  };

  const getAlignment = (alignment: Alignment) => {
    switch (alignment) {
      case "left": return "left";
      case "center": return "center";
      case "right": return "right";
      default: return "center";
    }
  };

  const commonStyle = {
    fontFamily: getFontFamily(theme.fontFamily),
    fontWeight: getFontWeight(theme.fontWeight),
    textAlign: getAlignment(theme.alignment) as any,
  };


  if (!isMounted || !isStoreHydrated || isInitialTemplateLoading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-stone-50 dark:bg-stone-950 z-50">
        <PreviewLoader />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden flex flex-col bg-stitch-surface font-sans selection:bg-stitch-primary-container selection:text-stitch-on-primary-container">
      <h1 className="sr-only">Biodata Maker & Matrimonial Profile Creator Studio</h1>
      {/* Top Navigation Bar */}
      <header className="w-full shrink-0 bg-stitch-surface/80 backdrop-blur-xl border-b border-stitch-outline/10 shadow-sm flex justify-between items-center px-4 md:px-6 h-16">
        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/" className="shrink-0 hidden sm:block">
            <Logo iconClassName="h-6 md:h-8" disableShine />
          </Link>
          <Button
            variant="ghost"
            className="group gap-1 md:gap-2 px-2.5 py-1.5 md:px-4 md:py-2 text-stitch-primary hover:bg-stitch-primary/10 rounded-full font-medium transition-all flex items-center border border-stitch-primary/20 hover:border-stitch-primary/40 shadow-sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-3.5 h-3.5 md:w-4.5 md:h-4.5 transition-transform group-hover:-translate-x-1" />
            <span className="hidden md:inline text-sm font-bold tracking-wide">Go Back</span>
            <span className="inline md:hidden text-xs font-bold tracking-wide">Back</span>
          </Button>
        </div>

        {/* Center toolbar: Undo/Redo always visible, other items hidden on mobile */}
        <div className="flex items-center gap-1 border-x border-stitch-outline/5 px-2 md:px-4 h-full">
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            className={cn(
              "p-2 rounded-lg transition-all active:scale-90",
              canUndo ? "text-stitch-on-surface hover:bg-stitch-surface-variant/30" : "text-stitch-on-surface-variant/30 cursor-not-allowed"
            )}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button
            onClick={handleRedo}
            disabled={!canRedo}
            className={cn(
              "p-2 rounded-lg transition-all active:scale-90",
              canRedo ? "text-stitch-on-surface hover:bg-stitch-surface-variant/30" : "text-stitch-on-surface-variant/30 cursor-not-allowed"
            )}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          {/* Reset button & divider: hidden on mobile */}
          <div className="hidden md:flex items-center gap-1 h-full">
            <Separator orientation="vertical" className="h-8 mx-1 bg-stitch-outline/10" />
            <Dialog>
              <DialogTrigger asChild>
                <ToolbarItem icon={<RefreshCcw />} label={translateUI("reset", currentLang)} />
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{translateUI("resetDesignTitle", currentLang)}</DialogTitle>
                  <DialogDescription>
                    {translateUI("resetDesignDesc", currentLang)}
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0 mt-4">
                  <DialogClose asChild>
                    <Button variant="outline" className="w-full sm:w-28 rounded-xl border-border/60 hover:bg-muted/50 font-bold transition-all text-muted-foreground hover:text-foreground shadow-sm">{translateUI("cancel", currentLang)}</Button>
                  </DialogClose>
                  <DialogClose asChild onClick={() => {
                    useBiodataStore.getState().resetDesignOnly();
                    useThemeStore.getState().resetTheme();
                    
                    const config = activeTemplate;
                    if (config) {
                      let bgColors: string[] = ["#ffffff"];
                      if (config.bgGradientColors && config.bgGradientColors.length > 0) {
                        bgColors = config.bgGradientColors;
                      } else if (config.frame?.type === "gradient") {
                        bgColors = config.frame.gradientColors;
                      } else if (config.frame?.bgColor) {
                        bgColors = [config.frame.bgColor];
                      }

                      useThemeStore.getState().setPalette({
                        name: "None",
                        primary: config.defaultPrimary,
                        secondary: config.defaultSecondary,
                        accent: config.defaultAccent || "",
                        bgColors: bgColors,
                      });

                      if (config.defaultPadding !== undefined && config.defaultPadding !== null) {
                        useThemeStore.getState().setPadding(config.defaultPadding);
                      }
                      useThemeStore.getState().setPaddingY(
                        config.defaultYPadding !== null && config.defaultYPadding !== undefined 
                          ? config.defaultYPadding 
                          : undefined
                      );
                      
                      useThemeStore.getState().setFontSize(config.fontSize || 9);
                      useThemeStore.getState().resetOverrides();
                    }
                    
                    methods.reset(useBiodataStore.getState().formData);
                    prevTemplateRef.current = `${selectedTemplate}_${config?.defaultPrimary}_${config?.defaultSecondary}_${config?.defaultAccent}`;
                  }}>
                    <Button className="relative overflow-hidden bg-gradient-primary text-white border-0 w-full sm:w-28 rounded-xl font-bold shadow-sm">
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-1/2 h-full animate-shine pointer-events-none" />
                      <span className="relative">{translateUI("resetDesignBtn", currentLang)}</span>
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="hidden xl:flex px-3 py-1.5 rounded-full bg-green-50 border border-green-100 items-center gap-2 mr-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider">Live</span>
          </div>

          <DownloadDropdown
            onDownload={handleDownload}
            isGenerating={isGenerating}
            variant="primary"
            isPremium={activeTemplate?.isPremium}
            price={activeTemplate?.price}
            discountPrice={activeTemplate?.discountPrice}
            currency={activeTemplate?.currency}
          />
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative pb-24 lg:pb-0">

        {/* Mobile Bottom Tab Bar */}
        <nav className={cn(
          "fixed bottom-4 left-4 right-4 h-16 flex lg:hidden flex-row items-center justify-around px-2 py-1 bg-white/30 backdrop-blur-2xl border border-white/40 rounded-2xl shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.5),_0_8px_32px_rgba(0,0,0,0.08)] z-50 transition-all duration-300",
          isRightOpen ? "opacity-0 pointer-events-none translate-y-20" : "opacity-100 translate-y-0"
        )}>
          <ToolButton
            icon={<LayoutDashboard />}
            label={translateUI("templates", currentLang)}
            active={isRightOpen && activeTab === "templates"}
            onClick={() => handleTabClick("templates")}
          />
          <ToolButton
            icon={<TypeIcon />}
            label={translateUI("fields", currentLang)}
            active={isRightOpen && activeTab === "fields"}
            onClick={() => handleTabClick("fields")}
          />
          <ToolButton
            icon={<Palette />}
            label={translateUI("theme", currentLang)}
            active={isRightOpen && activeTab === "theme"}
            onClick={() => handleTabClick("theme")}
          />
          <ToolButton
            icon={<Sliders className="w-5 h-5" />}
            label={translateUI("spacing", currentLang)}
            active={isRightOpen && activeTab === "spacing"}
            onClick={() => handleTabClick("spacing")}
          />

          <ToolButton
            icon={<Sparkles />}
            label={translateUI("graphics", currentLang)}
            active={isRightOpen && activeTab === "graphics"}
            onClick={() => handleTabClick("graphics")}
          />
        </nav>

        {/* Canvas Area */}
        <main id="canvas-container" className="flex-1 overflow-hidden relative bg-transparent h-full flex items-center justify-center">
          {/* KonvaPreview is ALWAYS mounted to preserve pan/zoom state.
              The PreviewLoader overlay is shown on top until templates are ready. */}
          <KonvaPreview isDesigner={true} />
          {(customTemplates.length === 0 || isInitialTemplateLoading) && (
            <div className="absolute inset-0 flex items-center justify-center bg-stone-50/80 backdrop-blur-sm z-10">
              <PreviewLoader />
            </div>
          )}

          {/* Floating Left Toolbar - Desktop only, overlaid on the canvas */}
          {isLeftOpen && (
            <nav className="hidden lg:flex absolute left-6 top-1/2 -translate-y-1/2 z-20 flex-col items-center py-4 px-2 gap-2 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-black/5">
              <ToolButton
                icon={<LayoutDashboard />}
                label={translateUI("templates", currentLang)}
                active={isRightOpen && activeTab === "templates"}
                onClick={() => handleTabClick("templates")}
              />
              <ToolButton
                icon={<TypeIcon />}
                label={translateUI("fields", currentLang)}
                active={isRightOpen && activeTab === "fields"}
                onClick={() => handleTabClick("fields")}
              />
              <ToolButton
                icon={<Palette />}
                label={translateUI("theme", currentLang)}
                active={isRightOpen && activeTab === "theme"}
                onClick={() => handleTabClick("theme")}
              />
              <ToolButton
                icon={<Sliders className="w-5 h-5" />}
                label={translateUI("spacing", currentLang)}
                active={isRightOpen && activeTab === "spacing"}
                onClick={() => handleTabClick("spacing")}
              />
              <ToolButton
                icon={<Sparkles />}
                label={translateUI("graphics", currentLang)}
                active={isRightOpen && activeTab === "graphics"}
                onClick={() => handleTabClick("graphics")}
              />
            </nav>
          )}

          {/* Floating Zoom Controls */}
          <div className="absolute bottom-6 left-6 lg:left-auto lg:right-6 z-20 flex items-center gap-1 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-black/5">
            <button
              onClick={handleZoomOut}
              className="p-1.5 hover:bg-black/5 rounded-full text-stitch-on-surface-variant hover:text-stitch-primary active:scale-90 transition-all cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleFitToScreen}
              className="p-1.5 hover:bg-black/5 rounded-full text-stitch-on-surface-variant hover:text-stitch-primary active:scale-90 transition-all cursor-pointer"
              title="Fit to Screen"
            >
              <Maximize className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-black text-stitch-on-surface w-10 text-center select-none">
              {Math.round(displayZoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1.5 hover:bg-black/5 rounded-full text-stitch-on-surface-variant hover:text-stitch-primary active:scale-90 transition-all cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </main>

        {/* Right Properties Panel / Bottom Drawer on Mobile */}
        <aside
          style={{
            transform: isDraggingDrawer
              ? `translateY(${drawerTranslateY}px)`
              : undefined
          }}
          className={cn(
            "flex flex-col z-40 shadow-2xl overflow-hidden",
            isDraggingDrawer ? "" : "transition-all duration-300",
            // Desktop: right sidebar
            "lg:relative lg:top-0 lg:bottom-0 lg:right-0 lg:h-full lg:w-96 lg:translate-y-0 lg:opacity-100 lg:border-l lg:border-t-0 lg:rounded-none lg:bg-stitch-surface/60 lg:border-stitch-outline/10",
            isRightOpen
              ? "lg:translate-x-0 lg:w-96"
              : "lg:translate-x-full lg:w-0 lg:pointer-events-none lg:border-l-0",
            // Mobile: bottom drawer (sitting flush at bottom-0)
            "fixed left-0 right-0 bottom-0 h-[50vh] border-t border-stitch-outline/10 rounded-t-[32px] bg-white",
            isRightOpen
              ? "translate-y-0 opacity-100"
              : "translate-y-full opacity-0 pointer-events-none"
          )}
        >
          {/* Header Panel */}
          <div className="select-none shrink-0 border-b border-stitch-outline/5">
            <div className="p-6 pb-4 relative flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black tracking-tight text-stitch-on-surface capitalize">
                  {translateUI(activeTab, currentLang)}
                </h2>
                <p className="text-[11px] text-stitch-on-surface-variant font-bold uppercase tracking-widest mt-1">
                  {activeTab === "fields"
                    ? translateUI("formInputsAndDetails", currentLang)
                    : translateUI("customizeDesignProperties", currentLang)}
                </p>
              </div>

              {activeTab === "templates" && (
                <div className="mr-8 lg:mr-0">
                  <TemplateFilter />
                </div>
              )}

              {/* Close Button for Mobile Drawer */}
              <button
                onClick={() => setIsRightOpen(false)}
                className="absolute right-6 top-6 lg:hidden w-8 h-8 rounded-full bg-stitch-surface-variant/10 hover:bg-stitch-surface-variant/25 active:scale-90 text-stitch-on-surface flex items-center justify-center transition-all border border-stitch-outline/5"
                aria-label="Close panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-6 pt-0 scrollbar-thin scrollbar-thumb-stitch-outline/20 scroll-smooth">
            <div className="flex flex-col gap-8 pb-28 lg:pb-10">
              {activeTab === "templates" && <TemplateSelector />}

              {activeTab === "fields" && (
                <div className="flex flex-col gap-6 text-left">
                  <FormProvider {...methods}>
                    <BiodataForm />
                  </FormProvider>
                </div>
              )}

              {activeTab === "theme" && (
                <div className="flex flex-col gap-6">
                  <Tabs defaultValue="bg" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-stitch-surface-variant/20 p-1 rounded-xl mb-6">
                      <TabsTrigger value="bg" className="font-bold py-2 rounded-lg transition-all text-xs cursor-pointer [&:not([data-active])]:hover:!bg-transparent data-active:!bg-gradient-to-r data-active:from-pink-500 data-active:via-rose-500 data-active:to-amber-500 data-active:text-white data-active:shadow-[0_4px_12px_rgba(244,63,94,0.25)] data-active:hover:!bg-gradient-to-r data-active:hover:from-pink-500 data-active:hover:via-rose-500 data-active:hover:to-amber-500">
                        {translateUI("backgroundThemes", currentLang)}
                      </TabsTrigger>
                      <TabsTrigger value="text" className="font-bold py-2 rounded-lg transition-all text-xs cursor-pointer [&:not([data-active])]:hover:!bg-transparent data-active:!bg-gradient-to-r data-active:from-pink-500 data-active:via-rose-500 data-active:to-amber-500 data-active:text-white data-active:shadow-[0_4px_12px_rgba(244,63,94,0.25)] data-active:hover:!bg-gradient-to-r data-active:hover:from-pink-500 data-active:hover:via-rose-500 data-active:hover:to-amber-500">
                        {translateUI("textThemes", currentLang)}
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="bg" className="flex flex-col gap-4 animate-in fade-in duration-200">
                      <div className="flex flex-col gap-3">
                        <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-stitch-on-surface-variant">{translateUI("themePalettes", currentLang)}</Label>
                        <div className="grid grid-cols-2 gap-2 max-h-[360px] overflow-y-auto p-1.5 border border-stitch-outline/5 rounded-2xl bg-stitch-surface-variant/5 shadow-inner">
                          {/* None / Reset option */}
                          {(() => {
                            const isNone = theme.selectedPaletteName === null;
                            return (
                              <button
                                onClick={() => {
                                  const config = activeTemplate;
                                  if (config) {
                                    let bgColors: string[] = ["#ffffff"];
                                    if (config.bgGradientColors && config.bgGradientColors.length > 0) {
                                      bgColors = config.bgGradientColors;
                                    } else if (config.frame?.type === "gradient") {
                                      bgColors = config.frame.gradientColors;
                                    } else if (config.frame?.bgColor) {
                                      bgColors = [config.frame.bgColor];
                                    }

                                    theme.setPalette({
                                      name: "None",
                                      primary: config.defaultPrimary,
                                      secondary: config.defaultSecondary,
                                      accent: config.defaultAccent || "",
                                      bgColors: bgColors,
                                    });
                                  } else {
                                    theme.setPalette({ name: "None", primary: "#800000", secondary: "#333333", accent: "#D4AF37" });
                                  }
                                }}
                                className={cn(
                                  "group relative flex items-center gap-2 p-1.5 rounded-xl border transition-all hover:shadow-md",
                                  isNone ? "border-stitch-primary bg-white shadow-sm" : "border-stitch-outline/10 hover:border-stitch-outline/30 bg-transparent"
                                )}
                              >
                                <div className="flex shrink-0 w-8 h-8 rounded-lg overflow-hidden border border-black/5 shadow-inner items-center justify-center bg-stitch-surface-variant/30">
                                  <svg className="w-4 h-4 text-stitch-on-surface-variant/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <circle cx="12" cy="12" r="9" />
                                    <line x1="5.5" y1="5.5" x2="18.5" y2="18.5" />
                                  </svg>
                                </div>
                                <span className="text-[11px] font-bold text-stitch-on-surface-variant">{translateUI("none", currentLang)}</span>
                                {isNone && (
                                  <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-stitch-primary flex items-center justify-center shadow-sm">
                                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  </div>
                                )}
                              </button>
                            );
                          })()}

                          {(() => {
                            const activeTemplateId = useBiodataStore.getState().selectedTemplate;
                            const dbTpl = useBiodataStore.getState().customTemplates?.find(t => t.id === activeTemplateId);

                            const bgType = dbTpl
                              ? dbTpl.bgType
                              : getTemplateConfig(activeTemplateId)?.bgType || getTemplateConfig(activeTemplateId)?.frame?.type;

                            const isGradient = bgType === "linear" || bgType === "radial" || bgType === "gradient";

                            if (isGradient) {
                              return GRADIENT_PRESETS.map((preset) => {
                                const colorsArr = preset.colors.split(",");
                                const c1 = colorsArr[0]?.trim();
                                const c2 = colorsArr[1]?.trim() || c1;
                                const c3 = colorsArr[2]?.trim();

                                let bgStyle = "";
                                if (bgType === "linear" || bgType === "gradient") {
                                  bgStyle = c3
                                    ? `linear-gradient(to bottom, ${c1}, ${c2}, ${c3})`
                                    : `linear-gradient(to bottom, ${c1}, ${c2})`;
                                } else {
                                  bgStyle = c3
                                    ? `radial-gradient(circle, ${c1}, ${c2}, ${c3})`
                                    : `radial-gradient(circle, ${c1}, ${c2})`;
                                }

                                const normalizeColors = (cStr: string) => cStr.toLowerCase().replace(/\s+/g, "");
                                const activeBgColors = theme.bgColors || [];
                                const activeNormalized = activeBgColors.map(c => normalizeColors(c)).join(",");
                                const presetNormalized = colorsArr.map(c => normalizeColors(c)).join(",");

                                const isSelected = activeNormalized === presetNormalized;

                                return (
                                  <button
                                    key={preset.name}
                                    onClick={() => {
                                      theme.setPalette({
                                        name: preset.name,
                                        primary: theme.primaryColor,
                                        secondary: theme.secondaryColor,
                                        accent: theme.accentColor,
                                        bgColors: colorsArr
                                      });
                                    }}
                                    className={cn(
                                      "group relative flex items-center gap-2 p-1.5 rounded-xl border transition-all hover:shadow-md",
                                      isSelected ? "border-stitch-primary bg-white shadow-sm" : "border-stitch-outline/10 hover:border-stitch-outline/30 bg-transparent"
                                    )}
                                  >
                                    <div className="flex shrink-0 w-8 h-8 rounded-lg overflow-hidden border border-black/5 shadow-inner animate-fade-in" style={{ background: bgStyle }} />
                                    <div className="flex flex-col items-start overflow-hidden flex-1">
                                      <span className="text-[11px] font-bold text-stitch-on-surface truncate pr-2 w-full text-left">{preset.name}</span>
                                      <div className="flex gap-0.5 mt-0.5">
                                        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: c1 }} />
                                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c2 }} />
                                        {c3 && <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c3 }} />}
                                      </div>
                                    </div>
                                    {isSelected && (
                                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-stitch-primary flex items-center justify-center shadow-sm">
                                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                      </div>
                                    )}
                                  </button>
                                );
                              });
                            }

                            // Static Solid Palettes (default behavior)
                            const filteredPalettes = PALETTES.filter(p => !p.bgColors);
                            return filteredPalettes.map((p) => {
                              const isSelected = theme.selectedPaletteName === p.name;
                              return (
                                <button
                                  key={p.name}
                                  onClick={() => {
                                    if (isSelected) {
                                      theme.setPalette({ name: "None", primary: "#800000", secondary: "#333333", accent: "#D4AF37" });
                                    } else {
                                      theme.setPalette(p);
                                    }
                                  }}
                                  className={cn(
                                    "group relative flex items-center gap-2 p-1.5 rounded-xl border transition-all hover:shadow-md",
                                    isSelected ? "border-stitch-primary bg-white shadow-sm" : "border-stitch-outline/10 hover:border-stitch-outline/30 bg-transparent"
                                  )}
                                >
                                  <div className="flex shrink-0 w-8 h-8 rounded-lg overflow-hidden border border-black/5 shadow-inner">
                                    <>
                                      <div className="flex-1" style={{ backgroundColor: p.primary }} />
                                      <div className="flex-1" style={{ backgroundColor: p.secondary }} />
                                      <div className="flex-1" style={{ backgroundColor: p.accent }} />
                                    </>
                                  </div>
                                  <div className="flex flex-col items-start overflow-hidden flex-1">
                                    <span className="text-[11px] font-bold text-stitch-on-surface truncate pr-2 w-full text-left">{p.name}</span>
                                    <div className="flex gap-0.5 mt-0.5">
                                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.primary }} />
                                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.secondary }} />
                                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.accent }} />
                                    </div>
                                  </div>
                                  {isSelected && (
                                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-stitch-primary flex items-center justify-center shadow-sm">
                                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                      </svg>
                                    </div>
                                  )}
                                </button>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="text" className="flex flex-col gap-4 animate-in fade-in duration-200">
                      <div className="flex flex-col gap-4">
                        <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-stitch-on-surface-variant">{translateUI("customColors", currentLang)}</Label>

                        <div className="flex flex-col gap-3">
                          {/* Primary Color Picker */}
                          <div className="flex items-center gap-2 sm:gap-4 bg-white/50 p-2 rounded-2xl border border-stitch-outline/5 hover:bg-white transition-all shadow-sm">
                            <Popover>
                              <PopoverTrigger asChild>
                                <button className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full border-[3px] sm:border-4 border-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-105 transition-transform active:scale-95 overflow-hidden shrink-0 focus-within:ring-2 focus-within:ring-stitch-primary focus-within:ring-offset-2 focus-within:scale-105 outline-none" style={{ backgroundColor: theme.primaryColor }}>
                                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-white drop-shadow" />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 border-none rounded-xl overflow-hidden shadow-2xl z-[100]" sideOffset={10}>
                                <ChromePicker
                                  color={theme.primaryColor}
                                  onChange={(color: any) => theme.setPrimaryColor(color.hex)}
                                  disableAlpha={true}
                                />
                              </PopoverContent>
                            </Popover>
                            <div className="flex-1 flex gap-2 sm:gap-3 items-center justify-between pr-1">
                              <div className="flex flex-col gap-0.5 overflow-hidden">
                                <span className="text-stitch-on-surface text-[10px] sm:text-[11px] font-bold leading-tight truncate">{translateUI("primary", currentLang)}</span>
                                <span className="text-[7px] sm:text-[8px] text-stitch-on-surface-variant/50 font-bold uppercase tracking-wider leading-none truncate">{translateUI("titlesHeaders", currentLang)}</span>
                              </div>
                              <Input
                                type="text"
                                placeholder="#000000"
                                value={theme.primaryColor.toUpperCase()}
                                onChange={(e) => {
                                  let val = e.target.value;
                                  if (val.length > 0 && !val.startsWith("#")) {
                                    val = "#" + val;
                                  }
                                  theme.setPrimaryColor(val);
                                }}
                                className="h-8 w-16 sm:w-28 text-center text-[10px] sm:text-xs font-mono font-bold bg-white/70 border-stitch-outline/15 rounded-lg focus-visible:ring-1 focus-visible:ring-stitch-primary px-1 sm:px-3"
                              />
                            </div>
                          </div>

                          {/* Secondary Color Picker */}
                          <div className="flex items-center gap-2 sm:gap-4 bg-white/50 p-2 rounded-2xl border border-stitch-outline/5 hover:bg-white transition-all shadow-sm">
                            <Popover>
                              <PopoverTrigger asChild>
                                <button className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full border-[3px] sm:border-4 border-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-105 transition-transform active:scale-95 overflow-hidden shrink-0 focus-within:ring-2 focus-within:ring-stitch-primary focus-within:ring-offset-2 focus-within:scale-105 outline-none" style={{ backgroundColor: theme.secondaryColor }}>
                                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-white drop-shadow" />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 border-none rounded-xl overflow-hidden shadow-2xl z-[100]" sideOffset={10}>
                                <ChromePicker
                                  color={theme.secondaryColor}
                                  onChange={(color: any) => theme.setSecondaryColor(color.hex)}
                                  disableAlpha={true}
                                />
                              </PopoverContent>
                            </Popover>
                            <div className="flex-1 flex gap-2 sm:gap-3 items-center justify-between pr-1">
                              <div className="flex flex-col gap-0.5 overflow-hidden">
                                <span className="text-stitch-on-surface text-[10px] sm:text-[11px] font-bold leading-tight truncate">{translateUI("secondary", currentLang)}</span>
                                <span className="text-[7px] sm:text-[8px] text-stitch-on-surface-variant/50 font-bold uppercase tracking-wider leading-none truncate">{translateUI("fieldValues", currentLang)}</span>
                              </div>
                              <Input
                                type="text"
                                placeholder="#000000"
                                value={theme.secondaryColor.toUpperCase()}
                                onChange={(e) => {
                                  let val = e.target.value;
                                  if (val.length > 0 && !val.startsWith("#")) {
                                    val = "#" + val;
                                  }
                                  theme.setSecondaryColor(val);
                                }}
                                className="h-8 w-16 sm:w-28 text-center text-[10px] sm:text-xs font-mono font-bold bg-white/70 border-stitch-outline/15 rounded-lg focus-visible:ring-1 focus-visible:ring-stitch-primary px-1 sm:px-3"
                              />
                            </div>
                          </div>

                          {/* Accent Color Picker */}
                          <div className="flex items-center gap-2 sm:gap-4 bg-white/50 p-2 rounded-2xl border border-stitch-outline/5 hover:bg-white transition-all shadow-sm">
                            <Popover>
                              <PopoverTrigger asChild>
                                <button className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full border-[3px] sm:border-4 border-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-105 transition-transform active:scale-95 overflow-hidden shrink-0 focus-within:ring-2 focus-within:ring-stitch-primary focus-within:ring-offset-2 focus-within:scale-105 outline-none" style={{ backgroundColor: theme.accentColor }}>
                                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-white drop-shadow" />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 border-none rounded-xl overflow-hidden shadow-2xl z-[100]" sideOffset={10}>
                                <ChromePicker
                                  color={theme.accentColor}
                                  onChange={(color: any) => theme.setAccentColor(color.hex)}
                                  disableAlpha={true}
                                />
                              </PopoverContent>
                            </Popover>
                            <div className="flex-1 flex gap-2 sm:gap-3 items-center justify-between pr-1">
                              <div className="flex flex-col gap-0.5 overflow-hidden">
                                <span className="text-stitch-on-surface text-[10px] sm:text-[11px] font-bold leading-tight truncate">{translateUI("accent", currentLang)}</span>
                                <span className="text-[7px] sm:text-[8px] text-stitch-on-surface-variant/50 font-bold uppercase tracking-wider leading-none truncate">{translateUI("labelsOrnaments", currentLang)}</span>
                              </div>
                              <Input
                                type="text"
                                placeholder="#000000"
                                value={theme.accentColor.toUpperCase()}
                                onChange={(e) => {
                                  let val = e.target.value;
                                  if (val.length > 0 && !val.startsWith("#")) {
                                    val = "#" + val;
                                  }
                                  theme.setAccentColor(val);
                                }}
                                className="h-8 w-16 sm:w-28 text-center text-[10px] sm:text-xs font-mono font-bold bg-white/70 border-stitch-outline/15 rounded-lg focus-visible:ring-1 focus-visible:ring-stitch-primary px-1 sm:px-3"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              {activeTab === "spacing" && (
                <div className="flex flex-col gap-8">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-stitch-on-surface-variant">{translateUI("spacingMargins", currentLang)}</Label>
                    <p className="text-[10.5px] text-stitch-on-surface-variant/70 leading-relaxed italic">
                      {translateUI("adjustMarginsDesc", currentLang)}
                    </p>
                  </div>

                  <div className="flex flex-col gap-6 bg-stitch-surface-variant/10 p-4 rounded-2xl border border-stitch-outline/5 shadow-sm">
                    {/* Spacing Section */}
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <Label className="text-[10px] text-stitch-on-surface-variant font-bold uppercase">{translateUI("topPadding", currentLang)}</Label>
                          <span className="text-[10px] font-bold text-stitch-primary">
                            {theme.paddingTop !== undefined ? theme.paddingTop : (theme.paddingY !== undefined ? theme.paddingY : defaultPaddingTop)}px
                          </span>
                        </div>
                        <Slider
                          value={[theme.paddingTop !== undefined ? theme.paddingTop : (theme.paddingY !== undefined ? theme.paddingY : defaultPaddingTop)]}
                          onValueChange={([v]) => theme.setPaddingTop(v)}
                          min={20}
                          max={200}
                          step={2}
                        />
                      </div>


                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <Label className="text-[10px] text-stitch-on-surface-variant font-bold uppercase">{translateUI("leftPadding", currentLang)}</Label>
                          <span className="text-[10px] font-bold text-stitch-primary">{theme.paddingLeft !== undefined ? theme.paddingLeft : (theme.padding !== undefined ? theme.padding : defaultPaddingLeft)}px</span>
                        </div>
                        <Slider
                          value={[theme.paddingLeft !== undefined ? theme.paddingLeft : (theme.padding !== undefined ? theme.padding : defaultPaddingLeft)]}
                          onValueChange={([v]) => theme.setPaddingLeft(v)}
                          min={20}
                          max={150}
                          step={2}
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <Label className="text-[10px] text-stitch-on-surface-variant font-bold uppercase">{translateUI("rightPadding", currentLang)}</Label>
                          <span className="text-[10px] font-bold text-stitch-primary">{theme.paddingRight !== undefined ? theme.paddingRight : (theme.padding !== undefined ? theme.padding : defaultPaddingRight)}px</span>
                        </div>
                        <Slider
                          value={[theme.paddingRight !== undefined ? theme.paddingRight : (theme.padding !== undefined ? theme.padding : defaultPaddingRight)]}
                          onValueChange={([v]) => theme.setPaddingRight(v)}
                          min={20}
                          max={150}
                          step={2}
                        />
                      </div>
                    </div>

                    {/* Typography Section */}
                    <div className="pt-5 border-t border-stitch-outline/10 space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <Label className="text-[10px] text-stitch-on-surface-variant font-bold uppercase">{translateUI("fontSize", currentLang)}</Label>
                          <span className="text-[10px] font-bold text-stitch-primary">{theme.fontSize ?? 9}px</span>
                        </div>
                        <Slider
                          value={[theme.fontSize ?? 9]}
                          onValueChange={([v]) => theme.setFontSize(v)}
                          min={9}
                          max={24}
                          step={0.5}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "graphics" && (
                <Tabs defaultValue="stickers" className="w-full flex flex-col gap-4">
                  <TabsList className="grid w-full grid-cols-2 bg-stitch-surface-variant/20 p-1 rounded-xl">
                    <TabsTrigger value="stickers" className="font-bold py-2 rounded-lg transition-all text-xs cursor-pointer [&:not([data-active])]:hover:!bg-transparent data-active:!bg-gradient-to-r data-active:from-pink-500 data-active:via-rose-500 data-active:to-amber-500 data-active:text-white data-active:shadow-[0_4px_12px_rgba(244,63,94,0.25)] data-active:hover:!bg-gradient-to-r data-active:hover:from-pink-500 data-active:hover:via-rose-500 data-active:hover:to-amber-500">
                      {translateUI("stickers", currentLang)}
                    </TabsTrigger>
                    <TabsTrigger value="backgrounds" className="font-bold py-2 rounded-lg transition-all text-xs cursor-pointer [&:not([data-active])]:hover:!bg-transparent data-active:!bg-gradient-to-r data-active:from-pink-500 data-active:via-rose-500 data-active:to-amber-500 data-active:text-white data-active:shadow-[0_4px_12px_rgba(244,63,94,0.25)] data-active:hover:!bg-gradient-to-r data-active:hover:from-pink-500 data-active:hover:via-rose-500 data-active:hover:to-amber-500">
                      {translateUI("bgImages", currentLang)}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="stickers" className="animate-in fade-in duration-200 mt-2">
                    <StickerSelector />
                  </TabsContent>

                  <TabsContent value="backgrounds" className="animate-in fade-in duration-200 mt-2">
                    <BackgroundSelector />
                  </TabsContent>
                </Tabs>
              )}

              {activeTab === "whatsapp" && (
                <div className="flex flex-col gap-6">
                  <WhatsAppDeliveryCard
                    onSubmitWhatsApp={handleSubmitWhatsApp}
                    isGenerating={isGenerating}
                  />
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onOpenChange={setIsFeedbackOpen}
        initialName={filename}
        onSubmit={handleFeedbackSubmit}
        onSkip={handleSkipDownload}
        isPremium={activeTemplate?.isPremium}
        price={activeTemplate?.price}
        discountPrice={activeTemplate?.discountPrice}
        currency={activeTemplate?.currency}
        downloadFormat={pendingDownloadFormat}
        pdfPrice={activeTemplate?.pdfPrice}
        pdfDiscountPrice={activeTemplate?.pdfDiscountPrice}
        jpgPrice={activeTemplate?.jpgPrice}
        jpgDiscountPrice={activeTemplate?.jpgDiscountPrice}
        pngPrice={activeTemplate?.pngPrice}
        pngDiscountPrice={activeTemplate?.pngDiscountPrice}
        comboPrice={(activeTemplate as any)?.comboPrice}
        comboDiscountPrice={(activeTemplate as any)?.comboDiscountPrice}
      />
      <PriceModal
        isOpen={isPriceModalOpen}
        onOpenChange={handlePriceModalOpenChange}
        isPremium={activeTemplate?.isPremium}
        isGenerating={isGenerating}
        onSelectFormat={async (format, couponCode) => {
          const currentData = {
            ...useBiodataStore.getState().formData,
            ...methods.getValues(),
            stickers: useBiodataStore.getState().formData.stickers,
            layout: useBiodataStore.getState().formData.layout,
          };
          if (activeTemplate?.isPremium) {
            setIsPriceModalOpen(false);
            await processPremiumPaymentAndDownload(currentData, format, filename, couponCode);
          } else {
            try {
              await triggerDownload(currentData, selectedTemplate, format, filename);
            } catch (err) {
              console.error("Free download failed:", err);
            } finally {
              setIsPriceModalOpen(false);
              setIsFeedbackOpen(true);
            }
          }
        }}
        currency={activeTemplate?.currency}
        price={activeTemplate?.price}
        discountPrice={activeTemplate?.discountPrice}
        pdfPrice={activeTemplate?.pdfPrice}
        pdfDiscountPrice={activeTemplate?.pdfDiscountPrice}
        jpgPrice={activeTemplate?.jpgPrice}
        jpgDiscountPrice={activeTemplate?.jpgDiscountPrice}
        pngPrice={activeTemplate?.pngPrice}
        pngDiscountPrice={activeTemplate?.pngDiscountPrice}
        comboPrice={(activeTemplate as any)?.comboPrice}
        comboDiscountPrice={(activeTemplate as any)?.comboDiscountPrice}
      />
      <SandboxModal />

      <Dialog open={isPaymentProcessing}>
        <DialogContent aria-describedby={undefined} className="max-w-[90%] sm:max-w-xs p-6 border-0 bg-background/95 backdrop-blur-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] rounded-3xl flex flex-col items-center justify-center gap-4 text-center [&>button]:hidden ring-1 ring-border/50">
          {paymentStep === "download_failed" ? (
            <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mb-2">
                <X className="w-8 h-8 text-rose-600" />
              </div>
              <div className="space-y-2">
                <DialogTitle className="text-base font-black text-rose-600 uppercase tracking-wider text-rose-600">
                  DOWNLOAD FAILED
                </DialogTitle>
                <div className="text-[11.5px] text-muted-foreground font-semibold leading-relaxed bg-rose-50 p-3.5 rounded-xl border border-rose-100/80">
                  Your payment was successful, but something went wrong on our end while preparing your file.
                  <br /><br />
                  We're sorry for the trouble! Your amount will be automatically refunded within 3 to 7 working days.
                </div>
              </div>
              {paymentIdInfo && (
                <div className="w-full bg-stone-100 p-2.5 rounded-lg flex flex-col gap-1 items-center border border-stone-200">
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">TRANSACTION ID</span>
                  <span className="text-xs font-mono font-bold text-foreground select-all">{paymentIdInfo}</span>
                </div>
              )}
              <Button 
                onClick={() => {
                  setIsProcessing(false);
                  setPaymentStep("idle");
                }}
                className="w-full rounded-full bg-stone-900 hover:bg-stone-800 text-white font-bold h-11 mt-2"
              >
                Close Window
              </Button>
            </div>
          ) : (
            <>
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 border-t-emerald-600 animate-spin" />
                {paymentStep === "downloading" ? (
                  <Download className="w-6 h-6 text-emerald-600 animate-bounce" />
                ) : paymentStep === "verifying" ? (
                  <ShieldCheck className="w-6 h-6 text-emerald-600 animate-pulse" />
                ) : (
                  <Crown className="w-6 h-6 text-emerald-600 fill-emerald-500/10 animate-pulse" />
                )}
              </div>
              <div className="space-y-1 select-none">
                <DialogTitle className="text-sm font-black text-foreground uppercase tracking-wide">
                  {paymentStep === "downloading"
                    ? "Generating Document..."
                    : paymentStep === "verifying"
                      ? "Verifying Payment..."
                      : "Securing Checkout..."}
                </DialogTitle>
                <DialogDescription className="text-[10px] text-muted-foreground font-semibold leading-relaxed">
                  {paymentStep === "downloading"
                    ? "Payment successful! Creating your high-quality biodata and downloading now."
                    : paymentStep === "verifying"
                      ? "Confirming transaction with payment gateway. Please do not close or refresh."
                      : "Opening payment gateway. Please do not close or refresh this page."}
                </DialogDescription>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ToolButton({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-14 h-14 lg:w-16 lg:h-16 flex flex-col items-center justify-center gap-1 lg:gap-1.5 transition-all rounded-xl lg:rounded-2xl shrink-0 cursor-pointer",
        active
          ? "bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white shadow-[0_4px_12px_rgba(244,63,94,0.25)] -translate-y-0.5 border-0"
          : "text-stitch-on-surface-variant hover:text-stitch-primary hover:bg-white hover:shadow-md hover:-translate-y-0.5"
      )}
    >
      {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-4 h-4 lg:w-5 lg:h-5" })}
      <span className="text-[8px] lg:text-[9px] uppercase tracking-wider font-bold">{label}</span>
    </button>
  );
}

const ToolbarItem = React.forwardRef<HTMLButtonElement, { icon: React.ReactNode, label: string, onClick?: () => void, className?: string }>(
  ({ icon, label, onClick, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        onClick={onClick}
        className={cn("flex items-center gap-2 px-3 py-2 rounded-xl text-stitch-on-surface-variant hover:text-stitch-primary hover:bg-stitch-primary/5 transition-all group cursor-pointer", className)}
        title={label}
        {...props}
      >
        {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-4 h-4" })}
        <span className="text-[10px] font-bold uppercase tracking-tight hidden sm:inline">{label}</span>
      </button>
    );
  }
);
ToolbarItem.displayName = "ToolbarItem";

function DetailItem({ label, value }: { label: string, value: string }) {
  return (
    <li className="flex justify-between border-b border-stitch-outline/10 pb-2">
      <span className="text-stitch-on-surface-variant font-medium">{label}</span>
      <span className="text-stitch-on-surface font-bold truncate max-w-[120px]">{value}</span>
    </li>
  );
}

function HoroscopeItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-stitch-on-surface-variant font-medium text-[10px] uppercase tracking-wider">{label}</span>
      <span className="text-stitch-on-surface font-bold text-xs">{value}</span>
    </div>
  );
}

function AlignmentButton({ icon, active = false, onClick }: { icon: React.ReactNode, active?: boolean, onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 py-1.5 rounded-lg flex items-center justify-center transition-all cursor-pointer",
        active
          ? "bg-stitch-primary-container/10 text-stitch-primary"
          : "text-stitch-on-surface-variant hover:bg-stitch-surface-variant/30"
      )}
    >
      {icon}
    </button>
  );
}

function Swatch({ color, onClick }: { color: string, onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-7 h-7 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform active:scale-95 cursor-pointer"
      style={{ backgroundColor: color }}
    />
  );
}

function Corner({ position, color }: { position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right', color: string }) {
  const styles = {
    'top-left': 'top-4 left-4 border-t-[5px] border-l-[5px] rounded-tl-xl',
    'top-right': 'top-4 right-4 border-t-[5px] border-r-[5px] rounded-tr-xl',
    'bottom-left': 'bottom-4 left-4 border-b-[5px] border-l-[5px] rounded-bl-xl',
    'bottom-right': 'bottom-4 right-4 border-b-[5px] border-r-[5px] rounded-br-xl',
  };

  return (
    <div className={cn("absolute w-16 h-16 pointer-events-none", styles[position])} style={{ borderColor: color }} />
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

