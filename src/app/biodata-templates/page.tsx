import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { ThumbnailsGrid } from "@/components/templates/ThumbnailsGrid";
import { JsonLd } from "@/components/seo/JsonLd";
import { CompanyLogoFeature } from "@/components/biodata/CompanyLogoFeature";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { templatesPageSchema, templatesPageFaqSchema } from "@/lib/seo-schemas";

export const metadata: Metadata = {
  title: "Marriage Biodata Templates & Formats",
  description: "Download 100+ free marriage biodata templates — Hindu, Muslim, Islamic, Jain, Sikh & more. Customize and export as PDF, PNG or JPEG — no login needed.",
  alternates: {
    canonical: "https://biodata99.com/biodata-templates",
  },
  openGraph: {
    title: "Marriage Biodata Templates & Formats",
    description: "Download 100+ free marriage biodata templates — Hindu, Muslim, Islamic, Jain, Sikh & more. Customize and export as PDF, PNG or JPEG — no login needed.",
    url: "https://biodata99.com/biodata-templates",
  },
};

export const dynamic = "force-dynamic";

export default async function BiodataTemplatesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FFFBF8] dark:bg-[#1A0A0E] pt-4 pb-10 px-4">
      {/* Background Ornaments */}
      <div className="absolute top-0 right-0 w-[40%] h-[40%] rounded-full bg-gradient-to-tr from-[#9B1B30]/5 to-[#C9A84C]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40%] h-[40%] rounded-full bg-gradient-to-br from-[#C9A84C]/5 to-[#9B1B30]/5 blur-[120px] pointer-events-none" />

      <div className="container mx-auto max-w-6xl relative z-10 space-y-5">
        {/* Header Block */}
        <div className="text-center space-y-2 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#C9A84C]/45 bg-[#FBF5E6]/90 dark:bg-[#8A7233]/25 px-4.5 py-1.5 text-xs font-black text-[#9B1B30] dark:text-[#E6C97A]">
            <Sparkles className="w-3.5 h-3.5" />
            Premium Design Collection
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
            100+ Free <span className="text-gradient-primary">Marriage Biodata Templates &amp; Formats</span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Create a professional marriage biodata in minutes using beautifully designed templates for every community. Personalize details, photos, colors, and language to match your preferences.
          </p>
          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2.5 pt-4 max-w-4xl mx-auto">
            {[
              "100+ Professionally Designed Templates",
              "Customize Fonts, Colors & Spacing",
              "Multiple Built-in Background Themes",
              "Community & Religion-Specific Designs",
              "Religious Symbols & Decorative Elements",
              "Multi-Language Support",
              "Instant PDF, PNG & JPEG Export",
              "No Design Skills Required"
            ].map((badge) => (
              <div
                key={badge}
                className="flex items-center gap-1.5 text-xs font-bold text-stone-750 dark:text-stone-300 bg-[#FBF5E6]/40 dark:bg-stone-900/30 border border-[#C9A84C]/20 px-3.5 py-1.5 rounded-full"
              >
                <span className="text-[#9B1B30] dark:text-[#E6C97A] font-black text-sm">✓</span>
                <span>{badge}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Thumbnails Grid Component */}
        <ThumbnailsGrid />

        {/* Features Customization Section */}
        <div className="py-8 max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-black text-foreground">
              Personalize Your <span className="text-gradient-primary">Marriage Biodata</span> Your Way
            </h2>
            <div className="text-sm text-stone-650 dark:text-stone-300 max-w-3xl mx-auto space-y-4 leading-relaxed font-medium">
              <p>
                Your marriage biodata is more than just a document. It's your first introduction to a potential life partner and their family. That's why <span className="font-bold text-[#9B1B30] dark:text-[#E6C97A]">biodata99.com</span> gives you complete creative control to customize every element of your biodata, making it truly yours.
              </p>
              <p>
                Whether you prefer a traditional look with religious motifs or a modern minimalist design, our easy-to-use editing tools let you adjust every detail with no design skills needed.
              </p>
            </div>
          </div>

          {/* Transition to customization steps */}
          <div className="pt-8 border-t border-stone-200/40 dark:border-stone-800/40 text-center max-w-2xl mx-auto space-y-2.5">
            <h3 className="text-lg md:text-xl font-black text-foreground">
              What You Can Customize
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              Let's walk you through everything you can edit and customize inside the creator studio:
            </p>
          </div>

          {/* Complete Step-by-Step Guide */}
          <div className="space-y-6 pt-4 max-w-5xl mx-auto">
            <p className="text-sm text-stone-650 dark:text-stone-300 text-center max-w-3xl mx-auto font-medium leading-relaxed">
              Once you select a template, you enter the biodata editor, a powerful, easy-to-use design studio built specifically for Indian marriage biodatas. Everything you see on the left sidebar controls a different aspect of your biodata. Here's what each tool does:
            </p>

            <div className="space-y-6 pt-4">
              {/* Step 1 */}
              <div className="bg-card/45 dark:bg-stone-900/20 border border-[#C9A84C]/15 rounded-2xl p-6 hover:border-[#C9A84C]/35 transition-all duration-300 shadow-xs">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  <div className="lg:col-span-7 relative aspect-video w-full overflow-hidden rounded-xl border border-[#C9A84C]/25 bg-muted/10 shadow-xs group/img">
                    <Image
                      src="/content/biodata-templates/biodata99-step-1-select-template-and-filter.webp"
                      alt="Step 1 in Biodata99 editor showing how to select a marriage biodata template, use template filters, and change the mantra or heading."
                      title="Step 1 - Choose a Biodata Template"
                      fill
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-cover transition-transform duration-500 group-hover/img:scale-[1.02]"
                      loading="lazy"
                    />
                  </div>
                  <div className="lg:col-span-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🗂️</span>
                      <h4 className="text-base font-black text-foreground">Step 1: Templates</h4>
                    </div>
                    <p className="text-[11px] font-black text-[#9B1B30] dark:text-[#E6C97A] leading-relaxed">
                      💡 Caption: Browse templates, filter by religion or language, and customize the biodata heading or mantra.
                    </p>
                    <div className="text-xs text-stone-600 dark:text-stone-400 space-y-2 leading-relaxed font-medium">
                      <p>
                        Click the <strong>Templates</strong> icon in the left sidebar to browse and switch between available designs at any time. Your information carries over automatically when you switch templates.
                      </p>
                      <p>
                        Use the <strong>Filter</strong> option (top right of the template panel) to narrow down templates by religion, language, color, or style, making it easy to find the perfect match.
                      </p>
                      <p>
                        At the top of the editor, you can also update the auspicious sign or mantra displayed on your biodata — such as <em>"|| Shree Ganeshay Namah ||"</em>, <em>"Bismillah"</em>, <em>"Ik Onkar"</em>, or any other religious line.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-card/45 dark:bg-stone-900/20 border border-[#C9A84C]/15 rounded-2xl p-6 hover:border-[#C9A84C]/35 transition-all duration-300 shadow-xs">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  <div className="lg:col-span-7 relative aspect-video w-full overflow-hidden rounded-xl border border-[#C9A84C]/25 bg-muted/10 shadow-xs group/img">
                    <Image
                      src="/content/biodata-templates/biodata99-step-2-fill-biodata-details.webp"
                      alt="Step 2 in Biodata99 editor showing how to enter personal details, upload a profile photo, reorder fields, and edit biodata information."
                      title="Step 2 - Fill Personal Details"
                      fill
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-cover transition-transform duration-500 group-hover/img:scale-[1.02]"
                      loading="lazy"
                    />
                  </div>
                  <div className="lg:col-span-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">✏️</span>
                      <h4 className="text-base font-black text-foreground">Step 2: Fields (Fill Your Details)</h4>
                    </div>
                    <p className="text-[11px] font-black text-[#9B1B30] dark:text-[#E6C97A] leading-relaxed">
                      💡 Caption: Add personal information, manage fields, and customize your profile photo.
                    </p>
                    <div className="text-xs text-stone-600 dark:text-stone-400 space-y-2 leading-relaxed font-medium">
                      <p>
                        Click the <strong>Fields</strong> icon to open the form panel where you enter all your personal information — Full Name, Date of Birth, Time of Birth, Height, Religion, and much more.
                      </p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Reorder fields using the up/down arrows next to each field</li>
                        <li>Delete fields you don't need using the trash icon</li>
                        <li>Edit field labels by clicking the pencil icon</li>
                        <li>Adjust your profile photo position, crop, scale, and border radius (square, rounded, or circle shape)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-card/45 dark:bg-stone-900/20 border border-[#C9A84C]/15 rounded-2xl p-6 hover:border-[#C9A84C]/35 transition-all duration-300 shadow-xs">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  <div className="lg:col-span-7 relative aspect-video w-full overflow-hidden rounded-xl border border-[#C9A84C]/25 bg-muted/10 shadow-xs group/img">
                    <Image
                      src="/content/biodata-templates/biodata99-step-3-customize-theme-colors.webp"
                      alt="Step 3 in Biodata99 editor showing background themes and custom text color settings for a marriage biodata."
                      title="Step 3 - Customize Theme Colors"
                      fill
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-cover transition-transform duration-500 group-hover/img:scale-[1.02]"
                      loading="lazy"
                    />
                  </div>
                  <div className="lg:col-span-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🎨</span>
                      <h4 className="text-base font-black text-foreground">Step 3: Theme (Colors & Style)</h4>
                    </div>
                    <p className="text-[11px] font-black text-[#9B1B30] dark:text-[#E6C97A] leading-relaxed">
                      💡 Caption: Choose background themes and adjust title, label, and text colors.
                    </p>
                    <div className="text-xs text-stone-600 dark:text-stone-400 space-y-2 leading-relaxed font-medium">
                      <p>
                        Click the <strong>Theme</strong> icon to customize the visual appearance of your biodata.
                      </p>
                      <p>
                        <strong>Background Themes:</strong> Choose from curated palettes including Royal Maroon, Golden Elegance, Emerald Luxury, Deep Ocean, Imperial Purple, Peacock Majesty, and more.
                      </p>
                      <p>
                        <strong>Text Themes:</strong> Fine-tune individual text colors for Titles & Headers (Primary), Field Values (Secondary), and Labels & Ornaments (Accent) using custom hex codes or the color picker.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-card/45 dark:bg-stone-900/20 border border-[#C9A84C]/15 rounded-2xl p-6 hover:border-[#C9A84C]/35 transition-all duration-300 shadow-xs">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  <div className="lg:col-span-7 relative aspect-video w-full overflow-hidden rounded-xl border border-[#C9A84C]/25 bg-muted/10 shadow-xs group/img">
                    <Image
                      src="/content/biodata-templates/biodata99-step-4-adjust-layout-spacing.webp"
                      alt="Step 4 in Biodata99 editor showing spacing controls for top padding, side margins, and font size adjustment."
                      title="Step 4 - Adjust Layout Spacing"
                      fill
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-cover transition-transform duration-500 group-hover/img:scale-[1.02]"
                      loading="lazy"
                    />
                  </div>
                  <div className="lg:col-span-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">↕️</span>
                      <h4 className="text-base font-black text-foreground">Step 4: Spacing (Layout Control)</h4>
                    </div>
                    <p className="text-[11px] font-black text-[#9B1B30] dark:text-[#E6C97A] leading-relaxed">
                      💡 Caption: Fine-tune page spacing, margins, and font size to fit your content perfectly.
                    </p>
                    <div className="text-xs text-stone-600 dark:text-stone-400 space-y-2 leading-relaxed font-medium">
                      <p>
                        Click the <strong>Spacing</strong> icon to adjust how your content fits on the page. This is especially useful when you have too much content (overflowing) or too little content.
                      </p>
                      <p>
                        Use simple sliders to adjust:
                      </p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Top Padding — space from the top of the page</li>
                        <li>Left & Right Padding — side margins of the content area</li>
                        <li>Font Size — scale all text across the entire biodata</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 5A */}
              <div className="bg-card/45 dark:bg-stone-900/20 border border-[#C9A84C]/15 rounded-2xl p-6 hover:border-[#C9A84C]/35 transition-all duration-300 shadow-xs">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  <div className="lg:col-span-7 relative aspect-video w-full overflow-hidden rounded-xl border border-[#C9A84C]/25 bg-muted/10 shadow-xs group/img">
                    <Image
                      src="/content/biodata-templates/biodata99-step-5-add-religious-stickers.webp"
                      alt="Step 5 in Biodata99 editor showing how to add, move, resize, and position religious or cultural stickers on a marriage biodata."
                      title="Step 5 - Add Graphics Stickers"
                      fill
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-cover transition-transform duration-500 group-hover/img:scale-[1.02]"
                      loading="lazy"
                    />
                  </div>
                  <div className="lg:col-span-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🌟</span>
                      <h4 className="text-base font-black text-foreground">Step 5A: Graphics Stickers</h4>
                    </div>
                    <p className="text-[11px] font-black text-[#9B1B30] dark:text-[#E6C97A] leading-relaxed">
                      💡 Caption: Choose stickers and freely drag, resize, rotate, or reposition them on your biodata.
                    </p>
                    <div className="text-xs text-stone-650 dark:text-stone-400 space-y-2 leading-relaxed font-medium">
                      <p>
                        Click the <strong>Graphics</strong> icon to add religious and cultural visual elements to your biodata.
                      </p>
                      <p>
                        <strong>Stickers:</strong> Browse cultural graphics representing all major Indian communities (Ganesha, Islamic Gold Symbol, Crescent Moon, Ashoka Chakra, Ram Navami Temple, Akkalkot Swami, etc.). Drag, scale, and position them freely on the canvas.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 5B */}
              <div className="bg-card/45 dark:bg-stone-900/20 border border-[#C9A84C]/15 rounded-2xl p-6 hover:border-[#C9A84C]/35 transition-all duration-300 shadow-xs">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  <div className="lg:col-span-7 relative aspect-video w-full overflow-hidden rounded-xl border border-[#C9A84C]/25 bg-muted/10 shadow-xs group/img">
                    <Image
                      src="/content/biodata-templates/biodata99-step-5-adjust-background-images.webp"
                      alt="Step 5 in Biodata99 editor showing background image selection with opacity, size, and position controls."
                      title="Step 5 - Background Image Controls"
                      fill
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-cover transition-transform duration-500 group-hover/img:scale-[1.02]"
                      loading="lazy"
                    />
                  </div>
                  <div className="lg:col-span-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🖼️</span>
                      <h4 className="text-base font-black text-foreground">Step 5B: Background Images</h4>
                    </div>
                    <p className="text-[11px] font-black text-[#9B1B30] dark:text-[#E6C97A] leading-relaxed">
                      💡 Caption: Add decorative background illustrations and adjust opacity, scale, and positioning.
                    </p>
                    <div className="text-xs text-stone-600 dark:text-stone-400 space-y-2 leading-relaxed font-medium">
                      <p>
                        Enhance the background layer of your biodata layout with elegant decorative illustrations.
                      </p>
                      <p>
                        <strong>BG Images:</strong> Choose subtle illustrations (like Krishna, Shiva Mandala) that blend behind your content as decorative textures without covering the text. Adjust the opacity to ensure text readability remains perfect.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 6 */}
              <div className="bg-card/45 dark:bg-stone-900/20 border border-[#C9A84C]/15 rounded-2xl p-6 hover:border-[#C9A84C]/35 transition-all duration-300 shadow-xs">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  <div className="lg:col-span-7 relative aspect-video w-full overflow-hidden rounded-xl border border-[#C9A84C]/25 bg-muted/10 shadow-xs group/img">
                    <Image
                      src="/content/biodata-templates/biodata99-step-6-download-biodata-formats.webp"
                      alt="Step 6 in Biodata99 showing PDF, JPEG, PNG, and combo pack download options for marriage biodata templates."
                      title="Step 6 - Download Your Biodata"
                      fill
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-cover transition-transform duration-500 group-hover/img:scale-[1.02]"
                      loading="lazy"
                    />
                  </div>
                  <div className="lg:col-span-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">📥</span>
                      <h4 className="text-base font-black text-foreground">Step 6: Download Your Biodata</h4>
                    </div>
                    <p className="text-[11px] font-black text-[#9B1B30] dark:text-[#E6C97A] leading-relaxed">
                      💡 Caption: Download your biodata in PDF, JPEG, PNG, or all-in-one combo format.
                    </p>
                    <div className="text-xs text-stone-650 dark:text-stone-400 space-y-2 leading-relaxed font-medium">
                      <p>
                        Once you're happy with your design, click the <strong>Premium Download</strong> button (top right).
                      </p>
                      <p>
                        <strong>Free Templates:</strong> Download in print-ready PDF, JPEG (best for WhatsApp), PNG, or the All-in-One Combo Pack.
                      </p>
                      <p>
                        <strong>Premium Templates:</strong> Unlock access in all formats at the highest quality. Features automatic discount vouchers (like WELCOME20) and a special bundled Combo Pack price (₹79 instead of ₹149). Payments are fully secured via Razorpay.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Exclusive Feature: Company Logo Auto Search & Display */}
            <CompanyLogoFeature variant="banner" />

            {/* Pro Tip Box */}
            <div className="bg-[#FBF5E6]/40 dark:bg-stone-900/30 border border-[#C9A84C]/20 rounded-2xl p-5 max-w-3xl mx-auto shadow-xs text-center flex items-center justify-center gap-3">
              <span className="text-2xl shrink-0">💡</span>
              <p className="text-xs md:text-sm font-bold text-stone-750 dark:text-stone-300 leading-relaxed text-left">
                <strong className="text-[#9B1B30] dark:text-[#E6C97A]">Pro Tip:</strong> Use the <strong>Undo / Redo</strong> buttons at the top of the editor to reverse any change. Made a mess? Hit <strong>Reset</strong> to restore the template to its original state, your form details stay safe!
              </p>
            </div>

            {/* FAQ Accordion Section */}
            <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-850 rounded-[32px] p-6 md:p-8 max-w-4xl mx-auto shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6 text-left mt-10">
              <div className="text-center space-y-1">
                <h2 className="text-xl md:text-2xl font-black text-foreground tracking-tight">
                  Frequently Asked Questions
                </h2>
                <p className="text-xs text-muted-foreground font-medium">
                  Got questions about biodata templates or editing? Find quick answers below.
                </p>
              </div>

              <Accordion type="multiple" defaultValue={["faq-1"]} className="w-full">
                {templatesPageFaqSchema.mainEntity.map((faq, index) => (
                  <AccordionItem key={index} value={`faq-${index + 1}`} className="border-stone-100 dark:border-stone-800">
                    <AccordionTrigger className="text-xs sm:text-sm font-bold text-foreground hover:no-underline hover:text-[#C9A84C] py-3 text-left">
                      {faq.name}
                    </AccordionTrigger>
                    <AccordionContent className="text-xs text-muted-foreground leading-relaxed pt-0 pb-3.5">
                      {faq.acceptedAnswer.text}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>

        {/* Footer Info Block */}
        <div className="bg-card border border-[#C9A84C]/20 rounded-2xl p-6 max-w-4xl mx-auto shadow-md text-center space-y-3">
          <h3 className="text-lg font-bold text-foreground">Can't decide which template is right?</h3>
          <p className="text-muted-foreground text-xs max-w-2xl mx-auto">
            Don't worry! You can change your template and layout style with a single click inside the editor **without losing any filled details**. Start with any design and customize it later.
          </p>
          <div className="pt-1 flex flex-col items-center gap-3">
            <Button size="default" className="rounded-full bg-gradient-primary border-0 font-bold px-8 shadow-md" asChild>
              <Link href="/edit">Open Creator Studio</Link>
            </Button>
            <Link href="/how-it-works" className="text-[#9B1B30] dark:text-[#E6C97A] hover:underline font-medium text-xs transition-colors">
              Want to see how it works? Read our simple guide &rarr;
            </Link>
          </div>
        </div>
      </div>
      <JsonLd schema={templatesPageSchema} />
      <JsonLd schema={templatesPageFaqSchema} />
    </div>
  );
}
