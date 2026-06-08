import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitials(name?: string | null, fallback = "U"): string {
  if (!name) return fallback;
  return name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function formatISTDate(
  dateInput: Date | string | number,
  options: Intl.DateTimeFormatOptions = {}
): string {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    ...options
  });
}

export function formatISTDateTime(
  dateInput: Date | string | number,
  options: Intl.DateTimeFormatOptions = {}
): string {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    ...options
  }) + " IST";
}

export function getClientImageUrl(src: string | null | undefined): string {
  if (!src) return "";
  if (src.startsWith("data:") || src.startsWith("blob:")) return src;

  if (typeof window !== "undefined") {
    try {
      const parsedUrl = new URL(src, window.location.origin);
      if (parsedUrl.hostname === window.location.hostname) {
        const relativePath = parsedUrl.pathname + parsedUrl.search;
        
        // In local development, direct relative paths for assets/uploads to production
        if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
          const lowerPath = relativePath.toLowerCase();
          if (
            lowerPath.startsWith("/uploads/") ||
            lowerPath.startsWith("/frames/") ||
            lowerPath.startsWith("/stickers/")
          ) {
            return `https://biodata99.com${relativePath}`;
          }
        }
        
        return relativePath.includes("?") ? `${relativePath}&canvas=true` : `${relativePath}?canvas=true`;
      }
      
      const isProduction = process.env.NODE_ENV === "production" || window.location.hostname !== "localhost";
      if (isProduction) {
        return src;
      }
      
      return `/api/proxy-logo?url=${encodeURIComponent(src)}`;
    } catch (e) {
      return src;
    }
  }
  
  return src;
}

