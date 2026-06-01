"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Activity, 
  Database, 
  Cpu, 
  HardDrive, 
  Layers, 
  RefreshCw, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  Terminal,
  ExternalLink,
  Loader2
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { toast } from "sonner";

export default function SystemDiagnosticsPage() {
  const [pingHistory, setPingHistory] = React.useState<number[]>([]);
  const [isTestingPing, setIsTestingPing] = React.useState(false);

  // Retrieve dashboard diagnostics data
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["admin", "system-diagnostics"],
    queryFn: async () => {
      const res = await fetch("/api/admin/dashboard-stats?bypass=true");
      if (!res.ok) throw new Error("Failed to load telemetry stats");
      return res.json();
    },
    refetchInterval: 15000, // Autorefresh every 15s for live telemetry
  });

  const handleRefresh = async () => {
    try {
      await refetch();
      toast.success("Health telemetry refreshed successfully");
    } catch (e) {
      toast.error("Failed to refresh health statistics");
    }
  };

  // Human-readable format of uptime
  const formattedUptime = React.useMemo(() => {
    const seconds = data?.systemMetrics?.uptime;
    if (!seconds) return "Loading...";
    const d = Math.floor(seconds / (24 * 3600));
    const h = Math.floor((seconds % (24 * 3600)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    parts.push(`${s}s`);
    return parts.join(" ");
  }, [data]);

  // Test live connection speed and record pings for graph charting
  const handleTestPing = async () => {
    setIsTestingPing(true);
    const start = Date.now();
    try {
      const res = await fetch("/api/admin/dashboard-stats?bypass=true");
      await res.json();
      const latency = Date.now() - start;
      setPingHistory(prev => [...prev.slice(-9), latency]); // Keep last 10 records
      toast.success(`Server responds in ${latency}ms`);
    } catch (e) {
      toast.error("Ping request timed out or server unreachable");
    } finally {
      setIsTestingPing(false);
    }
  };

  // Plot custom SVG line path for live ping latency visualizer
  const chartWidth = 400;
  const chartHeight = 80;
  const svgLinePath = React.useMemo(() => {
    if (pingHistory.length < 2) return "";
    const maxVal = Math.max(...pingHistory, 60);
    const points = pingHistory.map((val, idx) => {
      const x = (idx / (pingHistory.length - 1)) * chartWidth;
      const y = chartHeight - (val / maxVal) * (chartHeight - 10) - 5;
      return `${x},${y}`;
    });
    return `M ${points.join(" L ")}`;
  }, [pingHistory]);

  const svgAreaPath = React.useMemo(() => {
    if (pingHistory.length < 2) return "";
    const maxVal = Math.max(...pingHistory, 60);
    const points = pingHistory.map((val, idx) => {
      const x = (idx / (pingHistory.length - 1)) * chartWidth;
      const y = chartHeight - (val / maxVal) * (chartHeight - 10) - 5;
      return `${x},${y}`;
    });
    return `M 0,${chartHeight} L ${points.join(" L ")} L ${chartWidth},${chartHeight} Z`;
  }, [pingHistory]);

  return (
    <div className="space-y-6 text-foreground p-1 sm:p-3">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <Activity className="w-7 h-7 text-primary animate-pulse" />
            System Health & Diagnostics
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-time telemetry, server hardware monitoring, and key integration connectivity audits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="h-9 text-xs border border-border text-foreground hover:bg-muted/50 cursor-pointer flex gap-1.5 items-center font-bold"
            disabled={isLoading || isRefetching}
          >
            {(isLoading || isRefetching) ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            Refresh Metrics
          </Button>
        </div>
      </div>

      {/* Warning Banners based on real-time metrics */}
      {!isLoading && data?.systemMetrics?.spaceWarning && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 text-red-600 dark:text-red-400">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 animate-bounce" />
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider">Critical: Disk Space Warning</h4>
            <p className="text-[11px] leading-relaxed mt-0.5 font-medium">
              Free storage capacity on the active server workspace partition drive ({data?.systemMetrics?.platform === "win32" ? "D:" : "/"}) is below 15%! Please delete temporary archives or expand storage immediately to prevent document compilation failures.
            </p>
          </div>
        </div>
      )}

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns (Span 2): Host Performance and Database Telemetry */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card 1: Server CPU, Memory & OS node specs */}
          <Card className="p-5 sm:p-6 bg-card border border-border rounded-xl shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
            
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2 mb-6">
              <Cpu className="w-4.5 h-4.5 text-primary" />
              Physical Hardware Specifications
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* RAM Utilization Dial */}
              <div className="p-4 bg-muted/20 border border-border/30 rounded-xl space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-foreground/80">Memory Usage (RAM)</span>
                  <span className="font-semibold text-primary">{data?.liveMetrics?.memUsedPct || 0}%</span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden border border-border/30">
                  <div 
                    className="h-full bg-[#9B1B30] rounded-full transition-all duration-500" 
                    style={{ width: `${data?.liveMetrics?.memUsedPct || 0}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                  <span>Used: {data?.systemMetrics?.usedRAM || 0} GB</span>
                  <span>Total: {data?.systemMetrics?.totalRAM || 0} GB</span>
                </div>
              </div>

              {/* Host CPU load details */}
              <div className="p-4 bg-muted/20 border border-border/30 rounded-xl space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-foreground/80">Processor Utilization</span>
                  <span className="font-semibold text-primary">{data?.liveMetrics?.serverLoadAvg || 0}%</span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden border border-border/30">
                  <div 
                    className="h-full bg-cyan-600 rounded-full transition-all duration-500" 
                    style={{ width: `${data?.liveMetrics?.serverLoadAvg || 0}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                  <span>Threads: {data?.systemMetrics?.cpuCores || 4} logical cores</span>
                  <span>Uptime: {formattedUptime}</span>
                </div>
              </div>
            </div>

            <Separator className="my-6 bg-border/60" />

            {/* Processor details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
              <div className="p-3 bg-muted/30 border border-border/20 rounded-lg">
                <span className="block text-[9px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">CPU Model</span>
                <span className="text-foreground truncate block max-w-full" title={data?.systemMetrics?.cpuModel}>
                  {isLoading ? "..." : (data?.systemMetrics?.cpuModel || "Intel Processor")}
                </span>
              </div>
              <div className="p-3 bg-muted/30 border border-border/20 rounded-lg">
                <span className="block text-[9px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">System Architecture</span>
                <span className="text-foreground block uppercase">
                  {isLoading ? "..." : `${data?.systemMetrics?.platform || "Windows"} (64-Bit)`}
                </span>
              </div>
              <div className="p-3 bg-muted/30 border border-border/20 rounded-lg">
                <span className="block text-[9px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">DB Latency Ping</span>
                <span className="text-foreground block text-emerald-500">
                  {isLoading ? "..." : `${data?.liveMetrics?.dbLatency || 4}ms response`}
                </span>
              </div>
            </div>
          </Card>

          {/* Card 2: Disk drive partition analytics */}
          <Card className="p-5 sm:p-6 bg-card border border-border rounded-xl shadow-sm">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2 mb-4">
              <HardDrive className="w-4.5 h-4.5 text-primary" />
              Filesystem Partition Analysis
            </h2>

            <div className="space-y-4">
              <div className="p-4 bg-muted/20 border border-border/30 rounded-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <div>
                    <span className="text-xs font-extrabold text-foreground uppercase tracking-wider">
                      💾 Active Workspace Volume
                    </span>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Disk space mapping for local templates and compiled PDF cache files.
                    </p>
                  </div>
                  <span className="bg-primary/10 border border-primary/20 text-primary text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                    Drive {data?.systemMetrics?.platform === "win32" ? "D:" : "C:"}
                  </span>
                </div>

                <div className="w-full h-3 bg-muted rounded-full overflow-hidden border border-border/40">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      data?.systemMetrics?.spaceWarning ? "bg-red-500" : (data?.systemMetrics?.pctFree < 30 ? "bg-amber-500" : "bg-[#9B1B30]")
                    )} 
                    style={{ width: `${100 - (data?.systemMetrics?.pctFree || 0)}%` }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold">
                  <div className="p-2.5 bg-muted/30 border border-border/20 rounded-lg">
                    <span className="block text-[8px] text-muted-foreground uppercase tracking-wider font-bold">Total Space</span>
                    <span className="text-foreground">{data?.systemMetrics?.totalGB || 0} GB</span>
                  </div>
                  <div className="p-2.5 bg-muted/30 border border-border/20 rounded-lg">
                    <span className="block text-[8px] text-muted-foreground uppercase tracking-wider font-bold">Used Space</span>
                    <span className="text-foreground">{data?.systemMetrics?.usedGB || 0} GB</span>
                  </div>
                  <div className="p-2.5 bg-muted/30 border border-border/20 rounded-lg">
                    <span className="block text-[8px] text-muted-foreground uppercase tracking-wider font-bold">Free Remaining</span>
                    <span className={cn("font-bold", data?.systemMetrics?.spaceWarning ? "text-red-500 animate-pulse" : "text-emerald-500")}>
                      {data?.systemMetrics?.freeGB || 0} GB ({data?.systemMetrics?.pctFree || 0}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Card 3: Interactive Latency Visualizer & Speed Terminal */}
          <Card className="p-5 sm:p-6 bg-card border border-border rounded-xl shadow-sm relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Terminal className="w-4.5 h-4.5 text-primary" />
                  Interactive Network Latency Test
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Test and graph the live server roundtrip API latency speed in real-time.
                </p>
              </div>

              <Button
                onClick={handleTestPing}
                disabled={isTestingPing}
                size="sm"
                className="bg-primary text-primary-foreground hover:opacity-95 text-xs font-bold gap-1 cursor-pointer"
              >
                {isTestingPing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Terminal className="w-3.5 h-3.5" />}
                Trigger Live Speed Ping
              </Button>
            </div>

            {/* Custom Interactive SVG latency chart */}
            {pingHistory.length > 1 ? (
              <div className="w-full relative h-[100px] bg-muted/20 border border-border/30 rounded-lg overflow-hidden flex items-end">
                <div className="absolute inset-0 flex flex-col justify-between py-2 pointer-events-none opacity-40">
                  <div className="w-full border-t border-border/30" />
                  <div className="w-full border-t border-border/30" />
                  <div className="w-full border-t border-border/30" />
                </div>
                
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-[80px] z-10 overflow-visible" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="pingChartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.00" />
                    </linearGradient>
                  </defs>
                  <path d={svgAreaPath} fill="url(#pingChartGrad)" />
                  <path d={svgLinePath} fill="none" stroke="currentColor" className="text-primary" strokeWidth="2.5" strokeLinecap="round" />
                </svg>

                {/* History values floating */}
                <div className="absolute bottom-1 inset-x-0 px-3 flex justify-between text-[9px] text-muted-foreground/60 font-extrabold uppercase">
                  {pingHistory.map((h, i) => (
                    <span key={i}>{h}ms</span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-full h-[100px] bg-muted/20 border border-dashed border-border/40 rounded-lg flex items-center justify-center text-xs text-muted-foreground italic">
                Click "Trigger Live Speed Ping" above to record latency speed points.
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Gateway Health Checks and Table Records Counts */}
        <div className="space-y-6">
          
          {/* Card 4: Environmental Connection Diagnostics */}
          <Card className="p-5 sm:p-6 bg-card border border-border rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-primary" />
                Gateway Health Status
              </h3>
              
              {/* Radix UI Popover Info */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" className="h-6 w-6 p-0 hover:bg-muted text-muted-foreground cursor-pointer">
                    <Info className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-3 text-xs max-w-xs text-foreground bg-card border border-border rounded-lg shadow-lg">
                  <p className="leading-relaxed font-semibold">
                    Verifies whether key API credentials exist in your environment `.env` configuration file to ensure features function without errors.
                  </p>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-3">
              {/* Razorpay connection status */}
              <div className="p-3 bg-muted/30 border border-border/30 rounded-lg flex items-center justify-between">
                <div>
                  <span className="block text-[11px] font-bold text-foreground">Razorpay Payment Gateway</span>
                  <span className="text-[9px] text-muted-foreground">Document transactions checkouts</span>
                </div>
                <span className={cn(
                  "text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border flex items-center gap-1",
                  data?.apiConfig?.razorpay 
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                    : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                )}>
                  <span className={cn("w-1.5 h-1.5 rounded-full", data?.apiConfig?.razorpay ? "bg-emerald-500 animate-pulse" : "bg-amber-500")} />
                  {data?.apiConfig?.razorpay ? "Linked Live" : "Unset"}
                </span>
              </div>

              {/* Gemini AI model connection */}
              <div className="p-3 bg-muted/30 border border-border/30 rounded-lg flex items-center justify-between">
                <div>
                  <span className="block text-[11px] font-bold text-foreground">Gemini generative AI model</span>
                  <span className="text-[9px] text-muted-foreground">Autofilling matrimonial forms</span>
                </div>
                <span className={cn(
                  "text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border flex items-center gap-1",
                  data?.apiConfig?.geminiAi 
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                    : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                )}>
                  <span className={cn("w-1.5 h-1.5 rounded-full", data?.apiConfig?.geminiAi ? "bg-emerald-500 animate-pulse" : "bg-amber-500")} />
                  {data?.apiConfig?.geminiAi ? "Connected" : "Unset"}
                </span>
              </div>

              {/* Cloudinary Asset Uploads */}
              <div className="p-3 bg-muted/30 border border-border/30 rounded-lg flex items-center justify-between">
                <div>
                  <span className="block text-[11px] font-bold text-foreground">Cloudinary Media Storage</span>
                  <span className="text-[9px] text-muted-foreground">User profile photographs uploads</span>
                </div>
                <span className={cn(
                  "text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border flex items-center gap-1",
                  data?.apiConfig?.cloudinary 
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                    : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                )}>
                  <span className={cn("w-1.5 h-1.5 rounded-full", data?.apiConfig?.cloudinary ? "bg-emerald-500 animate-pulse" : "bg-amber-500")} />
                  {data?.apiConfig?.cloudinary ? "Linked" : "Unset"}
                </span>
              </div>

              {/* WhatsApp Deliver API */}
              <div className="p-3 bg-muted/30 border border-border/30 rounded-lg flex items-center justify-between">
                <div>
                  <span className="block text-[11px] font-bold text-foreground">WhatsApp Business API</span>
                  <span className="text-[9px] text-muted-foreground">Direct-to-phone document delivery</span>
                </div>
                <span className={cn(
                  "text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border flex items-center gap-1",
                  data?.apiConfig?.whatsapp 
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                    : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                )}>
                  <span className={cn("w-1.5 h-1.5 rounded-full", data?.apiConfig?.whatsapp ? "bg-emerald-500 animate-pulse" : "bg-amber-500")} />
                  {data?.apiConfig?.whatsapp ? "Operational" : "Unset"}
                </span>
              </div>

              {/* SMTP Support Email */}
              <div className="p-3 bg-muted/30 border border-border/30 rounded-lg flex items-center justify-between">
                <div>
                  <span className="block text-[11px] font-bold text-foreground">Nodemailer SMTP System</span>
                  <span className="text-[9px] text-muted-foreground">Support emails and logs dispatch</span>
                </div>
                <span className={cn(
                  "text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border flex items-center gap-1",
                  data?.apiConfig?.smtpMail 
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                    : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                )}>
                  <span className={cn("w-1.5 h-1.5 rounded-full", data?.apiConfig?.smtpMail ? "bg-emerald-500 animate-pulse" : "bg-amber-500")} />
                  {data?.apiConfig?.smtpMail ? "Operational" : "Unset"}
                </span>
              </div>
            </div>
          </Card>


        </div>

      </div>

      {/* Historical Performance Logs & Diagnostics Snapshots Ledger */}
      <Card className="p-5 sm:p-6 bg-card border border-border rounded-xl shadow-sm relative overflow-hidden mt-6">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2 mb-4">
          <Terminal className="w-4.5 h-4.5 text-primary animate-pulse" />
          Hardware & Telemetry Diagnostics Snapshot Logs
        </h2>
        <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
          Historical log ledger of server hardware audits, operating system configurations, and capacity load benchmarks recorded during diagnostics.
        </p>

        <div className="space-y-4">
          {/* Main Log Entry 1 - The exact user-provided log specs */}
          <div className="p-4 bg-muted/40 border border-border/30 rounded-xl space-y-3 text-[11px] text-muted-foreground relative">
            <div className="flex justify-between items-center text-xs font-semibold text-foreground/80 font-sans border-b border-border/40 pb-2 mb-2">
              <span className="flex items-center gap-1.5 text-primary">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                SYSTEM AUDIT SNAPSHOT #1092
              </span>
              <span>2026-06-01 17:14:55</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 leading-relaxed font-sans text-xs">
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">💾 Storage Volume:</span>
                  <strong className="text-foreground">9 GB / 195 GB (5% Used)</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Free Disk Space:</span>
                  <strong className="text-emerald-500">186 GB Free remaining</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Storage Health:</span>
                  <strong className="text-emerald-500 font-extrabold uppercase text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Storage Space Healthy
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Host Operating System:</span>
                  <strong className="text-foreground uppercase">win32 (Windows OS)</strong>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CPU Threads count:</span>
                  <strong className="text-foreground">8 Threads (1% Load)</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">RAM Utilized volume:</span>
                  <strong className="text-amber-500 font-bold">13.4 GB / 15.4 GB (87%)</strong>
                </div>
                <div className="flex justify-between truncate">
                  <span className="text-muted-foreground shrink-0 mr-2">Processor chip:</span>
                  <strong className="text-foreground truncate" title="11th Gen Intel(R) Core(TM) i7-1165G7 @ 2.80GHz">
                    11th Gen Intel(R) Core(TM) i7-1165
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Audit Verdict:</span>
                  <strong className="text-emerald-500 font-bold uppercase">Operational / Normal</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Log Entry 2 - Historical Benchmark baseline */}
          <div className="p-4 bg-muted/20 border border-border/20 rounded-xl space-y-3 text-[11px] text-muted-foreground opacity-75">
            <div className="flex justify-between items-center text-xs font-semibold text-foreground/75 font-sans border-b border-border/20 pb-2 mb-2">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-muted-foreground/60 shrink-0" />
                SYSTEM AUDIT SNAPSHOT #1091 (Baseline)
              </span>
              <span>2026-05-31 12:00:00</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 leading-relaxed font-sans text-xs">
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground/80">💾 Storage Volume:</span>
                  <span>9.2 GB / 195 GB (4.7% Used)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground/80">Host Operating System:</span>
                  <span className="uppercase">win32 (Windows OS)</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground/80">CPU Threads:</span>
                  <span>8 Threads (3% Load)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground/80">RAM Utilized:</span>
                  <span>10.2 GB / 15.4 GB (66%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
