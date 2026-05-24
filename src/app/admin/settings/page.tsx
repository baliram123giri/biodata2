"use client";

import * as React from "react";
import { 
  Settings as SettingsIcon, 
  Save, 
  Sliders, 
  Lock, 
  Database, 
  MessageSquare,
  Sparkles,
  RefreshCw,
  Check,
  Moon,
  Sun
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAdminThemeStore, type AdminTheme } from "@/store/useAdminThemeStore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminSettings() {
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const { theme, setTheme } = useAdminThemeStore();
  const [settings, setSettings] = React.useState({
    siteName: "biodata99.com",
    watermarkEnabled: true,
    watermarkType: "ganesha",
    allowFreeDownloads: true,
    whatsappApiEnabled: true,
    whatsAppToken: "••••••••••••••••••••••••••••••••",
    pdfMargin: "medium",
    maintenanceMode: false
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 1200);
  };

  return (
    <div className="space-y-6 text-foreground">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <SettingsIcon className="w-8 h-8 text-primary" />
            Application Settings
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Configure system settings, PDF defaults, branding watermarks and external API nodes.
          </p>
        </div>

        <Button 
          onClick={handleSave}
          disabled={loading}
          className="bg-primary hover:opacity-90 text-primary-foreground font-bold text-xs gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : success ? (
            <Check className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{loading ? "Saving Settings..." : success ? "Settings Saved!" : "Save Changes"}</span>
        </Button>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* General App Settings */}
          <Card className="p-5 sm:p-6 bg-card border border-border rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2 border-b border-border pb-3">
              <Sliders className="w-4.5 h-4.5 text-primary" />
              Branding & Layout Settings
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">Website Name</label>
                <input 
                  type="text" 
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  className="w-full bg-muted/40 border border-border focus:border-primary text-foreground rounded-lg px-3.5 py-2 text-xs outline-none transition-all focus:ring-1 focus:ring-primary/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">Default PDF Margin</label>
                <select 
                  value={settings.pdfMargin}
                  onChange={(e) => setSettings({ ...settings, pdfMargin: e.target.value })}
                  className="w-full bg-muted/40 border border-border focus:border-primary text-foreground rounded-lg px-3 py-2 text-xs outline-none transition-all cursor-pointer"
                >
                  <option value="narrow">Narrow (0.25 inch)</option>
                  <option value="medium">Medium (0.50 inch)</option>
                  <option value="wide">Wide (0.75 inch)</option>
                </select>
              </div>
            </div>

            <Separator className="bg-border/50 my-2" />

            {/* Custom Toggle Toggles */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-foreground">Enable Watermarks</h4>
                  <p className="text-[11px] text-muted-foreground">Apply a subtle background watermark to exported documents</p>
                </div>
                <input 
                  type="checkbox"
                  checked={settings.watermarkEnabled}
                  onChange={(e) => setSettings({ ...settings, watermarkEnabled: e.target.checked })}
                  className="w-4 h-4 accent-primary"
                />
              </div>

              {settings.watermarkEnabled && (
                <div className="pl-4 border-l border-border space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground">Watermark Asset Shape</label>
                  <select 
                    value={settings.watermarkType}
                    onChange={(e) => setSettings({ ...settings, watermarkType: e.target.value })}
                    className="w-56 bg-muted/40 border border-border focus:border-primary text-foreground rounded-lg px-3 py-1.5 text-xs outline-none transition-all cursor-pointer"
                  >
                    <option value="ganesha">Lord Ganesha Icon</option>
                    <option value="kalash">Kalash / Swastik Symbol</option>
                    <option value="wedding-knot">Marriage Knot / Ring</option>
                  </select>
                </div>
              )}

              <Separator className="bg-border/30" />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-foreground">Allow Free Downloads</h4>
                  <p className="text-[11px] text-muted-foreground">Users can export profiles in PDF format without paying</p>
                </div>
                <input 
                  type="checkbox"
                  checked={settings.allowFreeDownloads}
                  onChange={(e) => setSettings({ ...settings, allowFreeDownloads: e.target.checked })}
                  className="w-4 h-4 accent-primary"
                />
              </div>
            </div>
          </Card>

          {/* Console Theme Settings */}
          <Card className="p-5 sm:p-6 bg-card border border-border rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2 border-b border-border pb-3">
              <Sparkles className="w-4.5 h-4.5 text-primary" />
              Console Theme Settings
            </h3>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-foreground">Admin Panel Theme</h4>
                <p className="text-[11px] text-muted-foreground">Switch between light and dark themes for the administrator workspace</p>
              </div>

              <div className="w-full sm:w-56">
                <Select value={theme} onValueChange={(val) => setTheme(val as AdminTheme)}>
                  <SelectTrigger className="w-full bg-muted/40 border border-border text-foreground text-xs py-1.5 h-9 cursor-pointer">
                    <SelectValue placeholder="Select Theme" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border text-popover-foreground text-xs">
                    <SelectItem value="dark">
                      <span className="flex items-center gap-2 cursor-pointer">
                        <Moon className="w-3.5 h-3.5 text-primary" />
                        <span>Dark Theme</span>
                      </span>
                    </SelectItem>
                    <SelectItem value="light">
                      <span className="flex items-center gap-2 cursor-pointer">
                        <Sun className="w-3.5 h-3.5 text-primary" />
                        <span>Light Theme</span>
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* External Integrations */}
          <Card className="p-5 sm:p-6 bg-card border border-border rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2 border-b border-border pb-3">
              <MessageSquare className="w-4.5 h-4.5 text-primary" />
              WhatsApp & Notification Gateways
            </h3>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-foreground">Enable WhatsApp API Delivery</h4>
                <p className="text-[11px] text-muted-foreground">Send generated PDFs directly to users via WhatsApp</p>
              </div>
              <input 
                type="checkbox"
                checked={settings.whatsappApiEnabled}
                onChange={(e) => setSettings({ ...settings, whatsappApiEnabled: e.target.checked })}
                className="w-4 h-4 accent-primary"
              />
            </div>

            {settings.whatsappApiEnabled && (
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-muted-foreground">Meta API Access Token</label>
                <input 
                  type="password" 
                  value={settings.whatsAppToken}
                  onChange={(e) => setSettings({ ...settings, whatsAppToken: e.target.value })}
                  className="w-full bg-muted/40 border border-border focus:border-primary text-foreground rounded-lg px-3.5 py-2 text-xs outline-none transition-all focus:ring-1 focus:ring-primary/30"
                />
              </div>
            )}
          </Card>
        </div>

        {/* Right Side: Quick stats & Actions */}
        <div className="space-y-6">
          <Card className="p-5 sm:p-6 bg-card border border-border rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2 border-b border-border pb-3">
              <Database className="w-4.5 h-4.5 text-primary" />
              System Backup
            </h3>
            <p className="text-xs text-muted-foreground leading-normal">
              Back up the entire PostgreSQL database node, configurations, and custom watermark assets.
            </p>
            <Button variant="outline" size="sm" className="w-full bg-muted/20 border-border text-muted-foreground hover:text-foreground font-bold text-xs gap-1.5 cursor-pointer h-9">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Perform DB Backup</span>
            </Button>
          </Card>

          <Card className="p-5 sm:p-6 bg-card border border-destructive/20 rounded-xl space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2 border-b border-border/30 pb-3">
              <Lock className="w-4.5 h-4.5 text-primary" />
              Danger Console
            </h3>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-foreground">Maintenance Mode</h4>
                <p className="text-[11px] text-muted-foreground">Lock the public builder for updates</p>
              </div>
              <input 
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                className="w-4 h-4 accent-destructive"
              />
            </div>
            
            <Separator className="bg-border/30 my-2" />
            
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Warning Area</p>
            <Button className="w-full bg-destructive hover:bg-destructive/90 border-none font-bold text-xs text-destructive-foreground shadow-md cursor-pointer h-9">
              Flush Redis Cache Nodes
            </Button>
          </Card>
        </div>

      </form>
    </div>
  );
}
