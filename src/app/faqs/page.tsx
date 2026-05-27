import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { generateFaqSchema } from "@/lib/seo-schemas";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: "Answers to common questions about Biodata99 — how the editor works, privacy, PDF downloads, photo uploads, and regional language support.",
  alternates: {
    canonical: "https://biodata99.com/faqs",
  },
  openGraph: {
    title: "Frequently Asked Questions",
    description: "Answers to common questions about Biodata99 — how the editor works, privacy, PDF downloads, photo uploads, and regional language support.",
    url: "https://biodata99.com/faqs",
  },
};

const faqsList = [
  {
    question: "Is Biodata99 completely free?",
    answer: "Yes, completely. You can open the editor, choose a template, fill in all your details, and download your biodata as a PDF without paying anything. There is no trial period, no premium tier, and no account required. We built it this way because we believe every family should be able to create a good-looking biodata without worrying about cost.",
  },
  {
    question: "Do I need to create an account or sign in?",
    answer: "No. You open the editor, fill in your details, and download — that is the entire process. We do not ask for your email address, phone number, or any login credentials. This also means your information never passes through our servers at any point.",
  },
  {
    question: "Is my personal information safe?",
    answer: "Yes. Everything you type into the editor — your name, family details, photo, and contact information — stays entirely on your device. Biodata99 does not upload or store any of this on our servers. When you close the browser tab, nothing is saved on our end. Your biodata belongs only to you.",
  },
  {
    question: "How do I download my biodata as a PDF?",
    answer: "Once you have filled in your details and are happy with how it looks, click the Download button at the top of the editor. Your biodata will be generated instantly and saved as a PDF file on your device. The whole process — from opening the editor to having a PDF ready — typically takes under five minutes.",
  },
  {
    question: "Can I edit my biodata after downloading?",
    answer: "You can make changes anytime by returning to Biodata99 on the same device and browser where you originally created it. Since we do not store your data on our servers, your progress is saved locally in your browser. If you switch to a different device or clear your browser data, you would need to fill in your details again — which takes just a few minutes.",
  },
  {
    question: "Can I add a photo to my biodata?",
    answer: "Yes. The editor allows you to upload a photo directly from your device. Your photo, like all your other details, is processed locally and is never uploaded to our servers.",
  },
  {
    question: "How do I print my biodata?",
    answer: "Open the downloaded PDF on any device and print it as you would any other document. We recommend printing on A4 paper for the best result. All our templates are designed to look clean and proportionate when printed, not just on screen.",
  },
  {
    question: "Which biodata format is best for Indian weddings?",
    answer: "Most families share biodata as a PDF because it looks the same on every device and prints cleanly. Biodata99 generates a standard A4 PDF that works well whether you are sharing it digitally on WhatsApp, email, or a matrimonial platform, or printing it to hand to another family directly.",
  },
  {
    question: "What details should I include in a marriage biodata?",
    answer: "A complete marriage biodata typically covers your personal details (name, date of birth, height, complexion), educational background, professional information, family details (parents' names and occupation, siblings), religious or community information, horoscope details if applicable, and your family's contact information. Biodata99 templates are structured around these sections so you do not miss anything important.",
  },
  {
    question: "Will Biodata99 support regional Indian languages?",
    answer: "We are actively working on it. Hindi, Marathi, Tamil, and Telugu are our priority languages. Once available, you will be able to create your entire biodata in your preferred language. You can follow us on Instagram or check back on the Templates page for updates.",
  },
];

export default function FAQsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FFFBF8] dark:bg-[#1A0A0E] pt-24 pb-20 px-4">
      {/* JSON-LD Schema */}
      <JsonLd schema={generateFaqSchema(faqsList)} />
      <div className="container mx-auto max-w-4xl relative z-10 space-y-12">
        
        {/* Header Title */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1 bg-[#FBF5E6] dark:bg-[#8A7233]/25 px-4 py-1.5 rounded-full border border-[#C9A84C]/40 text-xs font-black text-[#8A7233] dark:text-[#E6C97A]">
            <HelpCircle className="w-3.5 h-3.5" />
            Help &amp; Support
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground animate-in fade-in duration-500">
            Frequently Asked <span className="text-gradient-primary">Questions</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto leading-relaxed font-medium">
            Everything you need to know about creating and downloading your marriage biodata on Biodata99.
          </p>
        </div>

        {/* Radix Accordion FAQ list */}
        <div className="bg-card border border-[#C9A84C]/25 rounded-2xl p-6 md:p-8 shadow-md">
          <Accordion type="single" collapsible className="w-full space-y-2">
            {faqsList.map((faq, idx) => (
              <AccordionItem key={idx} value={`faq-${idx}`} className="border-b border-border/40 py-2">
                <AccordionTrigger className="text-base font-black text-left text-foreground hover:text-primary hover:no-underline py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm md:text-base text-muted-foreground leading-relaxed pt-2 pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Bottom Support Section */}
        <div className="text-center space-y-4 pt-8 border-t border-border/40 max-w-xl mx-auto">
          <h3 className="text-xl font-black text-foreground">Did not find what you were looking for?</h3>
          <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
            Write to us at <a href="mailto:support@biodata99.com" className="text-[#9B1B30] dark:text-[#E6C97A] font-bold hover:underline">support@biodata99.com</a> and we will get back to you within 24 hours on working days.
          </p>
          <div className="pt-2">
            <Button size="lg" className="rounded-full bg-gradient-primary border-0 font-bold px-8 shadow-md" asChild>
              <Link href="/contact-us">Contact Support</Link>
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
