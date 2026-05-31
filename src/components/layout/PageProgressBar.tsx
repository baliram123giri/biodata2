"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function PageProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [status, setStatus] = useState<"idle" | "loading" | "complete">("idle");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Whenever pathname or searchParams change, mark the page load as complete
    if (status === "loading") {
      setStatus("complete");
      setProgress(100);
      
      const timer = setTimeout(() => {
        setStatus("idle");
        setProgress(0);
      }, 350);

      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    const startLoading = () => {
      setStatus("loading");
      setProgress(10);
    };

    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Handle pure hash links globally for smooth scrolling without URL change
      const isHashLink = href.startsWith("#") || href.startsWith("/#");
      if (isHashLink) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        const hashPart = href.substring(href.indexOf("#") + 1);
        if (hashPart.length > 0) {
          const element = document.getElementById(hashPart);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }
        return;
      }

      // Filter out links that shouldn't trigger transition
      if (
        href.startsWith("http") || 
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        anchor.target === "_blank" ||
        e.metaKey || 
        e.ctrlKey || 
        e.shiftKey || 
        e.altKey
      ) {
        return;
      }

      // Check if navigating to the same URL path and query (hash-only = scroll, skip it)
      try {
        const targetUrl = new URL(href, window.location.href);
        const currentUrl = new URL(window.location.href);
        // Same pathname + search means it's a hash/scroll navigation — skip
        if (targetUrl.pathname === currentUrl.pathname && targetUrl.search === currentUrl.search) {
          return;
        }
      } catch (err) {
        // Handle relative URLs
        if (href === pathname || href.startsWith(pathname + "#")) return;
      }

      startLoading();
    };

    const handlePopState = () => {
      const currentSearch = searchParams.toString() ? `?${searchParams.toString()}` : "";
      if (window.location.pathname === pathname && window.location.search === currentSearch) {
        return; // just a hash change
      }
      startLoading();
    };

    window.addEventListener("click", handleAnchorClick, { capture: true });
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("click", handleAnchorClick, { capture: true });
      window.removeEventListener("popstate", handlePopState);
    };
  }, [pathname, searchParams]);

  // Simulate progress steps when status is loading
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (status === "loading") {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 85) {
            clearInterval(interval);
            return 85;
          }
          return prev + Math.floor(Math.random() * 12) + 4; // increment between 4% and 16%
        });
      }, 150);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status]);

  if (status === "idle") return null;

  return (
    <div 
      className="fixed top-0 left-0 w-full z-[100] pointer-events-none"
      style={{ height: "4px" }}
    >
      <div 
        className="h-full bg-gradient-to-r from-[#9B1B30] via-[#C9A84C] to-[#E6C97A] transition-all duration-300 ease-out shadow-[0_1px_8px_rgba(201,168,76,0.5)]"
        style={{ 
          width: `${progress}%`,
          opacity: status === "complete" ? 0 : 1,
          transition: status === "complete" ? "width 0.2s ease-out, opacity 0.3s ease-in-out" : "width 0.4s cubic-bezier(0.1, 0.8, 0.1, 1)"
        }}
      />
    </div>
  );
}
