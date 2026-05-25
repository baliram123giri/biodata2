"use client";

import * as React from "react";
import { 
  BarChart3, 
  Calendar, 
  Sparkles,
  Download,
  Activity
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export default function AdminAnalytics() {
  // Chart calculation metrics
  const languageData = [
    { name: "Hindi", percentage: 42, color: "fill-[var(--chart-1)]" },
    { name: "Marathi", percentage: 28, color: "fill-[var(--chart-2)]" },
    { name: "Gujarati", percentage: 15, color: "fill-[var(--chart-3)]" },
    { name: "English", percentage: 10, color: "fill-[var(--chart-4)]" },
    { name: "Others", percentage: 5, color: "fill-[var(--chart-5)]" },
  ];

  const communityData = [
    { name: "Maratha", count: 14200, percentage: 31 },
    { name: "Brahmin", count: 10500, percentage: 23 },
    { name: "Patidar", count: 8700, percentage: 19 },
    { name: "Goswami", count: 6800, percentage: 15 },
    { name: "Jain", count: 5600, percentage: 12 },
  ];

  return (
    <div className="space-y-6 text-foreground">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-primary" />
            Analytics Insights
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Detailed distribution graphs and user metrics on generated shadi profiles.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-card p-1.5 rounded-lg border border-border self-start sm:self-auto">
          <Calendar className="w-4 h-4 text-primary ml-2" />
          <Select defaultValue="30d">
            <SelectTrigger className="h-8 border-none bg-transparent hover:bg-muted/50 text-foreground text-xs py-0 pl-1">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border text-popover-foreground text-xs">
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 3 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-5 bg-card border border-border rounded-xl space-y-4 shadow-sm">
          <div className="flex justify-between items-center text-xs text-muted-foreground uppercase font-bold tracking-wider">
            <span>Conversion Ratio</span>
            <Sparkles className="w-4.5 h-4.5 text-primary" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-foreground">8.42%</div>
            <p className="text-[11px] text-muted-foreground mt-1">+1.1% improvement this period</p>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full" style={{ width: "8.42%" }} />
          </div>
        </Card>

        <Card className="p-5 bg-card border border-border rounded-xl space-y-4 shadow-sm">
          <div className="flex justify-between items-center text-xs text-muted-foreground uppercase font-bold tracking-wider">
            <span>WhatsApp Share Success</span>
            <Activity className="w-4.5 h-4.5 text-primary" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-foreground">96.8%</div>
            <p className="text-[11px] text-muted-foreground mt-1">Direct attachment delivery gateway active</p>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: "96.8%" }} />
          </div>
        </Card>

        <Card className="p-5 bg-card border border-border rounded-xl space-y-4 shadow-sm">
          <div className="flex justify-between items-center text-xs text-muted-foreground uppercase font-bold tracking-wider">
            <span>Total Export Operations</span>
            <Download className="w-4.5 h-4.5 text-primary" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-foreground">52,890</div>
            <p className="text-[11px] text-muted-foreground mt-1">PDF downloads + JPG + Word exports</p>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-cyan-500 rounded-full" style={{ width: "78%" }} />
          </div>
        </Card>
      </div>

      {/* SVG Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Language Popularity Doughnut / Polar Chart */}
        <Card className="p-5 sm:p-6 bg-card border border-border rounded-xl space-y-6 shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Languages Share Distribution</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Most common languages chosen for shadi biodata forms</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 items-center">
            {/* SVG Pie Representation */}
            <div className="relative w-40 h-40">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {/* 42% Hindi */}
                <circle cx="50" cy="50" r="40" stroke="var(--chart-1)" strokeWidth="15" strokeDasharray="105.5 251.2" strokeDashoffset="0" fill="none" />
                {/* 28% Marathi */}
                <circle cx="50" cy="50" r="40" stroke="var(--chart-2)" strokeWidth="15" strokeDasharray="70.3 251.2" strokeDashoffset="-105.5" fill="none" />
                {/* 15% Gujarati */}
                <circle cx="50" cy="50" r="40" stroke="var(--chart-3)" strokeWidth="15" strokeDasharray="37.7 251.2" strokeDashoffset="-175.8" fill="none" />
                {/* 10% English */}
                <circle cx="50" cy="50" r="40" stroke="var(--chart-4)" strokeWidth="15" strokeDasharray="25.1 251.2" strokeDashoffset="-213.5" fill="none" />
                {/* 5% Others */}
                <circle cx="50" cy="50" r="40" stroke="var(--chart-5)" strokeWidth="15" strokeDasharray="12.6 251.2" strokeDashoffset="-238.6" fill="none" />
              </svg>
              <div className="absolute inset-0 flex flex-col justify-center items-center">
                <span className="text-xl font-extrabold text-foreground">42%</span>
                <span className="text-[9px] text-muted-foreground uppercase font-bold">Hindi Lead</span>
              </div>
            </div>

            {/* Labels and legends */}
            <div className="flex-1 w-full space-y-2">
              {languageData.map((lang) => (
                <div key={lang.name} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <svg className="w-3 h-3 rounded" viewBox="0 0 10 10">
                      <rect width="10" height="10" className={lang.color} rx="2" />
                    </svg>
                    <span className="text-foreground/80 font-medium">{lang.name}</span>
                  </div>
                  <span className="font-bold text-foreground">{lang.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Communities seeking matches */}
        <Card className="p-5 sm:p-6 bg-card border border-border rounded-xl space-y-6 shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Top Communities Active</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Most common caste tags typed in biological profile forms</p>
          </div>

          <div className="space-y-4">
            {communityData.map((com) => (
              <div key={com.name} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-foreground/80">{com.name}</span>
                  <span className="font-bold text-foreground">{com.count.toLocaleString()}</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full" style={{ width: `${com.percentage * 2.5}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </div>
  );
}
