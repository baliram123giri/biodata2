"use client"

import * as React from "react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface TruncatedValueProps {
  value: string | null | undefined
  className?: string
  maxLength?: number
}

export function TruncatedValue({ value, className, maxLength }: TruncatedValueProps) {
  const [isHoveredAndTruncated, setIsHoveredAndTruncated] = React.useState(false)
  const spanRef = React.useRef<HTMLSpanElement>(null)

  if (!value) return null

  const displayText = maxLength && value.length > maxLength 
    ? `${value.slice(0, maxLength)}...` 
    : value;

  const handleMouseEnter = () => {
    const el = spanRef.current
    if (el) {
      const hasEllipsis = el.scrollWidth > el.clientWidth || (maxLength ? value.length > maxLength : false)
      if (hasEllipsis) {
        setIsHoveredAndTruncated(true)
      }
    }
  }

  const handleMouseLeave = () => {
    setIsHoveredAndTruncated(false)
  }

  // Lightweight HTML span for optimal initial render performance
  const baseSpan = (
    <span 
      ref={spanRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "block truncate max-w-full transition-colors",
        isHoveredAndTruncated ? "cursor-help hover:text-primary" : "cursor-default",
        className
      )}
    >
      {displayText}
    </span>
  )

  if (!isHoveredAndTruncated) {
    return baseSpan
  }

  return (
    <Tooltip open={true} onOpenChange={(open) => { if (!open) setIsHoveredAndTruncated(false); }} delayDuration={100}>
      <TooltipTrigger asChild>
        {baseSpan}
      </TooltipTrigger>
      <TooltipContent className="max-w-sm break-all font-sans font-medium text-xs bg-stone-950 text-white border border-stone-850 p-2.5 rounded-lg shadow-lg">
        {value}
      </TooltipContent>
    </Tooltip>
  )
}
