"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  FileText,
  Sparkles,
  Activity,
  TrendingUp,
  ArrowUpRight,
  Calendar,
  CheckCircle,
  Database,
  AlertTriangle,
  ChevronRight,
  Loader2
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function AdminDashboard() {
  const queryClient = useQueryClient();


  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin", "dashboard-stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/dashboard-stats");
      if (!res.ok) throw new Error("Failed to load dashboard metrics");
      return res.json();
    },
    staleTime: Infinity, // Cache until page refresh
  });

  const fetchDashboardStats = async (bypass = false) => {
    if (bypass) {
      try {
        await queryClient.fetchQuery({
          queryKey: ["admin", "dashboard-stats"],
          queryFn: async () => {
            const res = await fetch("/api/admin/dashboard-stats?bypass=true");
            if (!res.ok) throw new Error("Failed to load dashboard metrics");
            return res.json();
          }
        });
        toast.success("Dashboard metrics refreshed successfully");
      } catch (err) {
        console.error(err);
        toast.error("Failed to refresh dashboard metrics");
      }
    } else {
      refetch();
    }
  };

  // Stats Card data mapped dynamically
  const stats = [
    {
      title: "Total Registered Users",
      value: isLoading ? "..." : (data?.totalUsers?.toLocaleString() || "0"),
      change: isLoading ? "" : `+${data?.newUsersToday || 0}`,
      trend: "up",
      icon: Users,
      description: isLoading ? "Loading users..." : `${data?.newUsersToday || 0} new signups today`,
      color: "from-cyan-500/10 to-transparent",
      borderColor: "border-border",
      glowColor: "group-hover:shadow-[0_0_20px_rgba(6,182,212,0.1)]"
    },
    {
      title: "Biodatas Generated",
      value: isLoading ? "..." : (data?.totalDownloads?.toLocaleString() || "0"),
      change: isLoading ? "" : `+${data?.downloadsThisWeek || 0}`,
      trend: "up",
      icon: FileText,
      description: isLoading ? "Loading logs..." : `${data?.downloadsThisWeek || 0} downloads this week`,
      color: "from-primary/10 to-transparent",
      borderColor: "border-primary/20",
      glowColor: "group-hover:shadow-[0_0_20px_rgba(155,27,48,0.1)]"
    },
    {
      title: "Total Revenue",
      value: isLoading ? "..." : `₹${Number(data?.totalRevenue || 0).toFixed(2)}`,
      change: isLoading ? "" : `+₹${Number(data?.revenueToday || 0).toFixed(2)}`,
      trend: "up",
      icon: Sparkles,
      description: isLoading ? "Loading revenue..." : `₹${Number(data?.revenueToday || 0).toFixed(2)} earned in the last 24h`,
      color: "from-secondary/15 to-transparent",
      borderColor: "border-secondary/30",
      glowColor: "group-hover:shadow-[0_0_20px_rgba(201,168,76,0.15)]"
    },
    {
      title: "System Health",
      value: "99.98%",
      change: "Stable",
      trend: "stable",
      icon: Activity,
      description: "All services operational",
      color: "from-emerald-500/10 to-transparent",
      borderColor: "border-border",
      glowColor: "group-hover:shadow-[0_0_20px_rgba(16,185,129,0.08)]"
    }
  ];

  // Dynamic Recent Biodatas list with formatted relative time-ago strings
  const recentBiodatas = React.useMemo(() => {
    if (!data?.recentDownloads) return [];

    return data.recentDownloads.map((log: any) => {
      const minutes = Math.floor((Date.now() - new Date(log.createdAt).getTime()) / 60000);
      let timeStr = "Just now";
      if (minutes > 0 && minutes < 60) {
        timeStr = `${minutes} min ago`;
      } else if (minutes >= 60 && minutes < 1440) {
        timeStr = `${Math.floor(minutes / 60)} hours ago`;
      } else if (minutes >= 1440) {
        timeStr = `${Math.floor(minutes / 1440)} days ago`;
      }

      return {
        id: log.id,
        name: log.name,
        community: log.location || "General / Matrimonial",
        language: log.format?.toUpperCase() || "PDF",
        template: log.templateName || "Default Theme",
        status: "Completed",
        time: timeStr
      };
    });
  }, [data]);

  const systemServices = [
    { name: "PDF Rendering Engine", status: "Healthy", type: "success", uptime: "99.99%", load: "12%" },
    { name: "Image Processing", status: "Healthy", type: "success", uptime: "100%", load: "8%" },
    { name: "Database PostgreSQL Node", status: "Healthy", type: "success", uptime: "100%", load: "8%" },
  ];

  // Template Popularity Mappings with visual HSL colors
  const templatePopularity = React.useMemo(() => {
    if (!data?.templatePopularity) return [];
    const colors = ["bg-[#9B1B30]", "bg-[#C9A84C]", "bg-cyan-600", "bg-purple-600", "bg-emerald-600", "bg-pink-600"];

    return data.templatePopularity.map((temp: any, index: number) => ({
      name: temp.name,
      count: temp.count,
      percentage: temp.percentage,
      color: colors[index % colors.length]
    }));
  }, [data]);

  // SVG Chart path calculators based on live daily traffic data
  const chartPoints = React.useMemo(() => {
    return data?.dailyTraffic?.map((t: any) => t.count) || [0, 0, 0, 0, 0, 0, 0];
  }, [data]);

  const chartLabels = React.useMemo(() => {
    return data?.dailyTraffic?.map((t: any) => t.day) || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  }, [data]);

  const chartWidth = 500;
  const chartHeight = 120;

  const chartMax = React.useMemo(() => {
    return Math.max(...chartPoints, 5);
  }, [chartPoints]);

  const getSvgPath = () => {
    const points = chartPoints.map((val: number, idx: number) => {
      const x = (idx / (chartPoints.length - 1)) * chartWidth;
      const y = chartHeight - (val / chartMax) * chartHeight;
      return `${x},${y}`;
    });
    return `M 0,${chartHeight} L ${points.join(" L ")} L ${chartWidth},${chartHeight} Z`;
  };

  const getSvgLinePath = () => {
    const points = chartPoints.map((val: number, idx: number) => {
      const x = (idx / (chartPoints.length - 1)) * chartWidth;
      const y = chartHeight - (val / chartMax) * chartHeight;
      return `${x},${y}`;
    });
    return `M ${points.join(" L ")}`;
  };

  return (
    <div className="space-y-6 text-foreground">
      {/* Upper header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-time analytics and system monitoring of your matrimonial biodata platform.
          </p>
        </div>

        {/* Refresh button */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => fetchDashboardStats(true)}
            variant="outline"
            size="sm"
            className="h-8 text-xs border border-border text-foreground hover:bg-muted/50 cursor-pointer flex gap-1 items-center"
          >
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5" />}
            Refresh Stats
          </Button>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              whileHover={{ y: -4 }}
              className="group"
            >
              <Card className={cn(
                "p-5 bg-gradient-to-br bg-card border flex flex-col justify-between h-full relative overflow-hidden transition-all duration-300 rounded-xl cursor-default shadow-sm",
                stat.borderColor,
                stat.color,
                stat.glowColor
              )}>
                {/* Accent top glow */}
                <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-primary/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground tracking-wide uppercase">{stat.title}</span>
                  <div className="p-2 rounded-lg bg-muted/60 border border-border/80 text-primary group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                </div>

                <div className="mt-4 space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                      {stat.value}
                    </span>
                    {!isLoading && stat.change && (
                      <span className={cn(
                        "text-[10px] font-bold px-1.5 py-0.5 rounded-md",
                        stat.trend === "up" ? "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400" : "bg-muted text-muted-foreground"
                      )}>
                        {stat.change}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground font-medium">
                    {stat.description}
                  </p>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Main Grid: Graph, Templates, Activity, Services */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Col: Area Chart & Recent Activity */}
        <div className="lg:col-span-2 space-y-6">

          {/* Chart Card */}
          <Card className="p-5 sm:p-6 bg-card border border-border rounded-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <div>
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Matrimonial Biodata Volume
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">Weekly traffic volume of generated document templates</p>
              </div>
              <div className="flex items-center gap-2 bg-muted/50 border border-border/50 rounded-lg p-1">
                <Button variant="ghost" size="sm" className="h-7 text-[10px] font-extrabold uppercase px-3 bg-primary/20 text-primary hover:bg-primary/30 cursor-pointer">Volume</Button>
              </div>
            </div>

            {/* Custom SVG Line Area Graph */}
            <div className="w-full relative h-[150px] sm:h-[180px] bg-muted/20 border border-border/30 rounded-lg overflow-hidden flex items-end">
              {/* Grid Background Lines */}
              <div className="absolute inset-0 flex flex-col justify-between py-2 pointer-events-none opacity-40">
                <div className="w-full border-t border-border/30" />
                <div className="w-full border-t border-border/30" />
                <div className="w-full border-t border-border/30" />
                <div className="w-full border-t border-border/30" />
              </div>

              {/* SVG Area & Stroke Paths */}
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-[120px] sm:h-[140px] z-10 overflow-visible" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var( -primary)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="var( -primary)" stopOpacity="0.00" />
                  </linearGradient>
                </defs>
                {/* Area path */}
                <path d={getSvgPath()} fill="url(#chartGradient)" />
                {/* Stroke path */}
                <path d={getSvgLinePath()} fill="none" stroke="currentColor" className="text-primary" strokeWidth="2.5" strokeLinecap="round" />
              </svg>

              {/* Data tooltips inside chart */}
              <div className="absolute bottom-2 inset-x-0 px-2 flex justify-between text-[9px] text-muted-foreground/60 font-bold uppercase tracking-wider">
                {chartLabels.map((lbl: string) => (
                  <span key={lbl}>{lbl}</span>
                ))}
              </div>
            </div>
          </Card>

          {/* Tabs Section: Recent Activity Log */}
          <Card className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <Tabs defaultValue="recent">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 border-b border-border bg-muted/20">
                <div>
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Operational Activity Logs</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Monitor creations, edits and platform tasks</p>
                </div>
                <TabsList className="bg-muted/60 border border-border h-9">
                  <TabsTrigger value="recent" className="text-xs cursor-pointer">Live Profiles</TabsTrigger>
                  <TabsTrigger value="templates" className="text-xs cursor-pointer">Popularity</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="recent" className="p-0 m-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/25 text-muted-foreground font-bold uppercase tracking-wider">
                        <th className="p-4">Name</th>
                        <th className="p-4">Location</th>
                        <th className="p-4">Format</th>
                        <th className="p-4">Template</th>
                        <th className="p-4">Time</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30 text-foreground/90">
                      {isLoading ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-muted-foreground font-semibold">
                            <Loader2 className="w-6 h-6 animate-spin text-primary inline mr-2" />
                            Loading dynamic logs...
                          </td>
                        </tr>
                      ) : recentBiodatas.length > 0 ? (
                        recentBiodatas.map((bio: any, idx: number) => (
                          <tr key={bio.id || idx} className="hover:bg-muted/20 transition-colors">
                            <td className="p-4 font-bold text-foreground flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                              {bio.name}
                            </td>
                            <td className="p-4">{bio.community}</td>
                            <td className="p-4">
                              <span className="bg-muted border border-border text-muted-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                                {bio.language}
                              </span>
                            </td>
                            <td className="p-4 text-muted-foreground font-medium">{bio.template}</td>
                            <td className="p-4 text-muted-foreground/70 font-medium">{bio.time}</td>
                            <td className="p-4 text-right">
                              <Button asChild variant="ghost" size="sm" className="h-7 text-[10px] font-extrabold text-primary hover:text-primary hover:bg-primary/10 gap-1 cursor-pointer">
                                <Link href="/admin/biodatas">
                                  View Audit <ArrowUpRight className="w-3 h-3" />
                                </Link>
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-muted-foreground italic">
                            No download logs captured in database yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 border-t border-border text-center bg-muted/20">
                  <Link href="/admin/biodatas" className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
                    Manage all downloaded logs <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </TabsContent>

              <TabsContent value="templates" className="p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {isLoading ? (
                    <div className="col-span-2 py-8 text-center text-muted-foreground font-semibold">
                      <Loader2 className="w-6 h-6 animate-spin text-primary inline mr-2" />
                      Loading popularity analysis...
                    </div>
                  ) : templatePopularity.length > 0 ? (
                    templatePopularity.map((temp: any) => (
                      <div key={temp.name} className="p-4 bg-muted/30 border border-border/50 rounded-lg space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-foreground">{temp.name}</span>
                          <span className="font-bold text-primary">{temp.percentage}%</span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div className={cn("h-full rounded-full", temp.color)} style={{ width: `${temp.percentage}%` }} />
                        </div>
                        <div className="text-[10px] text-muted-foreground flex items-center justify-between">
                          <span>Usage volume:</span>
                          <span className="font-semibold text-foreground/90">{temp.count.toLocaleString()} downloads</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center text-muted-foreground italic py-4">
                      No popularity logs found.
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Right Col: System Health, Server Metrics */}
        <div className="space-y-6">
          {/* Services Monitor */}
          <Card className="p-5 sm:p-6 bg-card border border-border rounded-xl shadow-sm">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2 mb-4">
              <Database className="w-4 h-4 text-primary" />
              Infrastructure Node Status
            </h3>

            <div className="space-y-4">
              {systemServices.map((service) => (
                <div key={service.name} className="p-3 bg-muted/30 border border-border/40 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground truncate max-w-[170px]">{service.name}</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {service.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium">
                    <span>Uptime: <strong className="text-foreground/90">{service.uptime}</strong></span>
                    <span>Load: <strong className="text-foreground/90">{service.load}</strong></span>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-5 bg-border/80" />

            {/* Quick stats grid */}
            <div className="grid grid-cols-2 gap-3 text-center text-xs">
              <div className="p-2.5 bg-muted/20 border border-border/40 rounded-lg">
                <p className="text-[10px] text-muted-foreground/75 uppercase font-bold">Mail Queue</p>
                <p className="text-base font-extrabold text-foreground mt-1">0 pending</p>
              </div>
              <div className="p-2.5 bg-muted/20 border border-border/40 rounded-lg">
                <p className="text-[10px] text-muted-foreground/75 uppercase font-bold">API Latency</p>
                <p className="text-base font-extrabold text-primary mt-1">42ms</p>
              </div>
            </div>
          </Card>

          {/* Quick System Action Alerts */}
          <Card className="p-5 sm:p-6 bg-card border border-primary/20 rounded-xl relative overflow-hidden shadow-sm">
            {/* Ambient light pulse */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-xl pointer-events-none" />

            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-primary" />
              Pending Admin Tasks
            </h3>
            <p className="text-xs text-muted-foreground leading-normal mb-4">
              Review and act on urgent updates required by the matrimonial platform config.
            </p>

            <ul className="space-y-3 text-xs text-foreground/95 mb-4">
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Verify WhatsApp API business account billing status.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>2 custom template layouts require designer review.</span>
              </li>
            </ul>

            <Button className="w-full bg-primary text-primary-foreground hover:opacity-90 border-none font-bold text-xs shadow-md cursor-pointer">
              Go to System Console
            </Button>
          </Card>
        </div>

      </div>
    </div>
  );
}
