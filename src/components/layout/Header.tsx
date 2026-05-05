import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between mx-auto px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-primary">Biodata Maker</span>
          </Link>
        </div>
        
        <nav aria-label="Main navigation" className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="transition-colors hover:text-primary">
            Home
          </Link>
          <Link href="/templates" className="transition-colors hover:text-primary">
            Templates
          </Link>
          <Link href="/how-it-works" className="transition-colors hover:text-primary">
            How It Works
          </Link>
          <Link href="/faqs" className="transition-colors hover:text-primary">
            FAQs
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Button asChild className="font-semibold px-6 rounded-full">
            <Link href="/create">Create Biodata</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
