"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/layout/Logo";
import {
  Heart,
  Mail,
  MapPin,
  ArrowRight,
  Shield,
  Star,
} from "lucide-react";

const footerLinks = {
  company: [
    { label: "Our Blog", href: "/blog" },
    { label: "About Us", href: "/about-us" },
    { label: "Contact Us", href: "/contact-us" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Refund Policy", href: "/refund-policy" },
    { label: "Terms & Conditions", href: "/terms-conditions" },
    { label: "Sitemap", href: "/sitemap.xml" },
  ],
};

const socialLinks = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/biodata99.co/",
    svgPath: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
  },
  {
    label: "YouTube",
    href: "https://youtube.com/@biodata99?si=XlmXrVimfS1vvgmq",
    svgPath: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  },
  {
    label: "Twitter / X",
    href: "https://x.com/biodata99com",
    svgPath: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
  {
    label: "Pinterest",
    href: "https://www.pinterest.com/biodata99/",
    svgPath: "M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z",
  },
];

export function Footer({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname();
  const isEditorPage = pathname === "/edit";
  const isAdminPage = pathname?.startsWith("/admin");

  if (isEditorPage || isAdminPage) return null;

  return (
    <footer className="w-full relative overflow-hidden">
      {/* Top Wave Divider */}
      <div className="w-full overflow-hidden leading-none">
        <svg viewBox="0 0 1440 60" className="w-full block" preserveAspectRatio="none" style={{ height: 20 }}>
          <path d="M0,40 C360,0 1080,80 1440,20 L1440,60 L0,60 Z" fill="#0f172a" />
        </svg>
      </div>

      {/* Main Footer Body */}
      <div className="bg-[#0f172a] text-white">
        {/* Main Grid */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-6">

            {/* Brand Column */}
            <div className="md:col-span-5 flex flex-col gap-3">
              <Logo iconClassName="h-8 md:h-10" disableShine />
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                Free marriage biodata maker for Indian families. Stylish formats, PDF &amp; Word download, 100% private.
              </p>

              {children}

              {/* Social Icons */}
              <div className="flex items-center gap-2 mt-1">
                {socialLinks.map(({ href, label, svgPath }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/40 flex items-center justify-center text-slate-400 hover:text-cyan-400 transition-all duration-200"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d={svgPath} />
                    </svg>
                  </a>
                ))}
              </div>

              {/* Trust badge */}
              <div className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-2.5 py-1 w-fit mt-1">
                <Shield className="w-3 h-3 text-green-400" />
                <span className="text-[10px] font-bold text-slate-300 tracking-wide">100% Free &amp; Secure</span>
              </div>
            </div>

            {/* Company Links */}
            <div className="md:col-span-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-3">
                Company
              </h3>
              <ul className="space-y-2">
                {footerLinks.company.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="group flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors duration-200"
                    >
                      <ArrowRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div className="md:col-span-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-3">
                Legal
              </h3>
              <ul className="space-y-2">
                {footerLinks.legal.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="group flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors duration-200"
                    >
                      <ArrowRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Contact email */}
              <div className="mt-4 flex items-center gap-1.5 text-slate-400 group">
                <Mail className="w-3 h-3 text-cyan-400 shrink-0" />
                <a
                  href="mailto:support@biodata99.com"
                  className="text-[11px] hover:text-cyan-400 transition-colors"
                >
                  support@biodata99.com
                </a>
              </div>

              {/* Location */}
              <div className="mt-2 flex items-center gap-1.5 text-slate-400">
                <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                <span className="text-[11px]">Maharashtra, India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/8">
          <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-[11px] text-slate-400 text-center sm:text-left" suppressHydrationWarning>
              © {new Date().getFullYear()} biodata99.com. All Rights Reserved.
            </p>
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              Made with <Heart className="w-2.5 h-2.5 text-red-400 fill-red-400" /> for Happy Marriages
              <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400 ml-0.5" />
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
