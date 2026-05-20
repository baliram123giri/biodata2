import React from "react";

// Premium A4-style preview loader representing the matrimonial template loading
export function PreviewLoader() {
  return (
    <div className="w-full h-full flex items-center justify-center p-4 bg-stone-50/30">
      <div className="w-full max-w-[360px] aspect-[1/1.414] bg-white rounded-xl shadow-md border border-stone-200/50 p-6 flex flex-col gap-4 relative overflow-hidden animate-pulse">
        {/* Decorative corner borders representing the template border */}
        <div className="absolute top-2 left-2 w-5 h-5 border-t border-l border-stone-200 rounded-tl" />
        <div className="absolute top-2 right-2 w-5 h-5 border-t border-r border-stone-200 rounded-tr" />
        <div className="absolute bottom-2 left-2 w-5 h-5 border-b border-l border-stone-200 rounded-bl" />
        <div className="absolute bottom-2 right-2 w-5 h-5 border-b border-r border-stone-200 rounded-br" />

        {/* Header placeholder */}
        <div className="flex flex-col items-center gap-1.5 mt-2">
          <div className="w-6 h-6 rounded-full bg-stone-200/60 flex items-center justify-center" />
          <div className="h-4 w-32 bg-stone-200 rounded-md" />
          <div className="h-2 w-20 bg-stone-100 rounded" />
        </div>

        {/* Main section placeholders */}
        <div className="flex gap-4 mt-2 items-start">
          {/* Details */}
          <div className="flex-1 flex flex-col gap-2.5">
            <div className="flex flex-col gap-1">
              <div className="h-2.5 w-12 bg-stone-200 rounded" />
              <div className="h-3 w-full bg-stone-100 rounded" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="h-2.5 w-16 bg-stone-200 rounded" />
              <div className="h-3 w-5/6 bg-stone-100 rounded" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="h-2.5 w-14 bg-stone-200 rounded" />
              <div className="h-3 w-3/4 bg-stone-100 rounded" />
            </div>
          </div>

          {/* Photo */}
          <div className="w-20 aspect-[3/4] rounded-lg border border-dashed border-stone-200 bg-stone-50 flex flex-col items-center justify-center gap-1">
            <div className="w-4 h-4 rounded-full bg-stone-200" />
            <div className="h-1.5 w-8 bg-stone-200 rounded" />
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-stone-200/60 my-1" />

        {/* Family info */}
        <div className="flex flex-col gap-2">
          <div className="h-3.5 w-24 bg-stone-200 rounded" />
          <div className="grid grid-cols-2 gap-2">
            <div className="h-2.5 w-full bg-stone-100 rounded" />
            <div className="h-2.5 w-5/6 bg-stone-100 rounded" />
            <div className="h-2.5 w-4/5 bg-stone-100 rounded" />
            <div className="h-2.5 w-full bg-stone-100 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
