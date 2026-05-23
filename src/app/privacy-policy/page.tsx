import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | biodata99.com",
  description: "Read our privacy policy to understand how biodata99.com processes and protects your matrimonial details completely inside your browser.",
  alternates: {
    canonical: "https://biodata99.com/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FFFBF8] dark:bg-[#1A0A0E] pt-24 pb-20 px-4">
      <div className="container mx-auto max-w-3xl relative z-10 space-y-10 text-muted-foreground leading-relaxed">
        
        {/* Title */}
        <div className="text-center space-y-4 max-w-xl mx-auto mb-6">
          <h1 className="text-4xl font-black tracking-tight text-foreground">
            Privacy <span className="text-gradient-primary">Policy</span>
          </h1>
          <p className="text-sm">
            Last Updated: May 23, 2026
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground font-sans">1. Introduction</h2>
          <p>
            At biodata99.com, we respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we handle your personal data when you visit our website and use our marriage biodata builder.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground font-sans">2. Local Browser-Side Processing (Zero Server-Side Storage)</h2>
          <p>
            We operate under a strict **privacy-first architecture**. All data entered in the biodata builder form (including your name, height, birth date, physical traits, family description, and uploaded profile pictures) is processed and rendered **completely inside your local web browser**.
          </p>
          <p>
            Specifically:
          </p>
          <ul className="list-disc list-inside pl-4 space-y-2">
            <li>No personal data or images are sent to or stored on our servers.</li>
            <li>No database is maintained containing user biodatas.</li>
            <li>We do not have access to your finalized biodata PDF or details.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground font-sans">3. Cookies and LocalStorage</h2>
          <p>
            We use browser LocalStorage to temporarily save your form input progress on your device so you do not lose your changes if you refresh the browser page. You can remove all of this data at any time by clearing your browser cache or site data.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground font-sans">4. Third-Party Analytics</h2>
          <p>
            We may use third-party analytics services (such as Google Analytics) to monitor aggregate, anonymous website traffic metrics (e.g. number of site visitors, duration of visit). These tools collect non-personal metadata and do not track any personal details entered into our biodata forms.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground font-sans">5. Contact Information</h2>
          <p>
            If you have any questions or suggestions regarding this privacy policy, please contact us at:
            <a href="mailto:hello@biodata99.com" className="ml-1 text-primary font-bold hover:underline">hello@biodata99.com</a>.
          </p>
        </section>

      </div>
    </div>
  );
}
