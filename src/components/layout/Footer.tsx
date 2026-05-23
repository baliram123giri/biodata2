"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/layout/Logo";
import {
  Heart,
  FileText,
  Download,
  Sparkles,
  Mail,
  Globe,
  MessageCircle,
  Camera,
  ArrowRight,
  Shield,
  Star,
} from "lucide-react";

const footerLinks = {
  product: [
    { label: "Build Biodata", href: "/#builder", icon: FileText },
    { label: "Designer Studio", href: "/edit", icon: Sparkles },
    { label: "Download Free", href: "/#builder", icon: Download },
  ],
  company: [
    { label: "Our Blog", href: "/blog" },
    { label: "About Us", href: "/about-us" },
    { label: "Contact Us", href: "/contact-us" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Refund Policy", href: "/refund-policy" },
    { label: "Terms & Conditions", href: "/terms-conditions" },
  ],
};

const socialLinks = [
  { icon: MessageCircle, href: "https://twitter.com", label: "Twitter" },
  { icon: Camera, href: "https://instagram.com", label: "Instagram" },
  { icon: Globe, href: "https://facebook.com", label: "Facebook" },
];

export function Footer() {
  const pathname = usePathname();
  const isEditorPage = pathname === "/edit";

  if (isEditorPage) return null;

  return (
    <footer className="w-full relative overflow-hidden">
      {/* Top Wave Divider */}
      <div className="w-full overflow-hidden leading-none">
        <svg viewBox="0 0 1440 60" className="w-full block" preserveAspectRatio="none" style={{ height: 48 }}>
          <path d="M0,40 C360,0 1080,80 1440,20 L1440,60 L0,60 Z" fill="#0f172a" />
        </svg>
      </div>

      {/* Main Footer Body */}
      <div className="bg-[#0f172a] text-white">
        {/* Main Grid */}
        <div className="container mx-auto px-4 py-14">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">

            {/* Brand Column */}
            <div className="md:col-span-4 flex flex-col gap-5">
              <Logo iconClassName="h-10 md:h-12" disableShine />
              <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
                Create a professional marriage biodata in minutes — free, beautiful, and designed for modern Indian families.
              </p>

              {/* Social Icons */}
              <div className="flex items-center gap-3 mt-1">
                {socialLinks.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-9 h-9 rounded-full bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/40 flex items-center justify-center text-slate-400 hover:text-cyan-400 transition-all duration-200"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>

              {/* Trust badge */}
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 w-fit mt-1">
                <Shield className="w-3.5 h-3.5 text-green-400" />
                <span className="text-[11px] font-bold text-slate-300 tracking-wide">100% Free &amp; Secure</span>
              </div>
            </div>

            {/* Product Links */}
            <div className="md:col-span-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-5 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Product
              </h3>
              <ul className="space-y-3">
                {footerLinks.product.map(({ label, href, icon: Icon }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="group flex items-center gap-2.5 text-sm text-slate-400 hover:text-cyan-400 transition-colors duration-200"
                    >
                      <Icon className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div className="md:col-span-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-5">
                Company
              </h3>
              <ul className="space-y-3">
                {footerLinks.company.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="group flex items-center gap-1.5 text-sm text-slate-400 hover:text-cyan-400 transition-colors duration-200"
                    >
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div className="md:col-span-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-5">
                Legal
              </h3>
              <ul className="space-y-3">
                {footerLinks.legal.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="group flex items-center gap-1.5 text-sm text-slate-400 hover:text-cyan-400 transition-colors duration-200"
                    >
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Contact email */}
              <div className="mt-6 flex items-center gap-2 text-slate-400 group">
                <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <a
                  href="mailto:hello@biodata99.com"
                  className="text-xs hover:text-cyan-400 transition-colors"
                >
                  hello@biodata99.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/8">
          <div className="container mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-500 text-center sm:text-left" suppressHydrationWarning>
              © {new Date().getFullYear()} biodata99.com. All Rights Reserved.
            </p>
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              Made with <Heart className="w-3 h-3 text-red-400 fill-red-400" /> for Happy Marriages
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 ml-1" />
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
