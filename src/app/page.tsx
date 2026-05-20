import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, FileText, Smartphone, Monitor, Download, Lock, ArrowDown } from "lucide-react";
import { HomeBiodataBuilder } from "@/components/biodata/HomeBiodataBuilder";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-muted to-background pt-10 pb-8 px-4">
        <div className="container mx-auto max-w-6xl flex flex-col lg:flex-row items-center gap-6 lg:gap-12">
          <div className="flex-1 text-center lg:text-left space-y-4">
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
              Trusted by 100,000+ Happy Families
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
              Free Online Biodata Maker <span className="text-gradient-primary">for Marriage</span>
            </h1>
            <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0">
              Create FREE marriage biodata online in 2 minutes. 50+ professional templates, 10+ Indian languages. Instant PDF download. No login required.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
              <Button size="lg" className="rounded-full text-lg px-8 py-5 w-full sm:w-auto bg-gradient-primary border-0" asChild>
                <a href="#builder">
                  Start Creating — It&apos;s Free
                  <ArrowDown className="w-5 h-5 ml-2 animate-bounce" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full text-lg px-8 py-5 w-full sm:w-auto" asChild>
                <Link href="/templates">View Templates</Link>
              </Button>
            </div>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 md:gap-6 text-sm text-muted-foreground pt-2">
              <div className="flex items-center gap-2 shrink-0"><CheckCircle2 className="w-4 h-4 text-primary" /> No Login Needed</div>
              <div className="flex items-center gap-2 shrink-0"><CheckCircle2 className="w-4 h-4 text-primary" /> 100% Private</div>
              <div className="flex items-center gap-2 shrink-0"><CheckCircle2 className="w-4 h-4 text-primary" /> Free PDF</div>
            </div>
          </div>

          <div className="flex-1 w-full max-w-md mx-auto lg:mx-0">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-muted/20">
              <img
                src="/arjun_sharma.png"
                alt="Free Premium Marriage Biodata Template Preview"
                className="w-full h-auto object-cover aspect-[3/4] hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          BIODATA BUILDER — Full create experience embedded on homepage
          ═══════════════════════════════════════════════════════════════════ */}
      <HomeBiodataBuilder />

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">Everything you need to create a professional marriage biodata</h2>
            <p className="text-lg text-muted-foreground">In one simple tool. No design skills required. Just fill your details and download.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<FileText className="w-8 h-8 text-primary" />}
              title="50+ Beautiful Templates"
              description="Pick from professionally designed biodata formats — traditional designs with religious symbols to modern clean layouts."
            />
            <FeatureCard
              icon={<Smartphone className="w-8 h-8 text-primary" />}
              title="Simple to Use"
              description="No design experience needed. Open the form, type in your details, pick a template, and your biodata is ready."
            />
            <FeatureCard
              icon={<Monitor className="w-8 h-8 text-primary" />}
              title="Live Preview as You Type"
              description="Watch your biodata update with every keystroke. You see the final result on screen before you download."
            />
            <FeatureCard
              icon={<Download className="w-8 h-8 text-primary" />}
              title="Free PDF Download"
              description="Download your finished biodata as a high-quality PDF instantly. Share on WhatsApp or print on A4 paper."
            />
            <FeatureCard
              icon={<span className="text-2xl font-bold text-white">Aअ</span>}
              title="10 Indian Languages"
              description="Create your biodata in Hindi, Tamil, Telugu, Marathi, Gujarati, Kannada, Bengali, Punjabi, Urdu, or English."
            />
            <FeatureCard
              icon={<Lock className="w-8 h-8 text-primary" />}
              title="100% Private"
              description="Your name, photo, and personal details never leave your device. No login required. Nothing stored on our servers."
            />
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 bg-muted px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">Create Your Marriage Biodata Online</h2>
            <p className="text-lg text-muted-foreground">From blank form to downloaded PDF in under 5 minutes.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <StepCard number="1" title="Fill In Details" description="Enter your name, family background, education, and contact details." />
            <StepCard number="2" title="Pick a Template" description="Browse 50+ designs and choose one that fits your style." />
            <StepCard number="3" title="Customize" description="Add your photo, select a color theme, and pick religious symbols." />
            <StepCard number="4" title="Download" description="Download as a high-quality PDF — instantly. Share anywhere." />
          </div>

          <div className="mt-16 text-center">
            <Button size="lg" className="rounded-full text-lg px-8 py-6 bg-gradient-primary border-0" asChild>
              <a href="#builder">Start Creating Free</a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="border-none shadow-md hover:shadow-lg transition-all hover:-translate-y-1 bg-card h-full group">
      <CardContent className="pt-8 space-y-4 h-full flex flex-col items-center text-center">
        <div className="bg-gradient-primary w-16 h-16 rounded-full flex items-center justify-center mb-2 shadow-md group-hover:scale-110 transition-transform">
          {/* Override the text-primary class passed from props to be white */}
          {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-8 h-8 text-white" })}
        </div>
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function StepCard({ number, title, description }: { number: string, title: string, description: string }) {
  return (
    <div className="text-center space-y-4 relative group">
      <div className="w-16 h-16 mx-auto bg-gradient-primary text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-lg z-10 relative group-hover:scale-110 transition-transform border-0">
        {number}
      </div>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
