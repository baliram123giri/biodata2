import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Frequently Asked Questions (FAQs) | biodata99.com",
  description: "Get answers to common questions about creating, editing, translating, and downloading marriage biodatas on biodata99.com.",
  alternates: {
    canonical: "https://biodata99.com/faqs",
  },
};

const faqsList = [
  {
    question: "Is this matrimonial biodata maker completely free?",
    answer: "Yes, biodata99.com is 100% free to use. You can enter your details, choose any of our premium templates, customize color schemes, and download high-resolution PDF and JPG files without paying a single rupee.",
  },
  {
    question: "Do I need to create an account or sign in?",
    answer: "No, registration or login is not required. You can start creating your biodata immediately. We value your convenience and time.",
  },
  {
    question: "Is my personal data and photo secure?",
    answer: "Absolutely. We prioritize your privacy. All your inputs, details, and photos are processed locally inside your web browser. Nothing is uploaded to our backend servers, meaning your personal details remain 100% private and secure on your device.",
  },
  {
    question: "How do I create a biodata in regional Indian languages?",
    answer: "Inside our builder form, you will find a language selection dropdown at the top. We support 10 languages including Hindi, Marathi, Gujarati, Telugu, Tamil, Kannada, Bengali, Punjabi, Urdu, and English. Selecting a language automatically translates all the core field labels (e.g. Caste, Education, Family details) instantly.",
  },
  {
    question: "Can I edit my details after downloading the biodata?",
    answer: "Yes. As long as you don't clear your browser's local cache, your details are automatically saved locally on your device. You can come back to the site at any time to edit labels, update details, or switch to a different color theme.",
  },
  {
    question: "How do I download the biodata as a JPG or PDF?",
    answer: "Once you have completed filling in your details, click the 'Download' button in the toolbar. A dropdown will appear allowing you to select either 'Download PDF' (perfect for printing on A4 paper) or 'Download JPG' (best for sharing directly on WhatsApp).",
  },
  {
    question: "How do I print the downloaded matrimonial biodata?",
    answer: "Our PDF layouts are specifically designed to fit standard A4 paper sizes perfectly. Simply open the downloaded PDF on your phone or PC and send it to any standard printer. Make sure to set print scale to 'Fit to Page' for best results.",
  },
];

export default function FAQsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FFFBF8] dark:bg-[#1A0A0E] pt-24 pb-20 px-4">
      <div className="container mx-auto max-w-4xl relative z-10 space-y-12">
        
        {/* Header Title */}
        <div className="text-center space-y-4 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1 bg-[#FBF5E6] dark:bg-[#8A7233]/25 px-4 py-1.5 rounded-full border border-[#C9A84C]/40 text-xs font-black text-[#8A7233] dark:text-[#E6C97A]">
            <HelpCircle className="w-3.5 h-3.5" />
            Support Center
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
            Frequently Asked <span className="text-gradient-primary">Questions</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Have questions about creating or formatting your marriage biodata? Here are answers to our most common user inquiries.
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

        {/* CTA Banner */}
        <div className="text-center space-y-4 pt-6">
          <p className="text-sm text-muted-foreground">Still have questions or need assistance?</p>
          <Button size="lg" className="rounded-full bg-gradient-primary border-0 font-bold px-8 shadow-md" asChild>
            <Link href="/contact-us">Get in Touch</Link>
          </Button>
        </div>

      </div>
    </div>
  );
}
