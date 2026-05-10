"use client";

import React, { useEffect, useState } from "react";
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
  Maximize2,
  Minimize2,
  RefreshCcw,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import dynamic from "next/dynamic";
import { ImageUpload } from "@/components/ImageUpload";
const KonvaPreview = dynamic(() => import("../../components/editor/KonvaPreview").then(mod => mod.KonvaPreview), { ssr: false });

import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { TemplateSelector } from "@/components/editor/TemplateSelector";
import { StickerSelector } from "@/components/editor/StickerSelector";
import { useBiodataStore } from "@/store/useBiodataStore";
import { useThemeStore, FontFamily, FontWeight, Alignment, PALETTES } from "@/store/useThemeStore";
import { useStore } from "zustand";
import { cn } from "@/lib/utils";

export default function EditPage() {
  const { formData, setFormData, updateField, updateLayout } = useBiodataStore();
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
  const [activeTab, setActiveTab] = useState<"templates" | "theme" | "typography" | "frames" | "photo" | "stickers">("theme");

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));

  // Fix hydration issues
  useEffect(() => {
    setIsMounted(true);
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
            selectedPaletteName: theme.selectedPaletteName,
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
      <header className="w-full shrink-0 bg-stitch-surface/80 backdrop-blur-xl border-b border-stitch-outline/10 shadow-sm flex justify-between items-center px-6 h-16">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full hover:bg-stitch-primary/10 text-stitch-primary"
            onClick={() => window.location.href = "/create"}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <span className="font-noto-serif text-2xl text-stitch-primary font-bold tracking-tight">Design Studio</span>
        </div>

        <div className="flex items-center gap-4 border-x border-stitch-outline/10 px-6 h-full">
          <div className="flex items-center gap-1">
            <button 
              onClick={handleUndo}
              disabled={!canUndo}
              className={cn(
                "p-2 rounded-lg transition-all active:scale-90",
                canUndo ? "text-stitch-on-surface hover:bg-stitch-surface-variant/30" : "text-stitch-on-surface-variant/30 cursor-not-allowed"
              )}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-5 h-5" />
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
              <Redo2 className="w-5 h-5" />
            </button>
          </div>

          <Separator orientation="vertical" className="h-8 mx-2 bg-stitch-outline/10" />

          <div className="flex items-center gap-1">
            <ToolbarItem icon={<RefreshCcw />} label="Reset" onClick={() => {
              if (confirm("Reset layout positions?")) {
                 useBiodataStore.getState().resetStore();
              }
            }} />
            <ToolbarItem 
              icon={<Maximize2 />} 
              label="Zoom In" 
              onClick={handleZoomIn}
            />
            <ToolbarItem 
              icon={<Minimize2 />} 
              label="Zoom Out" 
              onClick={handleZoomOut}
            />
            <div className="text-[10px] font-bold text-stitch-on-surface-variant w-10 text-center">
              {Math.round(zoom * 100)}%
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden xl:flex px-3 py-1.5 rounded-full bg-green-50 border border-green-100 items-center gap-2 mr-2">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
             <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider">Live</span>
          </div>
          <button className="p-2 text-stitch-on-surface-variant hover:text-stitch-primary transition-all active:scale-90">
            <Share2 className="w-5 h-5" />
          </button>
          <Button variant="outline" className="text-xs font-semibold h-9 px-4 border-stitch-primary/20 hover:border-stitch-primary hover:bg-transparent">
            Save
          </Button>
          <Button
            onClick={handleDownload}
            disabled={isGenerating}
            className="bg-stitch-primary-container text-stitch-on-primary-container hover:bg-stitch-primary hover:text-white transition-all text-xs font-semibold h-9 px-6 flex gap-2 shadow-sm disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating...
              </>
            ) : (
              <>
                Download
                <Download className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar (Tools) */}
        <nav className="w-24 bg-stitch-surface/40 backdrop-blur-2xl border-r border-stitch-outline/10 flex flex-col items-center py-6 gap-4 z-40 overflow-y-auto">
          <ToolButton 
            icon={<LayoutDashboard />} 
            label="Templates" 
            active={activeTab === "templates"}
            onClick={() => setActiveTab("templates")}
          />
          <ToolButton 
            icon={<Palette />} 
            label="Theme" 
            active={activeTab === "theme"}
            onClick={() => setActiveTab("theme")}
          />
          <ToolButton 
            icon={<TypeIcon />} 
            label="Typography" 
            active={activeTab === "typography"}
            onClick={() => setActiveTab("typography")}
          />
          <ToolButton 
            icon={<Frame />} 
            label="Frames" 
            active={activeTab === "frames"}
            onClick={() => setActiveTab("frames")}
          />
          <ToolButton 
            icon={<ImageIcon />} 
            label="Photo" 
            active={activeTab === "photo"}
            onClick={() => setActiveTab("photo")}
          />
          <ToolButton 
            icon={<Sparkles />} 
            label="Stickers" 
            active={activeTab === "stickers"}
            onClick={() => setActiveTab("stickers")}
          />
        </nav>

        {/* Canvas Area */}
        <main className="flex-1 overflow-hidden relative bg-[#f5f0eb]">
          <KonvaPreview scale={zoom} isDesigner={true} />
        </main>

        {/* Right Properties Panel */}
        <aside className="w-80 h-full bg-stitch-surface/60 backdrop-blur-lg border-l border-stitch-outline/10 flex flex-col z-40 shadow-2xl overflow-hidden">
          <div className="p-6 pb-4">
            <h2 className="text-lg font-black tracking-tight text-stitch-on-surface capitalize">
              {activeTab}
            </h2>
            <p className="text-[11px] text-stitch-on-surface-variant/60 font-bold uppercase tracking-widest mt-1">
              Customize Design Properties
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-6 pt-0 scrollbar-thin scrollbar-thumb-stitch-outline/20 scroll-smooth">
            <div className="flex flex-col gap-8 pb-10">
              {activeTab === "templates" && <TemplateSelector />}
              
              {activeTab === "theme" && (
                <div className="flex flex-col gap-8">
                  <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                  <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-stitch-on-surface-variant">Theme Palettes</Label>
                  <div className="grid grid-cols-1 gap-3">
                    {/* None / Reset option */}
                    {(() => {
                      const isNone = theme.selectedPaletteName === null;
                      return (
                        <button
                          onClick={() => theme.setPalette({ name: "None", primary: "#800000", secondary: "#333333", accent: "#D4AF37" })}
                          className={cn(
                            "group relative flex items-center gap-3 p-2 rounded-xl border transition-all hover:shadow-md",
                            isNone ? "border-stitch-primary bg-white shadow-sm" : "border-stitch-outline/10 hover:border-stitch-outline/30 bg-transparent"
                          )}
                        >
                          <div className="flex shrink-0 w-12 h-8 rounded-lg overflow-hidden border border-black/5 shadow-inner items-center justify-center bg-stitch-surface-variant/30">
                            <svg className="w-5 h-5 text-stitch-on-surface-variant/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <circle cx="12" cy="12" r="9" />
                              <line x1="5.5" y1="5.5" x2="18.5" y2="18.5" />
                            </svg>
                          </div>
                          <span className="text-xs font-bold text-stitch-on-surface-variant">None</span>
                          {isNone && (
                            <div className="ml-auto w-5 h-5 rounded-full bg-stitch-primary flex items-center justify-center shrink-0">
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </button>
                      );
                    })()}
                    {PALETTES.map((p) => {
                      const isSelected = theme.selectedPaletteName === p.name;
                      return (
                        <button
                          key={p.name}
                          onClick={() => {
                            if (isSelected) {
                              // Unselect — reset to default neutral
                              theme.setPalette({ name: "None", primary: "#800000", secondary: "#333333", accent: "#D4AF37" });
                            } else {
                              theme.setPalette(p);
                            }
                          }}
                          className={cn(
                            "group relative flex items-center gap-3 p-2 rounded-xl border transition-all hover:shadow-md",
                            isSelected ? "border-stitch-primary bg-white shadow-sm" : "border-stitch-outline/10 hover:border-stitch-outline/30 bg-transparent"
                          )}
                        >
                          <div className="flex shrink-0 w-12 h-8 rounded-lg overflow-hidden border border-black/5 shadow-inner">
                            <div className="flex-1" style={{ backgroundColor: p.primary }} />
                            <div className="flex-1" style={{ backgroundColor: p.secondary }} />
                            <div className="flex-1" style={{ backgroundColor: p.accent }} />
                          </div>
                          <div className="flex flex-col items-start overflow-hidden flex-1">
                            <span className="text-xs font-bold text-stitch-on-surface truncate">{p.name}</span>
                            <div className="flex gap-1">
                              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.primary }} />
                              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.secondary }} />
                              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.accent }} />
                            </div>
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-stitch-primary flex items-center justify-center shrink-0">
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </button>
                      );
                    })}
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

              <Separator className="bg-stitch-outline/10" />

              {/* Spacing Section */}
              <div className="flex flex-col gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-[10px] text-stitch-on-surface-variant font-bold uppercase">Padding</Label>
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
                  </div>
                </div>
              )}

              {activeTab === "typography" && (
                <div className="flex flex-col gap-6">
                  <p className="text-xs text-stitch-on-surface-variant italic">Typography settings coming soon...</p>
                </div>
              )}

              {activeTab === "frames" && (
                <div className="flex flex-col gap-6">
                  <p className="text-xs text-stitch-on-surface-variant italic">Frame customization coming soon...</p>
                </div>
              )}

              {activeTab === "photo" && (
                <div className="flex flex-col gap-6">
                  <div className="space-y-4">
                    <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-stitch-on-surface-variant">Profile Photo</Label>
                    <ImageUpload 
                      value={formData.photo} 
                      onChange={(url) => setFormData({ ...formData, photo: url })} 
                      aspect={3 / 4} 
                    />
                    <p className="text-[10px] text-stitch-on-surface-variant/70 leading-relaxed italic">
                      Tip: A clear portrait with a simple background looks best in matrimonial biodata.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "stickers" && <StickerSelector />}
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
        "w-16 h-16 flex flex-col items-center justify-center gap-1.5 transition-all rounded-2xl",
        active
          ? "bg-stitch-primary text-white shadow-lg shadow-stitch-primary/20 -translate-y-0.5"
          : "text-stitch-on-surface-variant hover:text-stitch-primary hover:bg-white hover:shadow-md hover:-translate-y-0.5"
      )}
    >
      {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-5 h-5" })}
      <span className="text-[9px] uppercase tracking-wider font-bold">{label}</span>
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
