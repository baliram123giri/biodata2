import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, FileText, Smartphone, Monitor, Download, Lock, ArrowDown, Wand2, Users, Globe, RefreshCw, Clock, Languages, Shield, HelpCircle } from "lucide-react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import dynamic from "next/dynamic";
import { Metadata } from "next";
import { howToSchema, generateFaqSchema } from "@/lib/seo-schemas";
import { JsonLd } from "@/components/seo/JsonLd";

import { HeroCardDeck } from "@/components/home/HeroCardDeck";

const HomeBiodataBuilder = dynamic(
  () => import("@/components/biodata/HomeBiodataBuilder").then(mod => mod.HomeBiodataBuilder)
);

export const metadata: Metadata = {
  title: "Free Marriage Biodata Format with Photo - PDF, JPEG & PNG",
  description: "Download a free marriage biodata format with photo for boy or girl. Simple one-page design, download as PDF, JPEG or PNG. Ready to share on WhatsApp instantly.",
};

const homepageFaqs = [
  {
    question: "Is Biodata99 completely free?",
    answer: "Creating and downloading your biodata is free. Some premium templates have a one-time fee - you'll see those clearly marked before you pick one. No surprises after you've filled everything in."
  },
  {
    question: "Do I need to create an account or sign in?",
    answer: "No account, no sign-in, no email address needed. Just open the form, fill your details, and download. We deliberately built it this way - creating an account felt unnecessary for something this personal."
  },
  {
    question: "Is my personal information safe?",
    answer: "Your details - name, photo, family information - never leave your device. Everything happens in your browser. We don't store, transmit, or have access to what you fill in. Once you close the tab, it's gone from our end completely."
  },
  {
    question: "Can I make a biodata in Hindi or Marathi?",
    answer: "Yes. You can switch the biodata language to Hindi, Marathi, Tamil, Telugu, Gujarati, Kannada, Bengali, Punjabi, or Urdu - right from the form. The template labels and layout adjust automatically."
  },
  {
    question: "Can I download as PDF and share on WhatsApp?",
    answer: "Yes. PDF, JPEG, and PNG are all available. For WhatsApp sharing, JPEG works best - the file size stays small and the image quality holds up well on mobile. PDF is better if someone wants to print it or share over email."
  },
  {
    question: "Can I edit my biodata after downloading?",
    answer: "Not after downloading, no. Since we don't store your data, the form clears once you close or refresh the tab. The practical workaround: keep the tab open while you share and wait for feedback, make any changes, then download the final version. Most people are done in one sitting anyway."
  }
];

