"use client";

import { FileText, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  onClick?: () => void;
}

export function Logo({ className, iconClassName, textClassName, onClick }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)} onClick={onClick}>
      <div className={cn("relative flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary shrink-0", iconClassName)}>
        <FileText className="w-4.5 h-4.5" />
        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-background flex items-center justify-center p-[1px]">
          <Heart className="w-2.5 h-2.5 fill-primary text-primary" />
        </div>
      </div>
      <span className={cn("text-xl font-bold tracking-tight text-primary font-sans select-none", textClassName)}>
        Biodata Maker
      </span>
    </div>
  );
}
