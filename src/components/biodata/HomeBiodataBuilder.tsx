"use client";

import { useForm, FormProvider, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { biodataSchema, type BiodataFormValues } from "@/types/biodata";
import { BiodataForm, COMMUNITY_FIELDS, COMMUNITY_HEADER_DEFAULTS } from "@/components/biodata/BiodataForm";
import dynamic from "next/dynamic";
import { defaultBiodataValues } from "@/lib/default-biodata";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Download, RotateCcw, Sparkles, LayoutDashboard, ArrowRight, Loader2, X, Crown, ShieldCheck, Wand2, Eye } from "lucide-react";
import { DownloadDropdown, type DownloadFormat } from "@/components/biodata/DownloadDropdown";
import { useRouter } from "next/navigation";
import { useDownloadBiodata, generateJpgDataUrl } from "@/hooks/useDownloadBiodata";
import { WhatsAppDeliveryCard } from "@/components/biodata/WhatsAppDeliveryCard";
import { CompanyLogoFeature } from "@/components/biodata/CompanyLogoFeature";
const FeedbackModal = dynamic(() => import("./FeedbackModal").then(mod => mod.FeedbackModal));
const PriceModal = dynamic(() => import("./PriceModal").then(mod => mod.PriceModal));
import { useRazorpayPayment } from "@/hooks/useRazorpayPayment";
import { getReligionTheme } from "@/lib/religionThemes";


import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { useState, useEffect, useRef, useMemo } from "react";

import { translations, translateUI } from "@/lib/translations";
import { useBiodataStore } from "@/store/useBiodataStore";
import { useThemeStore } from "@/store/useThemeStore";


import { CustomDrawer, CustomDrawerHeader, CustomDrawerTitle } from "@/components/ui/custom-drawer";
const TemplateSelector = dynamic(() => import("@/components/editor/TemplateSelector").then(mod => mod.TemplateSelector));
import { TemplateFilter } from "@/components/editor/TemplateFilter";
import { getTemplateConfig, getFrameImageUrl } from "@/lib/frame-config";

import { PreviewLoader } from "@/components/biodata/PreviewLoader";

// Konva uses canvas - must be client-only
const KonvaPreview = dynamic(
  () => import("@/components/editor/KonvaPreview").then((mod) => mod.KonvaPreview),
  {
    ssr: false,
    loading: () => <PreviewLoader />
  }
);


const resolveLanguageKey = (lang?: string) => {
  if (!lang) return undefined;
  const mapping: Record<string, string> = {
    "Marathi": "मराठी",
    "Hindi": "हिंदी",
    "Gujarati": "ગુજરાતી",
    "Bengali": "বাংলা",
    "Tamil": "தமிழ்",
    "Telugu": "తెలుగు",
    "Kannada": "ಕನ್ನಡ",
    "Punjabi": "ਪੰਜਾਬੀ",
    "Urdu": "اردو",
    "marathi": "मराठी",
    "hindi": "हिंदी",
  };
  return mapping[lang] || lang;
};

interface HomeBiodataBuilderProps {
  defaultCommunity?: string;
  defaultReligion?: string;
  defaultTitle?: string;
  defaultTemplateId?: string;
  hideCommunityAndReligion?: boolean;
  builderTitle?: string;
  builderSubtitle?: React.ReactNode;
  defaultLanguage?: string;
  forceLanguage?: string;
  hideHeader?: boolean;
}

/**
 * HomeBiodataBuilder - The full biodata creation experience embedded on the homepage.
 * Includes form, live preview, template picker, and download/export actions.
 */
