import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { TemplatesGrid } from "@/components/templates/TemplatesGrid";

export const metadata: Metadata = {
  title: "Premium Marriage Biodata Templates | biodata99.com",
  description: "Browse beautiful, traditional, and modern marriage biodata formats. Choose your template, select a language, customize colors, and download instantly.",
  alternates: {
    canonical: "https://biodata99.com/templates",
  },
};

export default function TemplatesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FFFBF8] dark:bg-[#1A0A0E] pt-24 pb-20 px-4">
      {/* Background Ornaments */}
      <div className="absolute top-0 right-0 w-[40%] h-[40%] rounded-full bg-gradient-to-tr from-[#9B1B30]/5 to-[#C9A84C]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40%] h-[40%] rounded-full bg-gradient-to-br from-[#C9A84C]/5 to-[#9B1B30]/5 blur-[120px] pointer-events-none" />

      <div className="container mx-auto max-w-6xl relative z-10 space-y-16">
        {/* Header Block */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#C9A84C]/45 bg-[#FBF5E6]/90 dark:bg-[#8A7233]/25 px-4.5 py-1.5 text-xs font-black text-[#8A7233] dark:text-[#E6C97A]">
            <Sparkles className="w-3.5 h-3.5" />
            Premium Design Collection
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
            Marriage <span className="text-gradient-primary">Biodata Formats</span> &amp; Templates
          </h1>
          <p className="text-lg text-muted-foreground">
            Explore our curated catalog of premium matrimonial biodatas. Choose any format below to load it instantly in our designer studio for customization.
          </p>
        </div>

        {/* Templates Grid Component */}
        <TemplatesGrid />

        {/* Footer Info Block */}
        <div className="bg-card border border-[#C9A84C]/20 rounded-2xl p-8 max-w-4xl mx-auto shadow-md text-center space-y-4">
          <h3 className="text-xl font-bold text-foreground">Can't decide which template is right?</h3>
          <p className="text-muted-foreground text-sm max-w-2xl mx-auto">
            Don't worry! You can change your template and layout style with a single click inside the editor **without losing any filled details**. Start with any design and customize it later.
          </p>
          <Button size="lg" className="rounded-full bg-gradient-primary border-0 font-bold px-8 shadow-md" asChild>
            <Link href="/edit">Open Creator Studio</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
