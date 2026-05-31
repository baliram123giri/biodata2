"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sparkles, Eye, ArrowRight, Loader2 } from "lucide-react";
import Image from "next/image";

interface Template {
  id: string;
  name: string;
  description: string;
  accent: string;
  tags: string[];
  color: string;
  thumbnailUrl?: string;
}

function MiniTemplatePreview({ color }: { id: string; color: string; scale?: number }) {
  return (
    <div
      className="absolute inset-0 bg-[#FFFBF8] p-4 flex flex-col justify-between border-[6px] rounded-lg shadow-inner transition-colors duration-300"
      style={{ borderColor: `${color}cc` }}
    >
      <div className="absolute inset-1.5 border border-dashed rounded" style={{ borderColor: `${color}30` }} />

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

        <div className="h-px my-3" style={{ backgroundColor: `${color}20` }} />

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

function TemplateDescription({ text }: { text: string }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text) {
    return null;
  }

  // Quick check if the text contains HTML tags (to support both old plain text and new WYSIWYG text)
  const isHtml = /<[a-z][\s\S]*>/i.test(text);

  return (
    <div className="flex flex-col items-start gap-2 w-full">
      <div
        className={`prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-headings:font-black prose-p:text-muted-foreground prose-p:leading-relaxed prose-li:text-muted-foreground prose-ul:list-disc prose-ul:pl-5 space-y-2 w-full ${!isExpanded ? "line-clamp-4" : ""}`}
        dangerouslySetInnerHTML={{ __html: isHtml ? text : `<p>${text}</p>` }}
      />
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsExpanded(!isExpanded);
        }}
        className="text-[#9B1B30] dark:text-[#C9A84C] font-black text-[11px] uppercase tracking-wider hover:underline inline-flex items-center cursor-pointer focus:outline-none"
      >
        {isExpanded ? "Read Less" : "Read More"}
      </button>
    </div>
  );
}

