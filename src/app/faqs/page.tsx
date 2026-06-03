import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { generateFaqSchema } from "@/lib/seo-schemas";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: "Answers to common questions about Biodata99 - how the editor works, privacy, PDF downloads, photo uploads, and regional language support.",
  alternates: {
    canonical: "https://biodata99.com/faqs",
  },
  openGraph: {
    title: "Frequently Asked Questions",
    description: "Answers to common questions about Biodata99 - how the editor works, privacy, PDF downloads, photo uploads, and regional language support.",
    url: "https://biodata99.com/faqs",
  },
};

const faqsList = [
  {
    question: "Is Biodata99 completely free?",
    answer: "Creating and downloading your biodata is free. Some premium templates have a one-time fee - you'll see those clearly marked before you pick one. No surprises after you've filled everything in.",
  },
  {
    question: "Do I need to create an account or sign in?",
    answer: "No account, no sign-in, no email address needed. Just open the form, fill your details, and download. We deliberately built it this way - creating an account felt unnecessary for something this personal.",
  },
  {
    question: "Is my personal information safe?",
    answer: "Your details - name, photo, family information - never leave your device. Everything happens in your browser. We don't store, transmit, or have access to what you fill in. Once you close the tab, it's gone from our end completely.",
  },
  {
    question: "Can I make a biodata in Hindi or Marathi?",
    answer: "Yes. You can switch the biodata language to Hindi, Marathi, Tamil, Telugu, Gujarati, Kannada, Bengali, Punjabi, or Urdu - right from the form. The template labels and layout adjust automatically.",
  },
  {
    question: "Can I download as PDF and share on WhatsApp?",
    answer: "Yes. PDF, JPEG, and PNG are all available. For WhatsApp sharing, JPEG works best - the file size stays small and the image quality holds up well on mobile. PDF is better if someone wants to print it or share over email.",
  },
  {
    question: "Can I edit my biodata after downloading?",
    answer: "Not after downloading, no. Since we don't store your data, the form clears once you close or refresh the tab. The practical workaround: keep the tab open while you share and wait for feedback, make any changes, then download the final version. Most people are done in one sitting anyway.",
  },
];

export default function FAQsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FFFBF8] dark:bg-[#1A0A0E] pt-10 pb-10 px-4">
      {/* JSON-LD Schema */}
      <JsonLd schema={generateFaqSchema(faqsList)} />
      <div className="container mx-auto max-w-4xl relative z-10 space-y-12">
        
        {/* Header Title */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1 bg-[#FBF5E6] dark:bg-[#8A7233]/25 px-4 py-1.5 rounded-full border border-[#C9A84C]/40 text-xs font-black text-[#9B1B30] dark:text-[#E6C97A]">
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
          <h2 className="sr-only">Answers to Common Questions</h2>
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