export default function Home() {
  const finalSlides = [
    { id: "1", imageUrl: "https://res.cloudinary.com/dhlyinfwd/image/upload/w_300,c_scale,q_auto,f_auto/v1780333327/biodata/hero_slides/umpd0mqssairpwfzpytk.png", title: "Royal Gold Premium" },
    { id: "2", imageUrl: "https://res.cloudinary.com/dhlyinfwd/image/upload/w_300,c_scale,q_auto,f_auto/v1780333386/biodata/hero_slides/rslwwcxq7e8hdcsz0vbk.png", title: "Neelambari Dream" },
    { id: "3", imageUrl: "https://res.cloudinary.com/dhlyinfwd/image/upload/w_300,c_scale,q_auto,f_auto/v1780333404/biodata/hero_slides/vwqpwpwy72u2xnnwlc0x.png", title: "Peacock Royal" }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#FFFBF8] dark:bg-[#1A0A0E] pt-2 pb-4 md:pt-4 md:pb-8 px-4 border-b border-border/40">
        {/* Grid Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(201,168,76,0.06)_1px,transparent_1px)] [background-size:36px_36px] pointer-events-none" />

        <div className="container mx-auto max-w-6xl flex flex-col lg:flex-row items-start gap-6 lg:gap-20 relative z-10">
          {/* Left Text Column */}
          <div className="flex-1 text-center lg:text-left space-y-3 md:space-y-5">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-[#C9A84C]/45 bg-[#FBF5E6]/90 dark:bg-[#8A7233]/25 px-4.5 py-2 text-xs font-extrabold text-[#8A7233] dark:text-[#E6C97A] backdrop-blur-sm shadow-md transition-all duration-300">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C9A84C] animate-pulse" />
              100% Free Online Biodata Maker
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-stone-900 dark:text-white leading-[1.12] font-sans">
              Your <span className="text-gradient-primary">Marriage Biodata</span> with Photo - Ready in Minutes, Free to Download
            </h1>

            <p className="text-stone-600 dark:text-stone-300 text-xs md:text-sm lg:text-base max-w-2xl mx-auto lg:mx-0 leading-relaxed font-semibold">
              Pick a stylish format, fill your details, add your photo and download as a print-ready PDF, JPEG or PNG. No account needed. Your data stays on your device.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-1">
              <Button size="sm" className="rounded-full text-sm px-7 py-5 w-full sm:w-auto bg-gradient-primary border-0 font-bold tracking-wide shadow-xl shadow-[#9B1B30]/25 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer" asChild>
                <a href="#builder">
                  Start Creating Free
                  <ArrowDown className="w-3.5 h-3.5 ml-2 animate-bounce" />
                </a>
              </Button>
              <Button size="sm" variant="outline" className="rounded-full text-sm px-7 py-5 w-full sm:w-auto border-[#C9A84C]/50 hover:bg-[#FBF5E6]/40 dark:hover:bg-[#8A7233]/15 font-bold text-foreground transition-all duration-200 cursor-pointer" asChild>
                <Link href="/templates">View Templates</Link>
              </Button>
            </div>

            {/* Features & Formats Metadata Stack */}
            <div className="hidden md:block space-y-2.5 pt-2">
              {/* Trust Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 text-[11px] font-extrabold">
                <span className="text-stone-400 dark:text-stone-500 uppercase tracking-wider text-[9px] mr-1 shrink-0">Features:</span>
                {[
                  "With photo",
                  "PDF, JPEG & PNG",
                  "WhatsApp-ready",
                  "No data stored",
                  "Boy & Girl formats"
                ].map((badge) => (
                  <div key={badge} className="flex items-center gap-1.5 bg-stone-50 dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-none px-3 py-1.5 text-stone-700 dark:text-stone-300 shadow-xs hover:border-[#C9A84C]/50 transition-colors">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C9A84C] shrink-0" />
                    <span>{badge}</span>
                  </div>
                ))}
              </div>

              {/* Community formats line (SEO + user signal) */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1.5 text-[11px] font-extrabold">
                <span className="text-[#8A7233] dark:text-[#E6C97A] uppercase tracking-wider text-[9px] mr-1 shrink-0">Formats:</span>
                {["Hindu", "Muslim", "Christian", "Sikh", "Jain", "NRI"].map((community) => (
                  <span key={community} className="px-2.5 py-1 border border-stone-200/50 dark:border-stone-800/80 bg-white/50 dark:bg-stone-900/50 text-stone-600 dark:text-stone-400 rounded-none text-[10px] tracking-wide hover:text-[#C9A84C] hover:border-[#C9A84C]/45 transition-colors cursor-default shadow-2xs">
                    {community}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Preview Column with Interactive Overlapping Templates */}
          <div className="flex-1 w-full max-w-lg mx-auto lg:mx-0 relative">
            {/* Elegant Golden Mandala Ornament Behind Image */}
            <div className="absolute -inset-10 bg-gradient-to-tr from-[#C9A84C]/20 via-transparent to-[#9B1B30]/20 rounded-full blur-xl animate-pulse pointer-events-none" />

            {/* SVG Decorative Indian Pattern Backdrop */}
            <div className="absolute -top-2 -left-14 w-32 h-32 text-[#C9A84C]/25 pointer-events-none hidden md:block">
              <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
                <path d="M50 0 C60 25 75 40 100 50 C75 60 60 75 50 100 C40 75 25 60 0 50 C25 40 40 25 50 0 Z" />
              </svg>
            </div>
            <div className="absolute bottom-14 -right-14 w-28 h-28 text-[#9B1B30]/20 pointer-events-none hidden md:block">
              <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
                <path d="M50 0 C60 25 75 40 100 50 C75 60 60 75 50 100 C40 75 25 60 0 50 C25 40 40 25 50 0 Z" />
              </svg>
            </div>

            {/* Interactive Premium Three-Card Deck */}
            <HeroCardDeck slides={finalSlides} />
          </div>
        </div>

        {/* Elegant Curved Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0 h-12 overflow-hidden pointer-events-none">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-[120%] h-full text-[#FFFBF8] dark:text-[#1A0A0E] fill-current">
            {/* Gold Accent Wave */}
            <path d="M0,30 C150,90 350,120 600,90 C850,60 1050,100 1200,40 L1200,120 L0,120 Z" fill="#C9A84C" opacity="0.1" />
            {/* Main Wave */}
            <path d="M0,50 C150,100 350,130 600,100 C850,70 1050,110 1200,60 L1200,120 L0,120 Z" />
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          BIODATA BUILDER - Full create experience embedded on homepage
          ═══════════════════════════════════════════════════════════════════ */}
      <div id="builder" className="scroll-mt-4" />
      <HomeBiodataBuilder />

      {/* Features Section */}
      <section className="py-10 md:py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8 md:mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground font-sans">
              Why Families Use Our <span className="text-gradient-primary">Free Marriage Biodata Maker</span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground font-semibold max-w-2xl mx-auto">
              No design skills needed. Fill your details, pick a stylish biodata format, and download as PDF, JPEG or PNG - all in under 5 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            <FeatureCard
              icon={<FileText className="w-8 h-8 text-primary" />}
              title="50+ Biodata Templates"
              description="Traditional designs with religious symbols to modern clean layouts - for every Indian community."
            />
            <FeatureCard
              icon={<Wand2 className="w-8 h-8 text-primary" />}
              title="No Design Skills Needed"
              description="Just open the form, fill your details, pick a template and your biodata is ready."
            />
            <FeatureCard
              icon={<Monitor className="w-8 h-8 text-primary" />}
              title="Live Preview as You Type"
              description="See your final biodata update in real time before you download."
            />
            <FeatureCard
              icon={<Download className="w-8 h-8 text-primary" />}
              title="Free PDF, JPEG &amp; PNG Download"
              description="Download as print-ready PDF, high-res JPEG or PNG. Share on WhatsApp or print on A4."
            />
            <FeatureCard
              icon={<span className="text-2xl font-bold text-white font-sans">Aअ</span>}
              title="10+ Indian Languages"
              description="Hindi, Tamil, Telugu, Marathi, Gujarati, Kannada, Bengali, Punjabi, Urdu &amp; English."
            />
            <FeatureCard
              icon={<Lock className="w-8 h-8 text-primary" />}
              title="100% Private - No Login"
              description="Your name, photo &amp; personal details never leave your device. Nothing stored on our servers."
            />
          </div>
        </div>
      </section>

      {/* Who Is This For Section */}
      <section className="py-12 md:py-16 px-4 border-t border-border/30 bg-white dark:bg-[#150709]">
        <div className="container mx-auto max-w-6xl">
          {/* Section Header */}
          <div className="space-y-2 mb-8 md:mb-10 text-left">
            <span className="text-[12px] font-bold uppercase tracking-wider text-[#8A7233] dark:text-[#E6C97A] block font-sans">
              WHO IS THIS FOR
            </span>
            <h2 className="text-[22px] md:text-[26px] font-medium text-stone-900 dark:text-white tracking-tight leading-snug font-sans">
              Made for real situations, not just profiles
            </h2>
            <p className="text-[15px] md:text-[16px] text-stone-550 dark:text-stone-400 leading-relaxed max-w-2xl font-normal">
              Whether you're just starting or helping someone you love, biodata99.com fits where you are right now.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="border border-stone-200/60 dark:border-stone-850 bg-white dark:bg-stone-900/40 rounded-xl p-6 flex flex-col gap-3 shadow-xs hover:border-[#C9A84C]/50 hover:shadow-sm transition-all duration-300">
              <div className="w-8 h-8 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200/50 dark:border-stone-750 flex items-center justify-center text-[#8A7233] dark:text-[#E6C97A] shrink-0">
                <FileText className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-[14px] font-medium text-stone-900 dark:text-white tracking-tight leading-snug">
                Ready to start looking
              </h3>
              <p className="text-[13px] text-stone-550 dark:text-stone-400 leading-relaxed line-clamp-2">
                You need a clean, presentable biodata to share with families or on matrimonial sites - without hiring anyone.
              </p>
            </div>

            {/* Card 2 */}
            <div className="border border-stone-200/60 dark:border-stone-850 bg-white dark:bg-stone-900/40 rounded-xl p-6 flex flex-col gap-3 shadow-xs hover:border-[#C9A84C]/50 hover:shadow-sm transition-all duration-300">
              <div className="w-8 h-8 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200/50 dark:border-stone-750 flex items-center justify-center text-[#8A7233] dark:text-[#E6C97A] shrink-0">
                <Users className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-[14px] font-medium text-stone-900 dark:text-white tracking-tight leading-snug">
                Parents doing the search
              </h3>
              <p className="text-[13px] text-stone-500 dark:text-stone-400 leading-relaxed line-clamp-2">
                Creating a biodata for your son or daughter. You want it done quickly, correctly, and in a format families respect.
              </p>
            </div>

            {/* Card 3 */}
            <div className="border border-stone-200/60 dark:border-stone-850 bg-white dark:bg-stone-900/40 rounded-xl p-6 flex flex-col gap-3 shadow-xs hover:border-[#C9A84C]/50 hover:shadow-sm transition-all duration-300">
              <div className="w-8 h-8 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200/50 dark:border-stone-750 flex items-center justify-center text-[#8A7233] dark:text-[#E6C97A] shrink-0">
                <Globe className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-[14px] font-medium text-stone-900 dark:text-white tracking-tight leading-snug">
                NRI or settled abroad
              </h3>
              <p className="text-[13px] text-stone-550 dark:text-stone-400 leading-relaxed line-clamp-2">
                You need a biodata that works in both English and your home language - presentable to families in India and overseas.
              </p>
            </div>

            {/* Card 4 */}
            <div className="border border-stone-200/60 dark:border-stone-850 bg-white dark:bg-stone-900/40 rounded-xl p-6 flex flex-col gap-3 shadow-xs hover:border-[#C9A84C]/50 hover:shadow-sm transition-all duration-300">
              <div className="w-8 h-8 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200/50 dark:border-stone-750 flex items-center justify-center text-[#8A7233] dark:text-[#E6C97A] shrink-0">
                <RefreshCw className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-[14px] font-medium text-stone-900 dark:text-white tracking-tight leading-snug">
                Second marriage or divorce
              </h3>
              <p className="text-[13px] text-stone-550 dark:text-stone-400 leading-relaxed line-clamp-2">
                Looking for a fresh start. You want a dignified, straightforward biodata - no fuss, no judgment, no saved data.
              </p>
            </div>

            {/* Card 5 */}
            <div className="border border-stone-200/60 dark:border-stone-850 bg-white dark:bg-stone-900/40 rounded-xl p-6 flex flex-col gap-3 shadow-xs hover:border-[#C9A84C]/50 hover:shadow-sm transition-all duration-300">
              <div className="w-8 h-8 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200/50 dark:border-stone-750 flex items-center justify-center text-[#8A7233] dark:text-[#E6C97A] shrink-0">
                <Clock className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-[14px] font-medium text-stone-900 dark:text-white tracking-tight leading-snug">
                Last-minute need
              </h3>
              <p className="text-[13px] text-stone-550 dark:text-stone-400 leading-relaxed line-clamp-2">
                A relative asked for your biodata today. You need something ready in minutes - not days.
              </p>
            </div>

            {/* Card 6 */}
            <div className="border border-stone-200/60 dark:border-stone-850 bg-white dark:bg-stone-900/40 rounded-xl p-6 flex flex-col gap-3 shadow-xs hover:border-[#C9A84C]/50 hover:shadow-sm transition-all duration-300">
              <div className="w-8 h-8 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200/50 dark:border-stone-750 flex items-center justify-center text-[#8A7233] dark:text-[#E6C97A] shrink-0">
                <Languages className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-[14px] font-medium text-stone-900 dark:text-white tracking-tight leading-snug">
                Regional language preference
              </h3>
              <p className="text-[13px] text-stone-500 dark:text-stone-400 leading-relaxed line-clamp-2">
                Your family communicates in Hindi, Marathi, Tamil, or Telugu. You want your biodata to feel native, not translated.
              </p>
            </div>
          </div>

          {/* Radix Separator */}
          <SeparatorPrimitive.Root className="h-px w-full bg-stone-200/60 dark:bg-stone-800/80 my-8" />

          {/* Bottom Note */}
          <div className="bg-[#FFFBF8] dark:bg-[#1C1214] border border-[#C9A84C]/20 dark:border-[#C9A84C]/10 rounded-lg py-3 px-4 flex items-start sm:items-center gap-3">
            <Shield className="w-4.5 h-4.5 text-[#8A7233] dark:text-[#E6C97A] shrink-0 mt-0.5 sm:mt-0" />
            <p className="text-[13px] text-stone-650 dark:text-stone-300 leading-normal font-normal">
              No account needed, nothing is saved on our servers. You fill your details, download your biodata, and that's it. Works on mobile too.
            </p>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-12 md:py-24 bg-muted relative px-4 overflow-hidden">
        <div className="container mx-auto max-w-6xl">

          {/* Header */}
          <div className="text-center mb-8 md:mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4">How It Works</p>
            <h2 className="text-3xl md:text-5xl font-black text-foreground leading-tight mb-4">
              Make Your Biodata in{" "}
              <span className="text-primary">
                4 Simple Steps
              </span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              From blank form to a downloaded PDF - in under 5 minutes, on any device.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            <StepCard number="01" title="Fill In Your Details" description="Enter your personal info, family background, education, and contact details - step by step." icon="📝" />
            <StepCard number="02" title="Pick a Biodata Format" description="Browse stylish marriage biodata templates - traditional, modern, or community-specific for boy or girl." icon="🎨" />
            <StepCard number="03" title="Add Photo & Customise" description="Upload your photo, choose a colour theme, and add your religious mantra or heading." icon="✨" />
            <StepCard number="04" title="Download & Share Free" description="Download as PDF, JPEG or PNG. Share directly on WhatsApp, email, or matrimony sites." icon="📥" />
          </div>

          {/* CTA */}
          <div className="mt-8 md:mt-14 text-center">
            <Button size="lg" className="rounded-full px-10 py-6 bg-gradient-primary border-0 hover:scale-105 active:scale-95 transition-all duration-300" asChild>
              <a href="#builder">Start Creating - It&apos;s Free</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Homepage FAQ Section */}
      <section className="py-12 md:py-20 px-4 border-t border-border/30 bg-background relative overflow-hidden">
        <div className="container mx-auto max-w-4xl space-y-10 relative z-10">
          
          {/* Header Title */}
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 bg-[#FBF5E6]/90 dark:bg-[#8A7233]/25 px-4.5 py-2 rounded-full border border-[#C9A84C]/45 text-xs font-black text-[#9B1B30] dark:text-[#E6C97A]">
              <HelpCircle className="w-3.5 h-3.5" />
              FAQ
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground font-sans">
              Frequently Asked <span className="text-gradient-primary">Questions</span>
            </h2>
            <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto leading-relaxed font-semibold">
              Find answers to the most common questions before creating your marriage biodata.
            </p>
          </div>

          {/* Radix Accordion FAQ list */}
          <div className="bg-card border border-[#C9A84C]/20 dark:border-stone-850 rounded-2xl p-6 md:p-8 shadow-md">
            <Accordion type="single" collapsible className="w-full space-y-2">
              {homepageFaqs.map((faq, idx) => (
                <AccordionItem key={idx} value={`faq-${idx}`} className="border-b border-border/40 py-2">
                  <AccordionTrigger className="text-base font-black text-left text-stone-900 dark:text-white hover:text-primary hover:no-underline py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm md:text-base text-stone-500 dark:text-stone-400 leading-relaxed pt-2 pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* See All FAQs Link */}
          <div className="text-center pt-2">
            <Link href="/faqs" className="inline-flex items-center gap-1 text-[#9B1B30] dark:text-[#E6C97A] hover:underline font-extrabold text-sm transition-colors">
              More questions? See all FAQs →
            </Link>
          </div>

        </div>
      </section>

      {/* Structured Data (HowTo & FAQ Schema) for Search Crawlers */}
      <JsonLd schema={howToSchema} />
      <JsonLd schema={generateFaqSchema(homepageFaqs)} />
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="premium-gold-border premium-gold-card group">
      <div className="bg-gradient-primary w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform">
        {/* Override the text-primary class passed from props to be white */}
        {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-8 h-8 text-white" })}
      </div>
      <h3 className="text-xl font-bold tracking-tight text-stone-900 dark:text-white mb-3">{title}</h3>
      <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({ number, title, description, icon }: { number: string, title: string, description: string, icon: string }) {
  return (
    <div className="premium-gold-border premium-gold-card group relative rounded-2xl p-7 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      {/* Number chip */}
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-white text-xs font-black mb-5 group-hover:scale-110 transition-transform duration-300">
        {number}
      </span>

      {/* Emoji icon */}
      <div className="text-3xl mb-4">{icon}</div>

      <h3 className="text-base font-bold text-foreground mb-2 tracking-tight group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  );
}
