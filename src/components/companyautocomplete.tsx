import * as React from "react"
import { Check, ChevronsUpDown, Loader2, Building2, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface Company {
  name: string
  domain: string
  logo: string
}

const POPULAR_COMPANIES: Company[] = [
  { name: "TCS", domain: "tcs.com", logo: "https://icon.horse/icon/tcs.com" },
  { name: "Infosys", domain: "infosys.com", logo: "https://icon.horse/icon/infosys.com" },
  { name: "Wipro", domain: "wipro.com", logo: "https://icon.horse/icon/wipro.com" },
  { name: "Cognizant", domain: "cognizant.com", logo: "https://icon.horse/icon/cognizant.com" },
  { name: "Accenture", domain: "accenture.com", logo: "https://icon.horse/icon/accenture.com" },
  { name: "Google", domain: "google.com", logo: "https://icon.horse/icon/google.com" },
  { name: "Microsoft", domain: "microsoft.com", logo: "https://icon.horse/icon/microsoft.com" },
  { name: "Amazon", domain: "amazon.com", logo: "https://icon.horse/icon/amazon.com" },
  { name: "Flipkart", domain: "flipkart.com", logo: "https://icon.horse/icon/flipkart.com" },
  { name: "Reliance", domain: "ril.com", logo: "https://icon.horse/icon/ril.com" },
  { name: "Tata Motors", domain: "tatamotors.com", logo: "https://icon.horse/icon/tatamotors.com" },
  { name: "HDFC Bank", domain: "hdfcbank.com", logo: "https://icon.horse/icon/hdfcbank.com" },
  { name: "ICICI Bank", domain: "icicibank.com", logo: "https://icon.horse/icon/icicibank.com" },
  { name: "SBI", domain: "sbi.co.in", logo: "https://icon.horse/icon/sbi.co.in" },
  { name: "L&T", domain: "larsentoubro.com", logo: "https://icon.horse/icon/larsentoubro.com" },
  { name: "Mahindra", domain: "mahindra.com", logo: "https://icon.horse/icon/mahindra.com" },
  { name: "Government of India", domain: "india.gov.in", logo: "https://icon.horse/icon/india.gov.in" },
];

export function CompanyAutocomplete({ value, onChange, placeholder }: { value: string; onChange: (v: string, logo?: string) => void; placeholder?: string }) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [companies, setCompanies] = React.useState<Company[]>([])
  const [loading, setLoading] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  
  const [logoMap, setLogoMap] = React.useState<Record<string, string>>(() => {
    const map: Record<string, string> = {}
    POPULAR_COMPANIES.forEach(c => map[c.name] = c.logo)
    return map
  })

  React.useEffect(() => {
    if (query.trim().length === 0) {
      setCompanies(POPULAR_COMPANIES)
      return
    }

    const localMatches = POPULAR_COMPANIES.filter(c => c.name.toLowerCase().includes(query.toLowerCase()))
    
    if (localMatches.length > 0) {
      setCompanies(localMatches)
      return
    }

    const fetchCompanies = async () => {
      setLoading(true)
      try {
        const res = await fetch(`https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(query)}`)
        if (res.ok) {
          const data = await res.json()
          setCompanies(data)
        } else {
          setCompanies([])
        }
      } catch (err) {
        console.error(err)
        setCompanies([])
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(fetchCompanies, 400)
    return () => clearTimeout(timer)
  }, [query])

  // Focus the input safely when popover opens without layout jumps
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
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger 
        render={
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal text-left px-3 shadow-none border-input hover:bg-transparent"
          />
        }
      >
        <span className="flex items-center truncate">
          {value ? (
            logoMap[value] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoMap[value]} alt="Logo" className="h-5 w-5 mr-2 rounded object-contain bg-white shrink-0" />
            ) : (
              <Building2 className="h-5 w-5 mr-2 text-muted-foreground shrink-0" />
            )
          ) : null}
          {value || <span className="text-muted-foreground">{placeholder || "Select Company..."}</span>}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-1 bg-popover text-popover-foreground rounded-lg border shadow-md max-h-72 overflow-hidden flex flex-col z-[9999]" align="start">
        {/* Branded search box input */}
        <div className="p-1 pb-0 shrink-0">
          <div className="flex h-8 items-center rounded-lg border border-input/30 bg-input/30 px-2 shadow-none gap-2">
            <Search className="size-4 shrink-0 opacity-50" />
            <input
              ref={inputRef}
              placeholder="Search companies..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full text-sm bg-transparent outline-none border-none focus:ring-0 p-0 text-foreground"
            />
          </div>
        </div>
        
        {/* Results List */}
        <div className="no-scrollbar max-h-56 scroll-py-1 overflow-x-hidden overflow-y-auto p-1 space-y-0.5 mt-1">
          {loading ? (
            <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mr-2" /> Searching...
            </div>
          ) : companies.length === 0 ? (
            query.length > 0 ? (
              <div className="p-4 text-sm text-center text-muted-foreground flex flex-col items-center">
                <Building2 className="h-8 w-8 mb-2 opacity-20" />
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
                Type to search...
              </div>
            )
          ) : (
            <>
              {companies.map((company) => (
                <div
                  key={company.domain}
                  onClick={() => {
                    if (company.logo) {
                      setLogoMap(prev => ({ ...prev, [company.name]: company.logo }))
                      onChange(company.name, company.logo)
                    } else if (company.domain) {
                      const logoUrl = `https://icon.horse/icon/${company.domain}`
                      setLogoMap(prev => ({ ...prev, [company.name]: logoUrl }))
                      onChange(company.name, logoUrl)
                    } else {
                      onChange(company.name)
                    }
                    setOpen(false)
                  }}
                  className={cn(
                    "flex items-center gap-3 px-2 py-1.5 text-sm rounded-md cursor-pointer transition-colors duration-150 select-none hover:bg-muted text-foreground",
                    value === company.name && "bg-muted font-medium"
                  )}
                >
                  {company.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={company.logo} alt={company.name} className="h-6 w-6 rounded object-contain bg-white shrink-0" />
                  ) : company.domain ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`https://icon.horse/icon/${company.domain}`} alt={company.name} className="h-6 w-6 rounded object-contain bg-white shrink-0" />
                  ) : (
                    <Building2 className="h-6 w-6 text-muted-foreground opacity-50 shrink-0" />
                  )}
                  <span className="truncate">{company.name}</span>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4 shrink-0 text-primary",
                      value === company.name ? "opacity-100" : "opacity-0"
                    )}
                  />
                </div>
              ))}
              
              {query && !companies.some(c => c.name.toLowerCase() === query.toLowerCase()) && (
                <div
                  onClick={() => {
                    onChange(query)
                    setOpen(false)
                  }}
                  className="flex items-center gap-3 px-2 py-1.5 text-sm rounded-md cursor-pointer transition-colors duration-150 hover:bg-muted text-primary font-medium border-t mt-1"
                >
                  <Building2 className="h-5 w-5 opacity-50 shrink-0" />
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
