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
