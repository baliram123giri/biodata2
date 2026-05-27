import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FileText, Palette, Camera, Download, Layout, RotateCcw, Smartphone, Sparkles, CheckCircle2, Lock as LucideLock } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { howToSchema } from "@/lib/seo-schemas";

export const metadata: Metadata = {
  title: "Marriage Biodata Maker – How It Works",
  description: "See how Biodata99 works — fill in your details, pick a template, add a photo, and download your marriage biodata as a PDF. Free and ready in minutes.",
  alternates: {
    canonical: "https://biodata99.com/how-it-works",
  },
  openGraph: {
    title: "Marriage Biodata Maker – How It Works",
    description: "See how Biodata99 works — fill in your details, pick a template, add a photo, and download your marriage biodata as a PDF. Free and ready in minutes.",
    url: "https://biodata99.com/how-it-works",
  },
};

export default function HowItWorksPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FFFBF8] dark:bg-[#1A0A0E] pt-24 pb-20 px-4 overflow-hidden relative">
      {/* Dynamic HowTo Schema */}
      <JsonLd schema={howToSchema} />

      {/* Decorative background gradients */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#9B1B30]/5 dark:bg-[#C9A84C]/5 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />
      <div className="absolute top-1/3 -left-48 w-96 h-96 bg-[#C9A84C]/5 dark:bg-[#9B1B30]/5 rounded-full blur-3xl pointer-events-none -z-10 animate-float" />
      <div className="absolute bottom-10 -right-48 w-96 h-96 bg-[#9B1B30]/5 dark:bg-[#C9A84C]/5 rounded-full blur-3xl pointer-events-none -z-10 animate-float-slow" />

      <div className="container mx-auto max-w-4xl relative z-10 space-y-16">
        
        {/* Title Block */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-[#FBF5E6] dark:bg-[#8A7233]/25 px-4 py-1.5 rounded-full border border-[#C9A84C]/40 text-xs font-black text-[#9B1B30] dark:text-[#E6C97A]">
            <Sparkles className="w-3.5 h-3.5" />
            Simple Walkthrough
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground animate-in fade-in duration-500">
            How It <span className="text-gradient-primary">Works</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto font-medium">
            Four simple steps to create a marriage biodata you are proud to share. No design skills needed.
          </p>
        </div>

        {/* Steps Walkthrough */}
        <div className="space-y-12">
          
          {/* Step 1 */}
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 bg-card border border-[#C9A84C]/20 rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex flex-col items-center shrink-0">
              <span className="text-5xl font-black text-[#C9A84C]/55 mb-2 leading-none">01</span>
              <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-md">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-foreground">Step 1 — Fill in Your Details</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Start by entering your information into the editor. The form is organised into clear sections so nothing feels overwhelming.
                </p>
              </div>

              <div className="bg-[#FFFBF8] dark:bg-[#1A0A0E]/30 rounded-xl p-5 border border-border/40 space-y-2">
                <div className="text-xs font-black uppercase text-[#9B1B30] dark:text-[#E6C97A] tracking-wider mb-2">What you can fill in:</div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#9B1B30]" />
                    <span>Personal details — name, DOB, height, complexion, religion, mother tongue</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#9B1B30]" />
                    <span>Educational &amp; professional background</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#9B1B30]" />
                    <span>Family details — parents, siblings, family type</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#9B1B30]" />
                    <span>Horoscope information if required</span>
                  </li>
                  <li className="flex items-center gap-2 sm:col-span-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#9B1B30]" />
                    <span>Contact details for the family</span>
                  </li>
                </ul>
              </div>

              <p className="text-xs font-semibold text-[#7A4A52] dark:text-muted-foreground bg-[#FAEAED]/50 dark:bg-[#1e1e21]/40 px-3 py-2 rounded-lg w-fit">
                💡 You can skip any section that does not apply. Fields can be reordered or hidden based on what your family prefers to share.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 bg-card border border-[#C9A84C]/20 rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex flex-col items-center shrink-0">
              <span className="text-5xl font-black text-[#C9A84C]/55 mb-2 leading-none">02</span>
              <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-md">
                <Palette className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-foreground">Step 2 — Choose a Template</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Pick a design that matches your family's taste. Each template is built around the sections families actually look for in a marriage biodata.
                </p>
              </div>

              <div className="bg-[#FFFBF8] dark:bg-[#1A0A0E]/30 rounded-xl p-5 border border-border/40 space-y-2">
                <div className="text-xs font-black uppercase text-[#9B1B30] dark:text-[#E6C97A] tracking-wider mb-2">What you can customise:</div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#9B1B30]" />
                    <span>Color scheme — choose from curated palettes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#9B1B30]" />
                    <span>Layout margins and spacing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#9B1B30]" />
                    <span>Auspicious symbols (Ganesha, Swastika, Ek Onkar, Kalash, Khanda)</span>
                  </li>
                </ul>
              </div>

              <p className="text-xs font-semibold text-[#7A4A52] dark:text-muted-foreground bg-[#FAEAED]/50 dark:bg-[#1e1e21]/40 px-3 py-2 rounded-lg w-fit">
                💡 The preview updates live as you make changes, so what you see is exactly what you get in the download.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 bg-card border border-[#C9A84C]/20 rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex flex-col items-center shrink-0">
              <span className="text-5xl font-black text-[#C9A84C]/55 mb-2 leading-none">03</span>
              <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-md">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-foreground">Step 3 — Add a Photo (Optional)</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Upload a photo directly from your phone or computer. You can crop and position it to fit cleanly within the template layout.
                </p>
              </div>

              <div className="bg-[#FFFBF8] dark:bg-[#1A0A0E]/30 rounded-xl p-5 border border-border/40 space-y-2">
                <div className="text-xs font-black uppercase text-[#9B1B30] dark:text-[#E6C97A] tracking-wider mb-2">A few things worth knowing:</div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#9B1B30] dark:text-[#E6C97A] shrink-0" />
                    <span>Your photo is processed entirely inside your browser</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#9B1B30] dark:text-[#E6C97A] shrink-0" />
                    <span>It is never uploaded or saved to our servers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#9B1B30] dark:text-[#E6C97A] shrink-0" />
                    <span>If you prefer not to add one, simply skip this step</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 bg-card border border-[#C9A84C]/20 rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex flex-col items-center shrink-0">
              <span className="text-5xl font-black text-[#C9A84C]/55 mb-2 leading-none">04</span>
              <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-md">
                <Download className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-foreground">Step 4 — Download and Share</h2>
                <p className="text-muted-foreground leading-relaxed">
                  When you are happy with how it looks, click Download. Your biodata is generated instantly.
                </p>
              </div>

              <div className="bg-[#FFFBF8] dark:bg-[#1A0A0E]/30 rounded-xl p-5 border border-border/40 space-y-2">
                <div className="text-xs font-black uppercase text-[#9B1B30] dark:text-[#E6C97A] tracking-wider mb-2">You get:</div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#9B1B30]" />
                    <span>High-resolution PDF — ready to print or share digitally</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#9B1B30]" />
                    <span>Microsoft Word (.docx) — fully editable offline document</span>
                  </li>
                  <li className="flex items-center gap-2 sm:col-span-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#9B1B30]" />
                    <span>JPG version if you need to send it on WhatsApp or matrimonial apps</span>
                  </li>
                </ul>
              </div>

              <p className="text-xs font-semibold text-[#7A4A52] dark:text-muted-foreground bg-[#FAEAED]/50 dark:bg-[#1e1e21]/40 px-3 py-2 rounded-lg w-fit">
                💡 The file saves directly to your device. No email required, no account, no waiting.
              </p>
            </div>
          </div>

        </div>

        {/* Radix UI Separator */}
        <Separator className="bg-[#C9A84C]/30 my-4" />

        {/* How the Editor Works Section */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-foreground">How the Editor Works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">
              Learn about the background technology that enables a seamless and private experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Feature 1 */}
            <div className="bg-card border border-border/60 rounded-2xl p-6 space-y-3 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-[#FAEAED] dark:bg-[#9B1B30]/30 flex items-center justify-center text-[#9B1B30] dark:text-[#E8D5D9]">
                <Layout className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Live preview</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Every change you make — text, color, photo, layout — appears instantly in the preview panel. You are always looking at the real biodata, not a rough approximation of it.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-card border border-border/60 rounded-2xl p-6 space-y-3 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-[#FBF5E6] dark:bg-[#8A7233]/30 flex items-center justify-center text-[#9B1B30] dark:text-[#E6C97A]">
                <LucideLock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Nothing is lost while you work</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your progress is saved automatically in your browser as you type. If you accidentally close the tab or step away, your details will still be there when you come back on the same device and browser.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-card border border-border/60 rounded-2xl p-6 space-y-3 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-[#FAEAED] dark:bg-[#9B1B30]/30 flex items-center justify-center text-[#9B1B30] dark:text-[#E8D5D9]">
                <RotateCcw className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Easy to make changes later</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Need to update a job title or add a sibling? Come back to Biodata99 on the same device, make your edits, and download a fresh PDF. The whole process takes two to three minutes.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-card border border-border/60 rounded-2xl p-6 space-y-3 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-[#FBF5E6] dark:bg-[#8A7233]/30 flex items-center justify-center text-[#8A7233] dark:text-[#E6C97A]">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Works on any device</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The editor runs entirely in your browser — no app to install, no software to download. It works on mobile, tablet, and desktop.
              </p>
            </div>

          </div>
        </div>

        {/* Bottom CTA Block */}
        <div className="bg-card border border-[#C9A84C]/25 rounded-3xl p-8 md:p-12 text-center space-y-6 max-w-3xl mx-auto shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#C9A84C]/10 to-transparent pointer-events-none" />
          
          <h3 className="text-2xl md:text-3xl font-black text-foreground">Ready to create your biodata?</h3>
          <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
            Free to use, private by design, and ready in minutes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button size="lg" className="rounded-full bg-gradient-primary border-0 font-bold px-10 py-6 text-base shadow-md hover:scale-105 transition-transform" asChild>
              <Link href="/edit">Create Biodata</Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full border-[#C9A84C] text-[#9B1B30] dark:text-[#E6C97A] hover:bg-[#FBF5E6] dark:hover:bg-[#8A7233]/10 font-bold px-10 py-6 text-base shadow-sm hover:scale-105 transition-transform" asChild>
              <Link href="/templates">Browse Templates</Link>
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
