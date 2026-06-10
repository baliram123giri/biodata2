"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, ArrowRight, Loader2, Search, RotateCcw, SlidersHorizontal, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

interface ThumbnailTemplate {
  id: string;
  name: string;
  thumbnailUrl?: string;
  language?: string;
  religion?: string | null;
  gender?: string | null;
  isPremium?: boolean;
  price?: number | null;
  discountPrice?: number | null;
  jpgPrice?: number | null;
  jpgDiscountPrice?: number | null;
}

const getTemplateGender = (name: string): "boy" | "girl" | "both" => {
  const lowerName = name.toLowerCase();
  
  // Explicit Girl templates (Crimson, Rose, Ruby, Garnet, Marathi Vivah Parichay, Shubh Vivah, Royal Gold Hindi)
  if (
    lowerName.includes("girl") ||
    lowerName.includes("bride") ||
    lowerName.includes("female") ||
    lowerName.includes("ruby") ||
    lowerName.includes("rose") ||
    lowerName.includes("pink") ||
    lowerName.includes("floral") ||
    lowerName.includes("crimson") ||
    lowerName.includes("marathi vivah parichay") ||
    lowerName.includes("shubh vivah") ||
    lowerName.includes("royal gold hindi") ||
    lowerName.includes("garnet")
  ) {
    return "girl";
  }

  // Explicit Boy templates (Blue, Peacock, Neelambari, Islamic/Muslim, Marathi Vivah, Traditional Hindi Shaadi)
  if (
    lowerName.includes("boy") ||
    lowerName.includes("groom") ||
    lowerName.includes("male") ||
    lowerName.includes("blue") ||
    lowerName.includes("peacock") ||
    lowerName.includes("neelambari") ||
    lowerName.includes("islamic") ||
    lowerName.includes("muslim") ||
    lowerName.includes("मराठी विवाह") ||
    lowerName.includes("traditional hindi shaadi")
  ) {
    return "boy";
  }

  return "both";
};

const getGender = (t: ThumbnailTemplate): "boy" | "girl" | "both" => {
  if (t.gender) {
    const g = t.gender.toLowerCase();
    if (g === "male" || g === "boy") return "boy";
    if (g === "female" || g === "girl") return "girl";
    return "both";
  }
  return getTemplateGender(t.name);
};

const getNormalizedReligion = (religion: string | null | undefined): string => {
  if (!religion || religion.trim().toLowerCase() === "general") {
    return "General";
  }
  return religion.trim();
};

// Global in-memory cache to persist data across page navigation without refetching
let cachedTemplates: ThumbnailTemplate[] | null = null;
let cachedSearchQuery = "";
let cachedSelectedLangs: string[] = [];
let cachedSelectedPrices: string[] = [];
let cachedSelectedGenders: string[] = [];
let cachedSelectedReligions: string[] = [];

