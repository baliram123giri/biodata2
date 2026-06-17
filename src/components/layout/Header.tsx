"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { Logo } from "@/components/layout/Logo";

export function Header() {
  const pathname = usePathname();
  const isEditorPage = pathname === "/edit";
  const isAdminPage = pathname?.startsWith("/admin");
  const [open, setOpen] = useState(false);

  if (isEditorPage || isAdminPage) return null;

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/biodata-templates", label: "Templates" },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/faqs", label: "FAQs" },
    { href: "/blog", label: "Blog" },
  ];

  const isMuslimPage = pathname === "/muslim-biodata-format";
  const isMarathiPage = pathname === "/marathi-biodata-maker";

  return (
    <header 
      className={`sticky top-0 z-50 w-full border-b backdrop-blur transition-all duration-300 ${
        isMuslimPage 
          ? "bg-[#FAF8F3]/95 border-[#D4AF37]/25 text-[#1F2937]" 
          : isMarathiPage
            ? "bg-[#FFFDF9]/95 border-[#EAB308]/25 text-[#1F2937]"
            : "bg-background/95 border-border supports-[backdrop-filter]:bg-background/60 text-foreground"
      }`}
    >
      <div className="container flex h-12 md:h-14 items-center justify-between mx-auto px-4">
        {/* Left side: Logo */}
        <Link href="/" prefetch={false}>
          <Logo />
        </Link>
 
        {/* Right side: Nav + Hamburger */}
        <div className="flex items-center gap-4">
          <nav aria-label="Main navigation" className="hidden md:flex items-center gap-6 text-xs font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                prefetch={false}
                className={`transition-colors font-semibold ${
                  isMuslimPage
                    ? pathname === link.href
                      ? "text-[#0F4C3A]"
                      : "text-[#1F2937]/75 hover:text-[#0F4C3A]"
                    : isMarathiPage
                      ? pathname === link.href
                        ? "text-[#C2410C]"
                        : "text-[#1F2937]/75 hover:text-[#C2410C]"
                      : pathname === link.href
                        ? "text-primary"
                        : "text-muted-foreground hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
 
          {/* Mobile Hamburger Menu */}
          <div className="md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className={`h-10 w-10 px-0 ${isMuslimPage ? "hover:bg-[#F5E6B8]/50 text-[#1F2937]" : isMarathiPage ? "hover:bg-[#FEF3C7]/50 text-[#1F2937]" : ""}`}>
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className={`w-[280px] ${isMuslimPage ? "bg-[#FAF8F3]" : isMarathiPage ? "bg-[#FFFDF9]" : ""}`}>
                <SheetHeader className="mb-6 text-left">
                  <SheetTitle>
                    <Link href="/" prefetch={false} onClick={() => setOpen(false)}>
                      <Logo />
                    </Link>
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      prefetch={false}
                      onClick={() => setOpen(false)}
                      className={`text-base font-semibold transition-colors ${
                        isMuslimPage
                          ? pathname === link.href
                            ? "text-[#0F4C3A]"
                            : "text-[#1F2937]/75 hover:text-[#0F4C3A]"
                          : isMarathiPage
                            ? pathname === link.href
                              ? "text-[#C2410C]"
                              : "text-[#1F2937]/75 hover:text-[#C2410C]"
                            : pathname === link.href
                              ? "text-primary"
                              : "text-muted-foreground hover:text-primary"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
