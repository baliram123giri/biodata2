import type { Metadata } from "next";
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
  MapPin,
  ExternalLink,
  ArrowRight,
  Download,
  Languages,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { termsConditionsSchema, generateBreadcrumbSchema } from "@/lib/seo-schemas";
import { TermsConditionsLayout } from "./TermsConditionsLayout";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: "Read the Terms and Conditions for using Biodata99, including user responsibilities, premium features, intellectual property, payments, and platform policies.",
  alternates: {
    canonical: "https://biodata99.com/terms-conditions",
  },
  openGraph: {
    title: "Terms and Conditions | biodata99.com",
    description: "Read the Terms and Conditions for using Biodata99, including user responsibilities, premium features, intellectual property, payments, and platform policies.",
    url: "https://biodata99.com/terms-conditions",
  },
};

const breadcrumbSchema = generateBreadcrumbSchema([
  { name: "Home", item: "https://biodata99.com" },
  { name: "Terms & Conditions", item: "https://biodata99.com/terms-conditions" }
]);

export default function TermsConditionsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FFFBF8] dark:bg-[#1A0A0E] pt-10 pb-10 px-4 relative">
      {/* SEO Structured Data */}
      <JsonLd schema={termsConditionsSchema} />
      <JsonLd schema={breadcrumbSchema} />

      {/* Decorative background gradients for premium aesthetics - wrapped with overflow-hidden to prevent horizontal scrolls without breaking sticky */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#9B1B30]/5 dark:bg-[#C9A84C]/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -left-48 w-96 h-96 bg-[#C9A84C]/5 dark:bg-[#9B1B30]/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 -right-48 w-96 h-96 bg-[#9B1B30]/5 dark:bg-[#C9A84C]/5 rounded-full blur-3xl animate-float-slow" />
      </div>

      {/* Main Container */}
      <div className="container mx-auto max-w-5xl relative z-10">
        <TermsConditionsLayout>

          {/* 1. About Biodata99 */}
          <section id="about-us" className="space-y-4 scroll-mt-24">
            <div className="flex items-center gap-2 border-b border-border/40 pb-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#FAEAED] dark:bg-[#9B1B30]/30 flex items-center justify-center text-[#9B1B30] dark:text-[#E8D5D9]">
                <FileText className="w-4 h-4" />
              </div>
              <h2 className="text-xl md:text-2xl font-black text-foreground">
                About Biodata99
              </h2>
            </div>
            <div className="text-muted-foreground text-sm md:text-base leading-relaxed space-y-4 font-medium">
              <p>
                Biodata99 is an online marriage biodata maker built and operated by a small independent team based in Pune, Maharashtra, India. Our website is available at{" "}
                <Link href="/" className="text-primary hover:underline font-bold inline-flex items-center gap-0.5">
                  biodata99.com <ExternalLink className="w-3 h-3" />
                </Link>.
              </p>
              <p>
                For any questions related to these terms, write to us at{" "}
                <a href="mailto:support@biodata99.com" className="text-primary hover:underline font-bold">
                  support@biodata99.com
                </a>{" "}
                — we respond within 24 hours on working days.
              </p>
            </div>
          </section>

          {/* 2. Scope of Services */}
          <section id="scope-of-services" className="space-y-6 scroll-mt-24">
            <div className="flex items-center gap-2 border-b border-border/40 pb-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#FBF5E6] dark:bg-[#8A7233]/30 flex items-center justify-center text-[#9B1B30] dark:text-[#E6C97A]">
                <Activity className="w-4 h-4" />
              </div>
              <h2 className="text-xl md:text-2xl font-black text-foreground">
                Scope of Services
              </h2>
            </div>
            <div className="text-muted-foreground text-sm md:text-base leading-relaxed space-y-6 font-medium">
              <p className="text-foreground font-semibold">
                Biodata99 gives people tools to make their marriage biodatas.
              </p>              {/* Services Visual Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 my-4">
                <div className="group bg-gradient-to-br from-card to-[#FFFDFB] dark:to-[#221013]/10 border border-[#E8D5D9]/50 dark:border-border/40 rounded-2xl p-5 flex gap-4 items-start shadow-[0_4px_20px_-4px_rgba(155,27,48,0.03)] hover:shadow-[0_12px_30px_-4px_rgba(201,168,76,0.12)] hover:border-[#C9A84C]/50 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#9B1B30] dark:bg-[#C9A84C] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="p-3 rounded-xl bg-gradient-to-br from-[#FAEAED] to-[#FFFBF8] dark:from-[#9B1B30]/25 dark:to-[#1A0A0E]/30 text-[#9B1B30] dark:text-[#E8D5D9] border border-[#9B1B30]/15 dark:border-[#C9A84C]/15 shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-300">
                    <FileEdit className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-[#9B1B30] dark:text-[#E6C97A] uppercase tracking-widest block">Feature</span>
                    <p className="text-xs md:text-sm text-foreground/90 font-semibold leading-relaxed">
                      They can. Change their biodatas online.
                    </p>
                  </div>
                </div>

                <div className="group bg-gradient-to-br from-card to-[#FFFDFB] dark:to-[#221013]/10 border border-[#E8D5D9]/50 dark:border-border/40 rounded-2xl p-5 flex gap-4 items-start shadow-[0_4px_20px_-4px_rgba(155,27,48,0.03)] hover:shadow-[0_12px_30px_-4px_rgba(201,168,76,0.12)] hover:border-[#C9A84C]/50 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#9B1B30] dark:bg-[#C9A84C] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="p-3 rounded-xl bg-gradient-to-br from-[#FBF5E6] to-[#FFFBF8] dark:from-[#8A7233]/25 dark:to-[#1A0A0E]/30 text-[#9B1B30] dark:text-[#E6C97A] border border-[#C9A84C]/20 shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-300">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-[#9B1B30] dark:text-[#E6C97A] uppercase tracking-widest block">Feature</span>
                    <p className="text-xs md:text-sm text-foreground/90 font-semibold leading-relaxed">
                      Biodata99 has templates and designs for users to choose from.
                    </p>
                  </div>
                </div>

                <div className="group bg-gradient-to-br from-card to-[#FFFDFB] dark:to-[#221013]/10 border border-[#E8D5D9]/50 dark:border-border/40 rounded-2xl p-5 flex gap-4 items-start shadow-[0_4px_20px_-4px_rgba(155,27,48,0.03)] hover:shadow-[0_12px_30px_-4px_rgba(201,168,76,0.12)] hover:border-[#C9A84C]/50 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#9B1B30] dark:bg-[#C9A84C] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="p-3 rounded-xl bg-gradient-to-br from-[#FAEAED] to-[#FFFBF8] dark:from-[#9B1B30]/25 dark:to-[#1A0A0E]/30 text-[#9B1B30] dark:text-[#E8D5D9] border border-[#9B1B30]/15 dark:border-[#C9A84C]/15 shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-300">
                    <Download className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-[#9B1B30] dark:text-[#E6C97A] uppercase tracking-widest block">Feature</span>
                    <p className="text-xs md:text-sm text-foreground/90 font-semibold leading-relaxed">
                      Users can download their biodata in the formats supported by Biodata99.
                    </p>
                  </div>
                </div>

                <div className="group bg-gradient-to-br from-card to-[#FFFDFB] dark:to-[#221013]/10 border border-[#E8D5D9]/50 dark:border-border/40 rounded-2xl p-5 flex gap-4 items-start shadow-[0_4px_20px_-4px_rgba(155,27,48,0.03)] hover:shadow-[0_12px_30px_-4px_rgba(201,168,76,0.12)] hover:border-[#C9A84C]/50 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#9B1B30] dark:bg-[#C9A84C] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="p-3 rounded-xl bg-gradient-to-br from-[#FBF5E6] to-[#FFFBF8] dark:from-[#8A7233]/25 dark:to-[#1A0A0E]/30 text-[#9B1B30] dark:text-[#E6C97A] border border-[#C9A84C]/20 shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-300">
                    <Languages className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-[#9B1B30] dark:text-[#E6C97A] uppercase tracking-widest block">Feature</span>
                    <p className="text-xs md:text-sm text-foreground/90 font-semibold leading-relaxed">
                      Biodata99 also lets users generate their biodata in available languages.
                    </p>
                  </div>
                </div>

                <div className="group bg-gradient-to-br from-card to-[#FFFDFB] dark:to-[#221013]/10 border border-[#E8D5D9]/50 dark:border-border/40 rounded-2xl p-5 flex gap-4 items-start shadow-[0_4px_20px_-4px_rgba(155,27,48,0.03)] hover:shadow-[0_12px_30px_-4px_rgba(201,168,76,0.12)] hover:border-[#C9A84C]/50 transition-all duration-300 relative overflow-hidden md:col-span-2">
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#9B1B30] dark:bg-[#C9A84C] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="p-3 rounded-xl bg-gradient-to-br from-[#FAEAED] to-[#FFFBF8] dark:from-[#9B1B30]/25 dark:to-[#1A0A0E]/30 text-[#9B1B30] dark:text-[#E8D5D9] border border-[#9B1B30]/15 dark:border-[#C9A84C]/15 shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-300">
                    <RefreshCw className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-[#9B1B30] dark:text-[#E6C97A] uppercase tracking-widest block">Feature</span>
                    <p className="text-xs md:text-sm text-foreground/90 font-semibold leading-relaxed">
                      Users can. Update their biodata as needed.
                    </p>
                  </div>
                </div>
              </div>

              <p>
                Please note that Biodata99 is a place where people can make their biodata.
              </p>

              <div className="bg-[#FFFBF8] dark:bg-[#1A0A0E]/30 rounded-2xl p-4 md:p-5 border border-[#C9A84C]/25 space-y-3 text-sm">
                <p className="font-bold text-foreground">Important Disclaimers &amp; Responsibilities:</p>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#9B1B30] mt-2 shrink-0" />
                    <span>Biodata99 is not a service that helps people find a husband or wife.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#9B1B30] mt-2 shrink-0" />
                    <span>The people at Biodata99 do not check whether the information users provide is correct.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#9B1B30] mt-2 shrink-0" />
                    <span>Users are responsible for what they write and share on Biodata99.</span>
                  </li>
                </ul>
              </div>

              <p>
                The people at Biodata99 might. Improve Biodata99's features at any time.
              </p>
              <p>
                They might even stop some features from working.
              </p>
              <p>
                When people use Biodata99, they must follow the rules listed in Biodata99's Terms and Conditions.
              </p>
            </div>
          </section>

          {/* 3. Who Can Use Biodata99 */}
          <section id="who-can-use" className="space-y-4 scroll-mt-24">
            <div className="flex items-center gap-2 border-b border-border/40 pb-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#FAEAED] dark:bg-[#9B1B30]/30 flex items-center justify-center text-[#9B1B30] dark:text-[#E8D5D9]">
                <UserCheck className="w-4 h-4" />
              </div>
              <h2 className="text-xl md:text-2xl font-black text-foreground">
                Who Can Use Biodata99
              </h2>
            </div>
            <div className="text-muted-foreground text-sm md:text-base leading-relaxed space-y-4 font-medium">
              <p>
                To use Biodata99, you have to be 18 years old. You can use it if your parent or legal guardian says it's okay. They must agree to our Terms and Conditions on your behalf.
              </p>
              <p>
                When you start using Biodata99, you are confirming that you meet these requirements. You are also confirming that you are allowed to use our services.
              </p>
            </div>
          </section>

          {/* 4. Your Responsibilities as a User */}
          <section id="user-responsibilities" className="space-y-4 scroll-mt-24">
            <div className="flex items-center gap-2 border-b border-border/40 pb-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#FBF5E6] dark:bg-[#8A7233]/30 flex items-center justify-center text-[#9B1B30] dark:text-[#E6C97A]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h2 className="text-xl md:text-2xl font-black text-foreground">
                Your Responsibilities as a User
              </h2>
            </div>
            <div className="text-muted-foreground text-sm md:text-base leading-relaxed space-y-4 font-medium">
              <p>
                You are responsible for the information you provide and how you use Biodata99. Please use the platform lawfully, honestly, and respectfully.
              </p>
            </div>
          </section>

          {/* 5. Free and Paid Features */}
          <section id="free-paid-features" className="space-y-4 scroll-mt-24">
            <div className="flex items-center gap-2 border-b border-border/40 pb-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#FAEAED] dark:bg-[#9B1B30]/30 flex items-center justify-center text-[#9B1B30] dark:text-[#E8D5D9]">
                <Coins className="w-4 h-4" />
              </div>
              <h2 className="text-xl md:text-2xl font-black text-foreground">
                Free and Paid Features
              </h2>
            </div>
            <div className="text-muted-foreground text-sm md:text-base leading-relaxed space-y-4 font-medium">
              <p>
                Some features on Biodata99 are free to use.
              </p>
              <p>
                You have to pay only once to download premium templates.
              </p>
              <p>
                All paid features are clearly labelled before you pay.
              </p>
              <p>
                We will never charge you without your confirmation.
              </p>
              <p>
                For information on premium templates and our refund policy, visit our{" "}
                <Link href="/refund-policy" className="text-primary font-bold hover:underline">
                  Refund Policy page
                </Link>.
              </p>
            </div>
          </section>

          {/* 6. Your Biodata and Information */}
          <section id="biodata-information" className="space-y-4 scroll-mt-24">
            <div className="flex items-center gap-2 border-b border-border/40 pb-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#FBF5E6] dark:bg-[#8A7233]/30 flex items-center justify-center text-[#9B1B30] dark:text-[#E6C97A]">
                <Lock className="w-4 h-4" />
              </div>
              <h2 className="text-xl md:text-2xl font-black text-foreground">
                Your Biodata and Information
              </h2>
            </div>
            <div className="text-muted-foreground text-sm md:text-base leading-relaxed space-y-4 font-medium">
              <p>
                When you use the Biodata99, everything you type. Like your name, family details, photo and other personal stuff. Is yours alone?
              </p>
              <p>
                We do not own your biodata content.
              </p>
              <p>
                Your data gets processed in your browser and is never stored on our servers.
              </p>
              <p>
                That means we cannot see the biodata that you created.
              </p>
              <p>
                There is one exception:
              </p>
              <ul className="list-disc pl-5 space-y-2 my-2">
                <li>information you submit through our contact form.</li>
              </ul>
              <p>
                We use that only to answer your question, as stated in our{" "}
                <Link href="/privacy-policy" className="text-primary font-bold hover:underline">
                  Privacy Policy
                </Link>.
              </p>
            </div>
          </section>

          {/* 7. Our Templates and Content */}
          <section id="templates-content" className="space-y-4 scroll-mt-24">
            <div className="flex items-center gap-2 border-b border-border/40 pb-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#FAEAED] dark:bg-[#9B1B30]/30 flex items-center justify-center text-[#9B1B30] dark:text-[#E8D5D9]">
                <Copyright className="w-4 h-4" />
              </div>
              <h2 className="text-xl md:text-2xl font-black text-foreground">
                Our Templates and Content
              </h2>
            </div>
            <div className="text-muted-foreground text-sm md:text-base leading-relaxed space-y-4 font-medium">
              <p>
                Everything you see on Biodata99, including the template designs and layouts, graphics, user interface elements, text, code, and branding, is made in-house. This is our work, protected by Indian copyright and intellectual property laws.
              </p>
              <p>
                You can use our templates to make your marriage biodata for personal use. You cannot copy the Biodata99 template designs, give them to other people, change them, or use them for any purpose other than personal use without our permission first. We need your written permission to use the Biodata99 template designs for any purpose.
              </p>
            </div>
          </section>

          {/* 8. Service Availability and Limitations */}
          <section id="service-limitations" className="space-y-4 scroll-mt-24">
            <div className="flex items-center gap-2 border-b border-border/40 pb-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#FBF5E6] dark:bg-[#8A7233]/30 flex items-center justify-center text-[#9B1B30] dark:text-[#E6C97A]">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h2 className="text-xl md:text-2xl font-black text-foreground">
                Service Availability and Limitations
              </h2>
            </div>
            <div className="text-muted-foreground text-sm md:text-base leading-relaxed space-y-4 font-medium">
              <p>
                We do our best to make sure Biodata99 is a place to be. Sometimes Biodata99 may not work right. It might be down for a bit. Have some errors. We do not know if Biodata99 will be right for you.
              </p>
              <p>
                Our templates are supposed to help you make biodatas on Biodata99. We cannot promise that you will get what you want from using Biodata99. You might not find what you are looking for on Biodata99, like a husband or a wife, or get the results you want.
              </p>
            </div>
          </section>

          {/* 9. Limits of Our Responsibility */}
          <section id="limits-of-responsibility" className="space-y-4 scroll-mt-24">
            <div className="flex items-center gap-2 border-b border-border/40 pb-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#FAEAED] dark:bg-[#9B1B30]/30 flex items-center justify-center text-[#9B1B30] dark:text-[#E8D5D9]">
                <Scale className="w-4 h-4" />
              </div>
              <h2 className="text-xl md:text-2xl font-black text-foreground">
                Limits of Our Responsibility
              </h2>
            </div>
            <div className="text-muted-foreground text-sm md:text-base leading-relaxed space-y-4 font-medium">
              <p>
                Biodata99 and its team will not be responsible for things.
              </p>
              <p>
                Here are some examples:
              </p>
              <ul className="space-y-2 pl-2">
                <li className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#9B1B30] mt-2 shrink-0" />
                  <span>Loss of biodata data when you clear your browser storage or switch devices or your browser gets updated</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#9B1B30] mt-2 shrink-0" />
                  <span>Any problems that happen because you used our service like money losses that are not directly related to us</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#9B1B30] mt-2 shrink-0" />
                  <span>Issues with paying through companies like when a transaction fails or is delayed</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#9B1B30] mt-2 shrink-0" />
                  <span>What happens to you whether it is, about your social life, money or personal things because of the biodata you created on our platform</span>
                </li>
              </ul>
              <p>
                If something goes wrong, the most we will owe you is the amount you paid us for that specific thing.
              </p>
              <p>
                If you did not pay us anything, then we do not owe you any money.
              </p>
            </div>
          </section>

          {/* 10. Third-Party Providers and Services */}
          <section id="third-party-providers" className="space-y-4 scroll-mt-24">
            <div className="flex items-center gap-2 border-b border-border/40 pb-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#FBF5E6] dark:bg-[#8A7233]/30 flex items-center justify-center text-[#9B1B30] dark:text-[#E6C97A]">
                <LifeBuoy className="w-4 h-4" />
              </div>
              <h2 className="text-xl md:text-2xl font-black text-foreground">
                Third-Party Providers and Services
              </h2>
            </div>
            <div className="text-muted-foreground text-sm md:text-base leading-relaxed space-y-4 font-medium">
              <p>
                Biodata99 works with a group of trusted companies to help us provide our services. These companies help us with tasks such as processing payments when you buy premium templates, hosting our website, delivering content, and keeping our systems running.
              </p>
              <p>
                When you use these services, you should know that they have their own rules, privacy policies and ways of doing things. We carefully select these companies because we think they are trustworthy. However, Biodata99 does not have control over what these companies do. We are not responsible for their policies, the content they provide or their actions.
              </p>
            </div>
          </section>

          {/* 11. Service Availability and Maintenance */}
          <section id="service-maintenance" className="space-y-4 scroll-mt-24">
            <div className="flex items-center gap-2 border-b border-border/40 pb-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#FAEAED] dark:bg-[#9B1B30]/30 flex items-center justify-center text-[#9B1B30] dark:text-[#E8D5D9]">
                <Clock className="w-4 h-4" />
              </div>
              <h2 className="text-xl md:text-2xl font-black text-foreground">
                Service Availability and Maintenance
              </h2>
            </div>
            <div className="text-muted-foreground text-sm md:text-base leading-relaxed space-y-4 font-medium">
              <p>
                We do our best to keep Biodata99 running continuously. Sometimes Biodata99 might not be available because we are doing maintenance or updating the software. There could be problems, or we might be making Biodata99 more secure. Sometimes things happen that we cannot control.
              </p>
              <p>
                When we know about it ahead of time, we will tell you that Biodata99 will be down for a little while. We try not to interrupt Biodata99 much. We cannot guarantee that Biodata99 will always work perfectly.
              </p>
              <p>
                Biodata99 is not responsible if you lose something, or if it is inconvenient when Biodata99 is not working for a while.
              </p>
            </div>
          </section>

          {/* 12. Changes to Our Terms and Conditions */}
          <section id="changes-to-terms" className="space-y-4 scroll-mt-24">
            <div className="flex items-center gap-2 border-b border-border/40 pb-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#FBF5E6] dark:bg-[#8A7233]/30 flex items-center justify-center text-[#9B1B30] dark:text-[#E6C97A]">
                <FileEdit className="w-4 h-4" />
              </div>
              <h2 className="text-xl md:text-2xl font-black text-foreground">
                Changes to Our Terms and Conditions
              </h2>
            </div>
            <div className="text-muted-foreground text-sm md:text-base leading-relaxed space-y-4 font-medium">
              <p>
                We may change these Terms and Conditions at any time. This is because our services and business practices are constantly changing. We also have to follow the law. When we make these changes, we will update the "Updated" date at the top of this page.
              </p>
              <p>
                If you keep using Biodata99 after we have made changes to the terms, that means you agree to follow the rules. We think it's a good idea for users to check this page every now and then to see if anything has changed.
              </p>
              <p>
                If we make changes to Biodata99 that affect how you use it, we will try to let you know about them on this page or elsewhere on the website. We want to make sure you know what is going on with Biodata99.
              </p>
            </div>
          </section>

          {/* 13. Applicable Law and Disputes */}
          <section id="applicable-law" className="space-y-4 scroll-mt-24">
            <div className="flex items-center gap-2 border-b border-border/40 pb-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#FAEAED] dark:bg-[#9B1B30]/30 flex items-center justify-center text-[#9B1B30] dark:text-[#E8D5D9]">
                <Gavel className="w-4 h-4" />
              </div>
              <h2 className="text-xl md:text-2xl font-black text-foreground">
                Applicable Law and Disputes
              </h2>
            </div>
            <div className="text-muted-foreground text-sm md:text-base leading-relaxed space-y-4 font-medium">
              <p>
                These Terms and Conditions are governed by the laws of India.
              </p>
              <p>
                If there is a problem with using Biodata99, we want you to try talking it out to solve it.
              </p>
              <p>
                We encourage both parties to have a good-faith discussion.
              </p>
              <p>
                If you still can't agree, then the courts in Pune, Maharashtra, India, will handle it.
              </p>
              <p>
                The Biodata99 Terms and Conditions are under the jurisdiction of these courts.
              </p>
            </div>
          </section>

          {/* 14. Contact Us */}
          <section id="contact-us" className="space-y-4 scroll-mt-24">
            <div className="flex items-center gap-2 border-b border-border/40 pb-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#FBF5E6] dark:bg-[#8A7233]/30 flex items-center justify-center text-[#9B1B30] dark:text-[#E6C97A]">
                <Mail className="w-4 h-4" />
              </div>
              <h2 className="text-xl md:text-2xl font-black text-foreground">
                Contact Us
              </h2>
            </div>
            <div className="text-muted-foreground text-sm md:text-base leading-relaxed space-y-4 font-medium">
              <p>
                Questions, concerns, or legal notices can be sent to:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
                <div className="bg-[#FFFBF8] dark:bg-[#1A0A0E]/30 border border-border/50 rounded-2xl p-4 flex items-start gap-3">
                  <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold text-foreground text-sm block">Email Support</span>
                    <a href="mailto:support@biodata99.com" className="text-primary hover:underline font-bold text-sm">
                      support@biodata99.com
                    </a>
                  </div>
                </div>

                <div className="bg-[#FFFBF8] dark:bg-[#1A0A0E]/30 border border-border/50 rounded-2xl p-4 flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold text-[#9B1B30] dark:text-[#E6C97A] text-sm block">📍 Pune, Maharashtra, India</span>
                  </div>
                </div>
              </div>

              <p className="font-bold text-foreground text-sm bg-primary-container/30 border border-primary-container text-foreground p-4 rounded-2xl mt-4">
                We respond to all emails within 24 hours on working days (Monday–Saturday).
              </p>
            </div>
          </section>

        </TermsConditionsLayout>
      </div>
    </div>
  );
}
