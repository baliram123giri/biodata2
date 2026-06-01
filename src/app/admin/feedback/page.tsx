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
  ThumbsUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { cn, getInitials } from "@/lib/utils";
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
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin", "feedback"],
    queryFn: async () => {
      const res = await fetch("/api/admin/feedback");
      if (!res.ok) throw new Error("Failed to load feedback");
      const json = await res.json();
      return (json.feedback || []) as FeedbackItem[];
    },
    staleTime: 0,
  });

  const feedbackList = data || [];
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

  // Statistics calculations
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
            {new Date(dateStr).toLocaleDateString(undefined, { 
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
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
          <Smile className="w-8 h-8 text-primary" />
          Reviews & Feedback
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Monitor user ratings, satisfaction scores, and detailed comments submitted during the download process.
        </p>
      </div>

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
            className="text-[10px] font-extrabold uppercase text-primary hover:opacity-85 border border-primary/20 bg-primary/5 px-2.5 py-1 rounded transition-colors"
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
