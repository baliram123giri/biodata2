"use client";

import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconClassName?: string;
  onClick?: () => void;
}

export function Logo({ className, iconClassName, onClick }: LogoProps) {
  return (
    <div className={cn("logo-shine-container flex items-center cursor-pointer select-none rounded-lg group", className)} onClick={onClick}>
      <img
        src="/new_logo.svg"
        alt="biodata99.com Logo"
        className={cn("h-16 md:h-20 w-auto object-contain shrink-0 relative z-10 transition-transform duration-300 group-hover:scale-105", iconClassName)}
      />
      {/* Premium Metallic Shimmer Sweep Overlay */}
      <div className="logo-shine-overlay" />
    </div>
  );
}
