import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart, Shield, Users, Compass } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about the mission behind biodata99.com - helping families create beautiful, private, and traditional marriage biodatas online for free.",
  alternates: {
    canonical: "https://biodata99.com/about-us",
  },
  openGraph: {
    title: "About Us",
    description: "Learn about the mission behind biodata99.com - helping families create beautiful, private, and traditional marriage biodatas online for free.",
    url: "https://biodata99.com/about-us",
  },
};

export default function AboutUsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FFFBF8] dark:bg-[#1A0A0E] pt-24 pb-20 px-4">
      <div className="container mx-auto max-w-4xl relative z-10 space-y-16">
        
        {/* Header Block */}
        <div className="text-center space-y-4 max-w-xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground animate-in fade-in duration-500">
            About <span className="text-gradient-primary">Us</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Helping families across the globe connect through beautiful, culturally rich matrimonial resumes.
          </p>
        </div>

        {/* Vision Text */}
        <div className="space-y-6 text-center md:text-left leading-relaxed text-muted-foreground">
          <p>
            Welcome to <strong className="text-foreground">biodata99.com</strong>. We are a dedicated team of designers, engineers, and culture enthusiasts committed to simplifying the process of creating matrimonial biodatas. Marriage is a highly celebrated milestone in Indian households, and a biodata is the very first step of communication between two families. We believe this first impression should be premium, clear, and visually outstanding.
          </p>
          <p>
            Traditionally, families had to struggle with basic Word templates, pay expensive designers, or use complicated editing software to assemble their details. We built biodata99.com to solve this issue — providing an intuitive, instantaneous, drag-and-drop tool that allows anyone to create a professional matrimonial biodata in less than 2 minutes.
          </p>
        </div>

        {/* Our Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
          <div className="bg-card border border-[#C9A84C]/25 rounded-2xl p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center mx-auto text-white">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Culture &amp; Design</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We design premium themes that blend traditional elements, sacred symbols, and modern clean layouts.
            </p>
          </div>

          <div className="bg-card border border-[#C9A84C]/25 rounded-2xl p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center mx-auto text-white">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-foreground">100% Privacy</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We run all processes locally inside your browser. Your name, details, and photos are never uploaded or stored on our servers.
            </p>
          </div>

          <div className="bg-card border border-[#C9A84C]/25 rounded-2xl p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center mx-auto text-white">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Accessibility First</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Supported in multiple regional Indian languages to ensure that language is never a barrier in finding your perfect match.
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="bg-card border border-[#C9A84C]/20 rounded-2xl p-8 text-center space-y-4 max-w-2xl mx-auto shadow-sm">
          <h3 className="text-xl font-bold text-foreground">Create a stunning biodata today</h3>
          <p className="text-sm text-muted-foreground">
            Get started right now. Choose a template, fill in your information, and download a print-ready PDF instantly.
          </p>
          <Button size="lg" className="rounded-full bg-gradient-primary border-0 font-bold px-8 shadow-md" asChild>
            <Link href="/edit">Open Editor</Link>
          </Button>
        </div>

      </div>
    </div>
  );
}
