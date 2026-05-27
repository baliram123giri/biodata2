import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { JsonLd } from "@/components/seo/JsonLd";
import { Heart, Shield, Compass, MapPin, Sparkles, Clock, FileDown, Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description: "Biodata99 is built by a small team in Pune, India. We make it easy for anyone to create a clean, well-designed marriage biodata without any design experience.",
  alternates: {
    canonical: "https://biodata99.com/about-us",
  },
  openGraph: {
    title: "About Us",
    description: "Biodata99 is built by a small team in Pune, India. We make it easy for anyone to create a clean, well-designed marriage biodata without any design experience.",
    url: "https://biodata99.com/about-us",
  },
};

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Biodata99",
  "url": "https://www.biodata99.com",
  "logo": "https://www.biodata99.com/logo.png",
  "foundingLocation": "Pune, Maharashtra, India",
  "email": "support@biodata99.com",
  "sameAs": [
    "https://www.instagram.com/officialbiodata99",
    "https://www.youtube.com/@biodata99",
    "https://www.pinterest.com/biodata99"
  ],
  "description": "Biodata99 is a free online marriage biodata maker for Indian families. Create and download professional biodata templates as PDF instantly, with complete privacy."
};

export default function AboutUsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FFFBF8] dark:bg-[#1A0A0E] pt-24 pb-20 px-4 overflow-hidden relative">
      {/* Organisation JSON-LD Schema */}
      <JsonLd schema={orgSchema} />

      {/* Decorative background elements */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#9B1B30]/5 dark:bg-[#C9A84C]/5 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />
      <div className="absolute top-1/3 -left-48 w-96 h-96 bg-[#C9A84C]/5 dark:bg-[#9B1B30]/5 rounded-full blur-3xl pointer-events-none -z-10 animate-float" />
      <div className="absolute bottom-10 -right-48 w-96 h-96 bg-[#9B1B30]/5 dark:bg-[#C9A84C]/5 rounded-full blur-3xl pointer-events-none -z-10 animate-float-slow" />

      <div className="container mx-auto max-w-4xl relative z-10 space-y-16">

        {/* Hero Section */}
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-[#FBF5E6] dark:bg-[#8A7233]/25 px-4 py-1.5 rounded-full border border-[#C9A84C]/40 text-xs font-black text-[#9B1B30] dark:text-[#E6C97A]">
            <Sparkles className="w-3.5 h-3.5" />
            Our Mission &amp; Vision
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.15] animate-in fade-in duration-500">
            About <span className="text-gradient-primary">Us</span>
          </h1>

          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-foreground/90 leading-[1.25] animate-in fade-in duration-500 max-w-2xl mx-auto">
            We help Indian families create a marriage biodata they are{" "}
            <span className="text-gradient-primary block md:inline">proud to share.</span>
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto font-medium">
            Biodata99 is built in Pune, India by a small team that understands how important this document is to your family.
          </p>
        </div>

        {/* Main Story Section */}
        <div className="bg-card border border-[#E8D5D9]/50 dark:border-[#27272a] rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
          <h2 className="text-2xl font-black text-foreground border-b border-[#C9A84C]/25 pb-3">
            Why We Built Biodata99
          </h2>
          <div className="space-y-4 text-muted-foreground text-base leading-relaxed">
            <p>
              A marriage biodata is often the first thing another family sees about you. It shapes their first impression before any conversation happens.
            </p>
            <p>
              We noticed that most families were either paying a designer for a basic Word file, struggling with complicated software, or settling for a generic template that did not reflect their background. None of that felt right for something this important.
            </p>
            <p className="font-medium text-foreground">
              So we built Biodata99 - a simple, browser-based tool where anyone can create a professional, well-designed marriage biodata in a few minutes, download it as a PDF, and share it with confidence. No design skills needed, no account required, and no personal details stored on our servers.
            </p>
          </div>
        </div>

        {/* Radix UI Separator */}
        <Separator className="bg-[#C9A84C]/30 my-4" />

        {/* Three Value Cards */}
        <div className="space-y-6">
          <h2 className="text-2xl md:text-3xl font-black text-center text-foreground">
            Our Core <span className="text-gradient-primary">Commitments</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card border border-[#C9A84C]/25 rounded-2xl p-6 text-center space-y-4 hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center mx-auto text-white">
                  <Heart className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Culture &amp; Design</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Our templates are designed around the sections Indian families actually look for - from family background to horoscope details - in clean, modern layouts.
                </p>
              </div>
            </div>

            <div className="bg-card border border-[#C9A84C]/25 rounded-2xl p-6 text-center space-y-4 hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center mx-auto text-white">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground">100% Privacy</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Everything you type stays on your device. We never see your name, photo, or family details. Your biodata is yours alone.
                </p>
              </div>
            </div>

            <div className="bg-card border border-[#C9A84C]/25 rounded-2xl p-6 text-center space-y-4 hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center mx-auto text-white">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Accessibility First</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We are building support for Hindi, Marathi, Tamil, and Telugu so more families can create a biodata in the language they are most comfortable with.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Who We Are Section */}
        <div className="bg-card border border-[#C9A84C]/25 rounded-2xl p-6 md:p-8 space-y-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#C9A84C]/10 to-transparent pointer-events-none" />

          <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
            <MapPin className="w-6 h-6 text-[#9B1B30] dark:text-[#C9A84C]" />
            Who We Are
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            Biodata99 is an independent product built and maintained in Pune, Maharashtra. We are a small team of developers and designers who work on this full time. If you have a suggestion, run into a problem, or want to request a template design, you can reach us directly at <a href="mailto:support@biodata99.com" className="text-[#9B1B30] dark:text-[#E6C97A] font-bold hover:underline">support@biodata99.com</a> - a real person reads every message.
          </p>
        </div>

        {/* Stats Row */}
        <div className="bg-gradient-to-r from-[#9B1B30]/5 via-[#C9A84C]/10 to-[#9B1B30]/5 dark:from-[#C9A84C]/5 dark:via-[#9B1B30]/10 dark:to-[#C9A84C]/5 border border-[#C9A84C]/20 rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center items-center">

            {/* Stat 1 */}
            <div className="space-y-2 flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-[#FAEAED] dark:bg-[#9B1B30]/30 flex items-center justify-center text-[#9B1B30] dark:text-[#E8D5D9] mb-1">
                <Clock className="w-5 h-5" />
              </div>
              <div className="text-2xl font-black text-foreground">2 minutes</div>
              <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Average time to complete</div>
            </div>

            {/* Radix Separator (hidden on mobile, visible on desktop) */}
            <div className="hidden md:flex justify-center h-12">
              <Separator orientation="vertical" className="bg-[#C9A84C]/30 w-px" />
            </div>

            {/* Stat 2 */}
            <div className="space-y-2 flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-[#FBF5E6] dark:bg-[#8A7233]/30 flex items-center justify-center text-[#9B1B30] dark:text-[#E6C97A] mb-1">
                <FileDown className="w-5 h-5" />
              </div>
              <div className="text-2xl font-black text-foreground">PDF Ready</div>
              <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">No software to install</div>
            </div>

            {/* Radix Separator (hidden on mobile, visible on desktop) */}
            <div className="hidden md:flex justify-center h-12">
              <Separator orientation="vertical" className="bg-[#C9A84C]/30 w-px" />
            </div>

            {/* Stat 3 */}
            <div className="space-y-2 flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-[#FAEAED] dark:bg-[#9B1B30]/30 flex items-center justify-center text-[#9B1B30] dark:text-[#E8D5D9] mb-1">
                <Lock className="w-5 h-5" />
              </div>
              <div className="text-2xl font-black text-foreground">100% Private</div>
              <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Nothing stored on servers</div>
            </div>

          </div>
        </div>

        {/* Interactive FAQ / Deep Dive Details with Radix Accordion */}
        <div className="bg-card border border-[#C9A84C]/25 rounded-2xl p-6 md:p-8 shadow-sm">
          <h2 className="text-2xl font-black text-foreground mb-4 flex items-center gap-2">
            <Compass className="w-6 h-6 text-[#9B1B30] dark:text-[#C9A84C]" />
            What Drives Biodata99
          </h2>

          <Accordion type="single" defaultValue="pillar-1" collapsible className="w-full space-y-2">
            <AccordionItem value="pillar-1" className="border-b border-border/40 py-2">
              <AccordionTrigger className="text-lg font-black text-left text-foreground hover:text-[#9B1B30] dark:hover:text-[#C9A84C] hover:no-underline py-4">
                🎨 Inspired by Culture, Perfected by Design
              </AccordionTrigger>
              <AccordionContent className="text-sm md:text-base text-muted-foreground leading-relaxed pt-2 pb-4 space-y-3">
                <p>
                  A matrimonial biodata is not just a CV -it is a cherished cultural artifact that initiates one of the most sacred unions in Indian society. Traditionally, families struggled with outdated Word files, paid exorbitant fees to local print shops, or spent hours wrestling with complex desktop editing software.
                </p>
                <p>
                  We built <strong className="text-foreground">Biodata99</strong> to revolutionize this first impression. By blending timeless traditional motifs (saffron/gold themes, elegant borders) with contemporary clean typography, we empower families to build high-end matrimonial resumes in minutes.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="pillar-2" className="border-b border-border/40 py-2">
              <AccordionTrigger className="text-lg font-black text-left text-foreground hover:text-[#9B1B30] dark:hover:text-[#C9A84C] hover:no-underline py-4">
                📍 Pune’s Innovation &amp; Family Values
              </AccordionTrigger>
              <AccordionContent className="text-sm md:text-base text-muted-foreground leading-relaxed pt-2 pb-4 space-y-3">
                <p>
                  Pune is known as a global educational hub and the cultural capital of Maharashtra. Our close-knit team based in Pune shares a deep familiarity with the warmth, expectations, and values of Indian household structures.
                </p>
                <p>
                  Every feature on our website is designed keeping in mind the uncles, aunts, parents, and siblings who collaborate on this document. Our intuitive, real-time builder guarantees a zero-learning-curve experience for users of all age groups.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="pillar-3" className="border-b border-border/40 py-2">
              <AccordionTrigger className="text-lg font-black text-left text-foreground hover:text-[#9B1B30] dark:hover:text-[#C9A84C] hover:no-underline py-4">
                🔒 100% Privacy by Design
              </AccordionTrigger>
              <AccordionContent className="text-sm md:text-base text-muted-foreground leading-relaxed pt-2 pb-4 space-y-3">
                <p>
                  Matrimonial biodatas contain sensitive personal and contact information. We strongly believe you should not have to compromise your family's data security in order to create a beautiful document.
                </p>
                <p>
                  Our system is built to run <strong>locally inside your browser</strong>. All translations, layout compiling, and image masking occur on your device. Your names, subcastes, phone numbers, and photographs are never transmitted or stored on any external servers.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

      </div>
    </div>
  );
}
