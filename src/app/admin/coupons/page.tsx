"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { 
  Tag, 
  Plus, 
  Trash2, 
  Calendar, 
  Percent, 
  Loader2, 
  Info,
  Sparkles,
  Ticket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogDescription,
  DialogHeader,
  DialogFooter
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn, formatISTDate } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef
} from "@tanstack/react-table";
import { motion, AnimatePresence } from "framer-motion";

interface Coupon {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  active: boolean;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  createdAt: string;
}

export default function CouponsAdminPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin", "coupons"],
    queryFn: async () => {
      const res = await fetch("/api/admin/coupons");
      if (!res.ok) throw new Error("Failed to load coupons");
      const json = await res.json();
      return (json.coupons || []) as Coupon[];
    },
    staleTime: 0, // Instant refetch
  });

  const coupons = data || [];
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [active, setActive] = useState(true);
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Row selection & confirmation box state
  const [rowSelection, setRowSelection] = useState({});
  const [confirmDeleteState, setConfirmDeleteState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    onConfirm: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  // Reset rowSelection when coupons count changes
  React.useEffect(() => {
    setRowSelection({});
  }, [coupons.length]);

  const selectedIds = React.useMemo(() => {
    return Object.keys(rowSelection).map(indexStr => {
      const idx = parseInt(indexStr, 10);
      return coupons[idx]?.id;
    }).filter(Boolean);
  }, [rowSelection, coupons]);

  const handleGenerateAICoupon = async () => {
    setIsGeneratingAI(true);
    try {
      const res = await fetch("/api/admin/coupons/generate-ai", {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCode(data.coupon.code || "");
        setDiscountType(data.coupon.discountType || "percentage");
        setDiscountValue(String(data.coupon.discountValue || ""));
        if (data.coupon.maxUses) setMaxUses(String(data.coupon.maxUses));
        if (data.coupon.expiresAt) {
          const dateStr = data.coupon.expiresAt.substring(0, 10);
          setExpiresAt(dateStr);
        }
        toast.success("AI designed a brilliant wedding coupon!");
      } else {
        toast.error(data.error || "Failed to generate AI coupon");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error connecting to AI helper");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !discountValue) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          discountType,
          discountValue: parseFloat(discountValue),
          active,
          maxUses: maxUses ? parseInt(maxUses) : null,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Coupon code created successfully!");
        setIsCreateOpen(false);
        resetForm();
        queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });
        refetch();
      } else {
        toast.error(data.error || "Failed to create coupon");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error creating coupon");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentStatus }),
      });

      if (res.ok) {
        toast.success(`Coupon ${!currentStatus ? "activated" : "deactivated"} successfully!`);
        queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });
        refetch();
      } else {
        toast.error("Failed to update coupon status");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating coupon");
    }
  };

  const resetForm = () => {
    setCode("");
    setDiscountType("percentage");
    setDiscountValue("");
    setActive(true);
    setMaxUses("");
    setExpiresAt("");
  };

  const getCouponStatus = (coupon: Coupon) => {
    if (!coupon.active) return { label: "Disabled", color: "bg-rose-500/10 text-rose-500 border-rose-500/20" };
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return { label: "Expired", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" };
    }
    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return { label: "Sold Out", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" };
    }
    return { label: "Active", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" };
  };

  // TanStack Table Column Definitions
  const columns = React.useMemo<ColumnDef<Coupon>[]>(() => [
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
      accessorKey: "code",
      header: "Coupon Code",
      cell: ({ row }) => (
        <span className="font-extrabold text-primary tracking-wide text-[13px] uppercase">
          {row.original.code}
        </span>
      )
    },
    {
      accessorKey: "discountValue",
      header: "Discount Applied",
      cell: ({ row }) => {
        const c = row.original;
        return c.discountType === "percentage" ? (
          <span className="flex items-center gap-1 font-bold text-foreground">
            {c.discountValue}% Off <Percent className="w-3.5 h-3.5 text-muted-foreground/60" />
          </span>
        ) : (
          <span className="font-bold text-foreground">Flat ₹{c.discountValue} Off</span>
        );
      }
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const statusInfo = getCouponStatus(row.original);
        return (
          <span className={cn(
            "inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full border",
            statusInfo.color
          )}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {statusInfo.label}
          </span>
        );
      }
    },
    {
      accessorKey: "usedCount",
      header: "Limit / Usage",
      cell: ({ row }) => {
        const coupon = row.original;
        return (
          <div className="flex flex-col gap-1 font-medium">
            <span className="font-semibold text-foreground/95">
              {coupon.usedCount} {coupon.maxUses ? `/ ${coupon.maxUses}` : "uses"}
            </span>
            {coupon.maxUses && (
              <div className="w-20 h-1 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary" 
                  style={{ width: `${Math.min(100, (coupon.usedCount / coupon.maxUses) * 100)}%` }} 
                />
              </div>
            )}
          </div>
        );
      }
    },
    {
      accessorKey: "expiresAt",
      header: "Expiration",
      cell: ({ row }) => {
        const coupon = row.original;
        return coupon.expiresAt ? (
          <span className="flex items-center gap-1.5 text-muted-foreground/80 font-semibold">
            <Calendar className="w-3.5 h-3.5" />
            {formatISTDate(coupon.expiresAt, { 
              month: "short", 
              day: "numeric", 
              year: "numeric" 
            })}
          </span>
        ) : (
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/50">Infinite</span>
        );
      }
    },
    {
      id: "actions",
      header: () => <div className="text-right pr-4">Actions</div>,
      cell: ({ row }) => {
        const coupon = row.original;
        return (
          <div className="flex items-center justify-end gap-2.5 pr-2">
            <button
              onClick={() => handleToggleActive(coupon.id, coupon.active)}
              title={coupon.active ? "Deactivate Promo Code" : "Activate Promo Code"}
              className={cn(
                "px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded border transition-colors cursor-pointer",
                coupon.active 
                  ? "bg-amber-500/10 border-amber-500/20 text-amber-600 hover:bg-amber-500/20" 
                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/20"
              )}
            >
              {coupon.active ? "Disable" : "Enable"}
            </button>

            <button
              onClick={() => {
                setConfirmDeleteState({
                  isOpen: true,
                  title: "Purge Coupon Code",
                  description: `Are you sure you want to permanently delete the promo code "${coupon.code}"? This action cannot be undone and will immediately prevent users from checking out with this coupon code.`,
                  onConfirm: async () => {
                    const loadingToast = toast.loading("Purging promo coupon...");
                    try {
                      const res = await fetch(`/api/admin/coupons`, {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: coupon.id }),
                      });
                      if (res.ok) {
                        toast.success("Coupon code successfully purged", { id: loadingToast });
                        queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });
                        refetch();
                      } else {
                        const data = await res.json();
                        toast.error(data.error || "Failed to delete coupon", { id: loadingToast });
                      }
                    } catch (err) {
                      console.error(err);
                      toast.error("Error deleting coupon", { id: loadingToast });
                    }
                  }
                });
              }}
              title="Delete Coupon Code"
              className="p-1 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 rounded border border-transparent transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      }
    }
  ], [coupons]);

  const table = useReactTable({
    data: coupons,
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
            <Ticket className="w-8 h-8 text-primary" />
            Promo Coupons Management
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Generate, validate, and manage discount promo codes for premium template downloads.
          </p>
        </div>

        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-9 tracking-wide px-4 rounded-lg shadow-md cursor-pointer flex gap-1.5 items-center shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create Promo Code
        </Button>
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
              <span className="bg-primary text-white px-2 py-0.5 rounded-full text-[10px] font-black">
                {selectedIds.length}
              </span>
              <span>Selected promo coupon codes</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => {
                  setConfirmDeleteState({
                    isOpen: true,
                    title: `Purge ${selectedIds.length} Coupon Codes`,
                    description: `Are you sure you want to permanently delete these ${selectedIds.length} promotional coupon codes? This action is completely irreversible and will immediately make all these coupon codes invalid.`,
                    onConfirm: async () => {
                      const loadingToast = toast.loading(`Purging ${selectedIds.length} coupon codes...`);
                      try {
                        const res = await fetch("/api/admin/coupons", {
                          method: "DELETE",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ ids: selectedIds }),
                        });
                        if (res.ok) {
                          toast.success(`Successfully purged ${selectedIds.length} coupon codes`, { id: loadingToast });
                          setRowSelection({});
                          queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });
                          refetch();
                        } else {
                          const data = await res.json();
                          toast.error(data.error || "Failed to bulk delete coupons", { id: loadingToast });
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

      {/* Coupon List Container */}
      <Card className="bg-card border border-border rounded-xl overflow-hidden shadow-sm w-full">
        <div className="p-5 border-b border-border bg-muted/20">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">All Active Promo Codes</h3>
          <p className="text-xs text-muted-foreground mt-0.5">List of configured coupons and real-time usage metrics.</p>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-xs table-fixed min-w-[700px]">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="border-b border-border bg-muted/25 text-muted-foreground font-bold uppercase tracking-wider">
                  {headerGroup.headers.map(header => {
                    let widthStyle = "";
                    if (header.id === "select") widthStyle = "w-[60px]";
                    else if (header.id === "code") widthStyle = "w-[180px]";
                    else if (header.id === "discountValue") widthStyle = "w-[150px]";
                    else if (header.id === "status") widthStyle = "w-[120px]";
                    else if (header.id === "usedCount") widthStyle = "w-[150px]";
                    else if (header.id === "expiresAt") widthStyle = "w-[140px]";
                    else if (header.id === "actions") widthStyle = "w-[180px]";

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
                    Loading coupons...
                  </td>
                </tr>
              ) : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="hover:bg-muted/10 transition-colors">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="p-4 align-middle truncate">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="p-8 text-center text-muted-foreground italic">
                    No custom coupon codes created yet. Click "Create Promo Code" to get started!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* CREATE COUPON DIALOG */}
      <Dialog open={isCreateOpen} onOpenChange={(open) => {
        if (!open) resetForm();
        setIsCreateOpen(open);
      }}>
        <DialogContent className="max-w-[95%] sm:max-w-md p-0 flex flex-col gap-0 border-0 bg-background/95 backdrop-blur-xl shadow-[0_20px_70px_-15px_rgba(0,0,0,0.4)] rounded-3xl overflow-hidden ring-1 ring-border/50 [&>button]:text-white">
          <div className="bg-gradient-primary py-5 px-6 text-white relative select-none flex items-center gap-4 border-b border-primary/20 shrink-0 overflow-hidden shadow-sm">
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent w-1/2 h-full animate-shine pointer-events-none z-0" />
            <div className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md shrink-0 border border-white/20">
              <Tag className="w-5.5 h-5.5 text-white" />
            </div>
            <div className="text-left flex-1 min-w-0 z-10">
              <DialogTitle className="text-lg sm:text-xl font-black tracking-wide text-white leading-tight drop-shadow-sm flex items-center gap-1.5">
                Create Promo Code
              </DialogTitle>
              <DialogDescription className="text-[11px] sm:text-xs text-white/90 mt-1 font-semibold leading-tight">
                Add a new discount code for your matrimonial users.
              </DialogDescription>
            </div>
          </div>

          <form onSubmit={handleCreateCoupon} className="p-5 sm:p-6 flex flex-col gap-4 text-left">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wide">Coupon Code *</label>
                <button
                  type="button"
                  onClick={handleGenerateAICoupon}
                  disabled={isGeneratingAI}
                  className="text-[9px] font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md hover:bg-amber-500/20 flex items-center gap-1 cursor-pointer transition-all select-none disabled:opacity-50"
                >
                  {isGeneratingAI ? (
                    <>
                      <Loader2 className="w-2.5 h-2.5 animate-spin" />
                      Designing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-2.5 h-2.5 fill-amber-500 animate-pulse" />
                      Auto-Generate with AI
                    </>
                  )}
                </button>
              </div>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="WELCOME50"
                className="w-full px-3.5 py-2.5 text-xs bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground/30 font-bold text-foreground uppercase"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wide">Discount Type *</label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-foreground"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Flat (₹)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wide">Discount Value *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={discountType === "percentage" ? "100" : undefined}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder={discountType === "percentage" ? "50" : "100"}
                  className="w-full px-3.5 py-2.5 text-xs bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground/30 font-bold text-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wide">Max Usage Count (Optional)</label>
                <input
                  type="number"
                  min="1"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  placeholder="e.g. 100"
                  className="w-full px-3.5 py-2.5 text-xs bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground/30 font-bold text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wide">Expiration Date (Optional)</label>
                <input
                  type="date"
                  value={expiresAt}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-semibold text-foreground"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="active"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="w-4 h-4 accent-primary rounded border-border"
              />
              <label htmlFor="active" className="text-xs font-bold text-foreground select-none cursor-pointer">
                Enable coupon immediately on production website
              </label>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 border border-border text-muted-foreground font-semibold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs px-5 rounded-xl shadow-md cursor-pointer flex gap-1.5 items-center disabled:opacity-75"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Save Coupon
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Premium Reusable Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDeleteState.isOpen}
        onOpenChange={(isOpen) => setConfirmDeleteState((prev) => ({ ...prev, isOpen }))}
        title={confirmDeleteState.title}
        description={confirmDeleteState.description}
        confirmText={confirmDeleteState.confirmText || "Confirm Purge"}
        cancelText="Keep Promo Code"
        onConfirm={confirmDeleteState.onConfirm}
        variant="danger"
      />
    </div>
  );
}
