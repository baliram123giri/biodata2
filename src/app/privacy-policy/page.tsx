import type { Metadata } from "next";
import { Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how Biodata99 handles your data. Your biodata details stay on your device and are never stored on our servers. Read our full privacy policy here.",
  alternates: {
    canonical: "https://biodata99.com/privacy-policy",
  },
  openGraph: {
    title: "Privacy Policy",
    description: "Learn how Biodata99 handles your data. Your biodata details stay on your device and are never stored on our servers. Read our full privacy policy here.",
    url: "https://biodata99.com/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FFFBF8] dark:bg-[#1A0A0E] pt-10 pb-10 px-4 overflow-hidden relative">
      {/* Decorative background gradients */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#9B1B30]/5 dark:bg-[#C9A84C]/5 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />

      <div className="container mx-auto max-w-3xl relative z-10 space-y-12">
        
        {/* Title & Header block */}
        <div className="text-center space-y-4 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-[#FBF5E6] dark:bg-[#8A7233]/25 px-4 py-1.5 rounded-full border border-[#C9A84C]/40 text-xs font-black text-[#9B1B30] dark:text-[#E6C97A]">
            <Shield className="w-3.5 h-3.5" />
            100% Privacy Promised
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
            Privacy <span className="text-gradient-primary">Policy</span>
          </h1>
          <p className="text-xs font-bold text-muted-foreground tracking-wider uppercase">
            Last updated: May 23, 2026
          </p>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed font-medium">
            We built Biodata99 with privacy as a core principle, not an afterthought. This page explains exactly what data we collect, what we do not collect, and how we handle the information you share with us.
          </p>
        </div>

        {/* Content Body */}
        <div className="bg-card border border-[#C9A84C]/20 rounded-3xl p-6 md:p-10 shadow-sm space-y-10 text-muted-foreground leading-relaxed">
          
          {/* Section 1 */}
          <section className="space-y-3 border-l-2 border-[#9B1B30] dark:border-[#C9A84C] pl-4">
            <h2 className="text-xl font-bold text-foreground">1. How the Biodata Editor Works</h2>
            <p>
              When you use the Biodata99 editor, everything you type - your name, date of birth, family details, photo, and any other information - is processed entirely within your own browser. None of this is sent to our servers at any point.
            </p>
            <div className="bg-[#FFFBF8] dark:bg-[#1A0A0E]/30 rounded-xl p-4 border border-border/40 my-3">
              <div className="text-xs font-black uppercase text-[#9B1B30] dark:text-[#E6C97A] tracking-wider mb-2">This means:</div>
              <ul className="space-y-1.5 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#9B1B30]" />
                  <span>We cannot see your biodata details</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#9B1B30]" />
                  <span>We do not store your name, photo, or family information</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#9B1B30]" />
                  <span>Your finalized PDF is saved directly to your device, not to us</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#9B1B30]" />
                  <span>If you close the browser, your data does not exist anywhere on our end</span>
                </li>
              </ul>
            </div>
            <p className="font-semibold text-foreground/80">
              This is not just a policy - it is how the technology is built. There is no server-side storage for biodata content because we never designed one.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 border-l-2 border-[#9B1B30] dark:border-[#C9A84C] pl-4">
            <h2 className="text-xl font-bold text-foreground">2. What Gets Saved on Your Device</h2>
            <p>
              To make your experience smoother, your browser's local storage is used to save your form progress automatically. This means if you refresh the page or come back later on the same device and browser, your details will still be there.
            </p>
            <p>
              This data lives only on your device. You can clear it at any time by clearing your browser's site data or cache. We have no access to it.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 border-l-2 border-[#9B1B30] dark:border-[#C9A84C] pl-4">
            <h2 className="text-xl font-bold text-foreground">3. Contact Form</h2>
            <p>
              When you send us a message through the Contact Us page, we collect your name and email address so we can reply to you. This information is used only to respond to your query and is not shared with anyone else or used for marketing.
            </p>
            <p>
              We do not add you to any mailing list when you contact us.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 border-l-2 border-[#9B1B30] dark:border-[#C9A84C] pl-4">
            <h2 className="text-xl font-bold text-foreground">4. Analytics</h2>
            <p>
              We use Google Analytics to understand how people use our website - which pages are visited, how long people stay, and where they come from. This helps us improve the product.
            </p>
            <p>
              Google Analytics collects anonymous, aggregated data only. It does not track anything you type into the biodata editor. No personal biodata details are visible to us through analytics.
            </p>
            <p>
              If you prefer not to be tracked, you can install the Google Analytics Opt-out Browser Add-on from Google's website, or use a browser extension that blocks tracking scripts.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 border-l-2 border-[#9B1B30] dark:border-[#C9A84C] pl-4">
            <h2 className="text-xl font-bold text-foreground">5. Cookies</h2>
            <p>
              We use a small number of cookies to keep the site functioning properly - for example, to remember your preferences and save your editor progress locally. We do not use advertising cookies or sell your data to third parties.
            </p>
            <p>
              You can manage or disable cookies through your browser settings at any time. Disabling cookies may affect how the editor saves your progress.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3 border-l-2 border-[#9B1B30] dark:border-[#C9A84C] pl-4">
            <h2 className="text-xl font-bold text-foreground">6. Third-Party Services</h2>
            <p>
              Biodata99 uses the following third-party services:
            </p>
            <ul className="list-disc list-inside pl-2 space-y-1 my-2">
              <li>WhatsApp - optional support channel, used only if you choose to contact us through it</li>
            </ul>
            <p>
              We do not use advertising networks, data brokers, or any service that profiles individual users.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3 border-l-2 border-[#9B1B30] dark:border-[#C9A84C] pl-4">
            <h2 className="text-xl font-bold text-foreground">7. Children's Privacy</h2>
            <p>
              Biodata99 is not directed at children under the age of 13. We do not knowingly collect any information from children. If you believe a child has submitted personal information through our contact form, please write to us and we will delete it promptly.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3 border-l-2 border-[#9B1B30] dark:border-[#C9A84C] pl-4">
            <h2 className="text-xl font-bold text-foreground">8. Changes to This Policy</h2>
            <p>
              If we make significant changes to this policy, we will update the date at the top of this page. We recommend checking back occasionally if privacy matters to you. We will never reduce your privacy protections without making it clearly visible here.
            </p>
          </section>

          {/* Section 9 */}
          <section className="space-y-3 border-l-2 border-[#9B1B30] dark:border-[#C9A84C] pl-4">
            <h2 className="text-xl font-bold text-foreground">9. Contact Us</h2>
            <p>
              If you have any questions about this privacy policy or how your data is handled, write to us at <a href="mailto:support@biodata99.com" className="text-[#9B1B30] dark:text-[#E6C97A] font-bold hover:underline">support@biodata99.com</a>. We read every message and will respond within 24 hours on working days.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
}