export function ThumbnailsGrid() {
  const [templates, setTemplates] = useState<ThumbnailTemplate[]>(() => cachedTemplates || []);
  const [loading, setLoading] = useState(() => !cachedTemplates);

  // Filter States
  const [searchQuery, setSearchQuery] = useState(() => cachedSearchQuery);
  const [selectedLangs, setSelectedLangs] = useState<string[]>(() => cachedSelectedLangs);
  const [selectedPrices, setSelectedPrices] = useState<string[]>(() => cachedSelectedPrices);
  const [selectedGenders, setSelectedGenders] = useState<string[]>(() => cachedSelectedGenders);
  const [selectedReligions, setSelectedReligions] = useState<string[]>(() => cachedSelectedReligions);

  // Sync state changes to global cache
  useEffect(() => {
    cachedSearchQuery = searchQuery;
  }, [searchQuery]);

  useEffect(() => {
    cachedSelectedLangs = selectedLangs;
  }, [selectedLangs]);

  useEffect(() => {
    cachedSelectedPrices = selectedPrices;
  }, [selectedPrices]);

  useEffect(() => {
    cachedSelectedGenders = selectedGenders;
  }, [selectedGenders]);

  useEffect(() => {
    cachedSelectedReligions = selectedReligions;
  }, [selectedReligions]);

  const [openSections, setOpenSections] = useState({
    search: true,
    gender: true,
    religion: true,
    price: true,
    language: true,
  });

  const toggleSection = (section: "search" | "price" | "language" | "gender" | "religion") => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Collapse accordions on mobile on mount
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setOpenSections({
        search: false,
        gender: false,
        religion: false,
        price: false,
        language: false,
      });
    }
  }, []);

  useEffect(() => {
    if (cachedTemplates && cachedTemplates.length > 0) {
      setLoading(false);
      return;
    }
    fetch("/api/templates/thumbnails")
      .then((res) => res.json())
      .then((data) => {
        if (data.templates) {
          cachedTemplates = data.templates;
          setTemplates(data.templates);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load template thumbnails:", err);
        setLoading(false);
      });
  }, []);

  // Compute unique languages list
  const languagesList = useMemo(() => {
    const langs = new Set<string>();
    templates.forEach((t) => {
      if (t.language) {
        langs.add(t.language);
      }
    });
    return Array.from(langs);
  }, [templates]);

  // Compute unique religions list
  const religionsList = useMemo(() => {
    const rels = new Set<string>();
    templates.forEach((t) => {
      rels.add(getNormalizedReligion(t.religion));
    });
    return Array.from(rels);
  }, [templates]);

  // Compute filtered templates
  const filteredTemplates = useMemo(() => {
    return templates.filter((tpl) => {
      // 1. Search filter
      const matchesSearch = tpl.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      // 2. Language filter (multi-select)
      if (selectedLangs.length > 0 && tpl.language && !selectedLangs.includes(tpl.language)) {
        return false;
      }

      // 3. Pricing filter (multi-select)
      if (selectedPrices.length > 0) {
        const isFree = !tpl.isPremium;
        const isPremium = !!tpl.isPremium;
        
        if (selectedPrices.includes("free") && !selectedPrices.includes("premium") && !isFree) {
          return false;
        }
        if (selectedPrices.includes("premium") && !selectedPrices.includes("free") && !isPremium) {
          return false;
        }
      }

      // 4. Gender / Format-For filter (multi-select)
      if (selectedGenders.length > 0) {
        const tplGender = getGender(tpl);
        if (tplGender !== "both" && !selectedGenders.includes(tplGender)) {
          return false;
        }
      }

      // 5. Religion / Community filter (multi-select)
      if (selectedReligions.length > 0) {
        const tplReligion = getNormalizedReligion(tpl.religion);
        if (!selectedReligions.includes(tplReligion)) {
          return false;
        }
      }

      return true;
    });
  }, [templates, searchQuery, selectedLangs, selectedPrices, selectedGenders, selectedReligions]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedLangs([]);
    setSelectedPrices([]);
    setSelectedGenders([]);
    setSelectedReligions([]);
  };

  const hasActiveFilters = searchQuery !== "" || selectedLangs.length > 0 || selectedPrices.length > 0 || selectedGenders.length > 0 || selectedReligions.length > 0;

  if (loading) {
    return (
      <div className="flex flex-col md:grid md:grid-cols-12 gap-8 items-start">
        {/* Skeleton Sidebar */}
        <div className="hidden md:block md:col-span-3 h-[400px] bg-muted/20 animate-pulse rounded-2xl w-full" />
        {/* Skeleton Grid */}
        <div className="md:col-span-9 w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="border border-[#C9A84C]/15 bg-card overflow-hidden shadow-md aspect-[1/1.414] animate-pulse rounded-none w-full bg-muted/40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:grid md:grid-cols-12 gap-8 items-start w-full">
        
        {/* LEFT COLUMN: E-commerce Sticky Sidebar */}
        <div className="flex col-span-12 md:col-span-3 flex-col gap-6 md:sticky md:top-24 w-full bg-white/60 dark:bg-stone-900/60 backdrop-blur-md border border-[#C9A84C]/25 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] text-left">
          <div className="flex items-center justify-between border-b border-stone-200/50 dark:border-stone-800 pb-3">
            <span className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-primary" />
              Filters
            </span>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-[11px] font-black text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer transition-colors uppercase tracking-wider"
              >
                <RotateCcw className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>

          {/* Search Category (Collapsible Accordion) */}
          <div className="border-b border-stone-250/30 dark:border-stone-800 last:border-0 pb-1">
            <button
              onClick={() => toggleSection("search")}
              className="w-full flex items-center justify-between py-3 px-1 text-xs font-bold text-foreground hover:text-primary transition-colors cursor-pointer group"
            >
              <span className="font-black uppercase tracking-wider text-[10px] text-muted-foreground/85">Search Templates</span>
              <ChevronDown className={cn("w-4 h-4 text-muted-foreground/50 transition-transform duration-300", openSections.search ? "rotate-180" : "rotate-0")} />
            </button>
            <div className={cn("overflow-hidden transition-all duration-300 ease-in-out px-1", openSections.search ? "max-h-24 opacity-100 pb-4" : "max-h-0 opacity-0")}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B1B30]/30 transition-all font-medium placeholder:text-muted-foreground/50 shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* Format For Category (Collapsible Accordion) */}
          <div className="border-b border-stone-250/30 dark:border-stone-800 last:border-0 pb-1">
            <button
              onClick={() => toggleSection("gender")}
              className="w-full flex items-center justify-between py-3 px-1 text-xs font-bold text-foreground hover:text-primary transition-colors cursor-pointer group"
            >
              <span className="font-black uppercase tracking-wider text-[10px] text-muted-foreground/85">Format For</span>
              <ChevronDown className={cn("w-4 h-4 text-muted-foreground/50 transition-transform duration-300", openSections.gender ? "rotate-180" : "rotate-0")} />
            </button>
            <div className={cn("overflow-hidden transition-all duration-300 ease-in-out px-1", openSections.gender ? "max-h-48 opacity-100 pb-4" : "max-h-0 opacity-0")}>
              <div className="flex flex-col gap-1">
                {[
                  { id: "boy", label: "Groom / Boy", count: templates.filter((t) => getGender(t) === "boy" || getGender(t) === "both").length },
                  { id: "girl", label: "Bride / Girl", count: templates.filter((t) => getGender(t) === "girl" || getGender(t) === "both").length },
                ].map((item) => {
                  const isChecked = selectedGenders.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      className="w-full flex items-center justify-between py-1.5 text-xs rounded-xl"
                    >
                      <label className="flex items-center gap-2.5 cursor-pointer font-bold text-stone-600 dark:text-stone-400 hover:text-foreground select-none w-full">
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedGenders((prev) => [...prev, item.id]);
                            } else {
                              setSelectedGenders((prev) => prev.filter((id) => id !== item.id));
                            }
                          }}
                        />
                        {item.label}
                      </label>
                      <span className="text-[9px] bg-muted/40 px-1.5 py-0.5 rounded-md font-black text-muted-foreground">
                        {item.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Religion / Community Category (Collapsible Accordion) */}
          {religionsList.length > 0 && (
            <div className="border-b border-stone-250/30 dark:border-stone-800 last:border-0 pb-1">
              <button
                onClick={() => toggleSection("religion")}
                className="w-full flex items-center justify-between py-3 px-1 text-xs font-bold text-foreground hover:text-primary transition-colors cursor-pointer group"
              >
                <span className="font-black uppercase tracking-wider text-[10px] text-muted-foreground/85">Religion / Community</span>
                <ChevronDown className={cn("w-4 h-4 text-muted-foreground/50 transition-transform duration-300", openSections.religion ? "rotate-180" : "rotate-0")} />
              </button>
              <div className={cn("overflow-hidden transition-all duration-300 ease-in-out px-1", openSections.religion ? "max-h-72 opacity-100 pb-4" : "max-h-0 opacity-0")}>
                <div className="flex flex-col gap-1 max-h-60 overflow-y-auto pr-1">
                  {religionsList.map((rel) => {
                    const isChecked = selectedReligions.includes(rel);
                    const count = templates.filter((t) => getNormalizedReligion(t.religion) === rel).length;
                    return (
                      <div
                        key={rel}
                        className="w-full flex items-center justify-between py-1.5 text-xs rounded-xl"
                      >
                        <label className="flex items-center gap-2.5 cursor-pointer font-bold text-stone-600 dark:text-stone-400 hover:text-foreground select-none w-full">
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedReligions((prev) => [...prev, rel]);
                              } else {
                                setSelectedReligions((prev) => prev.filter((r) => r !== rel));
                              }
                            }}
                          />
                          {rel}
                        </label>
                        <span className="text-[9px] bg-muted/40 px-1.5 py-0.5 rounded-md font-black text-muted-foreground">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Pricing Category (Collapsible Accordion) */}
          <div className="border-b border-stone-250/30 dark:border-stone-800 last:border-0 pb-1">
            <button
              onClick={() => toggleSection("price")}
              className="w-full flex items-center justify-between py-3 px-1 text-xs font-bold text-foreground hover:text-primary transition-colors cursor-pointer group"
            >
              <span className="font-black uppercase tracking-wider text-[10px] text-muted-foreground/85">Pricing Model</span>
              <ChevronDown className={cn("w-4 h-4 text-muted-foreground/50 transition-transform duration-300", openSections.price ? "rotate-180" : "rotate-0")} />
            </button>
            <div className={cn("overflow-hidden transition-all duration-300 ease-in-out px-1", openSections.price ? "max-h-48 opacity-100 pb-4" : "max-h-0 opacity-0")}>
              <div className="flex flex-col gap-1">
                {[
                  { id: "free", label: "Free Designs", count: templates.filter((t) => !t.isPremium).length },
                  { id: "premium", label: "Premium Designs", count: templates.filter((t) => t.isPremium).length },
                ].map((item) => {
                  const isChecked = selectedPrices.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      className="w-full flex items-center justify-between py-1.5 text-xs rounded-xl"
                    >
                      <label className="flex items-center gap-2.5 cursor-pointer font-bold text-stone-600 dark:text-stone-400 hover:text-foreground select-none w-full">
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedPrices((prev) => [...prev, item.id]);
                            } else {
                              setSelectedPrices((prev) => prev.filter((id) => id !== item.id));
                            }
                          }}
                        />
                        {item.label}
                      </label>
                      <span className="text-[9px] bg-muted/40 px-1.5 py-0.5 rounded-md font-black text-muted-foreground">
                        {item.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Languages Category (Collapsible Accordion) */}
          {languagesList.length > 0 && (
            <div className="border-b border-stone-250/30 dark:border-stone-800 last:border-0 pb-1">
              <button
                onClick={() => toggleSection("language")}
                className="w-full flex items-center justify-between py-3 px-1 text-xs font-bold text-foreground hover:text-primary transition-colors cursor-pointer group"
              >
                <span className="font-black uppercase tracking-wider text-[10px] text-muted-foreground/85">Languages</span>
                <ChevronDown className={cn("w-4 h-4 text-muted-foreground/50 transition-transform duration-300", openSections.language ? "rotate-180" : "rotate-0")} />
              </button>
              <div className={cn("overflow-hidden transition-all duration-300 ease-in-out px-1", openSections.language ? "max-h-72 opacity-100 pb-4" : "max-h-0 opacity-0")}>
                <div className="flex flex-col gap-1 max-h-60 overflow-y-auto pr-1">
                  {languagesList.map((lang) => {
                    const isChecked = selectedLangs.includes(lang);
                    const count = templates.filter((t) => t.language === lang).length;
                    return (
                      <div
                        key={lang}
                        className="w-full flex items-center justify-between py-1.5 text-xs rounded-xl"
                      >
                        <label className="flex items-center gap-2.5 cursor-pointer font-bold text-stone-600 dark:text-stone-400 hover:text-foreground select-none w-full">
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedLangs((prev) => [...prev, lang]);
                              } else {
                                setSelectedLangs((prev) => prev.filter((l) => l !== lang));
                              }
                            }}
                          />
                          {lang}
                        </label>
                        <span className="text-[9px] bg-muted/40 px-1.5 py-0.5 rounded-md font-black text-muted-foreground">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Results Grid */}
        <div className="md:col-span-9 flex flex-col gap-6 w-full text-left">
          
          {/* Header count */}
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-muted-foreground/85">
              Showing {filteredTemplates.length} {filteredTemplates.length === 1 ? "Template" : "Templates"}
            </p>
          </div>

          {/* Grid */}
          {filteredTemplates.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredTemplates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="border border-[#C9A84C]/25 bg-card overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group rounded-none aspect-[1/1.414] relative w-full"
                >
                  {/* Hidden template name for SEO and accessibility */}
                  <h2 className="sr-only">{tpl.name}</h2>

                  {/* Thumbnail Container */}
                  <div className="w-full h-full relative overflow-hidden flex items-center justify-center select-none bg-muted/5 rounded-none">
                    {tpl.thumbnailUrl ? (
                      <Image
                        src={tpl.thumbnailUrl.includes("res.cloudinary.com") && tpl.thumbnailUrl.includes("/image/upload/")
                          ? tpl.thumbnailUrl.replace("/image/upload/", "/image/upload/w_400,h_566,c_fit,f_auto,q_auto/")
                          : tpl.thumbnailUrl
                        }
                        alt={`Matrimonial biodata format ${tpl.name}`}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03] !rounded-none"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
                        <Sparkles className="w-8 h-8 text-[#C9A84C] mb-2 animate-pulse" />
                        <span className="text-xs font-bold">{tpl.name}</span>
                      </div>
                    )}

                    {/* Ribbon tag for Premium/Free */}
                    <span className={cn(
                      "absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-xs z-10 border",
                      tpl.isPremium
                        ? "bg-amber-500/90 text-white border-amber-400"
                        : "bg-emerald-500/90 text-white border-emerald-450"
                    )}>
                      {tpl.isPremium
                        ? `₹${tpl.jpgDiscountPrice ?? tpl.jpgPrice ?? tpl.discountPrice ?? tpl.price ?? 99}`
                        : "Free"}
                    </span>

                    {/* Hover Quick Actions */}
                    <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center p-3">
                      <Button
                        size="sm"
                        className="rounded-full bg-gradient-primary border-0 text-white font-bold text-xs px-5 py-2 shadow-md hover:scale-105 active:scale-95 transition-all"
                        asChild
                      >
                        <Link href={`/edit?template=${tpl.id}`}>
                          Edit Template
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-card/10 border border-dashed border-[#C9A84C]/25 rounded-3xl gap-4">
              <SlidersHorizontal className="w-10 h-10 text-[#C9A84C]/65" />
              <h2 className="text-lg font-bold text-foreground">No templates match filters</h2>
              <p className="text-muted-foreground text-sm max-w-sm text-center">
                Try adjusting your price selections, changing your language filter, or clearing search to discover formats.
              </p>
              <Button
                onClick={handleResetFilters}
                className="rounded-full bg-gradient-primary border-0 font-bold px-6 shadow-md"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
  );
}
