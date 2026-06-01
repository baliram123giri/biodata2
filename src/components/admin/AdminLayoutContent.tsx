"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  LayoutGrid, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  Bell, 
  Search, 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  Activity, 
  UserCircle2,
  ShieldAlert,
  Moon,
  Sun,
  Laptop,
  Sparkles,
  BookOpen,
  Tag,
  CreditCard,
  Smile
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/layout/Logo";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminThemeStore } from "@/store/useAdminThemeStore";
import { useSession, signOut } from "next-auth/react";

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const sidebarItems: SidebarItem[] = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Biodatas", href: "/admin/biodatas", icon: FileText, badge: "New" },
  { name: "Transactions", href: "/admin/transactions", icon: CreditCard },
  { name: "User Directory", href: "/admin/users", icon: Users },
  { name: "Templates Config", href: "/admin/templates", icon: LayoutGrid },
  { name: "Coupons", href: "/admin/coupons", icon: Tag },
  { name: "Hero Section", href: "/admin/hero-slides", icon: Sparkles },
  { name: "Blog Posts", href: "/admin/blog", icon: BookOpen },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];


export function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("admin-sidebar-collapsed");
      if (stored === "true") setCollapsed(true);
    }
  }, []);

  const toggleCollapsed = () => {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem("admin-sidebar-collapsed", String(next));
      return next;
    });
  };
  const { theme, setTheme } = useAdminThemeStore();
  const [mounted, setMounted] = React.useState(false);
  const { data: session, status } = useSession();
  const checkingAuth = status === "loading";

  const [notifications, setNotifications] = React.useState([
    { id: 1, title: "New Biodata Created", text: "Rahul Sharma created a new biodata.", time: "2 min ago", unread: true },
    { id: 2, title: "System Update", text: "PDF generator engine updated to v2.4.", time: "1 hour ago", unread: true },
    { id: 3, title: "Payment Received", text: "Subscription renewal for Vikram Patil.", time: "5 hours ago", unread: false },
  ]);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme, mounted]);

  React.useEffect(() => {
    if (!mounted || status === "loading") return;

    if (pathname === "/admin/login") {
      if (status === "authenticated") {
        router.push("/admin");
      }
      return;
    }

    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [mounted, status, pathname, router]);

  const hasUnread = notifications.some((n) => n.unread);

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, unread: false })));
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/admin/login" });
  };

  const activeItem = sidebarItems.find(item => item.href === pathname) || sidebarItems[0];

  const getBreadcrumbs = () => {
    const paths = pathname.split("/").filter(Boolean);
    return paths.map((path, index) => {
      const href = "/" + paths.slice(0, index + 1).join("/");
      const label = path.charAt(0).toUpperCase() + path.slice(1);
      const isLast = index === paths.length - 1;
      return { href, label, isLast };
    });
  };

  const breadcrumbs = getBreadcrumbs();

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex flex-col h-full bg-card border-r border-border text-foreground transition-all duration-300 relative">
      
      {/* Persist Sidebar toggle collapse/expand button (Desktop only) */}
      {!isMobile && (
        <button
          onClick={toggleCollapsed}
          className="absolute -right-3 top-8 z-50 h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted shadow-sm cursor-pointer flex transition-transform duration-200"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      )}

      {/* Brand logo & panel label */}
      <div className={cn(
        "border-b border-border flex flex-col justify-center transition-all duration-300",
        (collapsed && !isMobile) ? "p-3 h-16 items-center" : "p-6"
      )}>
        {(collapsed && !isMobile) ? (
          <span className="font-heading text-base font-black tracking-wider text-primary">B99</span>
        ) : (
          <div className="flex items-center justify-between w-full">
            <Link href="/" className="flex items-center gap-2">
              <Logo iconClassName="h-16 w-auto" disableShine />
            </Link>
            <span className="bg-gradient-to-r from-[#C9A84C] to-[#E6C97A] text-[#1A0A0E] text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider shadow-sm shadow-[#C9A84C]/25 border border-[#E6C97A]/30">
              Admin
            </span>
          </div>
        )}
      </div>

      {/* Navigation list */}
      <nav className={cn(
        "flex-1 py-6 space-y-1.5 overflow-y-auto overflow-x-hidden transition-all duration-300",
        (collapsed && !isMobile) ? "px-2" : "px-4"
      )}>
        {(!collapsed || isMobile) ? (
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 mb-3 truncate">
            Core Operations
          </div>
        ) : (
          <div className="border-t border-border/40 my-2 mx-1" />
        )}
        {sidebarItems.map((item) => {
          const isActive = item.href === "/admin" 
            ? pathname === "/admin" 
            : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              title={(collapsed && !isMobile) ? item.name : undefined}
              className={cn(
                "group flex items-center rounded-lg text-sm font-medium transition-all duration-200 relative",
                (collapsed && !isMobile) ? "justify-center p-2.5" : "justify-between px-3 py-2.5",
                isActive
                  ? "bg-primary/10 text-primary border-l-2 border-primary shadow-[inset_4px_0_12px_rgba(155,27,48,0.03)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border-l-2 border-transparent"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn(
                  "w-4.5 h-4.5 transition-colors duration-200 shrink-0",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )} />
                {(!collapsed || isMobile) && <span>{item.name}</span>}
              </div>
              
              {(!collapsed || isMobile) && item.badge && (
                <span className={cn(
                  "text-[10px] font-semibold px-2 py-0.5 rounded-full tracking-wider uppercase",
                  isActive
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-muted text-muted-foreground border border-border"
                )}>
                  {item.badge}
                </span>
              )}

              {(collapsed && !isMobile) && item.badge && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer User Profile & Actions */}
      <div className={cn(
        "border-t border-border bg-muted/20 flex flex-col gap-3 transition-all duration-300",
        (collapsed && !isMobile) ? "p-2 py-4 items-center" : "p-4"
      )}>
        {(collapsed && !isMobile) ? (
          <div className="relative" title={`${session?.user?.name || 'Admin'} (${session?.user?.email || 'admin@biodata99.com'})`}>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#9B1B30] to-[#C9A84C] flex items-center justify-center font-bold text-white shadow-md text-xs">
              {getInitials(session?.user?.name, "AD")}
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-card rounded-full" />
          </div>
        ) : (
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#9B1B30] to-[#C9A84C] flex items-center justify-center font-bold text-white shadow-md">
                {getInitials(session?.user?.name, "AD")}
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-card rounded-full" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{session?.user?.name || "Admin Account"}</p>
              <p className="text-[10px] text-muted-foreground truncate">{session?.user?.email || "admin@biodata99.com"}</p>
            </div>
          </div>
        )}

        {(!collapsed || isMobile) && <Separator className="bg-border" />}

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className={cn(
            "w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-2 transition-colors cursor-pointer",
            (collapsed && !isMobile) ? "justify-center p-2" : "justify-start"
          )}
          title="Sign Out"
        >
          <LogOut className="w-4.5 h-4.5" />
          {(!collapsed || isMobile) && <span>Sign Out</span>}
        </Button>
      </div>
    </div>
  );

  // Avoid SSR hydration issues by checking mounted state
  const wrapperThemeClass = mounted ? theme : "dark";

  if (mounted && checkingAuth) {
    return (
      <div className={cn(
        "min-h-screen bg-background text-foreground flex items-center justify-center font-sans antialiased selection:bg-primary/30 selection:text-foreground transition-colors duration-250 relative overflow-hidden",
        wrapperThemeClass
      )}>
        {/* Background ambient theme-based glows */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-primary/5 to-transparent rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-primary/3 to-transparent rounded-full blur-[150px] pointer-events-none" />
        <div className="flex flex-col items-center gap-4 text-center z-10">
          <Logo iconClassName="h-16 w-auto" disableShine />
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest mt-4">
            <svg className="animate-spin h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Verifying session...</span>
          </div>
        </div>
      </div>
    );
  }

  if (pathname === "/admin/login") {
    return (
      <div className={cn(
        "admin-panel min-h-screen bg-background text-foreground flex items-center justify-center font-sans antialiased selection:bg-primary/30 selection:text-foreground transition-colors duration-250 relative overflow-hidden",
        wrapperThemeClass
      )}>
        {/* Background ambient theme-based glows */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-primary/5 to-transparent rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-primary/3 to-transparent rounded-full blur-[150px] pointer-events-none" />
        {children}
      </div>
    );
  }

  return (
    <div className={cn(
      "admin-panel h-screen overflow-hidden bg-background text-foreground flex font-sans antialiased selection:bg-primary/30 selection:text-foreground transition-colors duration-250",
      wrapperThemeClass
    )}>
      {/* Background ambient theme-based glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-primary/5 to-transparent rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-primary/3 to-transparent rounded-full blur-[150px] pointer-events-none" />

      {/* Persistent Sidebar (Desktop) */}
      <aside className={cn(
        "hidden lg:block h-screen sticky top-0 shrink-0 z-30 transition-all duration-300 ease-in-out",
        collapsed ? "w-20" : "w-64"
      )}>
        <SidebarContent />
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border/70 bg-background/80 backdrop-blur-md px-4 sm:px-6 shadow-sm transition-colors duration-250">
          {/* Left Side: Mobile Menu Trigger & Breadcrumbs */}
          <div className="flex items-center gap-3">
            {/* Mobile Sheet Trigger */}
            <div className="lg:hidden">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Sidebar</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64 border-r border-border bg-card">
                  <SheetHeader className="sr-only">
                    <SheetTitle>Admin Navigation Menu</SheetTitle>
                  </SheetHeader>
                  <SidebarContent isMobile />
                </SheetContent>
              </Sheet>
            </div>

            {/* Breadcrumbs */}
            <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Link href="/admin" className="hover:text-foreground transition-colors">
                Console
              </Link>
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={crumb.href}>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                  {crumb.isLast ? (
                    <span className="text-primary font-semibold truncate max-w-[120px]">{crumb.label}</span>
                  ) : (
                    <Link href={crumb.href} className="hover:text-foreground transition-colors truncate max-w-[120px]">
                      {crumb.label}
                    </Link>
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>

          {/* Right Side Actions: Search, Theme Toggle, Notifications, Profile Popovers */}
          <div className="flex items-center gap-2.5">
            {/* Glassmorphic Search Bar */}
            <div className="relative hidden md:block w-56 lg:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search console..."
                className="w-full bg-muted/40 border border-border/60 hover:border-primary/40 focus:border-primary text-foreground rounded-lg pl-9 pr-3 py-1.5 text-xs outline-none placeholder:text-muted-foreground/75 transition-all focus:ring-1 focus:ring-primary/30"
              />
            </div>

            {/* Quick Theme Toggle Button */}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer"
                title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {theme === "dark" ? (
                  <Sun className="h-4.5 w-4.5 text-primary" />
                ) : (
                  <Moon className="h-4.5 w-4.5 text-primary" />
                )}
              </Button>
            )}

            {/* Notification Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted/50 relative cursor-pointer">
                  <Bell className="h-4.5 w-4.5" />
                  {hasUnread && (
                    <span className="absolute top-2 right-2 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                  )}
                  <span className="sr-only">Notifications</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 border border-border bg-popover text-popover-foreground shadow-2xl rounded-xl">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <h3 className="font-bold text-sm text-foreground">Notifications</h3>
                  {hasUnread && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[10px] font-bold text-primary hover:opacity-85 cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-[300px] overflow-y-auto divide-y divide-border/40">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={cn(
                        "p-4 text-xs transition-colors hover:bg-muted/30 flex gap-2.5",
                        notif.unread ? "bg-primary/5" : ""
                      )}
                    >
                      <div className="h-2 w-2 rounded-full mt-1.5 shrink-0 bg-primary" style={{ opacity: notif.unread ? 1 : 0 }} />
                      <div className="flex-1 space-y-1">
                        <p className="font-semibold text-foreground">{notif.title}</p>
                        <p className="text-muted-foreground text-[11px] leading-normal">{notif.text}</p>
                        <p className="text-[10px] text-muted-foreground/70">{notif.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 text-center border-t border-border bg-muted/30">
                  <Link href="/admin/notifications" className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors">
                    View all notifications
                  </Link>
                </div>
              </PopoverContent>
            </Popover>

            {/* Quick Actions Panel */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer">
                  <Plus className="h-4.5 w-4.5 text-primary" />
                  <span className="sr-only">Quick Actions</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2.5 border border-border bg-popover text-popover-foreground shadow-2xl rounded-lg">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2.5 py-1.5 mb-1">
                  Quick Actions
                </div>
                <div className="space-y-0.5">
                  <Link href="/edit" className="flex items-center gap-2 px-2.5 py-2 rounded-md hover:bg-muted/50 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <Plus className="w-3.5 h-3.5 text-primary" />
                    <span>Create New Biodata</span>
                  </Link>
                  <Link href="/admin/users" className="flex items-center gap-2 px-2.5 py-2 rounded-md hover:bg-muted/50 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <Users className="w-3.5 h-3.5" />
                    <span>Manage User Access</span>
                  </Link>
                  <Link href="/admin/templates" className="flex items-center gap-2 px-2.5 py-2 rounded-md hover:bg-muted/50 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Customize Templates</span>
                  </Link>
                </div>
              </PopoverContent>
            </Popover>

            <Separator orientation="vertical" className="h-6 bg-border" />

            {/* Profile Dropdown */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-2 hover:opacity-85 focus:outline-none cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#9B1B30] to-[#C9A84C] flex items-center justify-center font-bold text-white text-xs shadow-md border border-[#C9A84C]/30">
                    {getInitials(session?.user?.name, "AD")}
                  </div>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-1 border border-border bg-popover text-popover-foreground shadow-2xl rounded-lg">
                <div className="px-3 py-2 border-b border-border/60">
                  <p className="text-xs font-semibold text-foreground">{session?.user?.name || "Administrator"}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{session?.user?.email || "admin@biodata99.com"}</p>
                </div>
                <div className="p-1 space-y-0.5">
                  <Link href="/admin/settings" className="flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-muted/50 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <UserCircle2 className="w-3.5 h-3.5" />
                    <span>My Profile</span>
                  </Link>
                  <Link href="/admin/settings" className="flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-muted/50 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <Settings className="w-3.5 h-3.5" />
                    <span>Console Settings</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-destructive/10 text-xs text-muted-foreground hover:text-destructive transition-colors cursor-pointer text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </header>

        {/* Dynamic Content Panel */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="w-full space-y-6 animate-in fade-in duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
