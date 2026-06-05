"use client";

import * as React from "react";
import { 
  FileText, 
  Search, 
  Trash2, 
  Calendar,
  MapPin,
  Laptop,
  Smartphone,
  Info,
  FileSpreadsheet,
  Loader2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { toast } from "sonner";
import { cn, formatISTDateTime } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { TruncatedValue } from "@/components/ui/truncated-value";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef
} from "@tanstack/react-table";

interface DownloadLog {
  id: string;
  name: string;
  location: string | null;
  format: string;
  templateId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

interface Template {
  id: string;
  name: string;
  price?: number | null;
  discountPrice?: number | null;
  pdfPrice?: number | null;
  pdfDiscountPrice?: number | null;
  jpgPrice?: number | null;
  jpgDiscountPrice?: number | null;
  pngPrice?: number | null;
  pngDiscountPrice?: number | null;
  currency?: string | null;
}

export default function AdminBiodatas() {
  const queryClient = useQueryClient();
  const [isCsvExporting, setIsCsvExporting] = React.useState(false);
  
  // Filters state
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [formatFilter, setFormatFilter] = React.useState("all");
  const [templateFilter, setTemplateFilter] = React.useState("all");

  // Server-side Pagination states
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  // Row Selection & Confirmation Box state
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

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 450);
    return () => clearTimeout(timer);
  }, [search]);

  // Load templates once on mount via Query
  const { data: templatesData } = useQuery({
    queryKey: ["admin", "templates"],
    queryFn: async () => {
      const res = await fetch("/api/admin/templates");
      if (!res.ok) throw new Error("Failed to fetch templates");
      const json = await res.json();
      return (json.templates || []) as Template[];
    },
    staleTime: Infinity, // Cache until page refresh
  });
  const templates = templatesData || [];

  // Fetch downloads query based on filters
  const downloadsQueryKey = ["admin", "downloads", { currentPage, pageSize, debouncedSearch, formatFilter, templateFilter }];
  const { data: downloadsData, isLoading, refetch, isFetching } = useQuery({
    queryKey: downloadsQueryKey,
    queryFn: async () => {
      const res = await fetch(
        `/api/admin/downloads?page=${currentPage}&limit=${pageSize}&search=${encodeURIComponent(debouncedSearch)}&format=${formatFilter}&templateId=${templateFilter}`
      );
      if (!res.ok) throw new Error("Failed to fetch download records");
      return res.json();
    },
    placeholderData: keepPreviousData,
    staleTime: 0, // Instant refetch on state/filter change and invalidation
  });

  const downloads: DownloadLog[] = downloadsData?.downloads || [];
  const totalRecords = downloadsData?.total || 0;

  // Reset rowSelection when filters or page change
  React.useEffect(() => {
    setRowSelection({});
  }, [debouncedSearch, formatFilter, templateFilter, currentPage, pageSize]);

  const selectedIds = React.useMemo(() => {
    return Object.keys(rowSelection).map(indexStr => {
      const idx = parseInt(indexStr, 10);
      return downloads[idx]?.id;
    }).filter(Boolean);
  }, [rowSelection, downloads]);

  const getTemplateName = (templateId: string | null) => {
    if (!templateId) return "Default / Custom";
    const found = templates.find(t => t.id === templateId);
    return found ? found.name : templateId.slice(0, 14);
  };

  const getTemplatePrice = (templateId: string | null, format: string) => {
    if (!templateId) return "Free";
    const found = templates.find(t => t.id === templateId);
    if (!found) return "Free";

    const fmt = format.toLowerCase();
    let price: number | null = null;

    if (fmt === "pdf") {
      price = found.pdfDiscountPrice ?? found.pdfPrice ?? found.discountPrice ?? found.price ?? null;
    } else if (fmt === "jpg" || fmt === "jpeg") {
      price = found.jpgDiscountPrice ?? found.jpgPrice ?? found.discountPrice ?? found.price ?? null;
    } else if (fmt === "png") {
      price = found.pngDiscountPrice ?? found.pngPrice ?? found.discountPrice ?? found.price ?? null;
    } else {
      price = found.discountPrice ?? found.price ?? null;
    }

    if (price === null || price === 0) return "Free";
    const currencySym = found.currency === "USD" ? "$" : found.currency === "EUR" ? "€" : found.currency === "GBP" ? "£" : "₹";
    return `${currencySym}${price}`;
  };

  const totalPages = Math.ceil(totalRecords / pageSize) || 1;

  const getDeviceIcon = (ua: string | null) => {
    if (!ua) return <span title="Unknown client UA"><Laptop className="w-3.5 h-3.5 text-muted-foreground" /></span>;
    const lower = ua.toLowerCase();
    if (lower.includes("mobile") || lower.includes("android") || lower.includes("iphone")) {
      return <span title={ua}><Smartphone className="w-3.5 h-3.5 text-sky-500" /></span>;
    }
    return <span title={ua}><Laptop className="w-3.5 h-3.5 text-indigo-500" /></span>;
  };

  // TanStack Table Column Definitions
  const columns = React.useMemo<ColumnDef<DownloadLog>[]>(() => [
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
      accessorKey: "id",
      header: "Log ID",
      cell: ({ row }) => (
        <TruncatedValue 
          value={row.original.id} 
          className="font-mono font-bold text-muted-foreground/80 text-[10px]" 
          maxLength={8} 
        />
      )
    },
    {
      accessorKey: "name",
      header: "Biodata Name",
      cell: ({ row }) => (
        <TruncatedValue 
          value={row.original.name} 
          className="font-bold text-foreground" 
        />
      )
    },
    {
      accessorKey: "format",
      header: "Format",
      cell: ({ row }) => {
        const fmt = row.original.format.toLowerCase();
        return (
          <span className={cn(
            "text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border leading-none uppercase",
            fmt === "pdf"
              ? "bg-red-500/10 text-red-500 border-red-500/20"
              : "bg-blue-500/10 text-blue-500 border-blue-500/20"
          )}>
            {row.original.format}
          </span>
        );
      }
    },
    {
      accessorKey: "templateId",
      header: "Template Name",
      cell: ({ row }) => (
        <TruncatedValue 
          value={getTemplateName(row.original.templateId)} 
          className="font-bold text-muted-foreground" 
        />
      )
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => {
        const priceStr = getTemplatePrice(row.original.templateId, row.original.format);
        return (
          <span className={cn(
            "font-extrabold text-[10px] px-2 py-0.5 rounded border leading-none tracking-wide uppercase select-none",
            priceStr === "Free"
              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-950/20 dark:text-emerald-400"
              : "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-950/20 dark:text-amber-400"
          )}>
            {priceStr}
          </span>
        );
      }
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => {
        const loc = row.original.location;
        return loc ? (
          <div className="flex items-center gap-1 font-medium text-stone-600 dark:text-stone-300 max-w-full">
            <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <TruncatedValue value={loc} className="flex-1" />
          </div>
        ) : (
          <span className="text-stone-400 italic">Not Shared</span>
        );
      }
    },
    {
      id: "deviceIp",
      header: "Device / IP",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {getDeviceIcon(row.original.userAgent)}
          <span className="font-mono text-stone-500 text-[10px]" title={row.original.userAgent || ""}>
            {row.original.ipAddress || "0.0.0.0"}
          </span>
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "createdAt",
      header: "Downloaded At",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 font-medium text-muted-foreground">
          <Calendar className="w-3.5 h-3.5 text-stone-400" />
          <span>
            {formatISTDateTime(row.original.createdAt, {
              dateStyle: "short",
              timeStyle: "short"
            })}
          </span>
        </div>
      )
    },
    {
      id: "actions",
      header: () => <div className="text-right pr-4">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-end items-center gap-1 pr-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer">
                <Info className="w-3.5 h-3.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-3 border border-border bg-popover text-popover-foreground shadow-2xl rounded-lg text-xs space-y-2">
              <h4 className="font-bold text-foreground uppercase tracking-wide text-[10px]">User Agent Details</h4>
              <div className="p-2 rounded bg-muted/60 font-mono text-[10px] break-all max-h-24 overflow-y-auto leading-relaxed text-muted-foreground border border-border/40">
                {row.original.userAgent || "No client headers detected"}
              </div>
            </PopoverContent>
          </Popover>
          
          <Button 
            onClick={() => {
              setConfirmDeleteState({
                isOpen: true,
                title: "Purge Download Record",
                description: `Are you sure you want to permanently delete the download log for "${row.original.name}"? This action is irreversible and cannot be undone.`,
                onConfirm: async () => {
                  const loadingToast = toast.loading("Purging download record...");
                  try {
                    const res = await fetch(`/api/admin/downloads`, {
                      method: "DELETE",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ id: row.original.id }),
                    });
                    if (res.ok) {
                      toast.success("Download log successfully purged", { id: loadingToast });
                      queryClient.invalidateQueries({ queryKey: ["admin", "downloads"] });
                      refetch();
                    } else {
                      const data = await res.json();
                      toast.error(data.error || "Failed to delete log", { id: loadingToast });
                    }
                  } catch (err) {
                    console.error(err);
                    toast.error("An error occurred while deleting download record", { id: loadingToast });
                  }
                }
              });
            }}
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer rounded-lg"
            title="Delete Record"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
      enableSorting: false,
    }
  ], [templates]);

  const table = useReactTable({
    data: downloads,
    columns,
    state: {
      rowSelection,
    },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row, index) => String(index),
  });

  // Server-side CSV Exporter: Fetches all matched records ignoring page limits
  const exportCSV = async () => {
    setIsCsvExporting(true);
    try {
      const res = await fetch(
        `/api/admin/downloads?page=1&limit=100000&search=${encodeURIComponent(debouncedSearch)}&format=${formatFilter}&templateId=${templateFilter}`
      );
      if (!res.ok) throw new Error("Failed to compile CSV records");
      const data = await res.json();
      const allMatched = data.downloads || [];

      if (allMatched.length === 0) {
        toast.warning("No records available to export");
        return;
      }

      const headers = ["Log ID", "Biodata Name", "Format", "Template Name", "Price", "Location", "IP Address", "User Agent", "Downloaded At"];
      const rows = allMatched.map((log: DownloadLog) => [
        log.id,
        log.name,
        log.format.toUpperCase(),
        getTemplateName(log.templateId),
        getTemplatePrice(log.templateId, log.format),
        log.location || "N/A",
        log.ipAddress || "N/A",
        log.userAgent || "N/A",
        formatISTDateTime(log.createdAt)
      ]);

      const csvContent = [headers.join(","), ...rows.map((e: any[]) => e.map((val: any) => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `biodata99_downloads_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("CSV file downloaded successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to generate CSV export");
    } finally {
      setIsCsvExporting(false);
    }
  };

  return (
    <div className="space-y-6 text-foreground w-full">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <FileText className="w-8 h-8 text-primary" />
            Matrimonial Biodata Downloads
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-time operational audit log of matrimonial biodatas generated and downloaded by users.
          </p>
        </div>
      </div>

      {/* Control bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 border border-border rounded-xl shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search by ID, name, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-muted/40 border border-border focus:border-primary text-foreground rounded-lg pl-10 pr-3 py-2 text-xs outline-none placeholder:text-muted-foreground transition-all focus:ring-1 focus:ring-primary/30"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <Select defaultValue="all" onValueChange={(val) => setFormatFilter(val || "all")}>
            <SelectTrigger className="w-32 bg-muted/40 border-border text-foreground text-xs h-9 cursor-pointer">
              <SelectValue placeholder="Format" />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border text-popover-foreground text-xs">
              <SelectItem value="all">All Formats</SelectItem>
              <SelectItem value="jpg">Image (JPG)</SelectItem>
              <SelectItem value="pdf">PDF File</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all" onValueChange={(val) => setTemplateFilter(val || "all")}>
            <SelectTrigger className="w-44 bg-muted/40 border-border text-foreground text-xs h-9 cursor-pointer">
              <SelectValue placeholder="Template filter" />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border text-popover-foreground text-xs">
              <SelectItem value="all">All Templates</SelectItem>
              {templates.map(t => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            onClick={exportCSV}
            disabled={isCsvExporting}
            variant="outline" 
            size="sm" 
            className="h-9 bg-muted/20 border-border text-muted-foreground hover:text-foreground text-xs cursor-pointer flex gap-1.5 disabled:opacity-50"
          >
            {isCsvExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileSpreadsheet className="w-3.5 h-3.5 text-green-600" />}
            <span>Export CSV</span>
          </Button>
        </div>
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
              <span>Selected download records</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => {
                  setConfirmDeleteState({
                    isOpen: true,
                    title: `Purge ${selectedIds.length} Download Records`,
                    description: `Are you sure you want to permanently delete these ${selectedIds.length} download records? This action is irreversible and cannot be undone.`,
                    onConfirm: async () => {
                      const loadingToast = toast.loading(`Purging ${selectedIds.length} download records...`);
                      try {
                        const res = await fetch("/api/admin/downloads", {
                          method: "DELETE",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ ids: selectedIds }),
                        });
                        if (res.ok) {
                          toast.success(`Successfully purged ${selectedIds.length} download records`, { id: loadingToast });
                          setRowSelection({});
                          queryClient.invalidateQueries({ queryKey: ["admin", "downloads"] });
                          refetch();
                        } else {
                          const data = await res.json();
                          toast.error(data.error || "Failed to bulk delete records", { id: loadingToast });
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

      {/* Biodata list grid */}
      <Card className="bg-card border border-border rounded-xl overflow-hidden shadow-sm w-full">
        {isLoading && !downloadsData ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground font-semibold">Loading download records...</p>
          </div>
        ) : (
          <>
            <div className={cn("overflow-x-auto w-full transition-opacity duration-200", isFetching && "opacity-50")}>
              <table className="w-full text-left border-collapse text-xs table-fixed min-w-[900px]">
                <thead>
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id} className="border-b border-border bg-muted/25 text-muted-foreground font-bold uppercase tracking-wider">
                      {headerGroup.headers.map(header => {
                        let widthStyle = "";
                        if (header.id === "select") widthStyle = "w-[60px]";
                        else if (header.id === "id") widthStyle = "w-[120px]";
                        else if (header.id === "name") widthStyle = "w-[180px]";
                        else if (header.id === "format") widthStyle = "w-[100px]";
                        else if (header.id === "templateId") widthStyle = "w-[150px]";
                        else if (header.id === "price") widthStyle = "w-[100px]";
                        else if (header.id === "location") widthStyle = "w-[160px]";
                        else if (header.id === "deviceIp") widthStyle = "w-[180px]";
                        else if (header.id === "createdAt") widthStyle = "w-[170px]";
                        else if (header.id === "actions") widthStyle = "w-[100px]";

                        return (
                          <th 
                            key={header.id} 
                            className={cn("p-4 align-middle sticky top-0 z-10 bg-muted/95 backdrop-blur-xs font-bold text-left", widthStyle)}
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                          </th>
                        );
                      })}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-border/30 text-foreground/90">
                  {table.getRowModel().rows.length > 0 ? (
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
                      <td colSpan={columns.length} className="p-12 text-center text-muted-foreground font-bold uppercase tracking-wider">
                        No downloaded biodata logs found in database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Server-Side Pagination Bar */}
            {totalRecords > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border bg-muted/10 text-xs text-muted-foreground">
                {/* Left Side: Summary text */}
                <div>
                  Showing <span className="font-bold text-foreground">{Math.min((currentPage - 1) * pageSize + 1, totalRecords)}</span> to{" "}
                  <span className="font-bold text-foreground">{Math.min(currentPage * pageSize, totalRecords)}</span> of{" "}
                  <span className="font-bold text-foreground">{totalRecords}</span> records
                </div>

                {/* Right Side: Navigation buttons and rows selection */}
                <div className="flex flex-wrap items-center gap-4">
                  {/* Page Size Select */}
                  <div className="flex items-center gap-2">
                    <span>Rows per page:</span>
                    <Select value={String(pageSize)} onValueChange={(val) => {
                      setPageSize(Number(val));
                      setCurrentPage(1);
                    }}>
                      <SelectTrigger className="w-16 bg-muted/40 border-border text-foreground text-[11px] h-8 cursor-pointer">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border border-border text-popover-foreground text-xs">
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Navigation buttons */}
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="h-8 px-2.5 text-[11px] font-bold border border-border text-muted-foreground hover:text-foreground cursor-pointer disabled:opacity-50 bg-background flex items-center gap-1"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Previous</span>
                    </Button>

                    {/* Dynamic Page Buttons array */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber = i + 1;
                      if (currentPage > 3 && totalPages > 5) {
                        if (currentPage + 2 <= totalPages) {
                          pageNumber = currentPage - 2 + i;
                        } else {
                          pageNumber = totalPages - 4 + i;
                        }
                      }

                      return (
                        <Button
                          key={pageNumber}
                          variant={currentPage === pageNumber ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNumber)}
                          className={cn(
                            "h-8 w-8 text-[11px] font-bold border border-border cursor-pointer transition-colors",
                            currentPage === pageNumber 
                              ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                              : "text-muted-foreground hover:text-foreground bg-background"
                          )}
                        >
                          {pageNumber}
                        </Button>
                      );
                    })}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="h-8 px-2.5 text-[11px] font-bold border border-border text-muted-foreground hover:text-foreground cursor-pointer disabled:opacity-50 bg-background flex items-center gap-1"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

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
