"use client";

import * as React from "react";
import * as Tooltip from "@radix-ui/react-tooltip";

interface Props {
  children: React.ReactNode;
  content: string;
}

export function FooterReviewsTooltip({ children, content }: Props) {
  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <div className="cursor-pointer">{children}</div>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="z-50 rounded-lg bg-slate-900 border border-slate-700/60 px-3 py-1.5 text-[11px] text-slate-200 shadow-xl animate-in fade-in-0 zoom-in-95 leading-relaxed font-semibold max-w-[240px] text-center"
            side="top"
            sideOffset={8}
          >
            {content}
            <Tooltip.Arrow className="fill-slate-900" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
