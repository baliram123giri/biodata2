"use client";

import * as React from "react";
import { 
  FileText, 
  Search, 
  Trash2, 
  Download, 
  Eye, 
  MoreVertical,
  FileSpreadsheet,
  Loader2,
  Calendar,
  MapPin,
  Laptop,
  Smartphone,
  Info,
  ExternalLink
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";

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
}

export default function AdminBiodatas() {
  const queryClient = useQueryClient();
  const [isCsvExporting, setIsCsvExporting] = React.useState(false);
  
  // Filters state
  const [search, setSearch] = React.useState("");
  const [formatFilter, setFormatFilter] = React.useState("all");
  const [templateFilter, setTemplateFilter] = React.useState("all");

  // Server-side Pagination states
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

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
  const downloadsQueryKey = ["admin", "downloads", { currentPage, pageSize, search, formatFilter, templateFilter }];
  const { data: downloadsData, isLoading } = useQuery({
    queryKey: downloadsQueryKey,
    queryFn: async () => {
      const res = await fetch(
        `/api/admin/downloads?page=${currentPage}&limit=${pageSize}&search=${encodeURIComponent(search)}&format=${formatFilter}&templateId=${templateFilter}`
      );
      if (!res.ok) throw new Error("Failed to fetch download records");
      return res.json();
    },
    staleTime: Infinity, // Cache until page refresh
  });

  const downloads: DownloadLog[] = downloadsData?.downloads || [];
  const totalRecords = downloadsData?.total || 0;

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, formatFilter, templateFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this download log record? This action cannot be undone.")) return;

    try {
      const res = await fetch(`/api/admin/downloads?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Download log deleted successfully");
        queryClient.invalidateQueries({ queryKey: ["admin", "downloads"] });
      } else {
        toast.error(data.error || "Failed to delete log");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while deleting download record");
    }
  };

  const getTemplateName = (templateId: string | null) => {
    if (!templateId) return "Default / Custom";
    const found = templates.find(t => t.id === templateId);
    return found ? found.name : templateId.slice(0, 14);
  };

  const totalPages = Math.ceil(totalRecords / pageSize) || 1;

  // Server-side CSV Exporter: Fetches all matched records ignoring page limits
  const exportCSV = async () => {
    setIsCsvExporting(true);
    try {
      const res = await fetch(
        `/api/admin/downloads?page=1&limit=100000&search=${encodeURIComponent(search)}&format=${formatFilter}&templateId=${templateFilter}`
      );
      if (!res.ok) throw new Error("Failed to compile CSV records");
      const data = await res.json();
      const allMatched = data.downloads || [];

      if (allMatched.length === 0) {
        toast.warning("No records available to export");
        return;
      }

      const headers = ["Log ID", "Biodata Name", "Format", "Template Name", "Location", "IP Address", "User Agent", "Downloaded At"];
      const rows = allMatched.map((log: DownloadLog) => [
        log.id,
        log.name,
        log.format.toUpperCase(),
        getTemplateName(log.templateId),
        log.location || "N/A",
        log.ipAddress || "N/A",
        log.userAgent || "N/A",
        new Date(log.createdAt).toLocaleString()
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

  const getDeviceIcon = (ua: string | null) => {
    if (!ua) return <span title="Unknown client UA"><Laptop className="w-3.5 h-3.5 text-muted-foreground" /></span>;
    const lower = ua.toLowerCase();
    if (lower.includes("mobile") || lower.includes("android") || lower.includes("iphone")) {
      return <span title={ua}><Smartphone className="w-3.5 h-3.5 text-sky-500" /></span>;
    }
    return <span title={ua}><Laptop className="w-3.5 h-3.5 text-indigo-500" /></span>;
  };

  return (
    <div className="space-y-6 text-foreground">
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

      {/* Biodata list grid */}
      <Card className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground font-semibold">Loading download records...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/25 text-muted-foreground font-bold uppercase tracking-wider">
                    <th className="p-4 align-middle hidden sm:table-cell sticky top-0 z-10 bg-muted/95 backdrop-blur-xs">Log ID</th>
                    <th className="p-4 align-middle sticky top-0 z-10 bg-muted/95 backdrop-blur-xs">Biodata Name</th>
                    <th className="p-4 align-middle sticky top-0 z-10 bg-muted/95 backdrop-blur-xs">Format</th>
                    <th className="p-4 align-middle sticky top-0 z-10 bg-muted/95 backdrop-blur-xs">Template Name</th>
                    <th className="p-4 align-middle hidden md:table-cell sticky top-0 z-10 bg-muted/95 backdrop-blur-xs">Location</th>
                    <th className="p-4 align-middle hidden lg:table-cell sticky top-0 z-10 bg-muted/95 backdrop-blur-xs">Device / IP</th>
                    <th className="p-4 align-middle hidden sm:table-cell sticky top-0 z-10 bg-muted/95 backdrop-blur-xs">Downloaded At</th>
                    <th className="p-4 align-middle text-right sticky top-0 z-10 bg-muted/95 backdrop-blur-xs">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30 text-foreground/90">
                  <AnimatePresence mode="popLayout">
                    {downloads.length > 0 ? (
                      downloads.map((log) => (
                        <motion.tr 
                          key={log.id} 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="hover:bg-muted/10 transition-colors"
                        >
                          <td className="p-4 align-middle font-mono font-bold text-muted-foreground/80 text-[10px] hidden sm:table-cell" title={log.id}>
                            {log.id.slice(0, 8)}...
                          </td>
                          <td className="p-4 align-middle font-bold text-foreground">{log.name}</td>
                          <td className="p-4 align-middle">
                            <span className={cn(
                              "text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border leading-none uppercase",
                              log.format.toLowerCase() === "pdf"
                                ? "bg-red-500/10 text-red-500 border-red-500/20"
                                : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                            )}>
                              {log.format}
                            </span>
                          </td>
                          <td className="p-4 align-middle text-muted-foreground font-bold">{getTemplateName(log.templateId)}</td>
                          <td className="p-4 align-middle font-medium text-stone-600 dark:text-stone-300 hidden md:table-cell">
                            {log.location ? (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                                {log.location}
                              </span>
                            ) : (
                              <span className="text-stone-400 italic">Not Shared</span>
                            )}
                          </td>
                          <td className="p-4 align-middle hidden lg:table-cell">
                            <div className="flex items-center gap-2">
                              {getDeviceIcon(log.userAgent)}
                              <span className="font-mono text-stone-500 text-[10px]" title={log.userAgent || ""}>
                                {log.ipAddress || "0.0.0.0"}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 align-middle text-muted-foreground font-medium hidden sm:table-cell">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-stone-400" />
                              <span>
                                {new Date(log.createdAt).toLocaleString(undefined, {
                                  dateStyle: "short",
                                  timeStyle: "short"
                                })}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 align-middle text-right">
                            <div className="flex justify-end items-center gap-1">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer">
                                    <Info className="w-3.5 h-3.5" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-72 p-3 border border-border bg-popover text-popover-foreground shadow-2xl rounded-lg text-xs space-y-2">
                                  <h4 className="font-bold text-foreground uppercase tracking-wide text-[10px]">User Agent Details</h4>
                                  <div className="p-2 rounded bg-muted/60 font-mono text-[10px] break-all max-h-24 overflow-y-auto leading-relaxed text-muted-foreground border border-border/40">
                                    {log.userAgent || "No client headers detected"}
                                  </div>
                                </PopoverContent>
                              </Popover>
                              
                              <Button 
                                onClick={() => handleDelete(log.id)}
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer rounded-lg"
                                title="Delete Record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="p-12 text-center text-muted-foreground font-bold uppercase tracking-wider">
                          No downloaded biodata logs found in database.
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
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
                      className="h-8 text-[11px] font-bold border border-border text-muted-foreground hover:text-foreground cursor-pointer disabled:opacity-50 bg-background"
                    >
                      Previous
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
                      className="h-8 text-[11px] font-bold border border-border text-muted-foreground hover:text-foreground cursor-pointer disabled:opacity-50 bg-background"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
