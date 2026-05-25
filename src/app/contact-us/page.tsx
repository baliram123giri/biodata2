import type { Metadata } from "next";
import { Mail, MessageCircle, MapPin, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us | Support & Feedback | biodata99.com",
  description: "Get in touch with the biodata99.com team for support, feature requests, template suggestions, or general feedback.",
  alternates: {
    canonical: "https://biodata99.com/contact-us",
  },
};

export default function ContactUsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FFFBF8] dark:bg-[#1A0A0E] pt-24 pb-20 px-4">
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

        {/* Contact Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          
          {/* Card 1: Email Support */}
          <div className="bg-card border border-[#C9A84C]/25 rounded-2xl p-8 flex flex-col items-center text-center space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white">
              <Mail className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-foreground font-sans">Email Support</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              For templates request, bug reports, custom designs, or business partnership inquiries.
            </p>
            <a 
              href="mailto:hello@biodata99.com" 
              className="text-lg font-black text-primary hover:underline transition-colors"
            >
              hello@biodata99.com
            </a>
          </div>

          {/* Card 2: Support Timings */}
          <div className="bg-card border border-[#C9A84C]/25 rounded-2xl p-8 flex flex-col items-center text-center space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white">
              <Clock className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-foreground font-sans">Response Time</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We monitor support emails around the clock and aim to respond to all inquiries within 24 hours.
            </p>
            <span className="text-base font-bold text-foreground">
              Monday - Saturday | 9 AM - 6 PM IST
            </span>
          </div>

        </div>

        {/* Note */}
        <div className="bg-[#FBF5E6]/40 border border-[#C9A84C]/20 rounded-2xl p-6 text-center max-w-2xl mx-auto">
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
            Please note: Since we respect your privacy and **do not store any user details or biodatas on our servers**, we cannot retrieve or recover downloaded PDFs or editing details. Any updates must be done directly through the app on the same device.
          </p>
        </div>

      </div>
    </div>
  );
}
