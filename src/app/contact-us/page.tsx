import type { Metadata } from "next";
import { contactPageSchema } from "@/lib/seo-schemas";
import { JsonLd } from "@/components/seo/JsonLd";
import { ContactFormSection } from "@/components/contact/ContactFormSection";

export const metadata: Metadata = {
  title: {
    absolute: "Contact Us - Marriage Biodata Support"
  },
  description:
    "Reach out to biodata99.com for support, template requests, or feedback. We respond within 24 hours, Monday to Saturday.",
  alternates: {
    canonical: "https://biodata99.com/contact-us",
  },
  openGraph: {
    title: "Contact Us - Marriage Biodata Support",
    description: "Reach out to biodata99.com for support, template requests, or feedback. We respond within 24 hours, Monday to Saturday.",
    url: "https://biodata99.com/contact-us",
  },
};

export default function ContactUsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FFFBF8] dark:bg-[#1A0A0E] pt-24 pb-20 px-4">
      {/* JSON-LD Schema */}
      <JsonLd schema={contactPageSchema} />
      <div className="container mx-auto max-w-4xl relative z-10 space-y-16">

        {/* Header Block */}
        <div className="text-center space-y-4 max-w-xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
            Contact <span className="text-gradient-primary">Us</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            We value your suggestions, feature requests, and feedback. Feel free to reach out to us!
          </p>
        </div>

        {/* Premium Client Interactive Form & Support Section */}
        <ContactFormSection />

      </div>
    </div>
  );
}
