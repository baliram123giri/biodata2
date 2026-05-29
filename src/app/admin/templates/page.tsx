"use client";

import * as React from "react";
import Link from "next/link";
import { 
  LayoutGrid, 
  Settings, 
  Eye, 
  EyeOff, 
  Plus, 
  Trash2, 
  Edit3, 
  Loader2,
  Crown,
  Tag
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
  frameType: string;
  frameBgColor: string;
  frameUrlTemplate?: string | null;
  thumbnailUrl?: string | null;
  active: boolean;
  createdAt: string;
  language?: string | null;
  isPremium?: boolean | null;
  price?: number | null;
  discountPrice?: number | null;
  currency?: string | null;
}

interface Background {
  id: string;
  name: string;
  url: string;
  createdAt: string;
}

export default function AdminTemplates() {
  const [templates, setTemplates] = React.useState<Template[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<"templates" | "backgrounds">("templates");
  const [backgrounds, setBackgrounds] = React.useState<Background[]>([]);
  const [isBgLoading, setIsBgLoading] = React.useState(false);
  const [newBgName, setNewBgName] = React.useState("");
  const [newBgFile, setNewBgFile] = React.useState<string | null>(null);
  const [isUploadingBg, setIsUploadingBg] = React.useState(false);

  // Fetch templates from API
  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/templates");
      const data = await res.json();
      if (res.ok) {
        setTemplates(data.templates || []);
      } else {
        toast.error(data.error || "Failed to load templates");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while fetching templates");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBackgrounds = async () => {
    setIsBgLoading(true);
    try {
      const res = await fetch("/api/admin/backgrounds");
      const data = await res.json();
      if (res.ok) {
        setBackgrounds(data.backgrounds || []);
      } else {
        toast.error(data.error || "Failed to load background SVGs");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred fetching background SVGs");
    } finally {
      setIsBgLoading(false);
    }
  };

  React.useEffect(() => {
    fetchTemplates();
  }, []);

  React.useEffect(() => {
    if (activeTab === "backgrounds") {
      fetchBackgrounds();
    }
  }, [activeTab]);

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/templates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Template ${!currentStatus ? "enabled" : "disabled"} successfully`);
        setTemplates(templates.map(t => t.id === id ? { ...t, active: !currentStatus } : t));
      } else {
        toast.error(data.error || "Failed to update template status");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while updating template");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template? This action cannot be undone.")) return;

    try {
      const res = await fetch(`/api/admin/templates/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Template deleted successfully");
        setTemplates(templates.filter(t => t.id !== id));
      } else {
        toast.error(data.error || "Failed to delete template");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while deleting template");
    }
  };

  const handleBgFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewBgFile(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadBg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBgName || !newBgFile) {
      toast.error("Please fill in a name and select an SVG file");
      return;
    }
    setIsUploadingBg(true);
    try {
      const res = await fetch("/api/admin/backgrounds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newBgName, file: newBgFile }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Background SVG uploaded successfully!");
        setNewBgName("");
        setNewBgFile(null);
        const fileInput = document.getElementById("bg-file-input") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        fetchBackgrounds();
      } else {
        toast.error(data.error || "Failed to upload background");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred uploading the background");
    } finally {
      setIsUploadingBg(false);
    }
  };

  const handleDeleteBg = async (id: string) => {
    if (!confirm("Are you sure you want to delete this background SVG? Templates using this background will lose their watermark image.")) return;
    try {
      const res = await fetch(`/api/admin/backgrounds/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Background deleted successfully!");
        setBackgrounds(backgrounds.filter(bg => bg.id !== id));
      } else {
        toast.error(data.error || "Failed to delete background");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred deleting background");
    }
  };

  return (
    <div className="space-y-6 text-foreground">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <LayoutGrid className="w-8 h-8 text-primary" />
            Templates Config
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Create, edit, toggle visibility, and configure custom layout skins for matrimonial biodata.
          </p>
        </div>
        
        {activeTab === "templates" && (
          <Button 
            asChild
            className="bg-primary hover:opacity-90 text-primary-foreground font-bold text-xs gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Link href="/admin/templates/create">
              <Plus className="w-4 h-4" />
              <span>Add Custom Template</span>
            </Link>
          </Button>
        )}
      </div>

      {/* Tabs Switcher */}
      <div className="flex gap-2 border-b border-border pb-px">
        <button
          onClick={() => setActiveTab("templates")}
          className={cn(
            "px-4 py-2 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer outline-none",
            activeTab === "templates" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Templates
        </button>
        <button
          onClick={() => setActiveTab("backgrounds")}
          className={cn(
            "px-4 py-2 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer outline-none",
            activeTab === "backgrounds" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Background Watermarks
        </button>
      </div>

      {activeTab === "templates" ? (
        isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground font-semibold">Loading templates...</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="border border-dashed border-border rounded-xl p-12 text-center space-y-4">
            <p className="text-muted-foreground font-medium">No custom templates found. Click "Add Custom Template" to get started.</p>
            <Button asChild size="sm">
              <Link href="/admin/templates/create">Create First Template</Link>
            </Button>
          </div>
        ) : (
          /* Templates grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((temp) => (
              <Card key={temp.id} className="bg-card border border-border rounded-xl overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                
                {/* Header info / mock skin preview */}
                <div className="p-5 flex-1 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-base text-foreground leading-snug">{temp.name}</h3>
                      <span className="text-[9px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded mt-1 block w-max">
                        ID: {temp.id.slice(0, 8)}...
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-secondary/15 text-primary border-primary/20 capitalize">
                        {temp.frameType} Frame
                      </span>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded border bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30">
                        {temp.language || "English"}
                      </span>
                      {/* Pricing Badge */}
                      {temp.isPremium ? (
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full border bg-gradient-to-r from-amber-400/20 to-yellow-400/20 text-amber-700 border-amber-300/50 dark:text-amber-300 dark:border-amber-700/50 flex items-center gap-1">
                          <Crown className="w-2.5 h-2.5" />
                          {temp.discountPrice
                            ? `${temp.currency === "USD" ? "$" : temp.currency === "EUR" ? "€" : temp.currency === "GBP" ? "£" : "₹"}${temp.discountPrice}`
                            : temp.price
                            ? `${temp.currency === "USD" ? "$" : temp.currency === "EUR" ? "€" : temp.currency === "GBP" ? "£" : "₹"}${temp.price}`
                            : "Premium"}
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30">
                          FREE
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Mock design or Thumbnail representation */}
                  <div className="w-full h-44 rounded-lg bg-muted/30 border border-border/50 flex items-center justify-center relative overflow-hidden group p-2.5">
                    {temp.thumbnailUrl ? (
                      <img 
                        src={temp.thumbnailUrl.includes("res.cloudinary.com") && temp.thumbnailUrl.includes("/image/upload/")
                          ? temp.thumbnailUrl.replace("/image/upload/", "/image/upload/w_300,h_424,c_fit,q_100/")
                          : temp.thumbnailUrl
                        } 
                        alt={temp.name} 
                        className="h-full w-auto object-contain rounded-md shadow-md border border-border bg-white transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div 
                        className="w-24 h-36 rounded shadow-lg flex flex-col justify-between p-2.5 text-[5px] border"
                        style={{ 
                          backgroundColor: temp.frameBgColor || "#ffffff",
                          borderColor: temp.defaultPrimary 
                        }}
                      >
                        <div className="border-b pb-1 font-bold text-center" style={{ color: temp.defaultPrimary, borderColor: `${temp.defaultPrimary}30` }}>
                          BIODATA
                        </div>
                        <div className="space-y-1.5 py-1">
                          <div className="h-1.5 w-12 rounded" style={{ backgroundColor: temp.defaultPrimary }} />
                          <div className="h-1 w-14 rounded opacity-40" style={{ backgroundColor: temp.defaultSecondary }} />
                          <div className="h-1 w-10 rounded opacity-40" style={{ backgroundColor: temp.defaultSecondary }} />
                        </div>
                        <div className="h-2 w-full rounded flex items-center justify-center text-[5px] font-bold" style={{ backgroundColor: temp.defaultAccent, color: temp.defaultPrimary }}>
                          ❤
                        </div>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-background/90 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity duration-200">
                      <Button 
                        asChild
                        variant="ghost" 
                        size="sm" 
                        className="h-8 text-[11px] font-bold text-foreground hover:bg-muted cursor-pointer"
                      >
                        <Link href={`/admin/templates/${temp.id}/edit`}>
                          <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit Config
                        </Link>
                      </Button>
                    </div>
                  </div>

                  {temp.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 italic">
                      {temp.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full border border-border shrink-0" style={{ backgroundColor: temp.defaultPrimary }} />
                      <span>Primary</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full border border-border shrink-0" style={{ backgroundColor: temp.defaultSecondary }} />
                      <span>Secondary</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full border border-border shrink-0" style={{ backgroundColor: temp.defaultAccent }} />
                      <span>Accent</span>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="p-4 border-t border-border bg-muted/30 flex gap-2">
                  <Button 
                    onClick={() => toggleStatus(temp.id, temp.active)}
                    variant="ghost" 
                    className={cn(
                      "flex-1 text-xs font-bold gap-1.5 cursor-pointer h-9 rounded-lg",
                      temp.active 
                        ? "text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    {temp.active ? (
                      <>
                        <Eye className="w-4 h-4" />
                        <span>Enabled</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-4 h-4" />
                        <span>Disabled</span>
                      </>
                    )}
                  </Button>

                  <Button 
                    asChild
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer rounded-lg"
                    title="Edit Template"
                  >
                    <Link href={`/admin/templates/${temp.id}/edit`}>
                      <Settings className="w-4 h-4" />
                    </Link>
                  </Button>

                  <Button 
                    onClick={() => handleDelete(temp.id)}
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer rounded-lg"
                    title="Delete Template"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

              </Card>
            ))}
          </div>
        )
      ) : (
        /* Background SVGs Manager */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Upload panel */}
          <div className="lg:col-span-1">
            <Card className="p-5 bg-card border border-border rounded-xl space-y-4">
              <div>
                <h3 className="font-bold text-sm text-foreground">Upload SVG Watermark</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">Add vector graphics to reuse as background layers.</p>
              </div>

              <form onSubmit={handleUploadBg} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Background Name</label>
                  <input
                    type="text"
                    required
                    value={newBgName}
                    onChange={(e) => setNewBgName(e.target.value)}
                    placeholder="e.g. Floral Mandala"
                    className="w-full text-xs bg-background border border-border rounded-lg h-9 px-3 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">SVG File</label>
                  <input
                    id="bg-file-input"
                    type="file"
                    required
                    accept="image/svg+xml"
                    onChange={handleBgFileChange}
                    className="w-full text-xs text-muted-foreground cursor-pointer file:cursor-pointer file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-primary file:text-primary-foreground hover:file:opacity-90 border border-border rounded-lg p-2 bg-background"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isUploadingBg}
                  className="w-full text-xs font-bold h-9 rounded-lg bg-primary hover:opacity-95 text-primary-foreground flex justify-center items-center gap-1.5 cursor-pointer"
                >
                  {isUploadingBg ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Upload Watermark</span>
                    </>
                  )}
                </Button>
              </form>
            </Card>
          </div>

          {/* Backgrounds Listing grid */}
          <div className="lg:col-span-3">
            {isBgLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground font-semibold">Loading backgrounds...</p>
              </div>
            ) : backgrounds.length === 0 ? (
              <div className="border border-dashed border-border rounded-xl p-12 text-center text-muted-foreground font-medium text-sm">
                No background watermarks uploaded yet. Use the upload panel to add your first SVG vector!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {backgrounds.map((bg) => (
                  <Card key={bg.id} className="bg-card border border-border rounded-xl overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-foreground truncate">{bg.name}</h4>
                        <span className="text-[8px] text-muted-foreground font-mono truncate block mt-0.5">
                          Added: {new Date(bg.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* SVG Watermark Render Box */}
                      <div className="w-full h-32 rounded-lg bg-muted/40 border border-border/50 flex items-center justify-center relative overflow-hidden p-2 group bg-white">
                        <img
                          src={bg.url}
                          alt={bg.name}
                          className="h-full w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                          style={{ opacity: 0.8 }}
                        />
                      </div>
                    </div>

                    <div className="p-2 border-t border-border bg-muted/20 flex gap-2">
                      <Button
                        onClick={() => {
                          navigator.clipboard.writeText(bg.url);
                          toast.success("Background SVG URL copied to clipboard!");
                        }}
                        variant="ghost"
                        className="flex-1 text-[10px] font-bold h-8 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        Copy URL
                      </Button>
                      <Button
                        onClick={() => handleDeleteBg(bg.id)}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer rounded-lg"
                        title="Delete Watermark"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
