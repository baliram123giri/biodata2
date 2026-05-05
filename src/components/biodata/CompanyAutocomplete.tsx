import * as React from "react"
import { Check, ChevronsUpDown, Loader2, Building2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
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
  const [logoMap, setLogoMap] = React.useState<Record<string, string>>(() => {
    // Initialize map with popular companies
    const map: Record<string, string> = {}
    POPULAR_COMPANIES.forEach(c => map[c.name] = c.logo)
    return map
  })

  React.useEffect(() => {
    if (query.trim().length === 0) {
      setCompanies(POPULAR_COMPANIES)
      return
    }

    // Filter local first
    const localMatches = POPULAR_COMPANIES.filter(c => c.name.toLowerCase().includes(query.toLowerCase()))
    
    // If we have local matches, prioritize them to avoid latency
    if (localMatches.length > 0) {
      setCompanies(localMatches)
      return
    }

    // Otherwise, try API
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

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
              <img src={logoMap[value]} alt="Logo" className="h-5 w-5 mr-2 rounded object-contain bg-white" />
            ) : (
              <Building2 className="h-5 w-5 mr-2 text-muted-foreground" />
            )
          ) : null}
          {value || <span className="text-muted-foreground">{placeholder || "Select Company..."}</span>}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Search companies..." 
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>
              {loading ? (
                <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Searching...
                </div>
              ) : query.length > 0 ? (
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
              ) : "Type to search..."}
            </CommandEmpty>
            <CommandGroup>
              {companies.map((company) => (
                <CommandItem
                  key={company.domain}
                  value={company.name}
                  onSelect={(currentValue) => {
                    // Save logo if available
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
                  className="flex items-center cursor-pointer"
                >
                  {company.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={company.logo} alt={company.name} className="h-6 w-6 mr-3 rounded object-contain bg-white" />
                  ) : company.domain ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`https://icon.horse/icon/${company.domain}`} alt={company.name} className="h-6 w-6 mr-3 rounded object-contain bg-white" />
                  ) : (
                    <Building2 className="h-6 w-6 mr-3 text-muted-foreground opacity-50" />
                  )}
                  {company.name}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === company.name ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
              {query && !companies.some(c => c.name.toLowerCase() === query.toLowerCase()) && companies.length > 0 && (
                 <CommandItem
                    value={query}
                    onSelect={() => {
                        onChange(query)
                        setOpen(false)
                    }}
                    className="cursor-pointer font-medium text-primary border-t mt-1 flex items-center"
                 >
                    <Building2 className="h-5 w-5 mr-3 opacity-50" />
                    Use custom: "{query}"
                 </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
