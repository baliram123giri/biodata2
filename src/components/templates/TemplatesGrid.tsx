"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sparkles, Heart, Eye, ArrowRight, Palette, Loader2 } from "lucide-react";

interface Template {
  id: string;
  name: string;
  description: string;
  accent: string;
  tags: string[];
  color: string;
  thumbnailUrl?: string;
}

const templatesList: Template[] = [
  {
    id: "royal",
    name: "Royal Heritage",
    description: "An elegant, traditional design featuring classic gold ornaments and deep rich borders. Ideal for traditional Hindu and royal families.",
    accent: "Gold & Maroon",
    tags: ["Best Seller", "Traditional", "Auspicious"],
    color: "#9B1B30",
  },
  {
    id: "ivory-elegance",
    name: "Ivory Elegance",
    description: "Sophisticated and clean layout with minimalist borders and ivory elements. Perfect for a modern yet culture-rich look.",
    accent: "Teal & Warm White",
    tags: ["Minimalist", "Elegant"],
    color: "#0D9488",
  },
  {
    id: "modern-gradient",
    name: "Modern Gradient",
    description: "A trendy design utilizing soft gradient backdrops and modern font pairings. Great for contemporary, urban professionals.",
    accent: "Indigo Gradient",
    tags: ["Modern", "Gradient", "Clean"],
    color: "#4F46E5",
  },
  {
    id: "new-generation",
    name: "New Generation Arch",
    description: "Features a beautiful architectural dome structure that symbolizes new beginnings. Combines cultural essence with a clean aesthetic.",
    accent: "Sandalwood & Crimson",
    tags: ["New Release", "Architectural"],
    color: "#B45309",
  },
  {
    id: "ornate-grandeur",
    name: "Ornate Grandeur",
    description: "Exquisite and highly detailed traditional borders resembling vintage invitation scrolls. Perfectly conveys celebration and grandeur.",
    accent: "Golden Amber",
    tags: ["Ornate", "Classic"],
    color: "#D97706",
  },
  {
    id: "green-shapes",
    name: "Green Shapes",
    description: "A fresh and natural theme featuring geometric leaves and floral motifs. Highly popular for eco-friendly and garden-themed weddings.",
    accent: "Forest Green",
    tags: ["Nature", "Floral"],
    color: "#059669",
  },
];

