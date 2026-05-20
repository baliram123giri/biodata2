"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/layout/Logo";

export function Footer() {
  const pathname = usePathname();
  const isEditorPage = pathname === "/edit";

  if (isEditorPage) return null;

  return (
    <footer className="w-full border-t bg-muted py-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <Logo className="mb-4" />
          <p className="text-sm text-muted-foreground mb-4">
            Create a Professional Marriage Biodata with our easy-to-use platform for Free. Designed for modern needs, loved by families.
          </p>
          <p className="text-sm text-muted-foreground" suppressHydrationWarning>
            © {new Date().getFullYear()} Biodata Maker. All Rights Reserved.<br/>
            Made for Happy Marriages!
          </p>
        </div>
        
        <div>
          <h3 className="font-bold text-lg mb-4">Company</h3>
          <nav aria-label="Company links">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/blog" className="hover:text-primary transition-colors">Our Blog</Link></li>
              <li><Link href="/about-us" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/contact-us" className="hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </nav>
        </div>

        <div>
          <h3 className="font-bold text-lg mb-4">Legal</h3>
          <nav aria-label="Legal links">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/refund-policy" className="hover:text-primary transition-colors">Refund Policy</Link></li>
              <li><Link href="/terms-conditions" className="hover:text-primary transition-colors">Terms & Conditions</Link></li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
