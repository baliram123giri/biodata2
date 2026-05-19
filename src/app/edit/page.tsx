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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import dynamic from "next/dynamic";
import { ImageUpload } from "@/components/ImageUpload";
const KonvaPreview = dynamic(() => import("../../components/editor/KonvaPreview").then(mod => mod.KonvaPreview), { ssr: false });
import { CompanyAutocomplete } from "../../components/biodata/CompanyAutocomplete";

import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select";
import { TemplateSelector } from "@/components/editor/TemplateSelector";
import { StickerSelector } from "@/components/editor/StickerSelector";
import { useBiodataStore } from "@/store/useBiodataStore";
import { TEMPLATE_CONFIGS } from "@/lib/frame-config";
import { useThemeStore, FontFamily, FontWeight, Alignment, PALETTES } from "@/store/useThemeStore";
import { useStore } from "zustand";
import { cn } from "@/lib/utils";

// ════════════════════════════════════════════════════════════════════
// Snappy, 60 FPS Debounced Input Components to Eliminate Typing Lag
// ════════════════════════════════════════════════════════════════════
interface DebouncedInputProps {
  value: string;
  onChange: (val: string) => void;
  className?: string;
  placeholder?: string;
}

function DebouncedInput({ value, onChange, className, placeholder }: DebouncedInputProps) {
  const [localVal, setLocalVal] = useState(value);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    setLocalVal(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalVal(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onChange(val);
    }, 150);
  };

  const handleBlur = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    onChange(localVal);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <Input
      value={localVal}
      onChange={handleChange}
      onBlur={handleBlur}
      className={className}
      placeholder={placeholder}
    />
  );
}

interface DebouncedTextareaProps {
  value: string;
  onChange: (val: string) => void;
  className?: string;
}

function DebouncedTextarea({ value, onChange, className }: DebouncedTextareaProps) {
  const [localVal, setLocalVal] = useState(value);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    setLocalVal(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setLocalVal(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onChange(val);
    }, 150);
  };

  const handleBlur = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    onChange(localVal);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <Textarea
      value={localVal}
      onChange={handleChange}
      onBlur={handleBlur}
      className={className}
    />
  );
}

interface PremiumSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder: string;
}

function PremiumSelect({ value, onChange, options, placeholder }: PremiumSelectProps) {
  return (
    <div className="relative w-full">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white border border-stitch-outline/10 text-xs font-bold rounded-xl h-10 pl-3 pr-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-stitch-primary cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%237C726C%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[position:right_12px_center] bg-no-repeat transition-all text-stitch-on-surface"
      >
        <option value="" disabled className="text-stitch-on-surface-variant/50">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt} className="text-xs font-semibold text-stitch-on-surface bg-white py-1">
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}


const COMPANY_OPTIONS = [
  "Google",
  "Microsoft",
  "Amazon",
  "Meta",
  "Apple",
  "Netflix",
  "TCS (Tata Consultancy Services)",
  "Infosys",
  "Wipro",
  "Cognizant",
  "Accenture",
  "Capgemini",
  "Tech Mahindra",
  "HCL Technologies",
  "IBM",
  "Oracle",
  "Cisco",
  "Adobe",
  "Salesforce",
  "Deloitte",
  "PwC",
  "EY (Ernst & Young)",
  "KPMG",
  "J.P. Morgan",
  "Morgan Stanley",
  "Goldman Sachs",
  "Other"
];

