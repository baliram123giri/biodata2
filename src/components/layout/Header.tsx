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
    { href: "/templates", label: "Templates" },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/faqs", label: "FAQs" },
    { href: "/blog", label: "Blog" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-12 md:h-14 items-center justify-between mx-auto px-4">
        {/* Left side: Logo */}
        <Link href="/">
          <Logo />
        </Link>
        
        {/* Right side: Nav + Hamburger */}
        <div className="flex items-center gap-4">
          <nav aria-label="Main navigation" className="hidden md:flex items-center gap-6 text-xs font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors hover:text-primary ${
                  pathname === link.href ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Hamburger Menu */}
          <div className="md:hidden">
             <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger
                render={
                  <Button variant="ghost" size="icon" className="h-10 w-10 px-0">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                }
              />
              <SheetContent side="right" className="w-[280px]">
                <SheetHeader className="mb-6 text-left">
                  <SheetTitle>
                    <Link href="/" onClick={() => setOpen(false)}>
                      <Logo />
                    </Link>
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={`text-base font-medium transition-colors hover:text-primary ${
                        pathname === link.href ? "text-primary" : "text-muted-foreground"
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
