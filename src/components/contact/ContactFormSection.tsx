"use client";

import React, { useState } from "react";
import { Mail, Clock, MapPin, MessageSquare, Loader2, Shield, ExternalLink } from "lucide-react";
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
import * as Tooltip from "@radix-ui/react-tooltip";
import { faqs } from "@/lib/faqs";
import { toast } from "sonner";


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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
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
            We actively respond to all support emails during our working hours and aim to reply within 24 hours.
          </p>
          <span className="text-sm font-bold text-foreground mt-4 z-10">
            Monday – Saturday | 9 AM – 6 PM IST
          </span>
        </Card>

        {/* Address card */}
        <Card className="premium-gold-border premium-gold-card group flex flex-col items-center text-center p-8 bg-card relative overflow-hidden transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#9B1B30]/5 via-transparent to-[#C9A84C]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white z-10 shadow-md">
            <MapPin className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-foreground font-sans mt-4 z-10">Our Address</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mt-2 z-10">
            Visit or send correspondence to our registered office location in Pune.
          </p>
          <a
            href="https://maps.google.com/?q=Parijat+Vrindavan+Jadhav+Nagar+Dhayri+Pune+411041"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-bold text-foreground mt-4 z-10 hover:text-primary transition-colors leading-relaxed"
          >
            Pune, Maharashtra, India 411041
          </a>
        </Card>
      </div>

      {/* ── WhatsApp Assistance Button ── */}
      <div className="flex flex-col items-center text-center space-y-4 max-w-xl mx-auto">
        <p className="text-sm text-muted-foreground">
          Prefer chatting or need instant answers? Contact our WhatsApp support:
        </p>
        <a
          href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMMBER}?text=Hi%20biodata99%20team%2C%20I%20need%20help%20with%20my%20marriage%20biodata.`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 bg-[#075E54] hover:bg-[#054C44] active:scale-95 text-white px-8 py-3.5 rounded-full font-black text-sm shadow-md hover:shadow-lg transition-all duration-300"
        >
          <svg className="w-5 h-5 fill-white" viewBox="0 0 32 32">
            <path d="M16 0C7.163 0 0 7.163 0 16c0 2.83.738 5.484 2.027 7.788L0 32l8.424-2.01A15.938 15.938 0 0016 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.538a13.5 13.5 0 01-6.943-1.92l-.497-.296-5.002 1.194 1.234-4.866-.325-.513A13.476 13.476 0 012.462 16C2.462 8.97 8.97 2.462 16 2.462S29.538 8.97 29.538 16 23.03 29.538 16 29.538zm7.44-10.01c-.408-.204-2.414-1.192-2.788-1.328-.374-.136-.646-.204-.918.204-.272.408-1.054 1.328-1.292 1.6-.238.272-.476.306-.884.102-.408-.204-1.722-.635-3.28-2.025-1.212-1.08-2.03-2.415-2.268-2.823-.238-.408-.026-.629.179-.832.183-.183.408-.476.612-.714.204-.238.272-.408.408-.68.136-.272.068-.51-.034-.714-.102-.204-.918-2.21-1.258-3.026-.33-.796-.666-.688-.918-.7l-.782-.014c-.272 0-.714.102-1.088.51s-1.428 1.396-1.428 3.402 1.462 3.946 1.666 4.218c.204.272 2.876 4.39 6.97 6.158.974.42 1.734.67 2.326.858.977.31 1.867.266 2.57.162.784-.117 2.414-.987 2.754-1.94.34-.952.34-1.768.238-1.94-.102-.17-.374-.272-.782-.476z" />
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
                <SelectTrigger aria-label="Select subject topic" className="w-full text-sm rounded-lg focus:ring-primary focus:border-primary bg-background border border-border h-10 px-3">
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
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-foreground">Follow Our Journey</h2>
          <p className="text-sm text-muted-foreground">
            Stay updated with brand new premium templates, language releases, and matrimonial customization features.
          </p>
        </div>

        <Tooltip.Provider delayDuration={200}>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Instagram */}
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <a
                  id="social-instagram"
                  href="https://www.instagram.com/biodata99.co/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex flex-col items-center gap-3 p-5 rounded-2xl border border-pink-500/20 bg-pink-500/5 hover:border-pink-500/50 hover:bg-gradient-to-br hover:from-[#f9ce71]/15 hover:via-[#ee583f]/15 hover:to-[#d12e8b]/15 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_8px_30px_rgba(209,46,139,0.2)] active:scale-95 cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#f9ce71] via-[#ee583f] to-[#d12e8b] shadow-md group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-black text-foreground">Instagram</p>
                    <p className="text-xs text-pink-700 dark:text-pink-400 font-semibold">@biodata99.co</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-tight">Templates & reels</p>
                  <ExternalLink className="absolute top-3 right-3 w-3 h-3 text-muted-foreground/40 group-hover:text-pink-400 transition-colors" />
                </a>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className="z-50 rounded-lg bg-popover border border-border px-3 py-1.5 text-xs text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95"
                  sideOffset={6}
                >
                  Follow us on Instagram for daily template previews!
                  <Tooltip.Arrow className="fill-border" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>

            {/* YouTube */}
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <a
                  id="social-youtube"
                  href="https://youtube.com/@biodata99?si=XlmXrVimfS1vvgmq"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex flex-col items-center gap-3 p-5 rounded-2xl border border-red-600/20 bg-red-600/5 hover:border-red-600/50 hover:bg-red-600/10 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_8px_30px_rgba(220,38,38,0.2)] active:scale-95 cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[#FF0000] shadow-md group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-black text-foreground">YouTube</p>
                    <p className="text-xs text-red-700 dark:text-red-400 font-semibold">@biodata99</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-tight">How-to tutorials</p>
                  <ExternalLink className="absolute top-3 right-3 w-3 h-3 text-muted-foreground/40 group-hover:text-red-400 transition-colors" />
                </a>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className="z-50 rounded-lg bg-popover border border-border px-3 py-1.5 text-xs text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95"
                  sideOffset={6}
                >
                  Watch step-by-step biodata creation tutorials!
                  <Tooltip.Arrow className="fill-border" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>

            {/* Twitter / X */}
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <a
                  id="social-twitter"
                  href="https://x.com/biodata99com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex flex-col items-center gap-3 p-5 rounded-2xl border border-foreground/15 bg-foreground/5 hover:border-foreground/40 hover:bg-foreground/10 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_8px_30px_rgba(255,255,255,0.08)] active:scale-95 cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-foreground shadow-md group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-5 h-5 fill-background" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-black text-foreground">Twitter / X</p>
                    <p className="text-xs text-foreground/80 font-semibold">@biodata99com</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-tight">News & updates</p>
                  <ExternalLink className="absolute top-3 right-3 w-3 h-3 text-muted-foreground/40 group-hover:text-foreground/60 transition-colors" />
                </a>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className="z-50 rounded-lg bg-popover border border-border px-3 py-1.5 text-xs text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95"
                  sideOffset={6}
                >
                  Follow us on X for quick tips & feature drops!
                  <Tooltip.Arrow className="fill-border" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>

            {/* Pinterest */}
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <a
                  id="social-pinterest"
                  href="https://www.pinterest.com/biodata99/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex flex-col items-center gap-3 p-5 rounded-2xl border border-red-500/20 bg-red-500/5 hover:border-red-500/50 hover:bg-red-500/10 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_8px_30px_rgba(189,8,28,0.2)] active:scale-95 cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[#E60023] shadow-md group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" /></svg>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-black text-foreground">Pinterest</p>
                    <p className="text-xs text-red-700 dark:text-red-400 font-semibold">biodata99</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-tight">Ideas & inspiration</p>
                  <ExternalLink className="absolute top-3 right-3 w-3 h-3 text-muted-foreground/40 group-hover:text-red-400 transition-colors" />
                </a>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className="z-50 rounded-lg bg-popover border border-border px-3 py-1.5 text-xs text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95"
                  sideOffset={6}
                >
                  Pin our biodata templates for wedding inspiration!
                  <Tooltip.Arrow className="fill-border" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>

          </div>
        </Tooltip.Provider>
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
          <Shield className="w-5 h-5 text-[#9B1B30]" />
        </div>
        <p className="text-xs md:text-sm text-muted-foreground leading-relaxed text-left">
          <strong>Privacy Shield Active:</strong> Since we respect your privacy and **do not store any user details or biodatas on our servers**, we cannot retrieve or recover downloaded PDFs or editing details. Any updates must be done directly through the app on the same device.
        </p>
      </div>

    </div>
  );
}
