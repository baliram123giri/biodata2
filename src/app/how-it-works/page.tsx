import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ChevronRight, FileText, Palette, Download, Share2 } from "lucide-react";

export const metadata: Metadata = {
  title: "How It Works | Free Marriage Biodata Creator",
  description: "Learn how to make a beautiful, traditional matrimonial biodata in 4 easy steps. Select themes, add profiles, select languages, and download PDF instantly.",
  alternates: {
    canonical: "https://biodata99.com/how-it-works",
  },
  openGraph: {
    title: "How It Works | Free Marriage Biodata Creator",
    description: "Learn how to make a beautiful, traditional matrimonial biodata in 4 easy steps. Select themes, add profiles, select languages, and download PDF instantly.",
    url: "https://biodata99.com/how-it-works",
  },
};

export default function HowItWorksPage() {
  const steps = [
    {
      num: "01",
      title: "Fill in Your Details",
      desc: "Complete the form fields with your personal details, physical traits, educational background, professional details, family background, and contact details. You can add, remove, or swap fields according to your family's preferences.",
      icon: <FileText className="w-6 h-6 text-white" />,
    },
    {
      num: "02",
      title: "Choose a Beautiful Theme & Template",
      desc: "Choose from our hand-crafted, culturally rich templates. Change color schemes, modify font styles, pick margins, and select auspicious symbols (such as Ganesha, Swastika, Ek Onkar, Kalash, or Khanda) that represent your cultural values.",
      icon: <Palette className="w-6 h-6 text-white" />,
    },
    {
      num: "03",
      title: "Add Profile Photo (Optional)",
      desc: "Upload a high-quality profile picture directly from your mobile phone or computer. Crop it to fit perfectly within the layout frame. Your photo is processed locally inside your browser and is never stored on our servers.",
      icon: <CheckCircle2 className="w-6 h-6 text-white" />,
    },
    {
      num: "04",
      title: "Instant Download & Share",
      desc: "Review your live PDF layout. Choose whether to download as a high-resolution PDF for printing, or generate a crisp JPG image. Share it immediately with families and relatives on WhatsApp or matrimonial apps.",
      icon: <Download className="w-6 h-6 text-white" />,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#FFFBF8] dark:bg-[#1A0A0E] pt-24 pb-20 px-4">
      <div className="container mx-auto max-w-5xl relative z-10 space-y-16">
        
        {/* Title Block */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
            How It <span className="text-gradient-primary">Works</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Follow our simple 4-step process to build a highly professional, beautiful matrimonial resume that creates a stunning first impression.
          </p>
        </div>

        {/* Steps Walkthrough */}
        <div className="space-y-12">
          {steps.map((step, idx) => (
            <div 
              key={step.num} 
              className={`flex flex-col md:flex-row items-center gap-8 md:gap-12 bg-card border border-[#C9A84C]/25 rounded-2xl p-8 shadow-md hover:shadow-lg transition-all ${
                idx % 2 !== 0 ? "md:flex-row-reverse" : ""
              }`}
            >
              {/* Badge Icon block */}
              <div className="flex flex-col items-center shrink-0">
                <span className="text-5xl font-black text-[#C9A84C]/30 mb-2 leading-none">{step.num}</span>
                <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-lg">
                  {step.icon}
                </div>
              </div>

              {/* Text block */}
              <div className="flex-1 space-y-3 text-center md:text-left">
                <h2 className="text-2xl font-bold text-foreground">{step.title}</h2>
                <p className="text-muted-foreground text-sm md:text-base leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div className="text-center space-y-6">
          <h3 className="text-2xl font-black text-foreground">Ready to create your marriage biodata?</h3>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm">
            It takes less than 2 minutes, requires no email or account, is completely private, and is 100% free to download.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" className="rounded-full bg-gradient-primary border-0 font-bold px-8 shadow-lg shadow-primary/20" asChild>
              <Link href="/edit">Create Biodata Now</Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full border-[#C9A84C]/50 hover:bg-[#FBF5E6]/40 text-foreground font-bold px-8" asChild>
              <Link href="/templates">Browse Designs</Link>
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