export function HomeBiodataBuilder({
  defaultCommunity,
  defaultReligion,
  defaultTitle,
  defaultTemplateId,
  hideCommunityAndReligion = false,
  builderTitle,
  builderSubtitle,
  defaultLanguage,
  forceLanguage,
  hideHeader = false,
}: HomeBiodataBuilderProps = {}) {
  const {
    formData: storedData,
    selectedTemplate: storedTemplate,
    customTemplates,
    setFormData,
    setSelectedTemplate,
    resetStore,
    resetFormDataOnly,
    resetDesignOnly
  } = useBiodataStore();

  const theme = useThemeStore();
  const prevTemplateRef = useRef<string | null>(null);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const { handleDownload: triggerDownload, sendWhatsAppDelivery, isGenerating } = useDownloadBiodata();
  const { startPayment, SandboxModal, isProcessing: isPaymentProcessing, paymentStep, paymentIdInfo, setPaymentStep, setIsProcessing } = useRazorpayPayment();
  const [isHydrated, setIsHydrated] = useState(false);

  const isMuslimPage = defaultReligion === "Muslim";
  const religionTheme = getReligionTheme(defaultReligion);


  // Rating & Feedback Modal states
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [pendingDownloadFormat, setPendingDownloadFormat] = useState<DownloadFormat | null>(null);
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
          const res = await sendWhatsAppDelivery(phoneNumber, countryCode, currentData, storedTemplate, theme);
          resolve(res);
          setIsFeedbackOpen(true);
        } catch (err: any) {
          reject(err);
        }
      }
    });
  };
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleNavigateToEdit = (tab?: string) => {
    setIsNavigating(true);
    const query = tab ? `?tab=${tab}` : "";
    router.push(`/edit${query}`);
  };

  const handleOpenTemplatesDrawer = () => {
    if (window.innerWidth < 1024) {
      setIsMobileDrawerOpen(true);
    } else {
      setIsDrawerOpen(true);
    }
  };
  const [hasInitialized, setHasInitialized] = useState(false);
  const [showMobileBar, setShowMobileBar] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY || document.documentElement.scrollTop;
      const customSection = document.getElementById("photo-customization-section");

      if (customSection) {
        const rect = customSection.getBoundingClientRect();
        // Hide the mobile sticky bar once the user scrolls back up and reaches 
        // the Photo & Customization section (meaning the section top is visible, rect.top >= 0).
        // Show persistently only when they scroll past it (rect.top < 0).
        setShowMobileBar(rect.top < 0);
      } else {
        // Fallback if the element is not yet rendered
        setShowMobileBar(scrollPos > 400);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Execute immediately on mount
    handleScroll();

    // Run repeated checks for the first 1.5s to capture scroll-restoration timing instantly
    const interval = setInterval(handleScroll, 100);
    const timeout = setTimeout(() => clearInterval(interval), 1500);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  const initialDefaultValues = useMemo(() => {
    const base = { ...defaultBiodataValues };
    const resolvedLang = resolveLanguageKey(defaultLanguage);
    if (resolvedLang) {
      base.language = resolvedLang;
    }
    if (defaultCommunity) {
      base.community = defaultCommunity;
    }
    if (defaultTitle) {
      base.title = defaultTitle;
    }

    if (defaultCommunity && COMMUNITY_FIELDS[defaultCommunity]) {
      const standardIds = ["fullName", "dateOfBirth", "timeOfBirth", "placeOfBirth", "height", "maritalStatus", "bloodGroup", "complexion"];
      const newPersonal: any[] = [];
      
      // Add standard fields
      defaultBiodataValues.personalDetails.forEach(f => {
        if (standardIds.includes(f.id)) {
          newPersonal.push({ ...f });
        }
      });
      
      // Add community specific fields
      const specFields = COMMUNITY_FIELDS[defaultCommunity];
      specFields.forEach(f => {
        let val = f.value || "";
        if (f.id === "religion" && defaultReligion) {
          val = defaultReligion;
        }
        newPersonal.push({
          ...f,
          value: val
        });
      });
      
      base.personalDetails = newPersonal;
    } else if (defaultReligion) {
      if (base.personalDetails) {
        base.personalDetails = base.personalDetails.map(f => 
          f.id === "religion" ? { ...f, value: defaultReligion } : f
        );
      }
    }

    if (defaultCommunity && COMMUNITY_HEADER_DEFAULTS[defaultCommunity]) {
      const defaults = COMMUNITY_HEADER_DEFAULTS[defaultCommunity]?.[base.language || "English"] || 
                       COMMUNITY_HEADER_DEFAULTS[defaultCommunity]?.English || 
                       { mantra: "", title: "Biodata" };
      base.mantra = defaults.mantra;
      if (!defaultTitle) {
        base.title = defaults.title;
      }
    }

    return base;
  }, [defaultCommunity, defaultTitle, defaultReligion, defaultLanguage]);


  const methods = useForm<BiodataFormValues>({
    resolver: zodResolver(biodataSchema) as any,
    defaultValues: initialDefaultValues,
    mode: "onBlur",
  });

  // Handle hydration and initial load: preserves form data values, but resets template, theme, and stickers when landing back on the homepage
  useEffect(() => {
    setIsHydrated(true);

    // Load dynamic templates from database on initial page load
    useBiodataStore.getState().fetchInitialTemplate?.(defaultTemplateId);

    const performHomeReset = () => {
      // Run store/theme resets SYNCHRONOUSLY so the template-color sync effect (which
      // depends on isHydrated) runs AFTER the reset, not before — preventing a flash
      // where template colors are applied then immediately overridden by resetTheme().
      // 1. Reset template, layout and stickers in biodata store while preserving form values
      useBiodataStore.getState().resetDesignOnly();
      if (defaultTemplateId) {
        useBiodataStore.getState().setSelectedTemplate(defaultTemplateId);
      }
      // 2. Reset custom theme settings (colors, background, fonts, padding, etc.)
      useThemeStore.getState().resetTheme();

      // Defer ONLY the form reset by one event loop tick. This ensures any unmount cleanup
      // from the previous page (e.g., EditPage's watch saving community/mantra to the store)
      // has fully completed before we read from the store to initialize the form.
      setTimeout(() => {
        const currentStoredData = useBiodataStore.getState().formData;
        
        const mergedDefaults = { ...defaultBiodataValues };
        const finalData = { ...mergedDefaults, ...currentStoredData };

        const resolvedLang = resolveLanguageKey(forceLanguage || defaultLanguage);
        if (resolvedLang) {
          finalData.language = resolvedLang;
        }
        if (defaultCommunity) {
          finalData.community = defaultCommunity;
        }
        if (defaultTitle) {
          finalData.title = defaultTitle;
        }
        if (defaultReligion) {
          if (finalData.personalDetails) {
            finalData.personalDetails = finalData.personalDetails.map(f => 
              f.id === "religion" ? { ...f, value: defaultReligion } : f
            );
          }
        }

        methods.reset(finalData);
        useBiodataStore.getState().setFormData(finalData);
        setHasInitialized(true);
      }, 0);
    };

    // Register a listener for when hydration completes
    const unsub = useBiodataStore.persist.onFinishHydration(() => {
      performHomeReset();
    });

    // If store is already hydrated, run reset immediately
    if (useBiodataStore.persist.hasHydrated()) {
      performHomeReset();
    }

    return () => unsub();
  }, [methods, defaultTemplateId, defaultCommunity, defaultTitle, defaultReligion, defaultLanguage, forceLanguage]);

  // Synchronize theme padding and palette with selected template defaults from database
  useEffect(() => {
    if (!isHydrated) return;
    const config = customTemplates.find((t) => t.id === storedTemplate) || getTemplateConfig(storedTemplate);
    if (!config) return;

    const configKey = `${storedTemplate}_${config.defaultPrimary}_${config.defaultSecondary}_${config.defaultAccent}`;
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
  }, [storedTemplate, customTemplates, isHydrated, theme]);

  useEffect(() => {
    if (!hasInitialized) return;

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
  }, [methods, setFormData, hasInitialized]);

  const currentLang = useWatch({ control: methods.control, name: "language" }) || "English";
  const t = translations[currentLang] || translations["English"];

  const handleReset = () => {
    resetFormDataOnly();
    const mergedDefaults = { ...defaultBiodataValues };
    if (defaultCommunity) {
      mergedDefaults.community = defaultCommunity;
    }
    if (defaultTitle) {
      mergedDefaults.title = defaultTitle;
    }
    if (defaultReligion) {
      const religionField = mergedDefaults.personalDetails?.find(f => f.id === "religion");
      if (religionField) {
        religionField.value = defaultReligion;
      }
    }
    if (defaultTemplateId) {
      setSelectedTemplate(defaultTemplateId);
    }
    methods.reset(mergedDefaults);
    setShowResetDialog(false);
  };

  const handleDownload = async () => {
    const currentData = methods.getValues();
    const nameField =
      currentData.personalDetails?.find((f: any) => f.id === "fullName")?.value ||
      "biodata";
    const cleanName = nameField.replace(/[\\/:*?"<>|]/g, "").trim() || "biodata";
    setFilename(cleanName);

    setIsPriceModalOpen(true);
  };

  const processPremiumPaymentAndDownload = async (currentData: any, format: DownloadFormat, modalFilename: string, couponCode?: string) => {
    try {
      const fullName = currentData.personalDetails?.find((f: any) => f.id === "fullName")?.value || modalFilename || "";
      // Robust email lookup to capture the proper email address (including custom labels or IDs)
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
      if (format === "combo") finalPrice = activeTemplate?.comboDiscountPrice ?? activeTemplate?.comboPrice ?? 99;
      else if (format === "pdf") finalPrice = activeTemplate?.pdfDiscountPrice ?? activeTemplate?.pdfPrice ?? 49;
      else if (format === "jpg") finalPrice = activeTemplate?.jpgDiscountPrice ?? activeTemplate?.jpgPrice ?? 19;
      else if (format === "png") finalPrice = activeTemplate?.pngDiscountPrice ?? activeTemplate?.pngPrice ?? 29;

      await startPayment({
        amount: finalPrice,
        format,
        templateId: storedTemplate,
        customerName: fullName,
        customerEmail: properEmail,
        customerPhone: properPhone,
        currency: activeTemplate?.currency || "INR",
        couponCode: couponCode,
        onDownload: async (orderId?: string) => {
          const result = await triggerDownload(currentData, storedTemplate, format, modalFilename, orderId);
          if (result && !result.success) {
            throw result.error || new Error("Download failed");
          }

          if (pendingAction === "whatsapp" && pendingWhatsAppRef.current) {
            try {
              const res = await sendWhatsAppDelivery(
                pendingWhatsAppRef.current.phoneNumber,
                pendingWhatsAppRef.current.countryCode,
                currentData,
                storedTemplate,
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

  const handleFeedbackSubmit = async (modalRating: number, modalFilename: string, modalComment: string) => {
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


  /** Generate a JPG data URL for the WhatsApp share button */
  const handleGenerateShareImage = async (): Promise<string> => {
    return await generateJpgDataUrl();
  };

  // Manage drawer open state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Show floating template picker only while the builder section is in view
  const builderRef = useRef<HTMLElement>(null);
  const [isBuilderVisible, setIsBuilderVisible] = useState(false);

  useEffect(() => {
    const el = builderRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsBuilderVisible(entry.isIntersecting),
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Get current template for the box preview
  const currentTemplate = getTemplateConfig(storedTemplate);
  const activeTemplate = customTemplates.find((t) => t.id === storedTemplate) || currentTemplate;

  return (
    <FormProvider {...methods}>
      {/* Custom slow-floating style tag for premium designer look */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes gentle-float {
          0%, 100% { transform: translateY(-50%) translateX(0); }
          50% { transform: translateY(-52%) translateX(-3px); }
        }
        .animate-gentle-float {
          animation: gentle-float 4s ease-in-out infinite;
        }
        ${religionTheme ? `
          .mobile-toolbar-btn:hover {
            color: ${religionTheme.primary} !important;
          }
          .mobile-toolbar-btn:hover svg {
            color: ${religionTheme.primary} !important;
          }
          .mobile-toolbar-btn-icon {
            transition: color 0.2s ease-in-out;
          }
          .mobile-toolbar-btn:hover .mobile-toolbar-btn-icon {
            color: ${religionTheme.primary} !important;
          }
          .hover\\:text-primary:hover {
            color: ${religionTheme.primary} !important;
          }
          .group:hover .group-hover\\:text-primary {
            color: ${religionTheme.primary} !important;
          }
          .hover\\:bg-primary:hover {
            background-color: ${religionTheme.primary} !important;
          }
          .group:hover .group-hover\\:bg-primary {
            background-color: ${religionTheme.primary} !important;
          }
          
          /* Form Input Focus Overrides */
          input:focus, select:focus, textarea:focus {
            border-color: ${religionTheme.primary} !important;
            --tw-ring-color: ${religionTheme.primary}33 !important;
            box-shadow: 0 0 0 2px ${religionTheme.primary}33 !important;
          }
          input:focus-visible, select:focus-visible, textarea:focus-visible {
            outline: none !important;
            border-color: ${religionTheme.primary} !important;
            box-shadow: 0 0 0 2px ${religionTheme.primary}33 !important;
          }
          .focus-visible\\:ring-primary\\/20:focus-visible {
            --tw-ring-color: ${religionTheme.primary}33 !important;
            box-shadow: 0 0 0 2px ${religionTheme.primary}33 !important;
          }
          .focus\\:border-primary:focus {
            border-color: ${religionTheme.primary} !important;
          }
          .focus\\:ring-primary\\/20:focus {
            --tw-ring-color: ${religionTheme.primary}33 !important;
            box-shadow: 0 0 0 2px ${religionTheme.primary}33 !important;
          }
        ` : ''}
      `}} />

      {/* Desktop Floating Sticky Template Trigger - only visible when builder section is in view */}
      <div className={cn(
        "hidden lg:flex fixed right-0 top-1/2 z-40 animate-gentle-float transition-all duration-500",
        isBuilderVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full pointer-events-none"
      )}>
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="premium-gold-docked-tab group flex flex-col items-center gap-3 p-4 border-0 shadow-[-4px_4px_20px_rgba(252,224,104,0.3)] hover:shadow-[-6px_6px_28px_rgba(252,224,104,0.45)] hover:-translate-x-1 transition-all duration-300 w-20 text-center select-none active:scale-95 cursor-pointer"
        >
          <div className="p-2 rounded-full bg-stone-100/80 text-stone-500 group-hover:bg-primary group-hover:text-white transition-all duration-300">
            <LayoutDashboard className="w-5 h-5" />
          </div>

          <div className="w-12 h-16 rounded-md shadow-sm border border-stone-200/70 overflow-hidden relative mx-auto group-hover:ring-2 group-hover:ring-primary/30 transition-all shrink-0">
            {activeTemplate.thumbnailUrl ? (
              <Image
                src={activeTemplate.thumbnailUrl}
                alt={`Matrimonial template ${activeTemplate.name} thumbnail selection`}
                fill
                unoptimized
                sizes="48px"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
                loading="lazy"
              />
            ) : currentTemplate.frame.type === "image" ? (
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${getFrameImageUrl(currentTemplate.frame, currentTemplate.defaultPrimary)})`,
                  backgroundColor: currentTemplate.frame.bgColor
                }}
              />
            ) : currentTemplate.frame.type === "gradient" ? (
              <div
                className="absolute inset-0"
                style={{ background: `linear-gradient(135deg, ${currentTemplate.frame.gradientColors.join(", ")})` }}
              />
            ) : (
              <div
                className="absolute inset-0"
                style={{ backgroundColor: currentTemplate.defaultPrimary }}
              />
            )}
          </div>

          <span className="text-[10px] font-black text-stone-500 uppercase tracking-wider group-hover:text-primary transition-colors mt-0.5 leading-none">
            {currentLang === "Marathi" ? "नमुने" : "Templates"}
          </span>
        </button>
      </div>

      {/* Desktop custom drawer – renders at document.body via portal, never locks scroll */}
      <CustomDrawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} side="right">
        <CustomDrawerHeader className="p-6 pb-4 border-b border-stone-100 dark:border-stone-900/50">
          <div className="flex items-center justify-between w-full pr-6">
            <CustomDrawerTitle className="flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-primary" />
              {translateUI("pickTemplate", currentLang)}
            </CustomDrawerTitle>
            <div className="flex items-center gap-2">
              <TemplateFilter />
            </div>
          </div>
        </CustomDrawerHeader>
        <div className="flex-1 overflow-y-auto p-6 pt-4">
          <TemplateSelector religion={defaultReligion} onSelect={() => setIsDrawerOpen(false)} />
        </div>
      </CustomDrawer>

      <section ref={builderRef} id="builder" className="py-6 md:py-10 px-4 bg-gradient-to-b from-background via-accent/30 to-background scroll-mt-20">
        {/* Section Header */}
        {!hideHeader && (
          <div className="container mx-auto max-w-[1400px] mb-10">
            <div className="flex flex-col items-center text-center gap-4 mb-8">
              <div 
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold",
                  religionTheme ? "" : "bg-primary/10 text-primary"
                )}
                style={religionTheme ? { backgroundColor: religionTheme.primaryLight, color: religionTheme.primary } : undefined}
              >
                <Wand2 className="w-4 h-4" />
                {currentLang === "Marathi" ? "आत्ताच बनवायला सुरुवात करा" : "Start Building Now"}
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground font-sans">
                {builderTitle ? (
                  builderTitle
                ) : (
                  <>
                    Create Your Biodata{" "}
                    <span 
                      className={cn(!religionTheme && "text-gradient-primary")}
                      style={religionTheme ? {
                        backgroundImage: `linear-gradient(to right, ${religionTheme.primary}, ${religionTheme.secondary})`,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        color: "transparent"
                      } : undefined}
                    >
                      Right Here
                    </span>
                  </>
                )}
              </h2>
              <p 
                className={cn(
                  "text-base md:text-lg font-semibold max-w-2xl",
                  religionTheme ? "" : "text-muted-foreground"
                )}
                style={religionTheme?.descriptionColor ? { color: religionTheme.descriptionColor } : undefined}
              >
                {builderSubtitle || "Fill in your details below, pick a template, and download your professional marriage biodata - all without leaving this page."}
              </p>
            </div>
          </div>
        )}

        {/* Builder Content */}
        <div className="container mx-auto max-w-6xl">
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col md:grid md:grid-cols-12 gap-4 md:gap-10 items-start w-full">

            {/* Form Side */}
            <div className="md:col-span-6 flex flex-col w-full md:premium-gold-border md:p-8 md:shadow-xl p-0 shadow-none bg-transparent">
              <BiodataForm hideSliders hideCommunityAndReligion={hideCommunityAndReligion} />
            </div>

            {/* Mobile Preview - shown AFTER the form on small screens (mobile only) */}
            <div id="mobile-preview-section" className="md:hidden w-full flex flex-col gap-4 items-center pt-2 pb-2">
              <EmbeddedPreviewSection storedTemplate={storedTemplate} control={methods.control} />
              <Button
                onClick={() => handleNavigateToEdit()}
                disabled={isNavigating}
                className={cn(
                  "w-full rounded-full transition-all flex items-center justify-center gap-2 h-11 text-sm font-bold border-0 disabled:opacity-70",
                  isMuslimPage 
                    ? "bg-[#0F4C3A] hover:bg-[#0D4333] text-white shadow-lg shadow-[#0F4C3A]/20" 
                    : "bg-gradient-primary"
                )}
              >
                {isNavigating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Opening Designer...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Edit in Designer
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>

            {/* Preview Side - Sticky (tablet and desktop) */}
            <div className="hidden md:block md:col-span-5 md:sticky md:top-24 w-full">
              <div className="flex-1 flex flex-col gap-6 items-center w-full">
                <EmbeddedPreviewSection storedTemplate={storedTemplate} control={methods.control} />

                <div className="flex gap-3 items-center justify-center w-fit mx-auto mt-2">
                  <DownloadDropdown
                    onDownload={handleDownload}
                    isGenerating={isGenerating}
                    labels={{ download: "Download", downloadPdf: "Download PDF", generating: "Generating..." }}
                    variant="compact"
                    className={cn(
                      "rounded-full transition-all h-9 font-bold text-[11px] px-3 shrink-0 border-0",
                      isMuslimPage 
                        ? "bg-[#0F4C3A] hover:bg-[#0D4333] text-white shadow-lg shadow-[#0F4C3A]/20" 
                        : "bg-gradient-primary"
                    )}
                    isPremium={activeTemplate?.isPremium}
                    price={activeTemplate?.price}
                    discountPrice={activeTemplate?.discountPrice}
                    currency={activeTemplate?.currency}
                    isMuslimPage={isMuslimPage}
                  />

                  <Button
                    onClick={() => handleNavigateToEdit()}
                    disabled={isNavigating}
                    className={cn(
                      "rounded-full transition-all flex gap-1 h-9 text-[11px] font-bold items-center justify-center px-3 shrink-0 border-0 disabled:opacity-70",
                      isMuslimPage 
                        ? "bg-[#0F4C3A] hover:bg-[#0D4333] text-white shadow-lg shadow-[#0F4C3A]/20" 
                        : "bg-gradient-primary"
                    )}
                  >
                    {isNavigating ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                    <span>{isNavigating ? translateUI("loading", currentLang) : translateUI("editInDesigner", currentLang)}</span>
                    {!isNavigating && <ArrowRight className="w-3.5 h-3.5" />}
                  </Button>

                  <Button
                    onClick={handleOpenTemplatesDrawer}
                    variant="outline"
                    className={cn(
                      "rounded-full transition-all flex gap-1 h-9 text-[11px] font-bold items-center justify-center px-3 shrink-0 bg-white",
                      isMuslimPage 
                        ? "border-[#0F4C3A]/40 hover:bg-[#0F4C3A]/5 text-[#0F4C3A] hover:text-[#0A3327]" 
                        : "border border-rose-200 hover:bg-rose-50/50 text-rose-600 hover:text-rose-700"
                    )}
                  >
                    <LayoutDashboard className="w-3 h-3" />
                    <span>{currentLang === "Marathi" ? "टेम्पलेट निवडा" : "Choose Template"}</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "rounded-full h-9 font-bold text-[11px] px-3 shrink-0 transition-colors bg-white",
                      isMuslimPage 
                        ? "border-[#D4AF37]/50 hover:bg-[#D4AF37]/10 text-[#0F4C3A] hover:text-[#0A3327]" 
                        : "border border-rose-200 hover:bg-rose-50/50 text-rose-600 hover:text-rose-700"
                    )}
                    onClick={() => setShowResetDialog(true)}
                    disabled={isGenerating}
                  >
                    <RotateCcw className={cn("w-3 h-3 mr-1", isMuslimPage ? "text-[#0F4C3A]" : "text-rose-500")} /> {currentLang === "Marathi" ? "रीसेट करा" : "Reset"}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Widgets Grid */}
          <div className="mt-8 md:mt-24 px-2 sm:px-4 w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch max-w-6xl mx-auto">
            {/* Left: Get on WhatsApp Widget */}
            <div className="flex">
              <WhatsAppDeliveryCard
                onSubmitWhatsApp={handleSubmitWhatsApp}
                isGenerating={isGenerating}
                className="h-full flex flex-col justify-between"
              />
            </div>

            {/* Right: Company Logo Widget */}
            <div className="flex">
              <CompanyLogoFeature variant="card" religion={defaultReligion} />
            </div>
          </div>
        </div>

        {/* Mobile Sticky Bottom Bar */}
        {showMobileBar && (
          <div 
            className={cn(
              "lg:hidden fixed bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 bg-white/70 backdrop-blur-2xl border py-2 sm:py-2.5 px-2.5 sm:px-4 rounded-3xl z-40 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.5),_0_8px_32px_rgba(0,0,0,0.12)] transition-all duration-300 flex items-center justify-between gap-2",
              isMobileDrawerOpen ? "opacity-0 pointer-events-none translate-y-10" : "animate-in slide-in-from-bottom"
            )}
            style={religionTheme ? { borderColor: `${religionTheme.primary}25` } : { borderColor: "rgba(255, 255, 255, 0.5)" }}
          >

            {/* Left Icons Grid */}
            <div className="flex items-center justify-around flex-1 pr-1 sm:pr-2 border-r border-muted-foreground/10">

              {/* Templates Option */}
              <button
                onClick={() => setIsMobileDrawerOpen(true)}
                className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 text-muted-foreground hover:text-primary active:scale-95 transition-all w-12 sm:w-14 mobile-toolbar-btn"
              >
                <LayoutDashboard className="w-5 h-5 sm:w-[22px] sm:h-[22px] text-muted-foreground group-hover:text-primary mobile-toolbar-btn-icon" />
                <span className="text-[9.5px] sm:text-[10.5px] font-bold tracking-tight">{translateUI("templates", currentLang)}</span>
              </button>

              {/* Mobile custom drawer – renders at document.body via portal, never locks scroll */}
              <CustomDrawer open={isMobileDrawerOpen} onOpenChange={setIsMobileDrawerOpen} side="bottom">
                <CustomDrawerHeader className="p-6 pb-4 border-b border-stone-100 dark:border-stone-900/50">
                  <div className="flex items-center justify-between w-full pr-6">
                    <CustomDrawerTitle className="flex items-center gap-2">
                      <LayoutDashboard className="w-5 h-5 text-primary" />
                      {translateUI("pickTemplate", currentLang)}
                    </CustomDrawerTitle>
                    <div className="flex items-center gap-2">
                      <TemplateFilter />
                    </div>
                  </div>
                </CustomDrawerHeader>
                <div className="flex-1 overflow-y-auto p-6 pt-4">
                  <TemplateSelector religion={defaultReligion} onSelect={() => setIsMobileDrawerOpen(false)} />
                </div>
              </CustomDrawer>
              {/* Preview Option */}
              <button
                onClick={() => {
                  const el = document.getElementById('mobile-preview-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 text-muted-foreground hover:text-primary active:scale-95 transition-all w-9 sm:w-11 mobile-toolbar-btn"
              >
                <Eye className="w-4 h-4 sm:w-5 sm:h-5 mobile-toolbar-btn-icon" />
                <span className="text-[8px] sm:text-[9px] font-bold tracking-tight">{translateUI("preview", currentLang)}</span>
              </button>
 
              {/* Designer Option */}
              <button
                onClick={() => handleNavigateToEdit()}
                disabled={isNavigating}
                className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 text-muted-foreground hover:text-primary active:scale-95 transition-all w-9 sm:w-11 disabled:opacity-50 mobile-toolbar-btn"
              >
                {isNavigating ? (
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin mobile-toolbar-btn-icon" />
                ) : (
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mobile-toolbar-btn-icon" />
                )}
                <span className="text-[8px] sm:text-[9px] font-bold tracking-tight">{translateUI("design", currentLang)}</span>
              </button>


              {/* Reset Option */}
              <button
                onClick={() => setShowResetDialog(true)}
                disabled={isGenerating}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 sm:gap-1 active:scale-95 transition-all w-9 sm:w-11 disabled:opacity-50 text-muted-foreground",
                  isMuslimPage ? "hover:text-[#0F4C3A]" : "hover:text-destructive"
                )}
              >
                <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-[8px] sm:text-[9px] font-bold tracking-tight">{translateUI("reset", currentLang)}</span>
              </button>

            </div>

            {/* Right Download Button */}
            <DownloadDropdown
              onDownload={handleDownload}
              isGenerating={isGenerating}
              labels={{ download: "Download", generating: "Generating..." }}
              variant="compact"
              className={cn(
                "rounded-full transition-all h-10 sm:h-11 font-bold text-xs sm:text-sm px-4 shrink-0 border-0",
                isMuslimPage 
                  ? "bg-[#0F4C3A] hover:bg-[#0D4333] text-white shadow-md shadow-[#0F4C3A]/15" 
                  : "bg-gradient-primary"
              )}
              isPremium={activeTemplate?.isPremium}
              price={activeTemplate?.price}
              discountPrice={activeTemplate?.discountPrice}
              currency={activeTemplate?.currency}
              isMuslimPage={isMuslimPage}
            />

          </div>
        )}

        {/* Reset Confirmation Dialog */}
        <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Reset All Fields?</DialogTitle>
              <DialogDescription>
                {"This will clear all the information you've entered and revert to the default template. This action cannot be undone."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2 sm:gap-0 mt-4">
              <Button variant="outline" onClick={() => setShowResetDialog(false)} className="rounded-full">Cancel</Button>
              <Button
                onClick={handleReset}
                className={cn(
                  "relative overflow-hidden rounded-full border-0",
                  isMuslimPage 
                    ? "bg-[#0F4C3A] hover:bg-[#0D4333] text-white shadow-md" 
                    : "bg-gradient-primary"
                )}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-1/2 h-full animate-shine pointer-events-none" />
                <span className="relative">Yes, Reset</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
          religion={isMuslimPage ? "Muslim" : null}
        />
        <PriceModal
          isOpen={isPriceModalOpen}
          onOpenChange={handlePriceModalOpenChange}
          isPremium={activeTemplate?.isPremium}
          isGenerating={isGenerating}
          religion={isMuslimPage ? "Muslim" : null}
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
                await triggerDownload(currentData, storedTemplate, format, filename);
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

        {/* Full-screen secure checkout loading screen */}
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
      </section>

    </FormProvider>
  );
}

function EmbeddedPreviewSection({ storedTemplate, control }: { storedTemplate: string; control: any }) {
  const rawFormData = useWatch({ control });
  const [debouncedFormData, setDebouncedFormData] = useState(rawFormData);
  const [isClientMounted, setIsClientMounted] = useState(false);
  const customTemplates = useBiodataStore((state) => state.customTemplates);

  useEffect(() => {
    setIsClientMounted(true);
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFormData(rawFormData);
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [rawFormData]);

  return (
    <div id="biodata-preview-home" className="bg-white overflow-hidden w-full aspect-[210/297] relative rounded-lg shadow-2xl ring-1 ring-black/5 pointer-events-none flex items-center justify-center">
      {!isClientMounted || customTemplates.length === 0 ? (
        <PreviewLoader />
      ) : (
        <KonvaPreview liveFormData={debouncedFormData as BiodataFormValues} templateId={storedTemplate} />
      )}
    </div>
  );
}
