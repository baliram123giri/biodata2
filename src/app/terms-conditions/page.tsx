import type { Metadata } from "next";
import { Scale } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { termsConditionsSchema } from "@/lib/seo-schemas";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: "Read the terms and conditions for using Biodata99. Covers free and paid templates, your content rights, privacy, payments, and how we operate.",
  alternates: {
    canonical: "https://biodata99.com/terms-conditions",
  },
  openGraph: {
    title: "Terms and Conditions",
    description: "Read the terms and conditions for using Biodata99. Covers free and paid templates, your content rights, privacy, payments, and how we operate.",
    url: "https://biodata99.com/terms-conditions",
  },
};

export default function TermsConditionsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FFFBF8] dark:bg-[#1A0A0E] pt-24 pb-20 px-4 overflow-hidden relative">
      {/* Dynamic TermsConditions Schema */}
      <JsonLd schema={termsConditionsSchema} />

      {/* Decorative background gradients */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#9B1B30]/5 dark:bg-[#C9A84C]/5 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />

      <div className="container mx-auto max-w-3xl relative z-10 space-y-12">
        
        {/* Title & Header block */}
        <div className="text-center space-y-4 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-[#FBF5E6] dark:bg-[#8A7233]/25 px-4 py-1.5 rounded-full border border-[#C9A84C]/40 text-xs font-black text-[#8A7233] dark:text-[#E6C97A]">
            <Scale className="w-3.5 h-3.5" />
            Rules &amp; Guidelines
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
            Terms and <span className="text-gradient-primary">Conditions</span>
          </h1>
          <p className="text-xs font-bold text-muted-foreground tracking-wider uppercase">
            Last updated: May 23, 2026
          </p>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed font-medium">
            These terms explain what you can expect from Biodata99 and what we expect from you. We have written them in plain language so they are easy to understand.
          </p>
        </div>

        {/* Content Body */}
        <div className="bg-card border border-[#C9A84C]/20 rounded-3xl p-6 md:p-10 shadow-sm space-y-10 text-muted-foreground leading-relaxed">
          
          {/* Section 1 */}
          <section className="space-y-3 border-l-2 border-[#9B1B30] dark:border-[#C9A84C] pl-4">
            <h2 className="text-xl font-bold text-foreground">1. Who We Are</h2>
            <p>
              Biodata99 is an online marriage biodata maker built and operated by a small team based in Pune, Maharashtra, India. Our website is available at <span className="font-bold text-foreground">biodata99.com</span>.
            </p>
            <p>
              If you have any questions about these terms, you can reach us at <a href="mailto:support@biodata99.com" className="text-[#9B1B30] dark:text-[#E6C97A] font-bold hover:underline">support@biodata99.com</a> before or after using the service.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 border-l-2 border-[#9B1B30] dark:border-[#C9A84C] pl-4">
            <h2 className="text-xl font-bold text-foreground">2. Using Biodata99</h2>
            <p>
              Biodata99 is available to anyone who wants to create a marriage biodata for personal or family use. By using our website you agree to these terms.
            </p>
            <p>
              You agree to use Biodata99 only for its intended purpose — creating a marriage biodata for yourself or a family member. You agree not to:
            </p>
            <div className="bg-[#FFFBF8] dark:bg-[#1A0A0E]/30 rounded-xl p-4 border border-border/40 my-3">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#9B1B30]" />
                  <span>Use the service for any commercial reselling purpose without our written permission</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#9B1B30]" />
                  <span>Attempt to reverse engineer, copy, or replicate our editor or template designs</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#9B1B30]" />
                  <span>Use automated tools or bots to access or scrape our website</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#9B1B30]" />
                  <span>Upload content that is offensive, misleading, or belongs to someone else without permission</span>
                </li>
              </ul>
            </div>
            <p>
              We reserve the right to refuse access to anyone who misuses the service.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 border-l-2 border-[#9B1B30] dark:border-[#C9A84C] pl-4">
            <h2 className="text-xl font-bold text-foreground">3. Free and Paid Features</h2>
            <p>
              Some features on Biodata99 are free and some require a one-time payment. Free templates can be downloaded at no cost. Premium templates require payment before downloading.
            </p>
            <p>
              All paid features are clearly marked before you are asked to pay. We do not charge you without your knowledge or consent.
            </p>
            <p>
              For full details on payments and refunds, please read our <a href="/refund-policy" className="text-[#9B1B30] dark:text-[#E6C97A] font-bold hover:underline">Refund Policy</a>.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 border-l-2 border-[#9B1B30] dark:border-[#C9A84C] pl-4">
            <h2 className="text-xl font-bold text-foreground">4. Your Content</h2>
            <p>
              When you use the Biodata99 editor, the information you enter — your name, family details, photo, and other personal information — belongs entirely to you.
            </p>
            <p>
              We do not claim any ownership over your biodata content. Because your data is processed locally in your browser and never stored on our servers, we do not have access to it in the first place.
            </p>
            <p>
              The one exception is information you voluntarily submit through our contact form. We use that only to respond to your query, as explained in our <a href="/privacy-policy" className="text-[#9B1B30] dark:text-[#E6C97A] font-bold hover:underline">Privacy Policy</a>.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 border-l-2 border-[#9B1B30] dark:border-[#C9A84C] pl-4">
            <h2 className="text-xl font-bold text-foreground">5. Our Templates and Designs</h2>
            <p>
              All template designs, layouts, graphics, and visual elements available on Biodata99 are our original work and are protected under applicable intellectual property laws.
            </p>
            <p>
              You are welcome to use our templates to create your personal biodata. You may not copy, redistribute, sell, or use our template designs for any other purpose without our written permission.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3 border-l-2 border-[#9B1B30] dark:border-[#C9A84C] pl-4">
            <h2 className="text-xl font-bold text-foreground">6. Privacy</h2>
            <p>
              We take your privacy seriously. Your biodata details are never stored on our servers. For a full explanation of how we handle data, please read our <a href="/privacy-policy" className="text-[#9B1B30] dark:text-[#E6C97A] font-bold hover:underline">Privacy Policy</a>.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3 border-l-2 border-[#9B1B30] dark:border-[#C9A84C] pl-4">
            <h2 className="text-xl font-bold text-foreground">7. Third-Party Services</h2>
            <p>
              Biodata99 uses a small number of third-party services to operate — including a payment gateway for premium downloads and Google Analytics for anonymous traffic data.
            </p>
            <p>
              These services have their own terms and privacy policies. We choose them carefully and do not share your personal information with them beyond what is necessary to provide the service.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3 border-l-2 border-[#9B1B30] dark:border-[#C9A84C] pl-4">
            <h2 className="text-xl font-bold text-foreground">8. Availability of the Service</h2>
            <p>
              We work to keep Biodata99 available and functioning at all times. Occasionally the site may be unavailable due to maintenance, updates, or circumstances outside our control.
            </p>
            <p>
              We do not guarantee uninterrupted access to the service and are not liable for any inconvenience caused by temporary downtime.
            </p>
          </section>

          {/* Section 9 */}
          <section className="space-y-3 border-l-2 border-[#9B1B30] dark:border-[#C9A84C] pl-4">
            <h2 className="text-xl font-bold text-foreground">9. Limitation of Liability</h2>
            <p>
              Biodata99 is provided as-is. While we work hard to ensure a smooth and reliable experience, we cannot be held responsible for:
            </p>
            <div className="bg-[#FFFBF8] dark:bg-[#1A0A0E]/30 rounded-xl p-4 border border-border/40 my-3">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#9B1B30]" />
                  <span>Loss of data caused by clearing browser storage or switching devices</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#9B1B30]" />
                  <span>Issues with third-party payment processing</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#9B1B30]" />
                  <span>Any indirect loss or inconvenience arising from use of our service</span>
                </li>
              </ul>
            </div>
            <p className="font-semibold text-foreground/80">
              Our total liability to you in any situation is limited to the amount you paid us for the specific transaction in question.
            </p>
          </section>

          {/* Section 10 */}
          <section className="space-y-3 border-l-2 border-[#9B1B30] dark:border-[#C9A84C] pl-4">
            <h2 className="text-xl font-bold text-foreground">10. Changes to These Terms</h2>
            <p>
              We may update these terms from time to time. When we do, we will update the date at the top of this page. Continued use of Biodata99 after changes are posted means you accept the updated terms.
            </p>
            <p>
              We will never make changes that unfairly reduce your rights without making them clearly visible on this page.
            </p>
          </section>

          {/* Section 11 */}
          <section className="space-y-3 border-l-2 border-[#9B1B30] dark:border-[#C9A84C] pl-4">
            <h2 className="text-xl font-bold text-foreground">11. Governing Law</h2>
            <p>
              These terms are governed by the laws of India. Any disputes arising from use of Biodata99 will be subject to the jurisdiction of the courts in Pune, Maharashtra.
            </p>
          </section>

          {/* Section 12 */}
          <section className="space-y-3 border-l-2 border-[#9B1B30] dark:border-[#C9A84C] pl-4">
            <h2 className="text-xl font-bold text-foreground">12. Contact Us</h2>
            <p>
              If you have any questions about these terms, write to us at <a href="mailto:support@biodata99.com" className="text-[#9B1B30] dark:text-[#E6C97A] font-bold hover:underline">support@biodata99.com</a>. We are happy to clarify anything and will respond within 24 hours on working days.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
}
