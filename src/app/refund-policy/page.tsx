import type { Metadata } from "next";
import { RotateCcw } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { refundPolicySchema } from "@/lib/seo-schemas";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "Biodata99 offers free and premium biodata templates. Read our refund policy to understand what is covered and how to request a refund if something goes wrong.",
  alternates: {
    canonical: "https://biodata99.com/refund-policy",
  },
  openGraph: {
    title: "Refund Policy",
    description: "Biodata99 offers free and premium biodata templates. Read our refund policy to understand what is covered and how to request a refund if something goes wrong.",
    url: "https://biodata99.com/refund-policy",
  },
};

export default function RefundPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FFFBF8] dark:bg-[#1A0A0E] pt-10 pb-10 px-4 overflow-hidden relative">
      {/* Dynamic RefundPolicy Schema */}
      <JsonLd schema={refundPolicySchema} />

      {/* Decorative background gradients */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#9B1B30]/5 dark:bg-[#C9A84C]/5 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />

      <div className="container mx-auto max-w-3xl relative z-10 space-y-12">
        
        {/* Title & Header block */}
        <div className="text-center space-y-4 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-[#FBF5E6] dark:bg-[#8A7233]/25 px-4 py-1.5 rounded-full border border-[#C9A84C]/40 text-xs font-black text-[#9B1B30] dark:text-[#E6C97A]">
            <RotateCcw className="w-3.5 h-3.5" />
            Confidence &amp; Trust
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
            Refund <span className="text-gradient-primary">Policy</span>
          </h1>
          <p className="text-xs font-bold text-muted-foreground tracking-wider uppercase">
            Last updated: May 23, 2026
          </p>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed font-medium">
            We want you to feel confident before you pay anything on Biodata99. This page explains clearly what is free, what is paid, and what happens if something goes wrong.
          </p>
        </div>

        {/* Content Body */}
        <div className="bg-card border border-[#C9A84C]/20 rounded-3xl p-6 md:p-10 shadow-sm space-y-10 text-muted-foreground leading-relaxed">
          
          {/* Section 1 */}
          <section className="space-y-3 border-l-2 border-[#9B1B30] dark:border-[#C9A84C] pl-4">
            <h2 className="text-xl font-bold text-foreground">1. What Is Free</h2>
            <p>
              The core Biodata99 experience is free. This includes:
            </p>
            <div className="bg-[#FFFBF8] dark:bg-[#1A0A0E]/30 rounded-xl p-4 border border-border/40 my-3">
              <ul className="space-y-1.5 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#9B1B30]" />
                  <span>Opening the editor and filling in your details</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#9B1B30]" />
                  <span>Previewing your biodata in any template</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#9B1B30]" />
                  <span>Customising colors, fonts, and layout</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#9B1B30]" />
                  <span>Adding and cropping a profile photo</span>
                </li>
              </ul>
            </div>
            <p>
              You can use all of these features without paying anything and without creating an account.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 border-l-2 border-[#9B1B30] dark:border-[#C9A84C] pl-4">
            <h2 className="text-xl font-bold text-foreground">2. What Is Paid</h2>
            <p>
              Some templates in our collection are premium designs. These are clearly marked in the template panel with a paid label before you select them.
            </p>
            <p>
              To download a biodata using a premium template, a one-time payment is required. This is a single charge for that download - there is no subscription, no recurring fee, and no hidden cost.
            </p>
            <p>
              Free templates remain completely free to download at any time.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 border-l-2 border-[#9B1B30] dark:border-[#C9A84C] pl-4">
            <h2 className="text-xl font-bold text-foreground">3. Our Refund Policy</h2>
            <p>
              Because Biodata99 delivers a digital file that is available immediately after payment, we generally do not offer refunds once a download has been completed.
            </p>
            <p>
              However we will issue a full refund in the following situations:
            </p>
            <div className="bg-[#FFFBF8] dark:bg-[#1A0A0E]/30 rounded-xl p-4 border border-border/40 my-3">
              <ul className="space-y-1.5 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#9B1B30]" />
                  <span>You were charged but the download did not complete or the file was corrupted</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#9B1B30]" />
                  <span>You were charged twice for the same download due to a technical error</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#9B1B30]" />
                  <span>The template you paid for looked significantly different in the download compared to the preview</span>
                </li>
              </ul>
            </div>
            <p>
              If any of these apply, write to us at <a href="mailto:support@biodata99.com" className="text-[#9B1B30] dark:text-[#E6C97A] font-bold hover:underline">support@biodata99.com</a> within 7 days of your payment. Include your payment details and describe what went wrong. We will review it promptly and resolve it within 3 working days.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 border-l-2 border-[#9B1B30] dark:border-[#C9A84C] pl-4">
            <h2 className="text-xl font-bold text-foreground">4. Before You Pay</h2>
            <p>
              We strongly recommend previewing your biodata fully before purchasing a premium download. The live preview in the editor shows exactly how your biodata will look in the final PDF. If you have any questions about a template before paying, contact us first and we will help.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 border-l-2 border-[#9B1B30] dark:border-[#C9A84C] pl-4">
            <h2 className="text-xl font-bold text-foreground">5. Payment Security</h2>
            <p>
              All payments on Biodata99 are processed through a secure third-party payment gateway. We do not store your card details, bank information, or any payment credentials on our servers.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3 border-l-2 border-[#9B1B30] dark:border-[#C9A84C] pl-4">
            <h2 className="text-xl font-bold text-foreground">6. Contact Us</h2>
            <p>
              For any refund request or payment-related question, reach us at <a href="mailto:support@biodata99.com" className="text-[#9B1B30] dark:text-[#E6C97A] font-bold hover:underline">support@biodata99.com</a>. Please include your order details so we can help you quickly. We respond within 24 hours on working days.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
}
