import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions | biodata99.com",
  description: "Read the terms and conditions of using biodata99.com to build and download your matrimonial biodata.",
  alternates: {
    canonical: "https://biodata99.com/terms-conditions",
  },
};

export default function TermsConditionsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FFFBF8] dark:bg-[#1A0A0E] pt-24 pb-20 px-4">
      <div className="container mx-auto max-w-3xl relative z-10 space-y-10 text-muted-foreground leading-relaxed">
        
        {/* Title */}
        <div className="text-center space-y-4 max-w-xl mx-auto mb-6">
          <h1 className="text-4xl font-black tracking-tight text-foreground">
            Terms &amp; <span className="text-gradient-primary">Conditions</span>
          </h1>
          <p className="text-sm">
            Last Updated: May 23, 2026
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground font-sans">1. Acceptance of Terms</h2>
          <p>
            By accessing and using biodata99.com, you agree to comply with and be bound by the following terms and conditions. If you do not agree with any of these terms, you are prohibited from using the service.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground font-sans">2. Permitted Use</h2>
          <p>
            This website is provided free of charge for individuals to generate personal marriage resumes and biodatas. You may download, print, and share your generated biodata files for matrimonial and personal matchmaking purposes.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground font-sans">3. User Responsibility &amp; Data Verification</h2>
          <p>
            Since biodata99.com operates entirely inside your local browser and does not verify any inputs:
          </p>
          <ul className="list-disc list-inside pl-4 space-y-2">
            <li>You are solely responsible for ensuring that all details entered (including educational qualification, caste, and contact info) are true, accurate, and correct.</li>
            <li>We are not responsible or liable for any false information or misrepresentations printed on your generated document.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground font-sans">4. Intellectual Property</h2>
          <p>
            All layout frames, SVG motifs, borders, website design assets, and styling components on biodata99.com are protected by intellectual property laws. You may not copy, reproduce, scrape, or distribute these assets for commercial template resale or competitor services.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground font-sans">5. Disclaimer of Warranties</h2>
          <p>
            Our generator tool is provided 'as is' without warranties of any kind. We do not guarantee that the generated files will render identically on all devices, PDF readers, or document viewing software.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground font-sans">6. Changes to Terms</h2>
          <p>
            We reserves the right to modify these terms and conditions at any time without prior notice. By continuing to use our website, you agree to be bound by the updated terms.
          </p>
        </section>

      </div>
    </div>
  );
}