function MiniTemplatePreview({ id, color, scale = 1 }: { id: string; color: string; scale?: number }) {
  if (id === "royal") {
    return (
      <div 
        className="absolute inset-0 bg-[#FFFBF8] p-4 flex flex-col justify-between border-[10px] border-double rounded-lg shadow-inner transition-colors duration-300"
        style={{ borderColor: `${color}cc` }}
      >
        <div className="absolute inset-2 border border-dashed rounded" style={{ borderColor: `${color}55` }} />
        
        {/* Header Symbol */}
        <div className="flex flex-col items-center gap-1 z-10" style={{ transform: `scale(${scale})` }}>
          <div className="w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold bg-[#FBF5E6]" style={{ borderColor: color, color }}>
            ॐ
          </div>
          <div className="h-2.5 w-20 rounded-full" style={{ backgroundColor: `${color}40` }} />
        </div>

        {/* Form Body Mock */}
        <div className="space-y-3.5 z-10 px-3 mt-3">
          <div className="flex justify-between items-center">
            <div className="h-3 w-16 rounded-full" style={{ backgroundColor: `${color}a0` }} />
            <div className="h-2 w-24 bg-muted-foreground/30 rounded-full" />
          </div>
          <div className="space-y-2">
            <div className="h-2 w-full bg-muted-foreground/20 rounded-full" />
            <div className="h-2 w-5/6 bg-muted-foreground/20 rounded-full" />
            <div className="h-2 w-4/6 bg-muted-foreground/20 rounded-full" />
          </div>
          
          <div className="h-px my-3" style={{ backgroundColor: `${color}30` }} />

          <div className="flex justify-between items-center">
            <div className="h-3 w-14 rounded-full" style={{ backgroundColor: `${color}a0` }} />
            <div className="h-2 w-28 bg-muted-foreground/30 rounded-full" />
          </div>
          <div className="space-y-2">
            <div className="h-2 w-full bg-muted-foreground/20 rounded-full" />
            <div className="h-2 w-3/4 bg-muted-foreground/20 rounded-full" />
          </div>
        </div>

        {/* Footer Design */}
        <div className="flex justify-center items-center gap-1.5 z-10 pt-2 pb-1">
          <div className="w-4 h-4 rounded-full bg-muted-foreground/10 flex items-center justify-center text-[9px]" style={{ color }}>❤</div>
        </div>
      </div>
    );
  }

  if (id === "ivory-elegance") {
    return (
      <div 
        className="absolute inset-0 bg-[#FCFBF7] p-4 flex flex-col justify-between border-2 rounded-lg shadow-inner transition-colors duration-300"
        style={{ borderColor: color }}
      >
        <div className="absolute inset-1.5 border rounded" style={{ borderColor: `${color}30` }} />
        
        {/* Header Symbol */}
        <div className="flex flex-col items-center gap-1 z-10" style={{ transform: `scale(${scale})` }}>
          <div className="w-5 h-5 flex items-center justify-center text-[9px] font-bold border rounded-sm" style={{ borderColor: `${color}60`, color }}>
            ✦
          </div>
          <div className="h-2 w-16 rounded-full" style={{ backgroundColor: `${color}60` }} />
        </div>

        {/* Form Body Mock */}
        <div className="space-y-3 z-10 px-3 mt-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-14 rounded border border-dashed flex items-center justify-center text-[10px] bg-muted-foreground/5 shrink-0" style={{ borderColor: `${color}40`, color: `${color}90` }}>Photo</div>
            <div className="flex-1 space-y-2">
              <div className="h-3 w-16 rounded-full" style={{ backgroundColor: `${color}a0` }} />
              <div className="h-2 w-full bg-muted-foreground/20 rounded-full" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-2 w-full bg-muted-foreground/20 rounded-full" />
            <div className="h-2 w-full bg-muted-foreground/20 rounded-full" />
          </div>
        </div>

        {/* Footer Design */}
        <div className="flex justify-between items-center z-10 px-3 border-t pt-2" style={{ borderColor: `${color}30` }}>
          <div className="h-1.5 w-12 rounded-full" style={{ backgroundColor: `${color}60` }} />
          <div className="h-1.5 w-10 rounded-full" style={{ backgroundColor: `${color}60` }} />
        </div>
      </div>
    );
  }

  if (id === "modern-gradient") {
    return (
      <div 
        className="absolute inset-0 p-4 flex flex-col justify-between border rounded-lg shadow-inner transition-all duration-300"
        style={{ 
          background: `linear-gradient(135deg, ${color}20 0%, ${color}40 100%)`,
          borderColor: `${color}40`
        }}
      >
        {/* Soft Background Cards */}
        <div className="absolute inset-3 bg-white/80 dark:bg-black/40 backdrop-blur-xs rounded-md border" style={{ borderColor: `${color}25` }} />
        
        {/* Header Symbol */}
        <div className="flex flex-col items-center gap-1.5 z-10 mt-1" style={{ transform: `scale(${scale})` }}>
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] text-white shadow-md" style={{ backgroundColor: color }}>
            ✿
          </div>
          <div className="h-3 w-24 rounded-full" style={{ backgroundColor: `${color}80` }} />
        </div>

        {/* Form Body Mock */}
        <div className="space-y-3.5 z-10 px-4 mt-2">
          <div className="space-y-2.5">
            <div className="h-3.5 w-20 rounded-full" style={{ backgroundColor: color }} />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-2 w-full bg-muted-foreground/20 rounded-full" />
              <div className="h-2 w-full bg-muted-foreground/20 rounded-full" />
            </div>
            <div className="h-2 w-4/6 bg-muted-foreground/20 rounded-full" />
          </div>
        </div>

        {/* Footer Design */}
        <div className="flex justify-center items-center z-10 pb-1">
          <div className="h-2 w-20 opacity-50 rounded-full" style={{ backgroundColor: color }} />
        </div>
      </div>
    );
  }

  if (id === "new-generation") {
    return (
      <div 
        className="absolute inset-0 bg-[#FDFBF7] p-4 flex flex-col justify-between border rounded-lg shadow-inner transition-colors duration-300"
        style={{ borderColor: `${color}50` }}
      >
        {/* Custom Arched Dome Frame */}
        <div className="absolute inset-2.5 border-t border-x rounded-t-[50%] h-[90%]" style={{ borderColor: `${color}70` }} />
        <div className="absolute bottom-2.5 left-2.5 right-2.5 border-b" style={{ borderColor: `${color}70` }} />

        {/* Header Symbol inside Arch */}
        <div className="flex flex-col items-center gap-1 z-10 pt-3" style={{ transform: `scale(${scale})` }}>
          <div className="text-[11px] font-bold" style={{ color }}>卐</div>
          <div className="h-3 w-20 rounded-full" style={{ backgroundColor: `${color}80` }} />
        </div>

        {/* Form Body Mock */}
        <div className="space-y-2.5 z-10 px-4 mt-3">
          <div className="flex justify-between items-center">
            <div className="h-3.5 w-14 rounded-full" style={{ backgroundColor: color }} />
            <div className="h-2 w-20 bg-muted-foreground/20 rounded-full" />
          </div>
          <div className="space-y-2">
            <div className="h-2 w-full bg-muted-foreground/15 rounded-full" />
            <div className="h-2 w-full bg-muted-foreground/15 rounded-full" />
          </div>
        </div>

        {/* Footer Design */}
        <div className="flex justify-center items-center z-10 pb-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: `${color}70` }} />
        </div>
      </div>
    );
  }

  if (id === "ornate-grandeur") {
    return (
      <div 
        className="absolute inset-0 bg-[#FFF9ED] p-4 flex flex-col justify-between border-4 rounded-lg shadow-inner transition-colors duration-300"
        style={{ borderColor: color }}
      >
        {/* Detailed Ornate Corners */}
        <div className="absolute top-1.5 left-1.5 w-4 h-4 border-t border-l border-2 rounded-tl" style={{ borderColor: color }} />
        <div className="absolute top-1.5 right-1.5 w-4 h-4 border-t border-r border-2 rounded-tr" style={{ borderColor: color }} />
        <div className="absolute bottom-1.5 left-1.5 w-4 h-4 border-b border-l border-2 rounded-bl" style={{ borderColor: color }} />
        <div className="absolute bottom-1.5 right-1.5 w-4 h-4 border-b border-r border-2 rounded-br" style={{ borderColor: color }} />

        {/* Header Symbol */}
        <div className="flex flex-col items-center gap-1 z-10 mt-1" style={{ transform: `scale(${scale})` }}>
          <span className="text-[10px]" style={{ color }}>⚜</span>
          <div className="h-3 w-20 rounded-full" style={{ backgroundColor: `${color}80` }} />
        </div>

        {/* Form Body Mock */}
        <div className="space-y-3 z-10 px-3 mt-2">
          <div className="space-y-2">
            <div className="h-3.5 w-16 rounded-full" style={{ backgroundColor: color }} />
            <div className="h-2 w-full bg-muted-foreground/20 rounded-full" />
            <div className="h-2 w-5/6 bg-muted-foreground/20 rounded-full" />
          </div>
        </div>

        {/* Footer Design */}
        <div className="flex justify-center items-center z-10 pb-1">
          <div className="h-1.5 w-14 rounded-full" style={{ backgroundColor: `${color}60` }} />
        </div>
      </div>
    );
  }

  // Default green-shapes
  return (
    <div 
      className="absolute inset-0 bg-[#F4FBF7] p-4 flex flex-col justify-between border rounded-lg shadow-inner transition-colors duration-300"
      style={{ borderColor: `${color}70` }}
    >
      {/* Leaves Motif corners */}
      <div className="absolute top-2 left-2 text-[11px] select-none" style={{ color: `${color}a0` }}>🍃</div>
      <div className="absolute top-2 right-2 text-[11px] select-none" style={{ color: `${color}a0` }}>🍃</div>
      
      {/* Header Symbol */}
      <div className="flex flex-col items-center gap-1 z-10" style={{ transform: `scale(${scale})` }}>
        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px]" style={{ backgroundColor: `${color}15`, color }}>❀</div>
        <div className="h-3 w-16 rounded-full" style={{ backgroundColor: `${color}80` }} />
      </div>

      {/* Form Body Mock */}
      <div className="space-y-3 z-10 px-3 mt-2">
        <div className="flex justify-between items-center">
          <div className="h-3.5 w-14 rounded-full" style={{ backgroundColor: color }} />
          <div className="h-2 w-20 bg-muted-foreground/20 rounded-full" />
        </div>
        <div className="space-y-2">
          <div className="h-2 w-full bg-muted-foreground/15 rounded-full" />
          <div className="h-2 w-4/5 bg-muted-foreground/15 rounded-full" />
        </div>
      </div>

      {/* Footer Design */}
      <div className="flex justify-center items-center z-10 pb-1">
        <span className="text-[10px]" style={{ color: `${color}60` }}>🍃</span>
      </div>
    </div>
  );
}

