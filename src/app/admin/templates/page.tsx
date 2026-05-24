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
  Loader2
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
}

export default function AdminTemplates() {
  const [templates, setTemplates] = React.useState<Template[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

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

  React.useEffect(() => {
    fetchTemplates();
  }, []);

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
        
        <Button 
          asChild
          className="bg-primary hover:opacity-90 text-primary-foreground font-bold text-xs gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Link href="/admin/templates/create">
            <Plus className="w-4 h-4" />
            <span>Add Custom Template</span>
          </Link>
        </Button>
      </div>

      {isLoading ? (
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
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-secondary/15 text-primary border-primary/20 capitalize">
                    {temp.frameType} Frame
                  </span>
                </div>

                {/* Mock design or Thumbnail representation */}
                <div className="w-full h-44 rounded-lg bg-muted/30 border border-border/50 flex items-center justify-center relative overflow-hidden group p-2.5">
                  {temp.thumbnailUrl ? (
                    <img 
                      src={temp.thumbnailUrl} 
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
      )}
    </div>
  );
}