export default function EditPage() {
  const { formData, selectedTemplate, setFormData, updateField, updateLayout } = useBiodataStore();
  const theme = useThemeStore();
  const biodataHistory = useStore(useBiodataStore.temporal, (state) => state);
  const themeHistory = useStore(useThemeStore.temporal, (state) => state);

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [fitResetKey, setFitResetKey] = useState(0);
  const [activeTab, setActiveTab] = useState<"templates" | "fields" | "theme" | "spacing" | "photo" | "stickers">("theme");
  const [isLeftOpen, setIsLeftOpen] = useState(true);
  const [isRightOpen, setIsRightOpen] = useState(true);
  const [drawerTranslateY, setDrawerTranslateY] = useState(0);
  const [isDraggingDrawer, setIsDraggingDrawer] = useState(false);
  const touchStartY = useRef(0);

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
    }
    if (window.innerWidth < 1024) {
      setIsLeftOpen(false);
    }
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.4));

  const handleFitToScreen = () => {
    if (typeof window === "undefined") return;
    const A4_W = 595;
    const isMobile = window.innerWidth < 1024;
    const sidebarWidth = isMobile ? 0 : 416; // Left sidebar (96px) + Right properties panel (320px)
    const padding = isMobile ? 32 : 64;
    const availableWidth = window.innerWidth - sidebarWidth - padding;
    const fitZoom = availableWidth / A4_W;
    setZoom(Math.max(0.4, Math.min(fitZoom, 1.0)));
    // Always bump the reset key so KonvaPreview re-centers
    // even if the zoom value happens to be identical
    setFitResetKey(k => k + 1);
  };

  // Fix hydration issues and auto-calculate fit-to-screen zoom
  useEffect(() => {
    setIsMounted(true);
    handleFitToScreen();

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

  if (!isMounted) return null;

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const nameField = formData.personalDetails?.find((f: any) => f.id === "fullName")?.value || "biodata";

      const res = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formData,
          templateId: useBiodataStore.getState().selectedTemplate,
          theme: {
            fontFamily: theme.fontFamily,
            primaryColor: theme.primaryColor,
            secondaryColor: theme.secondaryColor,
            accentColor: theme.accentColor,
            fontSize: theme.fontSize,
            padding: theme.padding,
            paddingY: theme.paddingY,
            selectedPaletteName: theme.selectedPaletteName,
            bgColors: theme.bgColors,
          },
        }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${nameField}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF Export Error:", err);
    } finally {
      setIsGenerating(false);
    }
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
      {/* Top Navigation Bar */}
      <header className="w-full shrink-0 bg-stitch-surface/80 backdrop-blur-xl border-b border-stitch-outline/10 shadow-sm flex justify-between items-center px-4 md:px-6 h-16">
        <div className="flex items-center gap-2 md:gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full hover:bg-stitch-primary/10 text-stitch-primary"
            onClick={() => window.location.href = "/"}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <span className="font-noto-serif text-lg md:text-2xl text-stitch-primary font-bold tracking-tight hidden sm:block">Design Studio</span>
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
            <ToolbarItem icon={<RefreshCcw />} label="Reset" onClick={() => {
              if (confirm("Reset layout positions?")) {
                 useBiodataStore.getState().resetStore();
              }
            }} />
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="hidden xl:flex px-3 py-1.5 rounded-full bg-green-50 border border-green-100 items-center gap-2 mr-2">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
             <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider">Live</span>
          </div>

          <Button
            onClick={handleDownload}
            disabled={isGenerating}
            className="bg-stitch-primary-container text-stitch-on-primary-container hover:bg-stitch-primary hover:text-white transition-all text-xs font-semibold h-9 px-4 md:px-6 flex gap-2 shadow-sm disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="hidden sm:inline">Generating...</span>
              </>
            ) : (
              <>
                <span>Download</span>
                <Download className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative pb-24 lg:pb-0">

        {/* Left Sidebar (Tools) / Bottom Tab Bar on Mobile */}
        <nav className={cn(
          "z-45 transition-all duration-300",
          // Desktop: vertical sidebar
          "hidden lg:flex lg:flex-col lg:items-center lg:py-6 lg:gap-4 lg:relative lg:border-r lg:h-full lg:top-0 lg:bottom-0 lg:left-auto lg:right-auto lg:translate-x-0 lg:opacity-100 lg:w-24 lg:bg-stitch-surface/95 lg:border-stitch-outline/10",
          isLeftOpen ? "lg:w-24" : "lg:w-0 lg:opacity-0 lg:pointer-events-none lg:border-r-0",
          // Mobile: horizontal floating glassy bottom bar
          "fixed bottom-4 left-4 right-4 h-16 flex flex-row items-center justify-around px-2 py-1 bg-white/30 backdrop-blur-2xl border border-white/40 rounded-2xl shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.5),_0_8px_32px_rgba(0,0,0,0.08)] z-50"
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
            icon={<ImageIcon />} 
            label="Photo" 
            active={isRightOpen && activeTab === "photo"}
            onClick={() => handleTabClick("photo")}
          />
          <ToolButton 
            icon={<Sparkles />} 
            label="Stickers" 
            active={isRightOpen && activeTab === "stickers"}
            onClick={() => handleTabClick("stickers")}
          />
        </nav>

        {/* Canvas Area */}
        <main className="flex-1 overflow-hidden relative bg-transparent h-full">
          <KonvaPreview scale={zoom} isDesigner={true} resetKey={fitResetKey} />
          
          {/* Floating Zoom Controls */}
          <div className="absolute bottom-6 left-6 z-20 flex items-center gap-1 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-black/5">
            <button 
              onClick={handleZoomOut} 
              className="p-1.5 hover:bg-black/5 rounded-full text-stitch-on-surface-variant hover:text-stitch-primary active:scale-90 transition-all"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button 
              onClick={handleFitToScreen} 
              className="p-1.5 hover:bg-black/5 rounded-full text-stitch-on-surface-variant hover:text-stitch-primary active:scale-90 transition-all"
              title="Fit to Screen"
            >
              <Maximize className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-black text-stitch-on-surface w-10 text-center select-none">
              {Math.round(zoom * 100)}%
            </span>
            <button 
              onClick={handleZoomIn} 
              className="p-1.5 hover:bg-black/5 rounded-full text-stitch-on-surface-variant hover:text-stitch-primary active:scale-90 transition-all"
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
            "lg:relative lg:top-0 lg:bottom-0 lg:right-0 lg:h-full lg:w-80 lg:translate-y-0 lg:opacity-100 lg:border-l lg:border-t-0 lg:rounded-none lg:bg-stitch-surface/60 lg:border-stitch-outline/10",
            isRightOpen 
              ? "lg:translate-x-0 lg:w-80" 
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
              <p className="text-[11px] text-stitch-on-surface-variant/60 font-bold uppercase tracking-widest mt-1">
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

          <div className="flex-1 overflow-y-auto p-6 pt-0 scrollbar-thin scrollbar-thumb-stitch-outline/20 scroll-smooth">
            <div className="flex flex-col gap-8 pb-28 lg:pb-10">
              {activeTab === "templates" && <TemplateSelector />}
              
              {activeTab === "fields" && (
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-stitch-on-surface-variant">Edit Form Details</Label>
                    <p className="text-[10.5px] text-stitch-on-surface-variant/70 leading-relaxed italic">
                      Modify your biodata details in real-time. Changes will update instantly on the canvas.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Mantra & Title */}
                    <div className="p-4 rounded-2xl bg-stitch-surface-variant/5 border border-stitch-outline/5 space-y-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold text-stitch-on-surface-variant">Header Mantra</Label>
                        <DebouncedInput
                          value={formData.mantra || ""}
                          onChange={(val) => setFormData({ ...formData, mantra: val })}
                          className="bg-white border-stitch-outline/10 text-xs font-bold rounded-xl h-10 shadow-sm focus-visible:ring-stitch-primary"
                          placeholder="e.g. || Shree Ganeshay Namah ||"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold text-stitch-on-surface-variant">Document Title</Label>
                        <DebouncedInput
                          value={formData.title || ""}
                          onChange={(val) => setFormData({ ...formData, title: val })}
                          className="bg-white border-stitch-outline/10 text-xs font-bold rounded-xl h-10 shadow-sm focus-visible:ring-stitch-primary"
                          placeholder="e.g. BIODATA"
                        />
                      </div>
                    </div>

                    <Accordion type="multiple" defaultValue={["personal"]} className="w-full space-y-3">
                      {/* Personal Details Accordion */}
                      <AccordionItem value="personal" className="border border-stitch-outline/5 rounded-2xl bg-stitch-surface-variant/5 overflow-hidden">
                        <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-stitch-surface-variant/10 text-xs font-black text-stitch-on-surface">
                          Personal Details
                        </AccordionTrigger>
                        <AccordionContent className="p-4 pt-2 space-y-4">
                          {formData.personalDetails?.map((field: any) => (
                            <div key={field.id} className="space-y-1.5 text-left px-1 py-0.5">
                              <Label className="text-[10px] uppercase font-bold text-stitch-on-surface-variant/80">{field.label}</Label>
                              {field.type === "textarea" ? (
                                <DebouncedTextarea
                                  value={field.value || ""}
                                  onChange={(val) => updateField("personalDetails", field.id, val)}
                                  className="bg-white border-stitch-outline/10 text-xs font-bold rounded-xl shadow-sm focus-visible:ring-stitch-primary min-h-[60px]"
                                />
                              ) : field.type === "select" && field.options ? (
                                <PremiumSelect
                                  value={field.value || ""}
                                  onChange={(val) => updateField("personalDetails", field.id, val)}
                                  options={field.options}
                                  placeholder={`Select ${field.label}`}
                                />
                              ) : (
                                <DebouncedInput
                                  value={field.value || ""}
                                  onChange={(val) => updateField("personalDetails", field.id, val)}
                                  className="bg-white border-stitch-outline/10 text-xs font-bold rounded-xl h-10 shadow-sm focus-visible:ring-stitch-primary"
                                />
                              )}
                            </div>
                          ))}
                        </AccordionContent>
                      </AccordionItem>

                      {/* Education Details Accordion */}
                      <AccordionItem value="education" className="border border-stitch-outline/5 rounded-2xl bg-stitch-surface-variant/5 overflow-hidden">
                        <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-stitch-surface-variant/10 text-xs font-black text-stitch-on-surface">
                          Education & Work
                        </AccordionTrigger>
                        <AccordionContent className="p-4 pt-2 space-y-4">
                          {formData.educationDetails?.map((field: any) => (
                            <div key={field.id} className="space-y-1.5 text-left px-1 py-0.5">
                              <Label className="text-[10px] uppercase font-bold text-stitch-on-surface-variant/80">{field.label}</Label>
                              {field.type === "textarea" ? (
                                <DebouncedTextarea
                                  value={field.value || ""}
                                  onChange={(val) => updateField("educationDetails", field.id, val)}
                                  className="bg-white border-stitch-outline/10 text-xs font-bold rounded-xl shadow-sm focus-visible:ring-stitch-primary min-h-[60px]"
                                />
                              ) : field.type === "select" && field.options ? (
                                <PremiumSelect
                                  value={field.value || ""}
                                  onChange={(val) => updateField("educationDetails", field.id, val)}
                                  options={field.options}
                                  placeholder={`Select ${field.label}`}
                                />
                              ) : field.id === "companyName" ? (
                                <CompanyAutocomplete
                                  value={field.value || ""}
                                  onChange={(val, logo) => {
                                    updateField("educationDetails", field.id, val);
                                    if (logo) {
                                      updateField("educationDetails", "companyLogo", logo);
                                    }
                                  }}
                                  placeholder={`Select ${field.label}...`}
                                />
                              ) : (
                                <DebouncedInput
                                  value={field.value || ""}
                                  onChange={(val) => updateField("educationDetails", field.id, val)}
                                  className="bg-white border-stitch-outline/10 text-xs font-bold rounded-xl h-10 shadow-sm focus-visible:ring-stitch-primary"
                                />
                              )}
                            </div>
                          ))}
                        </AccordionContent>
                      </AccordionItem>

                      {/* Family Details Accordion */}
                      <AccordionItem value="family" className="border border-stitch-outline/5 rounded-2xl bg-stitch-surface-variant/5 overflow-hidden">
                        <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-stitch-surface-variant/10 text-xs font-black text-stitch-on-surface">
                          Family Details
                        </AccordionTrigger>
                        <AccordionContent className="p-4 pt-2 space-y-4">
                          {formData.familyDetails?.map((field: any) => (
                            <div key={field.id} className="space-y-1.5 text-left px-1 py-0.5">
                              <Label className="text-[10px] uppercase font-bold text-stitch-on-surface-variant/80">{field.label}</Label>
                              {field.type === "textarea" ? (
                                <DebouncedTextarea
                                  value={field.value || ""}
                                  onChange={(val) => updateField("familyDetails", field.id, val)}
                                  className="bg-white border-stitch-outline/10 text-xs font-bold rounded-xl shadow-sm focus-visible:ring-stitch-primary min-h-[60px]"
                                />
                              ) : field.type === "select" && field.options ? (
                                <PremiumSelect
                                  value={field.value || ""}
                                  onChange={(val) => updateField("familyDetails", field.id, val)}
                                  options={field.options}
                                  placeholder={`Select ${field.label}`}
                                />
                              ) : (
                                <DebouncedInput
                                  value={field.value || ""}
                                  onChange={(val) => updateField("familyDetails", field.id, val)}
                                  className="bg-white border-stitch-outline/10 text-xs font-bold rounded-xl h-10 shadow-sm focus-visible:ring-stitch-primary"
                                />
                              )}
                            </div>
                          ))}
                        </AccordionContent>
                      </AccordionItem>

                      {/* Contact Details Accordion */}
                      <AccordionItem value="contact" className="border border-stitch-outline/5 rounded-2xl bg-stitch-surface-variant/5 overflow-hidden">
                        <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-stitch-surface-variant/10 text-xs font-black text-stitch-on-surface">
                          Contact Details
                        </AccordionTrigger>
                        <AccordionContent className="p-4 pt-2 space-y-4">
                          {formData.contactDetails?.map((field: any) => (
                            <div key={field.id} className="space-y-1.5 text-left px-1 py-0.5">
                              <Label className="text-[10px] uppercase font-bold text-stitch-on-surface-variant/80">{field.label}</Label>
                              {field.type === "textarea" ? (
                                <DebouncedTextarea
                                  value={field.value || ""}
                                  onChange={(val) => updateField("contactDetails", field.id, val)}
                                  className="bg-white border-stitch-outline/10 text-xs font-bold rounded-xl shadow-sm focus-visible:ring-stitch-primary min-h-[60px]"
                                />
                              ) : field.type === "select" && field.options ? (
                                <PremiumSelect
                                  value={field.value || ""}
                                  onChange={(val) => updateField("contactDetails", field.id, val)}
                                  options={field.options}
                                  placeholder={`Select ${field.label}`}
                                />
                              ) : (
                                <DebouncedInput
                                  value={field.value || ""}
                                  onChange={(val) => updateField("contactDetails", field.id, val)}
                                  className="bg-white border-stitch-outline/10 text-xs font-bold rounded-xl h-10 shadow-sm focus-visible:ring-stitch-primary"
                                />
                              )}
                            </div>
                          ))}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </div>
              )}
              
              {activeTab === "theme" && (
                <div className="flex flex-col gap-8">
                  <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                  <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-stitch-on-surface-variant">Theme Palettes</Label>
                  <div className="grid grid-cols-2 gap-2">
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
                      const templateConfig = TEMPLATE_CONFIGS[useBiodataStore.getState().selectedTemplate] || TEMPLATE_CONFIGS["royal"];
                      const isGradientFrame = templateConfig.frame.type === "gradient";
                      
                      const filteredPalettes = isGradientFrame 
                        ? PALETTES.filter(p => !!p.bgColors)
                        : PALETTES.filter(p => !p.bgColors);

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
                              {p.bgColors ? (
                                <div className="w-full h-full" style={{ background: `linear-gradient(90deg, ${p.bgColors.join(", ")})` }} />
                              ) : (
                                <>
                                  <div className="flex-1" style={{ backgroundColor: p.primary }} />
                                  <div className="flex-1" style={{ backgroundColor: p.secondary }} />
                                  <div className="flex-1" style={{ backgroundColor: p.accent }} />
                                </>
                              )}
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

                <div className="flex flex-col gap-4">
                  <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-stitch-on-surface-variant">Custom Color</Label>
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-full border-4 border-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                      style={{ backgroundColor: theme.primaryColor }}
                    >
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 bg-white border border-stitch-outline/20 rounded-xl px-4 py-2.5 text-sm text-stitch-on-surface font-bold flex justify-between items-center shadow-sm">
                      <span>{theme.primaryColor.toUpperCase()}</span>
                      <span className="text-stitch-on-surface-variant text-[10px] font-bold">Primary</span>
                    </div>
                  </div>
                </div>
              </div>
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
                          {theme.paddingY !== undefined ? theme.paddingY : (TEMPLATE_CONFIGS[useBiodataStore.getState().selectedTemplate]?.defaultYPadding ?? theme.padding)}px
                        </span>
                      </div>
                      <Slider
                        value={[theme.paddingY !== undefined ? theme.paddingY : (TEMPLATE_CONFIGS[useBiodataStore.getState().selectedTemplate]?.defaultYPadding ?? theme.padding)]}
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
                <div className="flex flex-col gap-6">
                  <div className="space-y-4">
                    <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-stitch-on-surface-variant">Profile Photo</Label>
                    <ImageUpload 
                      value={formData.photo} 
                      onChange={(url) => {
                        setFormData({ ...formData, photo: url });
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
                </div>
              )}

              {activeTab === "stickers" && (
                <StickerSelector 
                  onSelect={() => {
                    if (window.innerWidth < 1024) {
                      setIsRightOpen(false);
                    }
                  }} 
                />
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ToolButton({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-14 h-14 lg:w-16 lg:h-16 flex flex-col items-center justify-center gap-1 lg:gap-1.5 transition-all rounded-xl lg:rounded-2xl shrink-0",
        active
          ? "bg-stitch-primary text-white shadow-lg shadow-stitch-primary/20 -translate-y-0.5"
          : "text-stitch-on-surface-variant hover:text-stitch-primary hover:bg-white hover:shadow-md hover:-translate-y-0.5"
      )}
    >
      {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-4 h-4 lg:w-5 lg:h-5" })}
      <span className="text-[8px] lg:text-[9px] uppercase tracking-wider font-bold">{label}</span>
    </button>
  );
}

function ToolbarItem({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 rounded-xl text-stitch-on-surface-variant hover:text-stitch-primary hover:bg-stitch-primary/5 transition-all group"
      title={label}
    >
      {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-4 h-4" })}
      <span className="text-[10px] font-bold uppercase tracking-tight hidden sm:inline">{label}</span>
    </button>
  );
}

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
        "flex-1 py-1.5 rounded-lg flex items-center justify-center transition-all",
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
      className="w-7 h-7 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform active:scale-95"
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