export function TemplatesGrid({ initialTemplates }: { initialTemplates?: any[] }) {
  const [dbTemplates, setDbTemplates] = useState<any[]>(initialTemplates || []);
  const [selectedTpl, setSelectedTpl] = useState<Template | null>(null);
  const [visibleCount, setVisibleCount] = useState(20);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(!initialTemplates || initialTemplates.length === 0);
  const observerTargetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialTemplates && initialTemplates.length > 0) {
      setDbTemplates(initialTemplates);
      setIsLoadingInitial(false);
      return;
    }

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
  }, [initialTemplates]);

  const handleOpenDialog = (tpl: Template) => {
    setSelectedTpl(tpl);
  };

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
          <Card key={i} className="border border-[#C9A84C]/15 bg-card overflow-hidden shadow-md flex flex-col animate-pulse">
            <div className="w-full aspect-[1/1.414] bg-muted/40" />
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
              className="border pt-0 border-[#C9A84C]/25 bg-card overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col group"
            >
              {/* Visual HTML Preview Cover */}
              <div className="w-full aspect-[1/1.414] relative overflow-hidden flex items-center justify-center select-none bg-muted/10">
                <div className="w-full h-full relative flex items-center justify-center transform scale-100 group-hover:scale-[1.03] transition-transform duration-500">
                  {tpl.thumbnailUrl ? (
                    <Image
                      src={tpl.thumbnailUrl.includes("res.cloudinary.com") && tpl.thumbnailUrl.includes("/image/upload/")
                        ? tpl.thumbnailUrl.replace("/image/upload/", "/image/upload/w_450,h_637,c_fit,f_auto,q_auto/")
                        : tpl.thumbnailUrl
                      }
                      alt={tpl.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 30vw"
                      className="object-cover object-center transition-transform duration-500"
                      loading="lazy"
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
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-[#FBF5E6] dark:bg-[#8A7233]/25 text-[#9B1B30] dark:text-[#E6C97A] border border-[#C9A84C]/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-2xl font-black text-foreground group-hover:text-primary transition-colors">{tpl.name}</h2>
                  <TemplateDescription text={tpl.description} />
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
            <p className="text-xs font-black text-[#9B1B30] dark:text-[#E6C97A] uppercase tracking-widest animate-pulse">
              Loading Premium Formats...
            </p>
          </div>
        )}

        {/* All Loaded Message */}
        {!loadingMore && allTemplates.length > 0 && visibleCount >= allTemplates.length && (
          <div className="flex items-center justify-center gap-4 animate-in fade-in duration-500">
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
            className="sm:max-w-3xl max-w-3xl w-[95vw] max-h-[92vh] sm:max-h-[85vh] p-0 rounded-2xl overflow-hidden border border-[#C9A84C]/35 bg-card shadow-2xl flex flex-col"
          >
            <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-y-auto md:overflow-hidden md:h-[560px]">

              {/* LEFT: Large Template Preview Panel */}
              <div
                className="md:w-[45%] w-full flex-shrink-0 relative flex items-center justify-center p-3 sm:p-4 md:p-8 min-h-[160px] sm:min-h-[220px] md:min-h-0 overflow-hidden"
                style={{ background: `linear-gradient(145deg, ${selectedTpl.color}12 0%, ${selectedTpl.color}22 100%)` }}
              >
                {/* Decorative soft ring */}
                <div
                  className="absolute w-72 h-72 rounded-full opacity-10 pointer-events-none"
                  style={{ backgroundColor: selectedTpl.color, filter: "blur(60px)" }}
                />

                {/* Template image / mini-preview */}
                <div
                  className="relative z-10 rounded-xl overflow-hidden shadow-[0_15px_40px_-8px_rgba(0,0,0,0.3)] border border-white/20 transition-transform duration-500 hover:scale-[1.02] w-[110px] h-[155px] sm:w-[150px] sm:h-[200px] md:w-[200px] md:h-[265px]"
                >
                  {selectedTpl.thumbnailUrl ? (
                    <Image
                      src={selectedTpl.thumbnailUrl.includes("res.cloudinary.com") && selectedTpl.thumbnailUrl.includes("/image/upload/")
                        ? selectedTpl.thumbnailUrl.replace("/image/upload/", "/image/upload/w_450,h_637,c_fit,f_auto,q_auto/")
                        : selectedTpl.thumbnailUrl
                      }
                      alt={selectedTpl.name}
                      fill
                      sizes="(max-width: 768px) 110px, 200px"
                      className="object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <MiniTemplatePreview id={selectedTpl.id} color={selectedTpl.color} scale={0.9} />
                  )}
                </div>

                {/* Bottom accent line */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-1"
                  style={{ background: `linear-gradient(to right, transparent, ${selectedTpl.color}80, transparent)` }}
                />
              </div>

              {/* RIGHT: Details Panel */}
              <div className="flex-1 flex flex-col md:overflow-y-auto overflow-visible p-4 sm:p-5 md:p-8 bg-card border-t md:border-t-0 md:border-l border-border/40 min-h-0">

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-2 md:mb-4">
                  {selectedTpl.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full text-[8.5px] md:text-[10px] font-black tracking-wider uppercase bg-[#FBF5E6] dark:bg-[#8A7233]/25 text-[#9B1B30] dark:text-[#E6C97A] border border-[#C9A84C]/25"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Name */}
                <DialogHeader className="p-0 text-left mb-1.5 md:mb-3">
                  <DialogTitle className="text-xl md:text-3xl font-black leading-tight text-foreground">
                    {selectedTpl.name}
                  </DialogTitle>
                </DialogHeader>

                {/* Color accent dot */}
                <div className="flex items-center gap-2 mb-2 md:mb-4">
                  <span
                    className="w-2.5 h-2.5 rounded-full border-2 border-white shadow"
                    style={{ backgroundColor: selectedTpl.color }}
                  />
                  <span className="text-[10.5px] md:text-xs font-bold text-muted-foreground">{selectedTpl.accent}</span>
                </div>

                {/* Description */}
                <div
                  className="w-full md:overflow-y-auto max-h-[85px] sm:max-h-[140px] md:max-h-[220px] custom-scrollbar prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-headings:font-black prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:text-[11.5px] md:prose-p:text-sm prose-li:text-muted-foreground prose-ul:list-disc prose-ul:pl-5 space-y-2 mb-3 md:mb-6 pr-2"
                  dangerouslySetInnerHTML={{
                    __html: (selectedTpl.description && /<[a-z][\s\S]*>/i.test(selectedTpl.description))
                      ? selectedTpl.description
                      : `<p>${selectedTpl.description || "A premium matrimonial biodata template with elegant design and comprehensive fields."}</p>`
                  }}
                />

                {/* Spacer to push CTA to the bottom */}
                <div className="flex-1 min-h-[10px] md:min-h-0" />

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <Button
                    className="flex-1 rounded-full bg-gradient-primary border-0 font-bold text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 h-9.5 md:h-11 text-xs md:text-sm"
                    asChild
                  >
                    <Link href={`/edit?template=${selectedTpl.id}`}>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Use This Template
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full border-[#C9A84C]/50 hover:bg-[#FBF5E6]/50 font-bold h-9.5 md:h-11 px-5 transition-all duration-200 text-xs md:text-sm"
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
