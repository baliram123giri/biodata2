"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";

const segmentNames: Record<string, string> = {
  "biodata-templates": "Templates",
  "about-us": "About Us",
  "how-it-works": "How It Works",
  "faqs": "FAQs",
  "blog": "Blog",
  "contact-us": "Contact Us",
  "terms-conditions": "Terms & Conditions",
  "privacy-policy": "Privacy Policy",
  "refund-policy": "Refund Policy"
};

const formatSegment = (str: string) => {
  if (segmentNames[str]) return segmentNames[str];
  return str
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export function Breadcrumbs() {
  const pathname = usePathname();

  // Exclude edit, admin, and home pages
  if (!pathname || pathname === "/" || pathname === "/edit" || pathname.startsWith("/edit") || pathname.startsWith("/admin")) {
    return null;
  }

  const paths = pathname.split("/").filter(Boolean);
  
  // Build breadcrumb items
  const items = paths.map((path, index) => {
    const url = "/" + paths.slice(0, index + 1).join("/");
    return {
      name: formatSegment(path),
      url
    };
  });

  // Home item is always first
  const allItems = [{ name: "Home", url: "/" }, ...items];

  // Schema generation
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": allItems.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `https://biodata99.com${item.url}`
    }))
  };

  return (
    <>
      <JsonLd schema={schema} />
      <div className="w-full bg-[#FFFBF8]/40 dark:bg-[#1A0A0E]/20 py-2.5 px-4 border-b border-stone-200/20 dark:border-stone-850/20 z-10 relative">
        <nav aria-label="Breadcrumb" className="container mx-auto max-w-6xl flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground/70 dark:text-stone-400/70">
          {allItems.map((item, index) => {
            const isLast = index === allItems.length - 1;
            return (
              <div key={item.url} className="flex items-center gap-1.5">
                {index > 0 && <ChevronRight className="w-3 h-3 opacity-50 text-stone-400" />}
                {isLast ? (
                  <span className="text-primary dark:text-[#E6C97A] font-black tracking-wide">
                    {item.name}
                  </span>
                ) : (
                  <Link
                    href={item.url}
                    className="hover:text-primary dark:hover:text-[#E6C97A] transition-colors flex items-center gap-1 uppercase tracking-wider text-[10px]"
                  >
                    {index === 0 && <Home className="w-3.5 h-3.5 -mt-0.5" />}
                    {item.name}
                  </Link>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </>
  );
}
