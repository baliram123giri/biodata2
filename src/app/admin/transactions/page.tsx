"use client";

import * as React from "react";
import { 
  Search, 
  CreditCard, 
  Calendar, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  IndianRupee, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw, 
  Tag, 
  Sparkles, 
  Loader2,
  FileText,
  RotateCcw,
  Ban,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef
} from "@tanstack/react-table";

export default function AdminTransactions() {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [status, setStatus] = React.useState("ALL");
  const [format, setFormat] = React.useState("ALL");
  const [page, setPage] = React.useState(1);
  const [selectedTransaction, setSelectedTransaction] = React.useState<any>(null);
  const [rowSelection, setRowSelection] = React.useState({});
  const [confirmDeleteState, setConfirmDeleteState] = React.useState<{
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

  // Reset rowSelection when filters or page change
  React.useEffect(() => {
    setRowSelection({});
  }, [debouncedSearch, status, format, page]);

  const selectedIds = React.useMemo(() => {
    return Object.keys(rowSelection);
  }, [rowSelection]);

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 450);
    return () => clearTimeout(timer);
  }, [search]);

  const queryKey = ["admin", "transactions", { debouncedSearch, status, format, page }];
  const { data, isLoading, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      const url = new URL("/api/admin/transactions", window.location.origin);
      if (debouncedSearch) url.searchParams.set("search", debouncedSearch);
      if (status && status !== "ALL") url.searchParams.set("status", status.toLowerCase());
      if (format && format !== "ALL") url.searchParams.set("format", format.toLowerCase());
      url.searchParams.set("page", String(page));
      url.searchParams.set("limit", "15");
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to load transactions history");
      return res.json();
    },
    staleTime: Infinity, // Cache until page refresh
  });

  const orders: any[] = data?.orders || [];
  const stats = data?.stats || null;
  const pagination = data?.pagination || null;

  const fetchTransactions = async (bypassCache = false) => {
    if (bypassCache) {
      try {
        await queryClient.fetchQuery({
          queryKey,
          queryFn: async () => {
            const url = new URL("/api/admin/transactions", window.location.origin);
            if (debouncedSearch) url.searchParams.set("search", debouncedSearch);
            if (status && status !== "ALL") url.searchParams.set("status", status.toLowerCase());
            if (format && format !== "ALL") url.searchParams.set("format", format.toLowerCase());
            url.searchParams.set("page", String(page));
            url.searchParams.set("limit", "15");
            url.searchParams.set("bypass", "true");
            const res = await fetch(url.toString());
            if (!res.ok) throw new Error("Failed to load transactions history");
            return res.json();
          }
        });
        toast.success("Transactions list successfully synced");
      } catch (err) {
        console.error(err);
        toast.error("Failed to sync transactions list");
      }
    } else {
      refetch();
    }
  };

  const resetFilters = () => {
    setSearch("");
    setStatus("ALL");
    setFormat("ALL");
    setPage(1);
  };

  const getFormatBadgeStyle = (fmt: string) => {
    const norm = fmt.toLowerCase();
    switch (norm) {
      case "pdf":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
      case "combo":
        return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 font-black";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getStatusBadgeStyle = (st: string) => {
    const norm = st.toLowerCase();
    switch (norm) {
      case "paid":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border-emerald-500/25";
      case "pending":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-450 border-amber-500/25";
      case "failed":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25";
      case "refunded":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25";
      case "cancelled":
        return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/25";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getStatusIcon = (st: string) => {
    const norm = st.toLowerCase();
    switch (norm) {
      case "paid":
        return <CheckCircle2 className="w-3.5 h-3.5 mr-1" />;
      case "pending":
        return <Clock className="w-3.5 h-3.5 mr-1 animate-pulse" />;
      case "failed":
        return <XCircle className="w-3.5 h-3.5 mr-1" />;
      case "refunded":
        return <RotateCcw className="w-3.5 h-3.5 mr-1" />;
      case "cancelled":
        return <Ban className="w-3.5 h-3.5 mr-1" />;
      default:
        return null;
    }
  };

  // TanStack Table Column Definitions
  const columns = React.useMemo<ColumnDef<any>[]>(() => [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
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
      accessorKey: "customerName",
      header: "Customer Details",
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-foreground truncate max-w-[150px]">
              {order.customerName || "Anonymous Guest"}
            </span>
            <span className="text-[10px] text-muted-foreground/80 truncate max-w-[150px]">
              {order.customerEmail || "No email"}
            </span>
            <span className="text-[10px] text-muted-foreground font-medium">
              {order.customerPhone || "No contact"}
            </span>
          </div>
        );
      }
    },
    {
      accessorKey: "razorpayOrderId",
      header: "Order ID",
      cell: ({ row }) => (
        <span className="font-semibold text-muted-foreground/80 font-mono">
          {row.getValue("razorpayOrderId")}
        </span>
      )
    },
    {
      accessorKey: "templateName",
      header: "Selected Theme",
      cell: ({ row }) => (
        <span className="text-muted-foreground font-medium truncate max-w-[140px]">
          {row.getValue("templateName")}
        </span>
      )
    },
    {
      accessorKey: "format",
      header: () => <div className="text-center">Format</div>,
      cell: ({ row }) => {
        const format = row.getValue("format") as string;
        return (
          <div className="text-center">
            <span className={cn(
              "text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider inline-block",
              getFormatBadgeStyle(format)
            )}>
              {format}
            </span>
          </div>
        );
      }
    },
    {
      accessorKey: "amount",
      header: () => <div className="text-right">Pricing Summary</div>,
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div className="flex flex-col items-end">
            <span className="font-bold text-foreground text-sm">
              ₹{Number(order.amount).toFixed(2)}
            </span>
            {order.discountApplied > 0 && (
              <span className="text-[9px] text-emerald-600 dark:text-emerald-500 font-extrabold flex items-center gap-0.5">
                <Tag className="w-2.5 h-2.5" /> Coupon Applied
              </span>
            )}
          </div>
        );
      }
    },
    {
      accessorKey: "status",
      header: () => <div className="text-center">Checkout Status</div>,
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div className="flex flex-col items-center gap-1.5">
            <span className={cn(
              "text-[9px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wider inline-flex items-center select-none",
              getStatusBadgeStyle(order.status)
            )}>
              {getStatusIcon(order.status)}
              {order.status}
            </span>
            {(order.status === "paid" || order.downloadStatus === "failed") && (
              <span className={cn(
                "text-[8px] font-bold px-1.5 py-[1px] rounded-[3px] border uppercase tracking-widest inline-flex items-center",
                order.downloadStatus === "success" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border-emerald-500/20" :
                order.downloadStatus === "failed" ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" :
                "bg-amber-500/10 text-amber-600 dark:text-amber-450 border-amber-500/20"
              )}>
                DL: {order.downloadStatus || "PENDING"}
              </span>
            )}
          </div>
        );
      }
    },
    {
      accessorKey: "createdAt",
      header: () => <div className="text-right">Date</div>,
      cell: ({ row }) => (
        <div className="text-right text-muted-foreground/75 font-medium whitespace-nowrap">
          {new Date(row.getValue("createdAt")).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          })}
        </div>
      )
    },
    {
      id: "actions",
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div className="text-center">
            <Button
              onClick={() => setSelectedTransaction(order)}
              variant="ghost"
              size="sm"
              className="h-7 text-[10px] font-extrabold text-primary hover:text-primary hover:bg-primary/10 gap-0.5 cursor-pointer"
            >
              Inspect <ArrowUpRight className="w-3 h-3" />
            </Button>
          </div>
        );
      }
    }
  ], []);

  const table = useReactTable({
    data: orders,
    columns,
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  });

  return (
    <div className="space-y-6 text-foreground">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-primary" />
            Transaction Registry
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Track customer payments, invoices, coupon usage, and direct downloads.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={() => fetchTransactions(true)}
            variant="outline"
            size="sm"
            className="h-8 text-xs border border-border text-foreground hover:bg-muted/50 cursor-pointer flex gap-1 items-center"
          >
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Sync Payments
          </Button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Total Revenue */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className="p-5 bg-gradient-to-br from-secondary/15 to-transparent border border-secondary/30 rounded-xl relative overflow-hidden group shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground tracking-wide uppercase">Total Revenue</span>
              <div className="p-2 rounded-lg bg-secondary/10 border border-secondary/20 text-secondary">
                <Sparkles className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl sm:text-3xl font-black text-foreground tracking-tight block">
                ₹{Number(stats?.totalRevenue || 0).toFixed(2)}
              </span>
              <span className="text-[11px] text-muted-foreground font-semibold mt-1 block">
                Calculated from paid orders
              </span>
            </div>
          </Card>
        </motion.div>

        {/* Card 2: Transactions count */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
          <Card className="p-5 bg-card border border-border rounded-xl relative overflow-hidden group shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground tracking-wide uppercase">All Checkouts</span>
              <div className="p-2 rounded-lg bg-muted border border-border text-foreground">
                <CreditCard className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl sm:text-3xl font-black text-foreground tracking-tight block">
                {stats?.totalTransactions?.toLocaleString() || "0"}
              </span>
              <span className="text-[11px] text-muted-foreground font-semibold mt-1 block">
                {stats?.paidCount || 0} paid • {stats?.pendingCount || 0} pending
              </span>
            </div>
          </Card>
        </motion.div>

        {/* Card 3: Success Rate */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
          <Card className="p-5 bg-card border border-border rounded-xl relative overflow-hidden group shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground tracking-wide uppercase">Payment Success Rate</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                <CheckCircle2 className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl sm:text-3xl font-black text-foreground tracking-tight block">
                {stats?.successRate || 100}%
              </span>
              <span className="text-[11px] text-muted-foreground font-semibold mt-1 block">
                Paid checkouts vs total attempts
              </span>
            </div>
          </Card>
        </motion.div>

        {/* Card 4: Currency & Support */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}>
          <Card className="p-5 bg-card border border-border rounded-xl relative overflow-hidden group shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground tracking-wide uppercase">Razorpay Key Mode</span>
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500">
                <Calendar className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl sm:text-3xl font-black text-foreground tracking-tight block uppercase text-emerald-500 dark:text-emerald-450">
                TEST MODE
              </span>
              <span className="text-[11px] text-muted-foreground font-semibold mt-1 block">
                UPI and test cards fully integrated
              </span>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Filter and Search Bar Card */}
      <Card className="p-4 bg-card border border-border rounded-xl shadow-xs">
        <div className="flex flex-col lg:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative w-full lg:flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer name, email, phone, order ID or coupon..."
              className="w-full bg-muted/40 border border-border/80 hover:border-primary/40 focus:border-primary text-foreground rounded-lg pl-10 pr-3 py-2 text-xs outline-none placeholder:text-muted-foreground/60 transition-all focus:ring-1 focus:ring-primary/20"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Status Select */}
            <div className="w-[140px] shrink-0">
              <Select value={status} onValueChange={(val) => { setStatus(val); setPage(1); }}>
                <SelectTrigger className="h-9 text-xs bg-muted/20 border-border">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Format Select */}
            <div className="w-[140px] shrink-0">
              <Select value={format} onValueChange={(val) => { setFormat(val); setPage(1); }}>
                <SelectTrigger className="h-9 text-xs bg-muted/20 border-border">
                  <SelectValue placeholder="All Formats" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Formats</SelectItem>
                  <SelectItem value="PDF">PDF Only</SelectItem>
                  <SelectItem value="JPG">JPEG Image</SelectItem>
                  <SelectItem value="PNG">PNG Image</SelectItem>
                  <SelectItem value="COMBO">Combo Pack</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reset Button */}
            {(search || status !== "ALL" || format !== "ALL") && (
              <Button
                onClick={resetFilters}
                variant="ghost"
                size="sm"
                className="text-xs h-9 text-muted-foreground hover:text-foreground cursor-pointer px-3 shrink-0"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Main Datatable Card */}
      <Card className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-primary/5 border-b border-primary/20 px-4 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 overflow-hidden text-xs"
            >
              <div className="flex items-center gap-2 font-bold text-foreground">
                <span className="bg-primary text-white px-2 py-0.5 rounded-full text-[10px] font-black">
                  {selectedIds.length}
                </span>
                <span>Selected transactions</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-muted-foreground font-semibold">Bulk Actions:</span>
                
                <Select
                  onValueChange={async (newStatus) => {
                    if (!newStatus) return;
                    const loadingToast = toast.loading(`Updating ${selectedIds.length} transactions to ${newStatus}...`);
                    try {
                      const res = await fetch("/api/admin/transactions/update-status", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          orderIds: selectedIds,
                          status: newStatus.toLowerCase(),
                        }),
                      });
                      if (res.ok) {
                        toast.success(`Successfully updated ${selectedIds.length} transactions to ${newStatus}`, { id: loadingToast });
                        setRowSelection({});
                        queryClient.invalidateQueries({ queryKey: ["admin", "transactions"] });
                      } else {
                        const err = await res.json();
                        toast.error(err.error || "Failed to bulk update status", { id: loadingToast });
                      }
                    } catch (error) {
                      toast.error("Network communication error", { id: loadingToast });
                    }
                  }}
                >
                  <SelectTrigger className="h-8 text-[11px] bg-card border-primary/20 text-foreground w-[150px]">
                    <SelectValue placeholder="Update Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                    <SelectItem value="REFUNDED">Refunded</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  onClick={() => {
                    setConfirmDeleteState({
                      isOpen: true,
                      title: `Purge ${selectedIds.length} Transaction Records`,
                      description: `Are you sure you want to permanently delete these ${selectedIds.length} transaction records? This action is irreversible and will immediately purge these entries from the registry database.`,
                      onConfirm: async () => {
                        const loadingToast = toast.loading(`Purging ${selectedIds.length} transaction records...`);
                        try {
                          const res = await fetch("/api/admin/transactions/delete", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ orderIds: selectedIds }),
                          });
                          if (res.ok) {
                            toast.success(`Successfully purged ${selectedIds.length} transaction records`, { id: loadingToast });
                            setRowSelection({});
                            queryClient.invalidateQueries({ queryKey: ["admin", "transactions"] });
                          } else {
                            const err = await res.json();
                            toast.error(err.error || "Failed to bulk delete records", { id: loadingToast });
                          }
                        } catch (error) {
                          toast.error("Network communication error", { id: loadingToast });
                        }
                      }
                    });
                  }}
                  variant="outline"
                  className="h-8 text-[11px] font-bold border-rose-500/20 hover:bg-rose-500 hover:text-white hover:border-rose-500 text-rose-500 cursor-pointer gap-1 px-3 transition-colors duration-205"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Purge Selected</span>
                </Button>

                <Button
                  onClick={() => setRowSelection({})}
                  variant="ghost"
                  className="h-8 text-[11px] font-semibold text-muted-foreground hover:text-foreground cursor-pointer px-3"
                >
                  Deselect All
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="border-b border-border bg-muted/25 text-muted-foreground font-bold uppercase tracking-wider">
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="p-4 align-middle font-bold text-muted-foreground">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border/40 text-foreground/90">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="p-12 text-center text-muted-foreground font-semibold">
                    <Loader2 className="w-6 h-6 animate-spin text-primary inline mr-2" />
                    Querying transactions database...
                  </td>
                </tr>
              ) : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map(row => {
                  const isSelected = row.getIsSelected();
                  return (
                    <tr key={row.id} className={cn(
                      "hover:bg-muted/15 transition-colors",
                      isSelected && "bg-primary/5 hover:bg-primary/10"
                    )}>
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="p-4 align-middle">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={columns.length} className="p-12 text-center text-muted-foreground italic">
                    No transactions match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-border flex items-center justify-between text-xs bg-muted/10">
          <div className="text-muted-foreground font-medium">
            Showing Page <span className="font-semibold text-foreground">{page}</span> of{" "}
            <span className="font-semibold text-foreground">{pagination?.pages || 1}</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1 || isLoading}
              className="h-8 text-xs font-semibold cursor-pointer"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.min(pagination?.pages || 1, prev + 1))}
              disabled={page === (pagination?.pages || 1) || isLoading}
              className="h-8 text-xs font-semibold cursor-pointer"
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      {/* Accessible Radix-UI Transaction Details Modal */}
      <Dialog open={selectedTransaction !== null} onOpenChange={(open) => { if (!open) setSelectedTransaction(null); }}>
        <DialogContent className="max-w-[95%] sm:max-w-md p-0 flex flex-col gap-0 border-0 bg-background/95 backdrop-blur-xl shadow-2xl rounded-2xl ring-1 ring-border/50 overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-primary py-5 px-6 text-white relative flex items-center gap-3 border-b border-primary/20 shrink-0 select-none">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md shrink-0 border border-white/20">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div className="text-left flex-1 min-w-0">
              <DialogTitle className="text-lg font-black tracking-wide text-white leading-tight">
                Transaction Inspector
              </DialogTitle>
              <DialogDescription className="text-[11px] text-white/80 mt-1 font-semibold leading-tight">
                Audit system values and payment gateway metadata
              </DialogDescription>
            </div>
          </div>

          {/* Details Scrollable List */}
          {selectedTransaction && (
            <div className="p-6 overflow-y-auto max-h-[75vh] flex flex-col gap-5 text-xs text-left">
              {/* Top Summary Row */}
              <div className="flex justify-between items-center bg-muted/40 p-4 rounded-xl border border-border/40">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Net Charged</span>
                  <span className="text-2xl font-black text-foreground mt-0.5">₹{Number(selectedTransaction.amount).toFixed(2)}</span>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={cn(
                    "text-[9px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wider inline-flex items-center",
                    getStatusBadgeStyle(selectedTransaction.status)
                  )}>
                    {getStatusIcon(selectedTransaction.status)}
                    {selectedTransaction.status}
                  </span>
                  {(selectedTransaction.status === "paid" || selectedTransaction.downloadStatus === "failed") && (
                    <span className={cn(
                      "text-[9px] font-bold px-2 py-[2px] rounded-[4px] border uppercase tracking-widest inline-flex items-center",
                      selectedTransaction.downloadStatus === "success" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border-emerald-500/20" :
                      selectedTransaction.downloadStatus === "failed" ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" :
                      "bg-amber-500/10 text-amber-600 dark:text-amber-450 border-amber-500/20"
                    )}>
                      DL: {selectedTransaction.downloadStatus || "PENDING"}
                    </span>
                  )}
                </div>
              </div>

              {/* Grid 1: Customer Details */}
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase text-primary tracking-wide block">Customer Particulars</span>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 bg-card border border-border/50 rounded-xl p-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-semibold text-muted-foreground">Full Name</span>
                    <span className="font-bold text-foreground mt-0.5">{selectedTransaction.customerName || "Anonymous Guest"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-semibold text-muted-foreground">Contact Phone</span>
                    <span className="font-bold text-foreground mt-0.5">{selectedTransaction.customerPhone || "—"}</span>
                  </div>
                  <div className="flex flex-col col-span-2">
                    <span className="text-[10px] font-semibold text-muted-foreground">Email Address</span>
                    <span className="font-bold text-foreground mt-0.5 truncate">{selectedTransaction.customerEmail || "—"}</span>
                  </div>
                </div>
              </div>

              {/* Grid 2: Purchase & Template Config */}
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase text-primary tracking-wide block">Biodata Configuration</span>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 bg-card border border-border/50 rounded-xl p-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-semibold text-muted-foreground">Template Theme</span>
                    <span className="font-bold text-foreground mt-0.5">{selectedTransaction.templateName}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-semibold text-muted-foreground">Export Format</span>
                    <span className="font-bold text-foreground mt-0.5 uppercase">{selectedTransaction.format}</span>
                  </div>
                  <div className="flex flex-col col-span-2">
                    <span className="text-[10px] font-semibold text-muted-foreground">Internal Template ID</span>
                    <span className="font-mono text-[10px] text-muted-foreground mt-0.5 truncate">{selectedTransaction.templateId}</span>
                  </div>
                </div>
              </div>

              {/* Grid 3: Gateway IDs */}
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase text-primary tracking-wide block">Razorpay Gateway Integration</span>
                <div className="grid grid-cols-1 gap-y-2.5 bg-card border border-border/50 rounded-xl p-4 font-mono">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-sans font-semibold text-muted-foreground">Razorpay Order ID</span>
                    <span className="font-bold text-foreground mt-0.5 text-[11px]">{selectedTransaction.razorpayOrderId}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-sans font-semibold text-muted-foreground">Razorpay Payment ID</span>
                    <span className="font-bold text-foreground mt-0.5 text-[11px] truncate">{selectedTransaction.razorpayPaymentId || "Not completed / Null"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-sans font-semibold text-muted-foreground">Razorpay Signature</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-[340px]">{selectedTransaction.razorpaySignature || "Pending payment execution"}</span>
                  </div>
                </div>
              </div>

              {/* Grid 4: Coupons and Discounts */}
              {(selectedTransaction.couponCode || selectedTransaction.discountApplied > 0) && (
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase text-primary tracking-wide block">Promo Coupon Usage</span>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 bg-emerald-500/[0.03] border border-emerald-500/20 rounded-xl p-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-450">Coupon Applied</span>
                      <span className="font-extrabold text-emerald-700 dark:text-emerald-400 mt-0.5 uppercase">{selectedTransaction.couponCode || "FREE100"}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-450">Discount Value</span>
                      <span className="font-extrabold text-emerald-700 dark:text-emerald-400 mt-0.5">₹{Number(selectedTransaction.discountApplied || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Grid 5: Administrative Control Actions */}
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase text-primary tracking-wide block">Administrative Actions</span>
                <div className="flex flex-col gap-3 bg-muted/40 border border-border/60 rounded-xl p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] font-semibold text-muted-foreground">Change Checkout Status</span>
                      <span className="text-[9px] text-muted-foreground/80 mt-0.5">Instantly syncs status across systems</span>
                    </div>
                    
                    <div className="w-[130px] shrink-0">
                      <Select 
                        value={selectedTransaction.status.toUpperCase()} 
                        onValueChange={async (newVal) => {
                          try {
                            const res = await fetch("/api/admin/transactions/update-status", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                orderId: selectedTransaction.id,
                                status: newVal.toLowerCase(),
                              }),
                            });
                            
                            if (res.ok) {
                              toast.success(`Transaction status successfully set to ${newVal}`);
                              // Invalidate query cache to pull updated transactions
                              queryClient.invalidateQueries({ queryKey: ["admin", "transactions"] });
                              setSelectedTransaction((prev: any) => ({ ...prev, status: newVal.toLowerCase() }));
                            } else {
                              const errData = await res.json();
                              toast.error(errData.error || "Failed to update transaction status");
                            }
                          } catch (err) {
                            console.error(err);
                            toast.error("Network communication error");
                          }
                        }}
                      >
                        <SelectTrigger className="h-8 text-[11px] bg-card border-border">
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PAID">Paid</SelectItem>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="FAILED">Failed</SelectItem>
                          <SelectItem value="REFUNDED">Refunded</SelectItem>
                          <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="border border-rose-500/20 rounded-xl p-4 bg-rose-500/5 space-y-3">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-rose-500">Danger Zone</p>
                  <p className="text-[10px] text-muted-foreground">Permanently delete this transaction record from the database.</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setConfirmDeleteState({
                      isOpen: true,
                      title: "Purge Transaction Record",
                      description: `Are you sure you want to permanently delete the transaction record for ${selectedTransaction.customerName || "Anonymous Guest"} (${selectedTransaction.razorpayOrderId})? This action is irreversible and will delete all payment data.`,
                      onConfirm: async () => {
                        const loadingToast = toast.loading("Purging transaction record...");
                        try {
                          const res = await fetch("/api/admin/transactions/delete", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ orderId: selectedTransaction.id }),
                          });
                          if (res.ok) {
                            toast.success("Transaction record successfully purged", { id: loadingToast });
                            setSelectedTransaction(null);
                            queryClient.invalidateQueries({ queryKey: ["admin", "transactions"] });
                          } else {
                            const err = await res.json();
                            toast.error(err.error || "Failed to delete transaction record", { id: loadingToast });
                          }
                        } catch (error) {
                          toast.error("Network communication error", { id: loadingToast });
                        }
                      }
                    });
                  }}
                  className="w-full h-8 border-rose-500/20 hover:bg-rose-500 hover:text-white hover:border-rose-500 text-rose-500 text-[10px] font-bold uppercase tracking-wider gap-1.5 cursor-pointer transition-all duration-200"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Purge Record</span>
                </Button>
              </div>

              {/* Bottom Date Log */}
              <div className="text-[10px] text-muted-foreground font-semibold text-center mt-2 flex justify-center gap-1">
                <span>Created at: {new Date(selectedTransaction.createdAt).toLocaleString()}</span>
                <span>•</span>
                <span>Last updated: {new Date(selectedTransaction.updatedAt).toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Dialog Action Buttons footer */}
          <div className="p-4 bg-muted/20 border-t border-border flex justify-end">
            <Button
              onClick={() => setSelectedTransaction(null)}
              className="bg-primary text-primary-foreground hover:opacity-90 font-bold text-xs px-5 shadow-xs cursor-pointer border-none"
            >
              Close Inspector
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Premium Reusable Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDeleteState.isOpen}
        onOpenChange={(isOpen) => setConfirmDeleteState((prev) => ({ ...prev, isOpen }))}
        title={confirmDeleteState.title}
        description={confirmDeleteState.description}
        confirmText={confirmDeleteState.confirmText || "Confirm Purge"}
        cancelText="Keep Record"
        onConfirm={confirmDeleteState.onConfirm}
        variant="danger"
      />
    </div>
  );
}
