import * as React from "react"
import { Check, ChevronsUpDown, Search, Sparkles } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface Mantra {
  id: string
  text: string
  nativeText?: string | null
  religion?: string
}

export function MantraAutocomplete({ 
  value, 
  onChange, 
  mantras, 
  placeholder 
}: { 
  value: string; 
  onChange: (v: string) => void; 
  mantras: Mantra[]; 
  placeholder?: string 
}) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement | null>(null)

  const filteredMantras = React.useMemo(() => {
    if (query.trim().length === 0) return mantras
    return mantras.filter(m => 
      m.text.toLowerCase().includes(query.toLowerCase()) || 
      (m.nativeText && m.nativeText.toLowerCase().includes(query.toLowerCase()))
    )
  }, [query, mantras])

  React.useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus({ preventScroll: true })
        }
      }, 80)
      return () => clearTimeout(timer)
    } else {
      setQuery("")
    }
  }, [open])

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={value || placeholder || "Select or type Mantra..."}
          className="w-full justify-between font-normal text-left px-3 h-14 border-border/80 focus-visible:ring-primary/20 bg-card shadow-sm hover:bg-card/90"
        >
        <span className="flex items-center truncate">
          {value || <span className="text-muted-foreground">{placeholder || "Select or type Mantra..."}</span>}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="w-[var(--radix-popover-trigger-width)] p-1 bg-popover text-popover-foreground rounded-lg border shadow-md max-h-72 overflow-hidden flex flex-col z-[9999]"
        align="start"
      >
        <div className="p-1 pb-0 shrink-0">
          <div className="flex h-10 items-center rounded-lg border border-input/30 bg-input/30 px-2 shadow-none gap-2">
            <Search className="size-4 shrink-0 opacity-50" />
            <input
              ref={inputRef}
              placeholder="Search or type custom mantra..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full text-sm bg-transparent outline-none border-none focus:ring-0 p-0 text-foreground"
            />
          </div>
        </div>
        
        <div className="no-scrollbar max-h-56 scroll-py-1 overflow-x-hidden overflow-y-auto p-1 space-y-0.5 mt-1">
          {filteredMantras.length === 0 ? (
            query.length > 0 ? (
              <div className="p-4 text-sm text-center text-muted-foreground flex flex-col items-center">
                <Sparkles className="h-8 w-8 mb-2 opacity-20 text-primary" />
                No exact matches found.
                <Button 
                  variant="link" 
                  size="sm" 
                  className="block mx-auto mt-2 h-auto p-0"
                  onClick={() => {
                    onChange(query)
                    setOpen(false)
                  }}
                >
                  Use "{query}"
                </Button>
              </div>
            ) : (
              <div className="p-4 text-sm text-center text-muted-foreground">
                Type to search or add custom...
              </div>
            )
          ) : (
            <>
              {filteredMantras.map((m) => (
                <div
                  key={m.id}
                  onClick={() => {
                    onChange(m.nativeText || m.text)
                    setOpen(false)
                  }}
                  className={cn(
                    "flex flex-col gap-0.5 px-2 py-2 text-sm rounded-md cursor-pointer transition-colors duration-150 select-none hover:bg-muted",
                    (value === m.text || value === m.nativeText) && "bg-muted font-medium"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate text-foreground font-medium">{m.text}</span>
                    <Check
                      className={cn(
                        "ml-2 h-4 w-4 shrink-0 text-primary",
                        (value === m.text || value === m.nativeText) ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </div>
                  {m.nativeText && (
                    <span className="text-xs text-muted-foreground font-serif">{m.nativeText}</span>
                  )}
                </div>
              ))}
              
              {query && !filteredMantras.some(m => m.text.toLowerCase() === query.toLowerCase()) && (
                <div
                  onClick={() => {
                    onChange(query)
                    setOpen(false)
                  }}
                  className="flex items-center gap-3 px-2 py-2 text-sm rounded-md cursor-pointer transition-colors duration-150 hover:bg-muted text-primary font-medium border-t mt-1"
                >
                  <Sparkles className="h-4 w-4 opacity-70 shrink-0" />
                  <span className="truncate">Use custom: "{query}"</span>
                </div>
              )}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
