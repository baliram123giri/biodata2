"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";

interface LogoProps {
  className?: string;
  iconClassName?: string;
  onClick?: () => void;
  disableShine?: boolean;
}

export function Logo({ className, iconClassName, onClick, disableShine = false }: LogoProps) {
  return (
    <div
      className={cn(
        !disableShine && "logo-shine-container",
        "flex items-center cursor-pointer select-none rounded-lg group",
        className
      )}
      onClick={onClick}
    >
      <Image
        src="/logo.svg"
        alt="biodata99.com Logo"
        width={180}
        height={48}
        className={cn("h-10 md:h-12 w-auto object-contain shrink-0 relative z-10 transition-transform duration-300 group-hover:scale-105", iconClassName)}
        style={{ width: "auto", height: "auto" }}
        priority
      />
      {/* Premium Metallic Shimmer Sweep Overlay */}
      {!disableShine && <div className="logo-shine-overlay" />}
    </div>
  );
}
