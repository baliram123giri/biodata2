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
import { TemplateSelector } from "@/components/editor/TemplateSelector";
import { StickerSelector } from "@/components/editor/StickerSelector";
import { BackgroundSelector } from "@/components/editor/BackgroundSelector";
import { useBiodataStore } from "@/store/useBiodataStore";
import { getTemplateConfig } from "@/lib/frame-config";
import { useThemeStore, FontFamily, FontWeight, Alignment, PALETTES } from "@/store/useThemeStore";
import { useStore } from "zustand";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { biodataSchema, type BiodataFormValues } from "@/types/biodata";
import { useRouter } from "next/navigation";
import { defaultBiodataValues } from "@/lib/default-biodata";
import { BiodataForm } from "@/components/biodata/BiodataForm";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/layout/Logo";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { DownloadDropdown, type DownloadFormat } from "@/components/biodata/DownloadDropdown";
import { useDownloadBiodata, generateJpgDataUrl } from "@/hooks/useDownloadBiodata";
import { FeedbackModal } from "@/components/biodata/FeedbackModal";
import { PriceModal } from "@/components/biodata/PriceModal";
import { useRazorpayPayment } from "@/hooks/useRazorpayPayment";
import { WhatsAppDeliveryCard } from "@/components/biodata/WhatsAppDeliveryCard";
import { GRADIENT_PRESETS } from "@/lib/gradient-presets";
export default function EditPage() {
  const router = useRouter();
  const { formData, selectedTemplate, customTemplates, setFormData } = useBiodataStore();
  const methods = useForm<BiodataFormValues>({
    resolver: zodResolver(biodataSchema) as any,
    defaultValues: defaultBiodataValues,
    mode: "onBlur",
  });

  const theme = useThemeStore();
  const prevTemplateRef = useRef<string | null>(null);
  const biodataHistory = useStore(useBiodataStore.temporal, (state) => state);
  const themeHistory = useStore(useThemeStore.temporal, (state) => state);

  const activeTemplate = customTemplates.find((t) => t.id === selectedTemplate) || getTemplateConfig(selectedTemplate);
  const canUndo = biodataHistory.pastStates.length > 0 || themeHistory.pastStates.length > 0;
  const canRedo = biodataHistory.futureStates.length > 0 || themeHistory.futureStates.length > 0;




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

  // AI Photo Generator states
  const [aiGender, setAiGender] = useState<"male" | "female">("male");
  const [aiStyle, setAiStyle] = useState<"traditional" | "professional">("traditional");
  const [aiAge, setAiAge] = useState("26");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiResultUrl, setAiResultUrl] = useState("");

  // Sync store data to form ONCE when mounted/hydrated
  useEffect(() => {
    if (isMounted && isStoreHydrated && !hasInitializedForm && formData) {
      methods.reset(formData);
      setHasInitializedForm(true);
    }
  }, [isMounted, isStoreHydrated, hasInitializedForm, formData, methods]);

  // Synchronize form changes back to the zustand store with debounce to prevent typing lag
  useEffect(() => {
    const subscription = methods.watch((value) => {
      const timer = setTimeout(() => {
        if (value) {
          setFormData(value as BiodataFormValues);
        }
      }, 400);
      return () => clearTimeout(timer);
    });
    return () => subscription.unsubscribe();
  }, [methods, setFormData]);

  const { handleDownload: triggerDownload, isGenerating } = useDownloadBiodata();
  const { startPayment, SandboxModal, isProcessing: isPaymentProcessing, paymentStep } = useRazorpayPayment();

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
      if (format === "pdf") finalPrice = activeTemplate?.pdfDiscountPrice ?? activeTemplate?.pdfPrice ?? 29;
      else if (format === "docx") finalPrice = activeTemplate?.docxDiscountPrice ?? activeTemplate?.docxPrice ?? 29;
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
        onDownload: async () => {
          await triggerDownload(currentData, selectedTemplate, format, modalFilename);
        }
      });
    } catch (paymentErr) {
      console.error("Payment failed or cancelled:", paymentErr);
    }
  };

  const [zoom, setZoom] = useState(1);
  const [selectedStickersCount, setSelectedStickersCount] = useState(0);

  useEffect(() => {
    const handleSelection = (e: Event) => {
      const selected = (e as CustomEvent).detail || [];
      setSelectedStickersCount(selected.length);
    };
    window.addEventListener("biodata:selection-changed", handleSelection);
    return () => window.removeEventListener("biodata:selection-changed", handleSelection);
  }, []);
  const [fitResetKey, setFitResetKey] = useState(0);
  const [activeTab, setActiveTab] = useState<"templates" | "fields" | "theme" | "spacing" | "photo" | "graphics" | "whatsapp">("templates");
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

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.4));

  const handleFitToScreen = () => {
    if (typeof window === "undefined") return;
    const container = document.getElementById("canvas-container");
    if (!container) return;

    const A4_W = 595;
    const A4_H = 842;
    const isMobile = window.innerWidth < 1024;
    const padding = isMobile ? 24 : 48; // padding around the A4 page in the view

    const availableWidth = container.clientWidth - padding * 2;
    const availableHeight = container.clientHeight - padding * 2;

    const fitWidthZoom = availableWidth / A4_W;
    const fitHeightZoom = availableHeight / A4_H;

    // Minimum zoom to fit both dimensions
    const fitZoom = Math.min(fitWidthZoom, fitHeightZoom);

    // Limit zoom to a reasonable range
    setZoom(Math.max(0.3, Math.min(fitZoom, 1.2)));
    setFitResetKey(k => k + 1);
  };

  // Fix hydration issues and layout listening
  useEffect(() => {
    setIsMounted(true);

    const searchParams = new URLSearchParams(window.location.search);
    const templateParam = searchParams.get('template');

    useBiodataStore.getState().fetchCustomTemplates().then(() => {
      const currentTemplates = useBiodataStore.getState().customTemplates;
      if (templateParam) {
        if (currentTemplates.some(t => t.id === templateParam) || getTemplateConfig(templateParam)) {
          useBiodataStore.getState().setSelectedTemplate(templateParam);
        }
      }
    });

    useBiodataStore.getState().fetchCustomStickers();

    if (window.innerWidth < 1024) {
      setIsLeftOpen(false);
      setIsRightOpen(false);
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

  // Synchronize theme padding and palette with selected template defaults from database
  useEffect(() => {
    if (!isMounted) return;
    const config = getTemplateConfig(selectedTemplate);
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
    }
  }, [selectedTemplate, customTemplates, isMounted, theme]);

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
      // Trigger fit-to-screen when sidebar state changes (after transition)
      const timer = setTimeout(handleFitToScreen, 350);
      return () => clearTimeout(timer);
    }
  }, [isRightOpen, isMounted]);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-stone-100/30 flex flex-col">
        {/* Simple skeleton header */}
        <header className="h-16 border-b border-stone-200/80 bg-white flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            {/* Mock Go Back button */}
            <div className="w-24 h-9 bg-stone-100 rounded-full animate-pulse border border-stone-200" />
          </div>
          <div className="w-28 h-9 bg-stone-200 rounded-full animate-pulse" />
        </header>
        {/* Main loading area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Skeleton Sidebar (Left) */}
          <aside className="w-80 border-r border-stone-200/80 bg-white p-6 hidden lg:flex flex-col gap-6">
            <div className="h-8 w-32 bg-stone-200 rounded-md animate-pulse" />
            <div className="h-10 w-full bg-stone-100 rounded-md animate-pulse" />
            <div className="h-20 w-full bg-stone-100 rounded-md animate-pulse" />
            <div className="h-10 w-full bg-stone-100 rounded-md animate-pulse" />
          </aside>
          {/* Canvas Loading Area */}
          <main className="flex-1 flex items-center justify-center p-6 bg-stone-50/20">
            <PreviewLoader />
          </main>
          {/* Skeleton Sidebar (Right) */}
          <aside className="w-80 border-l border-stone-200/80 bg-white p-6 hidden lg:flex flex-col gap-6">
            <div className="h-8 w-24 bg-stone-200 rounded-md animate-pulse" />
            <div className="h-12 w-full bg-stone-100 rounded-md animate-pulse" />
            <div className="h-12 w-full bg-stone-100 rounded-md animate-pulse" />
          </aside>
        </div>
      </div>
    );
  }

  const handleDownload = async () => {
    const nameField =
      formData.personalDetails?.find((f: any) => f.id === "fullName")?.value ||
      "biodata";
    const cleanName = nameField.replace(/[^a-zA-Z0-9\s-_]/g, "").trim() || "biodata";
    setFilename(cleanName);

    if (activeTemplate?.isPremium) {
      setIsPriceModalOpen(true);
    } else {
      setPendingDownloadFormat("pdf"); // default format
      setIsFeedbackOpen(true);
    }
  };

  const handleFeedbackSubmit = async (modalRating: number, modalFilename: string, modalComment: string, format: DownloadFormat) => {
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

    if (activeTemplate?.isPremium) {
      await processPremiumPaymentAndDownload(formData, format, modalFilename);
    } else {
      await triggerDownload(formData, selectedTemplate, format, modalFilename);
    }
  };

  const handleSkipDownload = async (modalFilename: string, format: DownloadFormat) => {
    setIsFeedbackOpen(false);
    if (activeTemplate?.isPremium) {
      await processPremiumPaymentAndDownload(formData, format, modalFilename);
    } else {
      await triggerDownload(formData, selectedTemplate, format, modalFilename);
    }
  };

  const handleGenerateAiPhoto = async () => {
    setIsAiGenerating(true);
    try {
      const res = await fetch("/api/generate-portrait", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gender: aiGender,
          style: aiStyle,
          age: aiAge,
          religion: methods.getValues().personalDetails?.find((f: any) => f.id === "religion")?.value || "Hindu"
        })
      });
      const data = await res.json();
      if (data.success && data.url) {
        setAiResultUrl(data.url);
      } else {
        console.error("AI Generation failed:", data.error);
      }
    } catch (err) {
      console.error("Error generating AI photo:", err);
    } finally {
      setIsAiGenerating(false);
    }
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


  return (
    <div className="fixed inset-0 overflow-hidden flex flex-col bg-stitch-surface font-sans selection:bg-stitch-primary-container selection:text-stitch-on-primary-container">
      <h1 className="sr-only">Biodata Maker & Matrimonial Profile Creator Studio</h1>
      {/* Top Navigation Bar */}
      <header className="w-full shrink-0 bg-stitch-surface/80 backdrop-blur-xl border-b border-stitch-outline/10 shadow-sm flex justify-between items-center px-4 md:px-6 h-16">
        <div className="flex items-center gap-2 md:gap-4">
          <Button
            variant="ghost"
            className="group gap-1 md:gap-2 px-2.5 py-1.5 md:px-4 md:py-2 text-stitch-primary hover:bg-stitch-primary/10 rounded-full font-medium transition-all flex items-center border border-stitch-primary/20 hover:border-stitch-primary/40 shadow-sm"
            onClick={() => router.push("/", { scroll: false })}
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
                <ToolbarItem icon={<RefreshCcw />} label="Reset" />
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reset Layout Positions?</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to reset all layout positions to their defaults? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0 mt-4">
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <DialogClose asChild onClick={() => useBiodataStore.getState().resetStore()}>
                    <Button className="relative overflow-hidden bg-gradient-primary text-white border-0">
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-1/2 h-full animate-shine pointer-events-none" />
                      <span className="relative">Reset Layout</span>
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
            label="Templates"
            active={isRightOpen && activeTab === "templates"}
            onClick={() => handleTabClick("templates")}
          />
          <ToolButton
            icon={<TypeIcon />}
            label="Fields"
            active={isRightOpen && activeTab === "fields"}
            onClick={() => handleTabClick("fields")}
          />
          <ToolButton
            icon={<Palette />}
            label="Theme"
            active={isRightOpen && activeTab === "theme"}
            onClick={() => handleTabClick("theme")}
          />
          <ToolButton
            icon={<Sliders className="w-5 h-5" />}
            label="Spacing"
            active={isRightOpen && activeTab === "spacing"}
            onClick={() => handleTabClick("spacing")}
          />

          <ToolButton
            icon={<Sparkles />}
            label="Graphics"
            active={isRightOpen && activeTab === "graphics"}
            onClick={() => handleTabClick("graphics")}
          />
        </nav>

        {/* Canvas Area */}
        <main id="canvas-container" className="flex-1 overflow-hidden relative bg-transparent h-full flex items-center justify-center">
          {customTemplates.length === 0 ? (
            <PreviewLoader />
          ) : (
            <KonvaPreview scale={zoom} isDesigner={true} resetKey={fitResetKey} />
          )}

          {/* Floating Left Toolbar - Desktop only, overlaid on the canvas */}
          {isLeftOpen && (
            <nav className="hidden lg:flex absolute left-6 top-1/2 -translate-y-1/2 z-20 flex-col items-center py-4 px-2 gap-2 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-black/5">
              <ToolButton
                icon={<LayoutDashboard />}
                label="Templates"
                active={isRightOpen && activeTab === "templates"}
                onClick={() => handleTabClick("templates")}
              />
              <ToolButton
                icon={<TypeIcon />}
                label="Fields"
                active={isRightOpen && activeTab === "fields"}
                onClick={() => handleTabClick("fields")}
              />
              <ToolButton
                icon={<Palette />}
                label="Theme"
                active={isRightOpen && activeTab === "theme"}
                onClick={() => handleTabClick("theme")}
              />
              <ToolButton
                icon={<Sliders className="w-5 h-5" />}
                label="Spacing"
                active={isRightOpen && activeTab === "spacing"}
                onClick={() => handleTabClick("spacing")}
              />
              <ToolButton
                icon={<ImageIcon />}
                label="Photo"
                active={isRightOpen && activeTab === "photo"}
                onClick={() => handleTabClick("photo")}
              />
              <ToolButton
                icon={<Sparkles />}
                label="Graphics"
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
              {Math.round(zoom * 100)}%
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
            <div className="p-6 pb-4 relative">
              <h2 className="text-lg font-black tracking-tight text-stitch-on-surface capitalize">
                {activeTab}
              </h2>
              <p className="text-[11px] text-stitch-on-surface-variant font-bold uppercase tracking-widest mt-1">
                Customize Design Properties
              </p>

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
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-stitch-on-surface-variant">Edit Form Details</Label>
                    <p className="text-[10.5px] text-stitch-on-surface-variant/70 leading-relaxed italic">
                      Modify your biodata details in real-time. Changes will update instantly on the canvas.
                    </p>
                  </div>
                  <FormProvider {...methods}>
                    <BiodataForm />
                  </FormProvider>
                </div>
              )}

              {activeTab === "theme" && (
                <div className="flex flex-col gap-6">
                  <Tabs defaultValue="bg" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-stitch-surface-variant/20 p-1 rounded-xl mb-6">
                      <TabsTrigger value="bg" className="font-bold py-2 rounded-lg transition-all text-xs cursor-pointer data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:via-rose-500 data-[state=active]:to-amber-500 data-[state=active]:text-white data-[state=active]:shadow-[0_4px_12px_rgba(244,63,94,0.25)]">
                        Background Themes
                      </TabsTrigger>
                      <TabsTrigger value="text" className="font-bold py-2 rounded-lg transition-all text-xs cursor-pointer data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:via-rose-500 data-[state=active]:to-amber-500 data-[state=active]:text-white data-[state=active]:shadow-[0_4px_12px_rgba(244,63,94,0.25)]">
                        Text Themes
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="bg" className="flex flex-col gap-4 animate-in fade-in duration-200">
                      <div className="flex flex-col gap-3">
                        <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-stitch-on-surface-variant">Theme Palettes</Label>
                        <div className="grid grid-cols-2 gap-2 max-h-[360px] overflow-y-auto p-1.5 border border-stitch-outline/5 rounded-2xl bg-stitch-surface-variant/5 shadow-inner">
                          {/* None / Reset option */}
                          {(() => {
                            const isNone = theme.selectedPaletteName === null;
                            return (
                              <button
                                onClick={() => {
                                  theme.setPalette({ name: "None", primary: "#800000", secondary: "#333333", accent: "#D4AF37" });
                                  if (window.innerWidth < 1024) {
                                    setIsRightOpen(false);
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
                                <span className="text-[11px] font-bold text-stitch-on-surface-variant">None</span>
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
                                      if (window.innerWidth < 1024) {
                                        setIsRightOpen(false);
                                      }
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
                                    if (window.innerWidth < 1024) {
                                      setIsRightOpen(false);
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
                        <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-stitch-on-surface-variant">Custom Colors</Label>

                        <div className="flex flex-col gap-3">
                          {/* Primary Color Picker */}
                          <div className="flex items-center gap-4 bg-white/50 p-2 rounded-2xl border border-stitch-outline/5 hover:bg-white transition-all shadow-sm">
                            <label className="relative w-10 h-10 rounded-full border-4 border-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-105 transition-transform active:scale-95 overflow-hidden shrink-0 focus-within:ring-2 focus-within:ring-stitch-primary focus-within:ring-offset-2 focus-within:scale-105 outline-none" style={{ backgroundColor: theme.primaryColor }}>
                              <input
                                type="color"
                                value={theme.primaryColor}
                                onChange={(e) => theme.setPrimaryColor(e.target.value)}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                              />
                              <Sparkles className="w-4 h-4 text-white drop-shadow" />
                            </label>
                            <div className="flex-1 flex gap-3 items-center justify-between pr-1">
                              <div className="flex flex-col gap-0.5">
                                <span className="text-stitch-on-surface text-[11px] font-bold leading-tight">Primary</span>
                                <span className="text-[8px] text-stitch-on-surface-variant/50 font-bold uppercase tracking-wider leading-none">Titles & Headers</span>
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
                                className="h-8 w-28 text-center text-xs font-mono font-bold bg-white/70 border-stitch-outline/15 rounded-lg focus-visible:ring-1 focus-visible:ring-stitch-primary"
                              />
                            </div>
                          </div>

                          {/* Secondary Color Picker */}
                          <div className="flex items-center gap-4 bg-white/50 p-2 rounded-2xl border border-stitch-outline/5 hover:bg-white transition-all shadow-sm">
                            <label className="relative w-10 h-10 rounded-full border-4 border-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-105 transition-transform active:scale-95 overflow-hidden shrink-0 focus-within:ring-2 focus-within:ring-stitch-primary focus-within:ring-offset-2 focus-within:scale-105 outline-none" style={{ backgroundColor: theme.secondaryColor }}>
                              <input
                                type="color"
                                value={theme.secondaryColor}
                                onChange={(e) => theme.setSecondaryColor(e.target.value)}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                              />
                              <Sparkles className="w-4 h-4 text-white drop-shadow" />
                            </label>
                            <div className="flex-1 flex gap-3 items-center justify-between pr-1">
                              <div className="flex flex-col gap-0.5">
                                <span className="text-stitch-on-surface text-[11px] font-bold leading-tight">Secondary</span>
                                <span className="text-[8px] text-stitch-on-surface-variant/50 font-bold uppercase tracking-wider leading-none">Field Values</span>
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
                                className="h-8 w-28 text-center text-xs font-mono font-bold bg-white/70 border-stitch-outline/15 rounded-lg focus-visible:ring-1 focus-visible:ring-stitch-primary"
                              />
                            </div>
                          </div>

                          {/* Accent Color Picker */}
                          <div className="flex items-center gap-4 bg-white/50 p-2 rounded-2xl border border-stitch-outline/5 hover:bg-white transition-all shadow-sm">
                            <label className="relative w-10 h-10 rounded-full border-4 border-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-105 transition-transform active:scale-95 overflow-hidden shrink-0 focus-within:ring-2 focus-within:ring-stitch-primary focus-within:ring-offset-2 focus-within:scale-105 outline-none" style={{ backgroundColor: theme.accentColor }}>
                              <input
                                type="color"
                                value={theme.accentColor}
                                onChange={(e) => theme.setAccentColor(e.target.value)}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                              />
                              <Sparkles className="w-4 h-4 text-white drop-shadow" />
                            </label>
                            <div className="flex-1 flex gap-3 items-center justify-between pr-1">
                              <div className="flex flex-col gap-0.5">
                                <span className="text-stitch-on-surface text-[11px] font-bold leading-tight">Accent</span>
                                <span className="text-[8px] text-stitch-on-surface-variant/50 font-bold uppercase tracking-wider leading-none">Labels & Ornaments</span>
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
                                className="h-8 w-28 text-center text-xs font-mono font-bold bg-white/70 border-stitch-outline/15 rounded-lg focus-visible:ring-1 focus-visible:ring-stitch-primary"
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
                    <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-stitch-on-surface-variant">Spacing & Padding</Label>
                    <p className="text-[10.5px] text-stitch-on-surface-variant/70 leading-relaxed italic">
                      Adjust horizontal and vertical page margins to perfectly compact or space out your content layout.
                    </p>
                  </div>

                  <div className="flex flex-col gap-6 bg-stitch-surface-variant/10 p-4 rounded-2xl border border-stitch-outline/5 shadow-sm">
                    {/* Spacing Section */}
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <Label className="text-[10px] text-stitch-on-surface-variant font-bold uppercase">Horizontal Padding (X)</Label>
                          <span className="text-[10px] font-bold text-stitch-primary">{theme.padding}px</span>
                        </div>
                        <Slider
                          value={[theme.padding]}
                          onValueChange={([v]) => theme.setPadding(v)}
                          min={40}
                          max={100}
                          step={4}
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <Label className="text-[10px] text-stitch-on-surface-variant font-bold uppercase">Vertical Padding (Y)</Label>
                          <span className="text-[10px] font-bold text-stitch-primary">
                            {theme.paddingY !== undefined ? theme.paddingY : (getTemplateConfig(useBiodataStore.getState().selectedTemplate)?.defaultYPadding ?? theme.padding)}px
                          </span>
                        </div>
                        <Slider
                          value={[theme.paddingY !== undefined ? theme.paddingY : (getTemplateConfig(useBiodataStore.getState().selectedTemplate)?.defaultYPadding ?? theme.padding)]}
                          onValueChange={([v]) => theme.setPaddingY(v)}
                          min={20}
                          max={150}
                          step={2}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}



              {activeTab === "photo" && (
                <div className="flex flex-col gap-6 animate-in fade-in duration-200">
                  <div className="space-y-4">
                    <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-stitch-on-surface-variant">Profile Photo</Label>
                    <ImageUpload
                      value={formData.photo}
                      onChange={(url) => {
                        methods.setValue("photo", url || "");
                        if (url && window.innerWidth < 1024) {
                          setIsRightOpen(false);
                        }
                      }}
                      aspect={3 / 4}
                    />
                    <p className="text-[10px] text-stitch-on-surface-variant/70 leading-relaxed italic">
                      Tip: A clear portrait with a simple background looks best in matrimonial biodata.
                    </p>
                  </div>

                  <div className="border-t border-stitch-outline/10 my-1" />

                  {/* AI Passport Photo Generator */}
                  <div className="flex flex-col gap-4 bg-stitch-surface-variant/5 p-4 rounded-2xl border border-stitch-outline/5 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-stitch-primary animate-pulse" />
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-stitch-on-surface">AI Passport Photo Generator</Label>
                    </div>

                    <p className="text-[10px] text-stitch-on-surface-variant/70 leading-relaxed">
                      Don't have a professional photo? Generate a realistic Indian matrimonial portrait instantly for free!
                    </p>

                    {/* Gender Selection */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[9.5px] uppercase tracking-wider font-bold text-stitch-on-surface-variant">Gender</span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setAiGender("male")}
                          className={cn(
                            "py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border",
                            aiGender === "male"
                              ? "bg-stitch-primary border-stitch-primary text-white shadow-sm font-extrabold"
                              : "bg-white border-stitch-outline/10 text-stitch-on-surface hover:bg-stitch-surface"
                          )}
                        >
                          Groom (Male)
                        </button>
                        <button
                          type="button"
                          onClick={() => setAiGender("female")}
                          className={cn(
                            "py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border",
                            aiGender === "female"
                              ? "bg-stitch-primary border-stitch-primary text-white shadow-sm font-extrabold"
                              : "bg-white border-stitch-outline/10 text-stitch-on-surface hover:bg-stitch-surface"
                          )}
                        >
                          Bride (Female)
                        </button>
                      </div>
                    </div>

                    {/* Style Selection */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[9.5px] uppercase tracking-wider font-bold text-stitch-on-surface-variant">Attire Style</span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setAiStyle("traditional")}
                          className={cn(
                            "py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border",
                            aiStyle === "traditional"
                              ? "bg-stitch-primary border-stitch-primary text-white shadow-sm font-extrabold"
                              : "bg-white border-stitch-outline/10 text-stitch-on-surface hover:bg-stitch-surface"
                          )}
                        >
                          Traditional
                        </button>
                        <button
                          type="button"
                          onClick={() => setAiStyle("professional")}
                          className={cn(
                            "py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border",
                            aiStyle === "professional"
                              ? "bg-stitch-primary border-stitch-primary text-white shadow-sm font-extrabold"
                              : "bg-white border-stitch-outline/10 text-stitch-on-surface hover:bg-stitch-surface"
                          )}
                        >
                          Formal Suit
                        </button>
                      </div>
                    </div>

                    {/* Age Input Dropdown */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[9.5px] uppercase tracking-wider font-bold text-stitch-on-surface-variant">Target Age</span>
                      <select
                        value={aiAge}
                        onChange={(e) => setAiAge(e.target.value)}
                        className="w-full p-2.5 text-xs bg-white border border-stitch-outline/15 rounded-xl text-stitch-on-surface font-semibold focus:outline-none focus:ring-1 focus:ring-stitch-primary cursor-pointer"
                      >
                        {[22, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35].map(a => (
                          <option key={a} value={a}>{a} Years Old</option>
                        ))}
                      </select>
                    </div>

                    {/* Generate Button */}
                    <Button
                      type="button"
                      onClick={handleGenerateAiPhoto}
                      disabled={isAiGenerating}
                      className="w-full mt-2 py-5 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-amber-500 hover:opacity-90 text-white font-bold cursor-pointer transition-all duration-300 shadow-md flex items-center justify-center gap-2"
                    >
                      {isAiGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>Generating Portrait...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-[#E6C97A] fill-[#E6C97A]" />
                          <span>Generate Free Portrait</span>
                        </>
                      )}
                    </Button>

                    {/* Preview Generated AI Portrait */}
                    {aiResultUrl && (
                      <div className="flex flex-col gap-3 mt-2 border border-stitch-outline/10 bg-white p-3 rounded-2xl shadow-sm animate-in zoom-in duration-200">
                        <span className="text-[9.5px] uppercase tracking-wider font-bold text-stitch-primary text-center">Generated Result</span>
                        
                        <div className="relative aspect-[3/4] w-32 mx-auto rounded-xl overflow-hidden border border-black/5 shadow-md">
                          <img
                            src={aiResultUrl}
                            alt="AI Passport Photo"
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <Button
                          type="button"
                          onClick={() => {
                            methods.setValue("photo", aiResultUrl);
                            setAiResultUrl(""); // clear preview once applied
                            if (window.innerWidth < 1024) {
                              setIsRightOpen(false);
                            }
                          }}
                          className="w-full py-2.5 rounded-xl bg-stitch-primary hover:bg-stitch-primary/95 text-white font-bold cursor-pointer transition-all text-xs"
                        >
                          Apply to Biodata
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "graphics" && (
                <Tabs defaultValue="stickers" className="w-full flex flex-col gap-4">
                  <TabsList className="grid w-full grid-cols-2 bg-stitch-surface-variant/20 p-1 rounded-xl">
                    <TabsTrigger value="stickers" className="font-bold py-2 rounded-lg transition-all text-xs">
                      Stickers
                    </TabsTrigger>
                    <TabsTrigger value="backgrounds" className="font-bold py-2 rounded-lg transition-all text-xs">
                      BG Images
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="stickers" className="animate-in fade-in duration-200 mt-2">
                    <StickerSelector
                      onSelect={() => {
                        if (window.innerWidth < 1024) {
                          setIsRightOpen(false);
                        }
                      }}
                    />
                  </TabsContent>

                  <TabsContent value="backgrounds" className="animate-in fade-in duration-200 mt-2">
                    <BackgroundSelector
                      onSelect={() => {
                        if (window.innerWidth < 1024) {
                          setIsRightOpen(false);
                        }
                      }}
                    />
                  </TabsContent>
                </Tabs>
              )}

              {activeTab === "whatsapp" && (
                <div className="flex flex-col gap-6">
                  <WhatsAppDeliveryCard
                    onTriggerDownload={handleDownload}
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
        docxPrice={activeTemplate?.docxPrice}
        docxDiscountPrice={activeTemplate?.docxDiscountPrice}
        jpgPrice={activeTemplate?.jpgPrice}
        jpgDiscountPrice={activeTemplate?.jpgDiscountPrice}
        pngPrice={activeTemplate?.pngPrice}
        pngDiscountPrice={activeTemplate?.pngDiscountPrice}
        comboPrice={(activeTemplate as any)?.comboPrice}
        comboDiscountPrice={(activeTemplate as any)?.comboDiscountPrice}
      />
      <PriceModal
        isOpen={isPriceModalOpen}
        onOpenChange={setIsPriceModalOpen}
        onSelectFormat={async (format, couponCode) => {
          setIsPriceModalOpen(false);
          if (activeTemplate?.isPremium) {
            await processPremiumPaymentAndDownload(formData, format, filename, couponCode);
          } else {
            await triggerDownload(formData, selectedTemplate, format, filename);
          }
        }}
        currency={activeTemplate?.currency}
        price={activeTemplate?.price}
        discountPrice={activeTemplate?.discountPrice}
        pdfPrice={activeTemplate?.pdfPrice}
        pdfDiscountPrice={activeTemplate?.pdfDiscountPrice}
        docxPrice={activeTemplate?.docxPrice}
        docxDiscountPrice={activeTemplate?.docxDiscountPrice}
        jpgPrice={activeTemplate?.jpgPrice}
        jpgDiscountPrice={activeTemplate?.jpgDiscountPrice}
        pngPrice={activeTemplate?.pngPrice}
        pngDiscountPrice={activeTemplate?.pngDiscountPrice}
        comboPrice={(activeTemplate as any)?.comboPrice}
        comboDiscountPrice={(activeTemplate as any)?.comboDiscountPrice}
      />
      <SandboxModal />

      {/* Full-screen secure checkout loading screen */}
      <Dialog open={isPaymentProcessing}>
        <DialogContent className="max-w-[90%] sm:max-w-xs p-6 border-0 bg-background/95 backdrop-blur-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] rounded-3xl flex flex-col items-center justify-center gap-4 text-center [&>button]:hidden ring-1 ring-border/50">
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

