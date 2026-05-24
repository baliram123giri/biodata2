"use client";

import * as React from "react";
import { 
  LayoutGrid, 
  Settings, 
  Eye, 
  EyeOff, 
  Plus, 
  TrendingUp 
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AdminTemplates() {
  const [templates, setTemplates] = React.useState([
    { id: "T-01", name: "Royal Crimson", type: "Premium", active: true, count: 18450, color: "bg-[#9B1B30] text-white" },
    { id: "T-02", name: "Classic Gold", type: "Premium", active: true, count: 12830, color: "bg-[#C9A84C] text-[#1A0A0E]" },
    { id: "T-03", name: "Warm Sand", type: "Standard", active: true, count: 9120, color: "bg-amber-100 text-slate-800" },
    { id: "T-04", name: "Deep Teal", type: "Standard", active: true, count: 8250, color: "bg-cyan-700 text-white" },
    { id: "T-05", name: "Royal Purple", type: "Premium", active: true, count: 6290, color: "bg-purple-700 text-white" },
    { id: "T-06", name: "Emerald Grace", type: "Premium", active: false, count: 0, color: "bg-emerald-800 text-white" },
  ]);

  const toggleStatus = (id: string) => {
    setTemplates(templates.map(t => t.id === id ? { ...t, active: !t.active } : t));
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
            Toggle visibility, adjust category status, and preview matrimonial layout skins.
          </p>
        </div>
        
        <Button className="bg-primary hover:opacity-90 text-primary-foreground font-bold text-xs gap-1.5 self-start sm:self-auto cursor-pointer">
          <Plus className="w-4 h-4" />
          <span>Upload Layout Template</span>
        </Button>
      </div>

      {/* Templates grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((temp) => (
          <Card key={temp.id} className="bg-card border border-border rounded-xl overflow-hidden flex flex-col justify-between shadow-sm">
            
            {/* Header info / mock skin preview */}
            <div className="p-5 flex-1 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-base text-foreground">{temp.name}</h3>
                  <span className="text-[10px] text-muted-foreground font-mono">ID: {temp.id}</span>
                </div>
                <span className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                  temp.type === "Premium" 
                    ? "bg-secondary/20 text-secondary-foreground border-secondary/30" 
                    : "bg-muted text-muted-foreground border-border"
                )}>
                  {temp.type}
                </span>
              </div>

              {/* Mock design representation */}
              <div className="w-full h-32 rounded-lg bg-muted/40 border border-border/50 flex items-center justify-center relative overflow-hidden group">
                <div className={cn("w-20 h-28 rounded shadow-lg flex flex-col justify-between p-2 text-[5px]", temp.color)}>
                  <div className="border-b border-white/20 pb-1 font-bold text-center">BIODATA</div>
                  <div className="space-y-1 py-1">
                    <div className="h-1.5 w-12 bg-white/30 rounded" />
                    <div className="h-1.5 w-14 bg-white/20 rounded" />
                    <div className="h-1.5 w-10 bg-white/20 rounded" />
                  </div>
                  <div className="h-2 w-full bg-white/25 rounded" />
                </div>

                <div className="absolute inset-0 bg-background/85 backdrop-blur-xs opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity duration-200">
                  <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold text-primary hover:bg-muted cursor-pointer">
                    <Eye className="w-3.5 h-3.5 mr-1" /> Preview
                  </Button>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-medium">Monthly Share Count:</span>
                <span className="font-bold text-foreground flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-primary" />
                  {temp.count.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="p-4 border-t border-border bg-muted/40 flex gap-2">
              <Button 
                onClick={() => toggleStatus(temp.id)}
                variant="ghost" 
                className={cn(
                  "flex-1 text-xs font-bold gap-1.5 cursor-pointer h-9",
                  temp.active 
                    ? "text-primary hover:bg-primary/10" 
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

              <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer">
                <Settings className="w-4 h-4" />
                <span className="sr-only">Edit Settings</span>
              </Button>
            </div>

          </Card>
        ))}
      </div>
    </div>
  );
}