export function TemplatesGrid({ initialTemplates }: { initialTemplates?: any[] }) {
  const [dbTemplates, setDbTemplates] = useState<any[]>(initialTemplates || []);
  const [selectedTpl, setSelectedTpl] = useState<Template | null>(null);
  const [customColor, setCustomColor] = useState<string>("");
  const [visibleCount, setVisibleCount] = useState(20);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(!initialTemplates || initialTemplates.length === 0);
  const observerTargetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Try to load from session storage cache first
    try {
      const cached = sessionStorage.getItem("biodata_templates_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setDbTemplates(parsed);
          setIsLoadingInitial(false);
        }
      }
    } catch (e) {
      console.error("Error reading templates cache:", e);
    }

    // 2. Fetch fresh data from API and refresh cache
    fetch("/api/templates")
      .then((res) => res.json())
      .then((data) => {
        if (data.templates) {
          setDbTemplates(data.templates);
          setIsLoadingInitial(false);
          try {
            sessionStorage.setItem("biodata_templates_cache", JSON.stringify(data.templates));
          } catch (e) {
            console.error("Error saving templates cache:", e);
          }
        }
      })
      .catch((err) => {
        console.error("Error loading templates in grid:", err);
        setIsLoadingInitial(false);
      });
  }, []);

  const handleOpenDialog = (tpl: Template) => {
    setSelectedTpl(tpl);
    setCustomColor(tpl.color);
  };

  const presetColors = ["#9B1B30", "#0D9488", "#4F46E5", "#B45309", "#D97706", "#059669", "#701A75", "#0F172A"];

  // Load templates only from the database
  const allTemplates = dbTemplates.map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description || "",
    accent: "Custom theme",
    tags: ["Dynamic", "Premium"],
    color: t.defaultPrimary,
    thumbnailUrl: t.thumbnailUrl,
  }));

  // Infinite Scroll logic via Intersection Observer
  useEffect(() => {
    const observerTarget = observerTargetRef.current;
    if (!observerTarget || allTemplates.length <= visibleCount) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !loadingMore) {
          setLoadingMore(true);
          // Artificial delay to showcase the beautiful loader transition
          setTimeout(() => {
            setVisibleCount((prev) => Math.min(prev + 20, allTemplates.length));
            setLoadingMore(false);
          }, 800);
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    observer.observe(observerTarget);
    return () => {
      observer.unobserve(observerTarget);
    };
  }, [allTemplates.length, visibleCount, loadingMore]);

  // Render initial skeleton loaders if loading for the very first time
  if (isLoadingInitial && dbTemplates.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="border border-[#C9A84C]/15 bg-card overflow-hidden shadow-md flex flex-col h-[480px] animate-pulse">
            <div className="h-56 bg-muted/40" />
            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="h-4 bg-muted/50 rounded-full w-1/4" />
                <div className="h-6 bg-muted/50 rounded-full w-2/3" />
                <div className="space-y-2">
                  <div className="h-3 bg-muted/40 rounded-full w-full" />
                  <div className="h-3 bg-muted/40 rounded-full w-5/6" />
                </div>
              </div>
              <div className="pt-4 border-t border-border/40 flex justify-between">
                <div className="h-4 bg-muted/40 rounded-full w-1/3" />
                <div className="h-8 bg-muted/40 rounded-full w-1/4" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const visibleTemplates = allTemplates.slice(0, visibleCount);

  return (
    <Dialog>
      <div className="space-y-16">
        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visibleTemplates.map((tpl) => (
            <Card
              key={tpl.id}
              className="border border-[#C9A84C]/25 bg-card overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col group"
            >
              {/* Visual HTML Preview Cover */}
              <div className="h-56 relative overflow-hidden bg-muted flex items-center justify-center p-3 select-none">
                <div className="w-full h-full relative flex items-center justify-center transform scale-[0.95] group-hover:scale-100 transition-transform duration-500">
                  {tpl.thumbnailUrl ? (
                    <img
                      src={tpl.thumbnailUrl.includes("res.cloudinary.com") && tpl.thumbnailUrl.includes("/image/upload/")
                        ? tpl.thumbnailUrl.replace("/image/upload/", "/image/upload/w_450,h_637,c_fit,q_100/")
                        : tpl.thumbnailUrl
                      }
                      alt={tpl.name}
                      className="h-full w-auto object-contain rounded-md border border-border/80 bg-white shadow-lg"
                    />
                  ) : (
                    <MiniTemplatePreview id={tpl.id} color={tpl.color} />
                  )}
                </div>
                
                {/* Blur Action Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-xs">
                  <DialogTrigger 
                    className="inline-flex shrink-0 items-center justify-center border border-[#C9A84C]/25 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-full font-bold text-xs h-9 px-3.5 shadow-md hover:scale-105 transition-all duration-200 cursor-pointer"
                    onClick={() => handleOpenDialog(tpl)}
                  >
                    <Eye className="w-4 h-4 mr-1.5" />
                    Quick View
                  </DialogTrigger>
                  <Button 
                    size="sm" 
                    className="rounded-full bg-gradient-primary border-0 text-white font-bold shadow-md hover:scale-105 transition-transform"
                    asChild
                  >
                    <Link href={`/edit?template=${tpl.id}`}>
                      Select
                    </Link>
                  </Button>
                </div>
              </div>

              <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {tpl.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-[#FBF5E6] dark:bg-[#8A7233]/25 text-[#8A7233] dark:text-[#E6C97A] border border-[#C9A84C]/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-2xl font-black text-foreground group-hover:text-primary transition-colors">{tpl.name}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">{tpl.description}</p>
                </div>

                <div className="pt-4 border-t border-border/40 flex items-center justify-between">
                  <div className="text-xs flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full border border-border" style={{ backgroundColor: tpl.color }} />
                    <span className="font-bold text-foreground">{tpl.accent}</span>
                  </div>

                  <Button 
                    variant="outline" 
                    className="rounded-full border-[#C9A84C]/50 hover:bg-[#FBF5E6]/40 text-foreground font-bold px-5 py-2 transition-colors duration-200" 
                    asChild
                  >
                    <Link href={`/edit?template=${tpl.id}`}>
                      Use Template <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Intersection Observer Target */}
        <div ref={observerTargetRef} className="h-4 w-full flex items-center justify-center" />

        {/* Loading Spinner */}
        {loadingMore && (
          <div className="flex flex-col items-center justify-center space-y-3 py-6 animate-in fade-in duration-300">
            <div className="relative flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <div className="absolute w-12 h-12 rounded-full border border-primary/20 border-t-transparent animate-pulse" />
            </div>
            <p className="text-xs font-black text-[#8A7233] dark:text-[#E6C97A] uppercase tracking-widest animate-pulse">
              Loading Premium Formats...
            </p>
          </div>
        )}

        {/* All Loaded Message */}
        {!loadingMore && allTemplates.length > 0 && visibleCount >= allTemplates.length && (
          <div className="flex items-center justify-center gap-4 py-8 animate-in fade-in duration-500">
            <div className="h-px bg-[#C9A84C]/25 flex-1 max-w-[150px]" />
            <span className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A84C]" />
              You've viewed all templates
            </span>
            <div className="h-px bg-[#C9A84C]/25 flex-1 max-w-[150px]" />
          </div>
        )}


        {/* Quick View Dialog / Modal */}
        {selectedTpl && (
          <DialogContent
            showCloseButton={true}
            className="max-w-3xl w-[95vw] p-0 rounded-2xl overflow-hidden border border-[#C9A84C]/35 bg-card shadow-2xl"
          >
            <div className="flex flex-col md:flex-row h-auto md:h-[560px]">

              {/* LEFT: Large Template Preview Panel */}
              <div
                className="md:w-[45%] w-full flex-shrink-0 relative flex items-center justify-center p-6 md:p-8 min-h-[260px] md:min-h-0 overflow-hidden"
                style={{ background: `linear-gradient(145deg, ${selectedTpl.color}12 0%, ${selectedTpl.color}22 100%)` }}
              >
                {/* Decorative soft ring */}
                <div
                  className="absolute w-72 h-72 rounded-full opacity-10 pointer-events-none"
                  style={{ backgroundColor: selectedTpl.color, filter: "blur(60px)" }}
                />

                {/* Template image / mini-preview */}
                <div
                  className="relative z-10 rounded-xl overflow-hidden shadow-[0_20px_60px_-8px_rgba(0,0,0,0.35)] border border-white/20 transition-transform duration-500 hover:scale-[1.02]"
                  style={{ width: 200, height: 265 }}
                >
                  {selectedTpl.thumbnailUrl ? (
                    <img
                      src={selectedTpl.thumbnailUrl.includes("res.cloudinary.com") && selectedTpl.thumbnailUrl.includes("/image/upload/")
                        ? selectedTpl.thumbnailUrl.replace("/image/upload/", "/image/upload/w_450,h_637,c_fit,q_100/")
                        : selectedTpl.thumbnailUrl
                      }
                      alt={selectedTpl.name}
                      className="w-full h-full object-contain bg-white"
                    />
                  ) : (
                    <MiniTemplatePreview id={selectedTpl.id} color={customColor} scale={0.9} />
                  )}
                </div>

                {/* Bottom accent line */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-1"
                  style={{ background: `linear-gradient(to right, transparent, ${selectedTpl.color}80, transparent)` }}
                />
              </div>

              {/* RIGHT: Details Panel */}
              <div className="flex-1 flex flex-col overflow-y-auto p-6 md:p-8 bg-card border-t md:border-t-0 md:border-l border-border/40">

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {selectedTpl.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-[#FBF5E6] dark:bg-[#8A7233]/25 text-[#8A7233] dark:text-[#E6C97A] border border-[#C9A84C]/25"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Name */}
                <DialogHeader className="p-0 text-left mb-3">
                  <DialogTitle className="text-[1.6rem] md:text-3xl font-black leading-tight text-foreground">
                    {selectedTpl.name}
                  </DialogTitle>
                </DialogHeader>

                {/* Color accent dot */}
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className="w-3 h-3 rounded-full border-2 border-white shadow"
                    style={{ backgroundColor: selectedTpl.color }}
                  />
                  <span className="text-xs font-bold text-muted-foreground">{selectedTpl.accent}</span>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed mb-6 line-clamp-4">
                  {selectedTpl.description || "A premium matrimonial biodata template with elegant design and comprehensive fields."}
                </p>

                {/* Color Customizer — only when no thumbnail */}
                {!selectedTpl.thumbnailUrl && (
                  <div className="mb-6 space-y-2.5">
                    <span className="text-[11px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5" />
                      Preview Color
                    </span>
                    <div className="flex flex-wrap gap-2.5">
                      {presetColors.map((color) => (
                        <button
                          key={color}
                          className="relative w-7 h-7 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none"
                          style={{ backgroundColor: color }}
                          onClick={() => setCustomColor(color)}
                          title={color}
                        >
                          {customColor === color && (
                            <span className="absolute inset-0 rounded-full ring-2 ring-offset-2 ring-foreground/60" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Spacer to push CTA to the bottom */}
                <div className="flex-1" />

                {/* Stats Row */}
                <div className="flex items-center gap-4 mb-5 p-3 rounded-xl bg-muted/40 border border-border/30">
                  <div className="flex flex-col items-center flex-1 border-r border-border/30">
                    <span className="text-lg font-black text-foreground">A4</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Format</span>
                  </div>
                  <div className="flex flex-col items-center flex-1 border-r border-border/30">
                    <span className="text-lg font-black text-foreground">PDF</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Export</span>
                  </div>
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-lg font-black text-foreground">∞</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Colors</span>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    className="flex-1 rounded-full bg-gradient-primary border-0 font-bold text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 h-11"
                    asChild
                  >
                    <Link href={`/edit?template=${selectedTpl.id}`}>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Use This Template
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full border-[#C9A84C]/50 hover:bg-[#FBF5E6]/50 font-bold h-11 px-5 transition-all duration-200"
                    asChild
                  >
                    <Link href={`/edit?template=${selectedTpl.id}`}>
                      Preview <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Link>
                  </Button>
                </div>

              </div>
            </div>
          </DialogContent>
        )}
      </div>
    </Dialog>
  );
}
