"use client";

import React, { useState } from "react";
import { Mail, Clock, MessageSquare, Loader2, Heart, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";

const faqs = [
  {
    q: "Is biodata99.com completely free?",
    a: "Yes, creating and downloading your marriage biodata is 100% free. There are absolutely no hidden charges, trial limits, or premium features locked behind a paywall.",
  },
  {
    q: "Do you store my personal data?",
    a: "No. We utilize a strict privacy-first local processing system. All details and photos entered inside the builder stay entirely within your web browser and are never uploaded or saved to our servers.",
  },
  {
    q: "Can I edit my biodata after downloading?",
    a: "Yes! Your progress is automatically cached locally inside your web browser. As long as you access the site on the same device and browser without clearing cache, your filled-in details will be ready for editing.",
  },
  {
    q: "Which languages are supported?",
    a: "We support a wide array of Indian regional languages, including English, Hindi, Marathi, Gujarati, Telugu, Bengali, Tamil, Kannada, Punjabi, and Urdu.",
  },
  {
    q: "Can I download in Word format?",
    a: "Yes, our builder supports instant A4 high-resolution downloads in both print-ready PDF format and editable Microsoft Word (.docx) document styles.",
  },
];

const WHATSAPP_NUMBER = "919999999999";

export function ContactFormSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    topic: "General Feedback",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Message delivered successfully!");
        setFormData({
          name: "",
          email: "",
          topic: "General Feedback",
          message: "",
        });
      } else {
        toast.error(data.error || "Failed to deliver message.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error. Please verify your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-16">
      
      {/* ── Contact Info Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Email support card */}
        <Card className="premium-gold-border premium-gold-card group flex flex-col items-center text-center p-8 bg-card relative overflow-hidden transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#9B1B30]/5 via-transparent to-[#C9A84C]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white z-10 shadow-md">
            <Mail className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-foreground font-sans mt-4 z-10">Email Support</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mt-2 z-10">
            For template suggestions, custom design requests, bugs reporting, or business proposals.
          </p>
          <a
            href="mailto:support@biodata99.com"
            className="text-lg font-black text-primary hover:underline transition-colors mt-4 z-10"
          >
            support@biodata99.com
          </a>
        </Card>

        {/* Support timings card */}
        <Card className="premium-gold-border premium-gold-card group flex flex-col items-center text-center p-8 bg-card relative overflow-hidden transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#9B1B30]/5 via-transparent to-[#C9A84C]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white z-10 shadow-md">
            <Clock className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-foreground font-sans mt-4 z-10">Response Window</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mt-2 z-10">
            We monitor support emails around the clock and aim to respond to all inquiries within 24 hours.
          </p>
          <span className="text-sm font-bold text-foreground mt-4 z-10">
            Monday – Saturday | 9 AM – 6 PM IST
          </span>
        </Card>
      </div>

      {/* ── WhatsApp Assistance Button ── */}
      <div className="flex flex-col items-center text-center space-y-4 max-w-xl mx-auto">
        <p className="text-sm text-muted-foreground">
          Prefer chatting or need instant answers? Contact our WhatsApp support:
        </p>
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi%20biodata99%20team%2C%20I%20need%20help%20with%20my%20marriage%20biodata.`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 bg-[#25D366] hover:bg-[#1ebe5d] active:scale-95 text-white px-8 py-3.5 rounded-full font-black text-sm shadow-md hover:shadow-lg transition-all duration-300"
        >
          <svg className="w-5 h-5 fill-white" viewBox="0 0 32 32">
            <path d="M16 0C7.163 0 0 7.163 0 16c0 2.83.738 5.484 2.027 7.788L0 32l8.424-2.01A15.938 15.938 0 0016 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.538a13.5 13.5 0 01-6.943-1.92l-.497-.296-5.002 1.194 1.234-4.866-.325-.513A13.476 13.476 0 012.462 16C2.462 8.97 8.97 2.462 16 2.462S29.538 8.97 29.538 16 23.03 29.538 16 29.538zm7.44-10.01c-.408-.204-2.414-1.192-2.788-1.328-.374-.136-.646-.204-.918.204-.272.408-1.054 1.328-1.292 1.6-.238.272-.476.306-.884.102-.408-.204-1.722-.635-3.28-2.025-1.212-1.08-2.03-2.415-2.268-2.823-.238-.408-.026-.629.179-.832.183-.183.408-.476.612-.714.204-.238.272-.408.408-.68.136-.272.068-.51-.034-.714-.102-.204-.918-2.21-1.258-3.026-.33-.796-.666-.688-.918-.7l-.782-.014c-.272 0-.714.102-1.088.51s-1.428 1.396-1.428 3.402 1.462 3.946 1.666 4.218c.204.272 2.876 4.39 6.97 6.158.974.42 1.734.67 2.326.858.977.31 1.867.266 2.57.162.784-.117 2.414-.987 2.754-1.94.34-.952.34-1.768.238-1.94-.102-.17-.374-.272-.782-.476z"/>
          </svg>
          Chat on WhatsApp
        </a>
      </div>

      {/* ── Custom Premium Contact Form Section ── */}
      <Card className="max-w-3xl mx-auto bg-card border border-[#C9A84C]/25 rounded-2xl shadow-lg overflow-hidden relative">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-primary" />
        <CardContent className="p-6 md:p-10 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-foreground">Send Us a Message</h2>
            <p className="text-muted-foreground text-sm">
              Fill out this quick form and our support team will get in touch with you.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="contact-name" className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                  Full Name
                </Label>
                <Input
                  id="contact-name"
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="rounded-lg focus-visible:ring-primary focus-visible:border-primary border-border bg-background"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="contact-email" className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                  Email Address
                </Label>
                <Input
                  id="contact-email"
                  type="email"
                  required
                  placeholder="e.g. rahul@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="rounded-lg focus-visible:ring-primary focus-visible:border-primary border-border bg-background"
                />
              </div>
            </div>

            {/* Subject/Topic */}
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                Subject Topic
              </Label>
              <Select
                value={formData.topic}
                onValueChange={(value) => setFormData({ ...formData, topic: value || "General Feedback" })}
              >
                <SelectTrigger className="w-full text-sm rounded-lg focus:ring-primary focus:border-primary bg-background border border-border h-10 px-3">
                  <SelectValue placeholder="Select a topic" />
                </SelectTrigger>
                <SelectContent className="bg-card border border-border rounded-lg shadow-md z-50">
                  <SelectItem value="Template Request" className="cursor-pointer hover:bg-muted py-2 px-3 text-sm">
                    🎨 Template Request / Design Suggestion
                  </SelectItem>
                  <SelectItem value="Bug Report" className="cursor-pointer hover:bg-muted py-2 px-3 text-sm">
                    🐞 Bug Report / Technical Glitch
                  </SelectItem>
                  <SelectItem value="Feature Suggestion" className="cursor-pointer hover:bg-muted py-2 px-3 text-sm">
                    ✨ Feature Request / Suggestion
                  </SelectItem>
                  <SelectItem value="Business Partnership" className="cursor-pointer hover:bg-muted py-2 px-3 text-sm">
                    💼 Business Partnership / Ads
                  </SelectItem>
                  <SelectItem value="General Feedback" className="cursor-pointer hover:bg-muted py-2 px-3 text-sm">
                    💬 General Feedback or Question
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Message Body */}
            <div className="space-y-2">
              <Label htmlFor="contact-message" className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                Message details
              </Label>
              <Textarea
                id="contact-message"
                required
                rows={5}
                placeholder="Please describe your suggestions, questions, or bugs in detail..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="rounded-lg focus-visible:ring-primary focus-visible:border-primary border-border bg-background min-h-[120px]"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full py-6 rounded-full font-black text-sm bg-gradient-primary text-white border-0 transition-all hover:scale-[1.01] active:scale-95 shadow-md disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending Message...
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4" />
                  Submit Contact Form
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ── Follow Us / Social Links ── */}
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-foreground">Follow Our Journey</h2>
          <p className="text-sm text-muted-foreground">
            Stay updated with brand new premium templates, language releases, and matrimonial customization features.
          </p>
        </div>
        <div className="flex justify-center gap-3.5 flex-wrap">
          {[
            { label: "Instagram", href: "https://instagram.com/biodata99", color: "hover:bg-gradient-to-r hover:from-[#f9ce71] hover:via-[#ee583f] hover:to-[#d12e8b] bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20" },
            { label: "Facebook", href: "https://facebook.com/biodata99", color: "hover:bg-blue-600 hover:text-white bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-600/20" },
            { label: "YouTube", href: "https://youtube.com/@biodata99", color: "hover:bg-red-600 hover:text-white bg-red-600/10 text-red-600 dark:text-red-400 border border-red-600/20" },
            { label: "Twitter / X", href: "https://x.com/biodata99", color: "hover:bg-foreground hover:text-background bg-foreground/10 text-foreground dark:text-foreground border border-foreground/20" },
          ].map(({ label, href, color }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={`px-6 py-2.5 rounded-full text-xs font-black tracking-wide transition-all duration-300 hover:scale-105 active:scale-95 ${color}`}
            >
              {label}
            </a>
          ))}
        </div>
      </div>

      {/* ── Frequently Asked Questions (Accordion) ── */}
      <div className="max-w-3xl mx-auto space-y-8">
        <h2 className="text-2xl font-black text-foreground text-center">
          Frequently Asked Questions
        </h2>
        <Card className="border border-[#C9A84C]/25 rounded-2xl p-6 md:p-8 bg-card shadow-sm">
          <Accordion type="single" collapsible className="w-full space-y-2">
            {faqs.map((faq, idx) => (
              <AccordionItem key={idx} value={`faq-${idx}`} className="border-b border-border/40 py-2">
                <AccordionTrigger className="text-base font-black text-left text-foreground hover:text-primary hover:no-underline py-4">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm md:text-base text-muted-foreground leading-relaxed pt-2 pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
      </div>

      {/* ── Strict Privacy Shield Note ── */}
      <div className="bg-[#FBF5E6]/40 border border-[#C9A84C]/20 rounded-2xl p-6 text-center max-w-2xl mx-auto flex flex-col md:flex-row items-center gap-4 justify-center">
        <div className="w-10 h-10 rounded-full bg-[#C9A84C]/10 flex items-center justify-center shrink-0">
          <Shield className="w-5 h-5 text-[#8A7233]" />
        </div>
        <p className="text-xs md:text-sm text-muted-foreground leading-relaxed text-left">
          <strong>Privacy Shield Active:</strong> Since we respect your privacy and **do not store any user details or biodatas on our servers**, we cannot retrieve or recover downloaded PDFs or editing details. Any updates must be done directly through the app on the same device.
        </p>
      </div>

    </div>
  );
}
