"use client";

import * as React from "react";
import Link from "next/link";
import { 
  FileText, 
  Activity, 
  UserCheck, 
  ShieldCheck, 
  Coins, 
  Lock, 
  Copyright, 
  AlertTriangle, 
  Scale, 
  LifeBuoy, 
  Clock, 
  FileEdit, 
  Gavel, 
  Mail, 
  Printer, 
  ChevronRight, 
  Sparkles,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const sections = [
  { id: "about-us", title: "About Biodata99", icon: FileText },
  { id: "scope-of-services", title: "Scope of Services", icon: Activity },
  { id: "who-can-use", title: "Who Can Use Biodata99", icon: UserCheck },
  { id: "user-responsibilities", title: "Your Responsibilities as a User", icon: ShieldCheck },
  { id: "free-paid-features", title: "Free and Paid Features", icon: Coins },
  { id: "biodata-information", title: "Your Biodata and Information", icon: Lock },
  { id: "templates-content", title: "Our Templates and Content", icon: Copyright },
  { id: "service-limitations", title: "Service Availability and Limitations", icon: AlertTriangle },
  { id: "limits-of-responsibility", title: "Limits of Our Responsibility", icon: Scale },
  { id: "third-party-providers", title: "Third-Party Providers and Services", icon: LifeBuoy },
  { id: "service-maintenance", title: "Service Availability and Maintenance", icon: Clock },
  { id: "changes-to-terms", title: "Changes to Our Terms and Conditions", icon: FileEdit },
  { id: "applicable-law", title: "Applicable Law and Disputes", icon: Gavel },
  { id: "contact-us", title: "Contact Us", icon: Mail },
];

interface TermsConditionsLayoutProps {
  children: React.ReactNode;
}

export function TermsConditionsLayout({ children }: TermsConditionsLayoutProps) {
  const [activeId, setActiveId] = React.useState<string>("about-us");

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { 
        rootMargin: "-10% 0px -50% 0px", 
        threshold: 0.1 
      }
    );

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const handleScroll = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      setActiveId(id);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full relative">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-foreground" aria-current="page">Terms &amp; Conditions</span>
      </nav>

      {/* Header Panel */}
      <div className="bg-card border border-[#E8D5D9]/50 dark:border-[#27272a] rounded-3xl p-6 md:p-8 shadow-sm space-y-6 relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#C9A84C]/10 to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-[#FBF5E6] dark:bg-[#8A7233]/25 px-3.5 py-1 rounded-full border border-[#C9A84C]/40 text-xs font-black text-[#9B1B30] dark:text-[#E6C97A]">
              <Scale className="w-3.5 h-3.5" />
              Official Terms of Use
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground tracking-tight">
              Terms &amp; <span className="text-gradient-primary">Conditions</span>
            </h1>
            <p className="text-xs font-bold text-muted-foreground tracking-wider uppercase">
              Last updated: June 11, 2026
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePrint}
              className="gap-2 font-bold cursor-pointer print:hidden hover:bg-accent/80 hover:text-accent-foreground border-border/80"
              aria-label="Print terms and conditions document"
            >
              <Printer className="w-4 h-4" />
              Print Page
            </Button>
          </div>
        </div>

        <Separator className="bg-[#C9A84C]/25" />

        <div className="space-y-4">
          <p className="text-base font-bold text-foreground leading-relaxed">
            These are the rules for using Biodata99. You should read these rules before you make or download a biodata.
          </p>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            If you keep using this platform, that means you agree to all of these rules, for Biodata99.
          </p>
        </div>
      </div>

      {/* Mobile Table of Contents (Radix Accordion) */}
      <div className="bg-card border border-[#C9A84C]/20 rounded-2xl p-4 shadow-sm mb-6 print:hidden lg:hidden">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="mobile-toc" className="border-none py-0">
            <AccordionTrigger className="text-sm font-black text-left text-foreground hover:no-underline py-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#9B1B30]" />
                Table of Contents
              </span>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-0">
              <nav className="flex flex-col gap-1 max-h-[50vh] overflow-y-auto" aria-label="Mobile Page Sections">
                {sections.map((section) => {
                  const isActive = activeId === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => handleScroll(section.id)}
                      className={`flex items-center gap-2 text-left text-xs font-semibold px-3 py-2 rounded-xl transition-all duration-200 cursor-pointer ${
                        isActive 
                          ? "bg-[#FAEAED] dark:bg-[#9B1B30]/20 text-[#9B1B30] dark:text-[#E6C97A] font-bold" 
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                      }`}
                    >
                      <section.icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{section.title}</span>
                    </button>
                  );
                })}
              </nav>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>


      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sticky Sidebar Navigation (Table of Contents) */}
        <aside className="lg:col-span-4 sticky top-20 hidden lg:block print:hidden space-y-6">
          <div className="bg-card border border-[#E8D5D9]/50 dark:border-[#27272a] rounded-3xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-black uppercase text-foreground/90 tracking-wider">
              Table of Contents
            </h2>
            <Separator className="bg-border/60" />
            <nav className="flex flex-col gap-1 max-h-[60vh] overflow-y-auto pr-1" aria-label="Page Sections">
              {sections.map((section) => {
                const isActive = activeId === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => handleScroll(section.id)}
                    className={`flex items-center gap-2.5 text-left text-xs font-semibold px-3 py-2 rounded-xl transition-all duration-200 cursor-pointer ${
                      isActive 
                        ? "bg-[#FAEAED] dark:bg-[#9B1B30]/20 text-[#9B1B30] dark:text-[#E6C97A] font-bold shadow-xs border-l-3 border-[#9B1B30] dark:border-[#C9A84C] pl-2" 
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    }`}
                  >
                    <section.icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-[#9B1B30] dark:text-[#E6C97A]" : ""}`} />
                    <span className="truncate">{section.title}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Help Card */}
          <div className="bg-gradient-to-br from-[#9B1B30]/5 via-transparent to-[#C9A84C]/5 border border-[#C9A84C]/25 rounded-3xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-foreground">Need Support?</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Have questions about these terms or our templates? We response within 24 hours on working days.
            </p>
            <div className="flex flex-col gap-2 pt-1">
              <a 
                href="mailto:support@biodata99.com"
                className="inline-flex items-center justify-center gap-1.5 text-xs font-bold bg-primary text-primary-foreground py-2 px-3 rounded-lg hover:bg-primary/95 transition-all text-center shadow-xs"
              >
                <Mail className="w-3.5 h-3.5" />
                Email Support
              </a>
              <Link 
                href="/contact-us"
                className="inline-flex items-center justify-center gap-1.5 text-xs font-bold border border-border bg-background hover:bg-accent py-2 px-3 rounded-lg transition-all text-center text-foreground"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Contact Form
              </Link>
            </div>
          </div>
        </aside>

        {/* Content Body (Rendered from server) */}
        <div className="lg:col-span-8 bg-card border border-[#E8D5D9]/50 dark:border-[#27272a] rounded-3xl p-6 md:p-8 lg:p-10 shadow-sm space-y-12">
          {children}
        </div>
      </div>
    </div>
  );
}
