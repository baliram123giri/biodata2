"use client";

import * as React from "react";
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  ArrowUpDown, 
  Upload, 
  Loader2, 
  ArrowLeft 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface HeroSlide {
  id: string;
  title: string;
  imageUrl: string;
  order: number;
  active: boolean;
  createdAt: string;
}

export default function AdminHeroSlides() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "hero-slides"],
    queryFn: async () => {
      const res = await fetch("/api/admin/hero-slides");
      if (!res.ok) throw new Error("Failed to load hero slides");
      const json = await res.json();
      return (json.slides || []) as HeroSlide[];
    },
    staleTime: Infinity, // Cache until page refresh
  });

  const slides = data || [];
  const [isSubmitLoading, setIsSubmitLoading] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  
  // New slide form state
  const [title, setTitle] = React.useState("");
  const [order, setOrder] = React.useState("0");
  const [imageFile, setImageFile] = React.useState<string | null>(null);
  const [fileName, setFileName] = React.useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10MB for high-fidelity images");
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageFile(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      toast.error("Please upload a high-quality template preview image");
      return;
    }

    setIsSubmitLoading(true);
    try {
      const res = await fetch("/api/admin/hero-slides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          imageFile,
          order: parseInt(order) || 0,
        }),
      });

      if (res.ok) {
        toast.success("High-fidelity hero slide created and uploaded successfully!");
        setTitle("");
        setOrder("0");
        setImageFile(null);
        setFileName("");
        setIsDialogOpen(false);
        queryClient.invalidateQueries({ queryKey: ["admin", "hero-slides"] });
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to create slide");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while saving the slide");
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/hero-slides/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentActive }),
      });

      if (res.ok) {
        toast.success(`Slide ${!currentActive ? "activated" : "deactivated"} successfully!`);
        queryClient.invalidateQueries({ queryKey: ["admin", "hero-slides"] });
      } else {
        toast.error("Failed to toggle slide status");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    }
  };

  const handleOrderChange = async (id: string, newOrder: number) => {
    try {
      const res = await fetch(`/api/admin/hero-slides/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: newOrder }),
      });

      if (res.ok) {
        toast.success("Slide sort order updated!");
        queryClient.invalidateQueries({ queryKey: ["admin", "hero-slides"] });
      } else {
        toast.error("Failed to update slide order");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    }
  };

  const handleDeleteSlide = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this hero slide?")) return;

    try {
      const res = await fetch(`/api/admin/hero-slides/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Hero slide deleted successfully!");
        queryClient.invalidateQueries({ queryKey: ["admin", "hero-slides"] });
      } else {
        toast.error("Failed to delete slide");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    }
  };

  return (
    <div className="space-y-6 text-foreground max-w-7xl mx-auto">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            Manage Landing Hero Templates
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Upload and order high-quality Cloudinary preview images to showcase in the homepage hero section.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-lg bg-gradient-primary border-0 font-bold tracking-wide shadow-md hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer">
              <Plus className="w-4 h-4 mr-2" />
              Upload Hero Template
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px] bg-card border border-border rounded-xl shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Upload New Hero Template
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Select a high-resolution exported PNG or JPEG file of the template. This file will be uploaded to Cloudinary in original quality.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateSlide} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="slide-title" className="text-xs font-bold text-muted-foreground">Template Name / Title</Label>
                <Input
                  id="slide-title"
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Royal Gold Premium Frame"
                  className="focus-visible:ring-primary rounded-lg"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="slide-order" className="text-xs font-bold text-muted-foreground">Sort Order Index</Label>
                <Input
                  id="slide-order"
                  type="number"
                  value={order}
                  onChange={e => setOrder(e.target.value)}
                  placeholder="e.g. 1"
                  className="focus-visible:ring-primary rounded-lg"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-muted-foreground">Upload High-Res Template Image *</Label>
                <div className="border-2 border-dashed border-border/80 hover:border-primary/50 transition-colors rounded-xl p-6 text-center cursor-pointer relative group bg-secondary/10">
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleFileChange}
                    required
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-xs font-bold text-foreground">
                      {fileName ? `✓ ${fileName}` : "Click or Drag to Upload Template Image"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Supports PNG, JPG, or JPEG up to 10MB.
                    </p>
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitLoading}
                  className="w-full rounded-lg bg-gradient-primary border-0 font-bold cursor-pointer"
                >
                  {isSubmitLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading to Cloudinary...
                    </>
                  ) : (
                    "Save & Publish Slide"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Grid View */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider">Loading Hero templates list...</span>
        </div>
      ) : slides.length === 0 ? (
        <Card className="border border-border/60 bg-card rounded-2xl shadow-sm text-center py-16">
          <CardContent className="space-y-4">
            <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold">No Hero Slides Configured</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Upload beautiful preview layouts of your best marriage biodata templates to showcase them in a high-fidelity visual display on the home page.
              </p>
            </div>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              variant="outline" 
              className="rounded-lg border-primary/30 hover:bg-primary/5 text-xs font-bold cursor-pointer"
            >
              Add Your First Slide
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {slides.map((slide) => (
            <Card key={slide.id} className="border border-border/80 bg-card rounded-2xl shadow-md overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative">
              {/* Image Preview Container */}
              <div className="relative aspect-[3/4] overflow-hidden bg-muted border-b border-border/60">
                <img
                  src={slide.imageUrl}
                  alt={slide.title || "Hero Template Slide"}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                />
                
                {/* Active/Inactive Ribbon Badge */}
                <div className={`absolute top-3.5 right-3.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase shadow-sm tracking-wider ${
                  slide.active 
                    ? "bg-green-100 text-green-700 dark:bg-green-950/80 dark:text-green-400" 
                    : "bg-muted text-muted-foreground"
                }`}>
                  {slide.active ? "Active" : "Inactive"}
                </div>
              </div>

              {/* Slide Meta & Actions Footer */}
              <CardContent className="p-4.5 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground truncate">{slide.title || "Untitled Hero Slide"}</h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Uploaded {new Date(slide.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="space-y-3 pt-2 border-t border-border/40">
                  {/* Reordering Input */}
                  <div className="flex items-center justify-between gap-2.5">
                    <Label className="text-[10px] font-extrabold text-muted-foreground uppercase flex items-center gap-1 shrink-0">
                      <ArrowUpDown className="w-3.5 h-3.5" /> Order Index:
                    </Label>
                    <input
                      type="number"
                      value={slide.order}
                      onChange={(e) => handleOrderChange(slide.id, parseInt(e.target.value) || 0)}
                      className="w-16 h-8 text-center text-xs font-bold rounded-lg border border-border bg-background focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                  </div>

                  {/* Actions Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(slide.id, slide.active)}
                      className="rounded-lg text-xs h-9 font-bold cursor-pointer"
                    >
                      {slide.active ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5 mr-1.5 text-primary" />
                          Activate
                        </>
                      )}
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteSlide(slide.id)}
                      className="rounded-lg text-xs h-9 font-bold cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
