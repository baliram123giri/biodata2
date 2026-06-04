"use client";

import * as React from "react";
import { useState } from "react";
import { 
  Smile, 
  Star, 
  Trash2, 
  Loader2, 
  MessageSquare, 
  Calendar, 
  TrendingUp, 
  Heart,
  Globe,
  Settings,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn, getInitials, formatISTDateTime } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef
} from "@tanstack/react-table";
import { motion, AnimatePresence } from "framer-motion";

interface FeedbackItem {
  id: string;
  name: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export default function FeedbackAdminPage() {
  const queryClient = useQueryClient();
  
  // ── Query for customer feedback ──
  const { data: feedbackData, isLoading, refetch } = useQuery({
    queryKey: ["admin", "feedback"],
    queryFn: async () => {
      const res = await fetch("/api/admin/feedback");
      if (!res.ok) throw new Error("Failed to load feedback");
      const json = await res.json();
      return (json.feedback || []) as FeedbackItem[];
    },
    staleTime: 0,
  });

  const feedbackList = feedbackData || [];
  const [rowSelection, setRowSelection] = useState({});
  const [confirmDeleteState, setConfirmDeleteState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  // Reset rowSelection when data count changes
  React.useEffect(() => {
    setRowSelection({});
  }, [feedbackList.length]);

  const selectedIds = React.useMemo(() => {
    return Object.keys(rowSelection).map(indexStr => {
      const idx = parseInt(indexStr, 10);
      return feedbackList[idx]?.id;
    }).filter(Boolean);
  }, [rowSelection, feedbackList]);

  // Statistics calculations for customer feedback
  const stats = React.useMemo(() => {
    if (feedbackList.length === 0) {
      return {
        total: 0,
        average: 0,
        positivePercentage: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      };
    }

    const total = feedbackList.length;
    let sum = 0;
    let positiveCount = 0;
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    feedbackList.forEach(item => {
      sum += item.rating;
      if (item.rating >= 4) positiveCount++;
      const ratingKey = Math.min(5, Math.max(1, item.rating)) as 1 | 2 | 3 | 4 | 5;
      distribution[ratingKey]++;
    });

    return {
      total,
      average: parseFloat((sum / total).toFixed(1)),
      positivePercentage: Math.round((positiveCount / total) * 100),
      distribution
    };
  }, [feedbackList]);

  // ── Query for Review Platform Settings ──
  const { data: settingsData, isLoading: isLoadingSettings, refetch: refetchSettings } = useQuery({
    queryKey: ["admin", "reviewSettings"],
    queryFn: async () => {
      const res = await fetch("/api/admin/review-settings");
      if (!res.ok) throw new Error("Failed to load review settings");
      const json = await res.json();
      return json.settings;
    }
  });

  // Settings form states
  const [googleEnabled, setGoogleEnabled] = useState(true);
  const [googleRating, setGoogleRating] = useState("4.9");
  const [googleCount, setGoogleCount] = useState("524");
  const [googleUrl, setGoogleUrl] = useState("https://share.google/T4eEjxMJkqDKaFWGN");
  const [trustpilotEnabled, setTrustpilotEnabled] = useState(true);
  const [trustpilotRating, setTrustpilotRating] = useState("4.8");
  const [trustpilotCount, setTrustpilotCount] = useState("320");
  const [trustpilotUrl, setTrustpilotUrl] = useState("https://www.trustpilot.com/review/biodata99.com");
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (settingsData) {
      setGoogleEnabled(settingsData.googleEnabled ?? true);
      setGoogleRating(String(settingsData.googleRating ?? "4.9"));
      setGoogleCount(String(settingsData.googleCount ?? "524"));
      setGoogleUrl(settingsData.googleUrl ?? "https://share.google/T4eEjxMJkqDKaFWGN");
      setTrustpilotEnabled(settingsData.trustpilotEnabled ?? true);
      setTrustpilotRating(String(settingsData.trustpilotRating ?? "4.8"));
      setTrustpilotCount(String(settingsData.trustpilotCount ?? "320"));
      setTrustpilotUrl(settingsData.trustpilotUrl ?? "https://www.trustpilot.com/review/biodata99.com");
    }
  }, [settingsData]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const loadingToast = toast.loading("Updating review settings...");

    try {
      const res = await fetch("/api/admin/review-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          googleEnabled,
          googleRating,
          googleCount,
          googleUrl,
          trustpilotEnabled,
          trustpilotRating,
          trustpilotCount,
          trustpilotUrl,
        }),
      });

      if (res.ok) {
        toast.success("Review settings updated successfully!", { id: loadingToast });
        refetchSettings();
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Failed to update review settings", { id: loadingToast });
      }
    } catch (err) {
      console.error(err);
      toast.error("Network communication error", { id: loadingToast });
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to render gold/green preview stars
  const renderStars = (rating: number, activeColor: string, inactiveColor: string) => {
    return Array.from({ length: 5 }, (_, i) => {
      const diff = rating - i;
      
      // Full star threshold (>= 0.75)
      if (diff >= 0.75) {
        return (
          <Star
            key={i}
            className={cn("w-3.5 h-3.5", activeColor)}
          />
        );
      }
      
      // Half star threshold (>= 0.25 and < 0.75)
      if (diff >= 0.25) {
        return (
          <div key={i} className="relative w-3.5 h-3.5 shrink-0 select-none">
            {/* Background outline star */}
            <Star className={cn("absolute inset-0 w-3.5 h-3.5 fill-transparent", inactiveColor)} />
            {/* Overlay filled left-half star */}
            <Star 
              className={cn("absolute inset-0 w-3.5 h-3.5", activeColor)}
              style={{ clipPath: "polygon(0 0, 50% 0, 50% 100%, 0 100%)" }}
            />
          </div>
        );
      }
      
      // Empty star
      return (
        <Star
          key={i}
          className={cn("w-3.5 h-3.5 fill-transparent", inactiveColor)}
        />
      );
    });
  };

  // TanStack Table Column Definitions
  const columns = React.useMemo<ColumnDef<FeedbackItem>[]>(() => [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center p-1">
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center p-1">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Customer",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 border border-primary/20">
              {getInitials(item.name, "CU")}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-foreground text-xs sm:text-sm truncate">
                {item.name}
              </span>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: "rating",
      header: "Rating",
      cell: ({ row }) => {
        const rating = row.original.rating;
        return (
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                className={cn(
                  "w-3.5 h-3.5",
                  star <= rating 
                    ? "text-amber-500 fill-amber-500" 
                    : "text-muted-foreground/30 dark:text-muted-foreground/20"
                )} 
              />
            ))}
          </div>
        );
      }
    },
    {
      accessorKey: "comment",
      header: "Comment / Feedback",
      cell: ({ row }) => {
        const comment = row.original.comment;
        return comment ? (
          <span className="text-foreground/90 font-medium block whitespace-pre-wrap max-w-sm sm:max-w-md break-words pr-2">
            {comment}
          </span>
        ) : (
          <span className="text-muted-foreground/45 italic font-medium">No written comment provided</span>
        );
      }
    },
    {
      accessorKey: "createdAt",
      header: "Submitted At",
      cell: ({ row }) => {
        const dateStr = row.original.createdAt;
        return (
          <span className="flex items-center gap-1.5 text-muted-foreground/80 font-semibold">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
            {formatISTDateTime(dateStr, { 
              month: "short", 
              day: "numeric", 
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            })}
          </span>
        );
      }
    },
    {
      id: "actions",
      header: () => <div className="text-right pr-4">Actions</div>,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center justify-end gap-2.5 pr-2">
            <button
              onClick={() => {
                setConfirmDeleteState({
                  isOpen: true,
                  title: "Delete Feedback Item",
                  description: `Are you sure you want to permanently delete the feedback review from "${item.name}"? This action cannot be undone.`,
                  onConfirm: async () => {
                    const loadingToast = toast.loading("Purging feedback review...");
                    try {
                      const res = await fetch(`/api/admin/feedback`, {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: item.id }),
                      });
                      if (res.ok) {
                        toast.success("Feedback successfully deleted", { id: loadingToast });
                        queryClient.invalidateQueries({ queryKey: ["admin", "feedback"] });
                        refetch();
                      } else {
                        const data = await res.json();
                        toast.error(data.error || "Failed to delete feedback", { id: loadingToast });
                      }
                    } catch (err) {
                      console.error(err);
                      toast.error("Error deleting feedback", { id: loadingToast });
                    }
                  }
                });
              }}
              title="Delete Review"
              className="p-1.5 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 rounded border border-transparent transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      }
    }
  ], [feedbackList]);

  const table = useReactTable({
    data: feedbackList,
    columns,
    state: {
      rowSelection,
    },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row, index) => String(index),
  });

  return (
    <div className="space-y-6 text-foreground w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <Smile className="w-8 h-8 text-primary" />
            Reviews & Feedback
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Monitor user ratings, satisfaction scores, and configure platform review statistics.
          </p>
        </div>
      </div>

      <Tabs defaultValue="feedback" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="feedback" className="cursor-pointer">Customer Feedback</TabsTrigger>
          <TabsTrigger value="settings" className="cursor-pointer">Platform Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="feedback" className="space-y-6">
          {/* KPI Stats Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total & Average score card */}
            <Card className="p-6 bg-card border border-border rounded-xl shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Satisfaction Score</span>
                <TrendingUp className="w-4.5 h-4.5 text-emerald-500" />
              </div>
              <div className="flex items-baseline gap-3 my-4">
                <span className="text-4xl sm:text-5xl font-black text-foreground">{stats.average}</span>
                <div className="flex flex-col">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={cn(
                          "w-3.5 h-3.5",
                          star <= Math.round(stats.average) 
                            ? "text-amber-500 fill-amber-500" 
                            : "text-muted-foreground/30"
                        )} 
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-muted-foreground font-semibold mt-1">out of 5.0 stars</span>
                </div>
              </div>
              <div className="text-xs font-semibold text-muted-foreground">
                Based on <span className="text-foreground font-black">{stats.total}</span> total customer ratings.
              </div>
            </Card>

            {/* Sentiment Score card */}
            <Card className="p-6 bg-card border border-border rounded-xl shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Positive Sentiment</span>
                <Heart className="w-4.5 h-4.5 text-rose-500 fill-rose-500/25" />
              </div>
              <div className="my-4">
                <span className="text-4xl sm:text-5xl font-black text-foreground">{stats.positivePercentage}%</span>
                <span className="text-[10px] text-muted-foreground font-bold block mt-1">4.0+ Star ratings ratio</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-500" 
                  style={{ width: `${stats.positivePercentage}%` }} 
                />
              </div>
            </Card>

            {/* Detailed Breakdown progress card */}
            <Card className="p-5 bg-card border border-border rounded-xl shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-3 block">Rating Distribution</span>
              <div className="space-y-1.5">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = stats.distribution[rating as 1 | 2 | 3 | 4 | 5];
                  const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                  return (
                    <div key={rating} className="flex items-center gap-2 text-[10px] sm:text-xs">
                      <span className="w-3 font-bold text-muted-foreground shrink-0">{rating}★</span>
                      <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="h-full bg-amber-500 rounded-full" 
                          style={{ width: `${pct}%` }} 
                        />
                      </div>
                      <span className="w-7 text-right font-semibold text-muted-foreground shrink-0">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Floating Bulk Action bar */}
          <AnimatePresence>
            {selectedIds.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 overflow-hidden text-xs"
              >
                <div className="flex items-center gap-2 font-bold text-foreground">
                  <span className="bg-primary text-white px-2 py-0.5 rounded-full text-[10px] font-black animate-pulse">
                    {selectedIds.length}
                  </span>
                  <span>Selected feedback items</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => {
                      setConfirmDeleteState({
                        isOpen: true,
                        title: `Purge ${selectedIds.length} Reviews`,
                        description: `Are you sure you want to permanently delete these ${selectedIds.length} feedback items? This action cannot be undone.`,
                        onConfirm: async () => {
                          const loadingToast = toast.loading(`Deleting ${selectedIds.length} feedback reviews...`);
                          try {
                            const res = await fetch("/api/admin/feedback", {
                              method: "DELETE",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ ids: selectedIds }),
                            });
                            if (res.ok) {
                              toast.success(`Successfully deleted ${selectedIds.length} items`, { id: loadingToast });
                              setRowSelection({});
                              queryClient.invalidateQueries({ queryKey: ["admin", "feedback"] });
                              refetch();
                            } else {
                              const data = await res.json();
                              toast.error(data.error || "Failed to delete feedback reviews", { id: loadingToast });
                            }
                          } catch (error) {
                            toast.error("Network communication error", { id: loadingToast });
                          }
                        }
                      });
                    }}
                    className="h-8 px-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg flex items-center gap-1.5 transition-all text-[11px] cursor-pointer uppercase tracking-wider border border-transparent dark:border-white/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Purge Selected</span>
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Feedback List Container */}
          <Card className="bg-card border border-border rounded-xl overflow-hidden shadow-sm w-full">
            <div className="p-5 border-b border-border bg-muted/20 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">All Customer Feedback</h3>
                <p className="text-xs text-muted-foreground mt-0.5">List of all feedback entries sorted by recency.</p>
              </div>
              <button
                onClick={() => refetch()}
                className="text-[10px] font-extrabold uppercase text-primary hover:opacity-85 border border-primary/20 bg-primary/5 px-2.5 py-1 rounded transition-colors cursor-pointer"
              >
                Refresh
              </button>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse text-xs table-fixed min-w-[800px]">
                <thead>
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id} className="border-b border-border bg-muted/25 text-muted-foreground font-bold uppercase tracking-wider">
                      {headerGroup.headers.map(header => {
                        let widthStyle = "";
                        if (header.id === "select") widthStyle = "w-[60px]";
                        else if (header.id === "name") widthStyle = "w-[200px]";
                        else if (header.id === "rating") widthStyle = "w-[120px]";
                        else if (header.id === "comment") widthStyle = "w-[300px]";
                        else if (header.id === "createdAt") widthStyle = "w-[180px]";
                        else if (header.id === "actions") widthStyle = "w-[100px]";

                        return (
                          <th 
                            key={header.id} 
                            className={cn(
                              "sticky top-0 z-10 bg-muted/95 backdrop-blur-xs p-4 align-middle font-bold text-left", 
                              widthStyle
                            )}
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </th>
                        );
                      })}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-border/30 text-foreground/90">
                  {isLoading ? (
                    <tr>
                      <td colSpan={columns.length} className="p-12 text-center text-muted-foreground font-semibold">
                        <Loader2 className="w-6 h-6 animate-spin text-primary inline mr-2" />
                        Loading feedback entries...
                      </td>
                    </tr>
                  ) : table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map(row => (
                      <tr key={row.id} className="hover:bg-muted/10 transition-colors">
                        {row.getVisibleCells().map(cell => (
                          <td key={cell.id} className="p-4 align-middle">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={columns.length} className="p-8 text-center text-muted-foreground italic">
                        No customer feedback records found in the database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Google Reviews Card */}
              <Card className="p-6 bg-card border border-border rounded-xl shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                      <Star className="w-5 h-5 fill-amber-500/25" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-foreground truncate">Google Reviews</h3>
                      <p className="text-xs text-muted-foreground truncate">Configure Google ratings & settings.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Label htmlFor="google-enabled" className="text-xs font-bold text-muted-foreground cursor-pointer">
                      {googleEnabled ? "Enabled" : "Disabled"}
                    </Label>
                    <Switch
                      id="google-enabled"
                      checked={googleEnabled}
                      onCheckedChange={setGoogleEnabled}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="google-rating" className="text-xs font-semibold text-muted-foreground">
                        Average Rating
                      </Label>
                      <Input
                        id="google-rating"
                        type="number"
                        step="0.1"
                        min="1"
                        max="5"
                        required
                        value={googleRating}
                        onChange={(e) => setGoogleRating(e.target.value)}
                        placeholder="e.g. 4.9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="google-count" className="text-xs font-semibold text-muted-foreground">
                        Reviews Count
                      </Label>
                      <Input
                        id="google-count"
                        type="number"
                        min="0"
                        required
                        value={googleCount}
                        onChange={(e) => setGoogleCount(e.target.value)}
                        placeholder="e.g. 524"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="google-url" className="text-xs font-semibold text-muted-foreground">
                      Redirect URL
                    </Label>
                    <Input
                      id="google-url"
                      type="url"
                      required
                      value={googleUrl}
                      onChange={(e) => setGoogleUrl(e.target.value)}
                      placeholder="https://share.google/..."
                    />
                  </div>
                </div>
              </Card>

              {/* Trustpilot Reviews Card */}
              <Card className="p-6 bg-card border border-border rounded-xl shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-foreground truncate">Trustpilot Reviews</h3>
                      <p className="text-xs text-muted-foreground truncate">Configure Trustpilot ratings & settings.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Label htmlFor="trustpilot-enabled" className="text-xs font-bold text-muted-foreground cursor-pointer">
                      {trustpilotEnabled ? "Enabled" : "Disabled"}
                    </Label>
                    <Switch
                      id="trustpilot-enabled"
                      checked={trustpilotEnabled}
                      onCheckedChange={setTrustpilotEnabled}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="trustpilot-rating" className="text-xs font-semibold text-muted-foreground">
                        Average Rating
                      </Label>
                      <Input
                        id="trustpilot-rating"
                        type="number"
                        step="0.1"
                        min="1"
                        max="5"
                        required
                        value={trustpilotRating}
                        onChange={(e) => setTrustpilotRating(e.target.value)}
                        placeholder="e.g. 4.8"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="trustpilot-count" className="text-xs font-semibold text-muted-foreground">
                        Reviews Count
                      </Label>
                      <Input
                        id="trustpilot-count"
                        type="number"
                        min="0"
                        required
                        value={trustpilotCount}
                        onChange={(e) => setTrustpilotCount(e.target.value)}
                        placeholder="e.g. 320"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="trustpilot-url" className="text-xs font-semibold text-muted-foreground">
                      Redirect URL
                    </Label>
                    <Input
                      id="trustpilot-url"
                      type="url"
                      required
                      value={trustpilotUrl}
                      onChange={(e) => setTrustpilotUrl(e.target.value)}
                      placeholder="https://www.trustpilot.com/review/..."
                    />
                  </div>
                </div>
              </Card>
            </div>

            {/* Visual Preview Section */}
            <Card className="p-6 bg-slate-900 border border-slate-800 rounded-xl shadow-inner space-y-4 text-white">
              <div>
                <h3 className="text-sm font-bold text-slate-200">Live Preview</h3>
                <p className="text-xs text-slate-400">This is how the reviews badges look on the platform footer.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950 p-6 rounded-xl border border-slate-800/60 min-h-[140px]">
                {/* Google Badge Preview */}
                <div className={cn("flex flex-col gap-2 w-fit relative transition-opacity duration-200", !googleEnabled && "opacity-25")}>
                  {!googleEnabled && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 z-10 rounded-lg">
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded border border-rose-500/20">Disabled</span>
                    </div>
                  )}
                  <span className="text-[11px] font-semibold text-slate-400 tracking-wide">
                    Trusted by Indian families
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {renderStars(parseFloat(googleRating || "0"), "text-amber-400 fill-amber-400", "text-slate-700")}
                    </div>
                    <span className="text-xs font-bold text-slate-200">
                      {googleRating} <span className="text-slate-400 font-normal">· {googleCount}+ reviews</span>
                    </span>
                  </div>
                  <a
                    href={googleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 px-3 py-2 rounded-xl border border-white/8 bg-white/3 hover:bg-white/6 text-slate-200 hover:text-white text-xs font-bold transition-all duration-200 w-fit pointer-events-none mt-1"
                  >
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3.01A11.916 11.916 0 0 0 12 0C7.309 0 3.268 2.56 1.155 6.368l4.11 3.397z" />
                      <path fill="#34A853" d="M16.04 15.345c-1.077.733-2.433 1.164-4.04 1.164-2.955 0-5.467-1.99-6.36-4.673L1.517 15.22A11.969 11.969 0 0 0 12 24c3.3 0 6.073-1.091 8.09-2.964l-4.05-3.691z" />
                      <path fill="#4285F4" d="M23.49 12.273c0-.818-.073-1.609-.209-2.373H12v4.582h6.455c-.278 1.482-1.118 2.736-2.373 3.582l4.05 3.691c2.372-2.19 3.736-5.418 3.736-9.482z" />
                      <path fill="#FBBC05" d="M5.64 11.836A7.16 7.16 0 0 1 5.64 9.773L1.53 6.376A11.933 11.933 0 0 0 0 12c0 2.01.5 3.91 1.382 5.59l4.258-3.754z" />
                    </svg>
                    <span>See Google reviews</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </div>

                {/* Trustpilot Badge Preview */}
                <div className={cn("flex flex-col gap-2 w-fit relative transition-opacity duration-200", !trustpilotEnabled && "opacity-25")}>
                  {!trustpilotEnabled && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 z-10 rounded-lg">
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded border border-rose-500/20">Disabled</span>
                    </div>
                  )}
                  <span className="text-[11px] font-semibold text-slate-400 tracking-wide">
                    Rated Excellent on Trustpilot
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {renderStars(parseFloat(trustpilotRating || "0"), "text-emerald-400 fill-emerald-400", "text-slate-700")}
                    </div>
                    <span className="text-xs font-bold text-slate-200">
                      {trustpilotRating} <span className="text-slate-400 font-normal">· {trustpilotCount}+ reviews</span>
                    </span>
                  </div>
                  <a
                    href={trustpilotUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 px-3 py-2 rounded-xl border border-white/8 bg-white/3 hover:bg-white/6 text-slate-200 hover:text-white text-xs font-bold transition-all duration-200 w-fit pointer-events-none mt-1"
                  >
                    <svg className="w-3.5 h-3.5 shrink-0 fill-emerald-400" viewBox="0 0 24 24">
                      <path d="M24 9.624H14.83L12 1l-2.83 8.624H0l7.41 5.378L4.58 23L12 17.624L19.42 23l-2.83-8.998z" />
                    </svg>
                    <span>See Trustpilot reviews</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </div>
              </div>
            </Card>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="submit"
                disabled={isSaving || isLoadingSettings}
                className="h-10 px-6 font-bold uppercase tracking-wider text-xs rounded-lg cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                    Saving...
                  </>
                ) : (
                  "Save Platform Settings"
                )}
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog for deletions */}
      <ConfirmationDialog
        isOpen={confirmDeleteState.isOpen}
        onOpenChange={(isOpen) => setConfirmDeleteState((prev) => ({ ...prev, isOpen }))}
        title={confirmDeleteState.title}
        description={confirmDeleteState.description}
        confirmText="Confirm Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteState.onConfirm}
        variant="danger"
      />
    </div>
  );
}
