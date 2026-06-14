import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowDown, CheckCircle2, Briefcase, Moon, Compass, BookOpen, Users, Globe } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BiodataBuilderSection } from "./BiodataBuilderSection";
import { generateFaqSchema } from "@/lib/seo-schemas";
import { JsonLd } from "@/components/seo/JsonLd";

const muslimHowToSchema = {
  "@context": "https://schema.org" as const,
  "@type": "HowTo" as const,
  "name": "How to Make a Muslim Marriage Biodata",
  "description": "Learn how to create a beautiful Muslim matrimonial biodata with Islamic header symbols in 7 simple steps.",
  "step": [
    {
      "@type": "HowToStep" as const,
      "position": 1,
      "name": "Choose a Muslim Biodata Format",
      "text": "Select an Islamic biodata template. It should match your style. Also, consider your preferences when choosing one."
    },
    {
      "@type": "HowToStep" as const,
      "position": 2,
      "name": "Upload Your Photo & Select Islamic Header Elements",
      "text": "Add a passport-size photo and personalise your biodata with beautiful Islamic header designs such as 786, Bismillah, crescent moon, stars, and other decorative Islamic symbols."
    },
    {
      "@type": "HowToStep" as const,
      "position": 3,
      "name": "Add Personal Information",
      "text": "Enter your name, age, date of birth, height, and contact details."
    },
    {
      "@type": "HowToStep" as const,
      "position": 4,
      "name": "Enter Family Details",
      "text": "Provide information about your parents, siblings, family background, and values."
    },
    {
      "@type": "HowToStep" as const,
      "position": 5,
      "name": "Add Education & Career Information",
      "text": "Enter your educational qualifications, profession, workplace, and career achievements."
    },
    {
      "@type": "HowToStep" as const,
      "position": 6,
      "name": "Customise colours & Design with Editor Studio",
      "text": "Modify background colours, text colours, fonts, stickers, and layout elements to create a biodata that reflects your personality."
    },
    {
      "@type": "HowToStep" as const,
      "position": 7,
      "name": "Preview & Download PDF",
      "text": "Review your biodata, make final adjustments, and download a high-quality PDF ready to share with family and matrimonial prospects."
    }
  ]
};

const muslimFaqs = [
  {
    q: "How do I make a Muslim biodata for marriage?",
    a: "Choose a template, upload your photo, add your details, customise the design, and download your biodata PDF."
  },
  {
    q: "What should be included in a Muslim marriage biodata?",
    a: "Personal details, family information, education, profession, photograph, and partner preferences."
  },
  {
    q: "How can I create a Muslim girl's biodata online?",
    a: "Select a template, add personal and family details, upload a photo, and download the PDF."
  },
  {
    q: "How can I create a Muslim boy's biodata online?",
    a: "Choose a biodata format, enter your information, customise the design, and download instantly."
  },
  {
    q: "Can I create a Muslim biodata for free?",
    a: "Yes, you can create and customise your Muslim biodata online for free. Also, there are some premium templates"
  },
  {
    q: "Can I add 786, Bismillah, or Islamic symbols to my biodata?",
    a: "Yes, you can add 786, Bismillah, crescent moon symbols, stars, and other Islamic header designs to your biodata. We have specially designed these elements to help you create a more beautiful, personalised, and impressive Muslim marriage biodata."
  },
  {
    q: "Can I customise colours, backgrounds, and stickers?",
    a: "Yes, you can personalise templates with different colours, backgrounds, text styles, and stickers."
  },
  {
    q: "Is this suitable for Sunni, Shia, and Bohra communities?",
    a: "Yes, our Muslim biodata templates are suitable for Sunni, Shia, Bohra, and other Muslim communities."
  },
  {
    q: "Can I download my Muslim biodata as a PDF?",
    a: "Yes, you can download your completed biodata as a high-quality PDF, JPEG, and PNG"
  },
  {
    q: "Do I need design skills to create a Muslim biodata?",
    a: "No, simply choose a template, fill in your details, and customise it with a few clicks."
  }
];


export const metadata: Metadata = {
  title: {
    absolute: "Muslim Biodata Format for Marriage | Free PDF Maker",
  },
  description: "Create your Muslim marriage biodata in minutes. Suitable for Sunni, Shia, Bohra, and other Muslim communities. Download a free PDF.",
  alternates: {
    canonical: "https://biodata99.com/muslim-biodata-format",
  },
  openGraph: {
    title: "Muslim Biodata Format for Marriage | Free PDF Maker",
    description: "Create your Muslim marriage biodata in minutes. Suitable for Sunni, Shia, Bohra, and other Muslim communities. Download a free PDF.",
    url: "https://biodata99.com/muslim-biodata-format",
  },
};

export default function MuslimBiodataFormatPage() {
  return (
    <div 
      className="min-h-screen text-[#1F2937] pb-16 relative overflow-x-clip font-sans"
      style={{
        '--theme-primary': '#0F4C3A',
        '--theme-secondary': '#D4AF37',
        '--theme-bg': '#FAF8F3',
        '--theme-text': '#1F2937',
        '--theme-accent': '#F5E6B8',
      } as React.CSSProperties}
    >
      {/* Override global body background and brand buttons with Muslim theme colors */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root, body, html body {
          background: #FAF8F3 !important;
          --ring: #0F4C3A !important;
          --color-ring: #0F4C3A !important;
          --primary: #0F4C3A !important;
          --color-primary: #0F4C3A !important;
          --popover-foreground: #1F2937 !important;
          --muted-foreground: #57534E !important;
          --card-foreground: #1F2937 !important;
          --border: #E7E5E4 !important;
          --accent: rgba(245, 230, 184, 0.2) !important;
          --accent-foreground: #0F4C3A !important;
          --muted: #FAF6ED !important;
        }
        html body .bg-gradient-primary {
          background: linear-gradient(to right, #0F4C3A, #166D53, #0F4C3A) !important;
          color: #ffffff !important;
          box-shadow: 0 10px 15px -3px rgba(15, 76, 58, 0.3) !important;
        }
        html body .bg-gradient-primary:hover {
          opacity: 0.95 !important;
        }
        html body .text-primary {
          color: #0F4C3A !important;
        }
        html body .border-primary {
          border-color: #0F4C3A !important;
        }
        html body .bg-primary {
          background-color: #0F4C3A !important;
        }
        html body .hover\:bg-primary\/90:hover {
          background-color: #0D4333 !important;
        }
        html body .bg-primary\/10 {
          background-color: rgba(15, 76, 58, 0.1) !important;
        }
        html body .bg-primary\/20 {
          background-color: rgba(15, 76, 58, 0.2) !important;
        }
        /* Reset button (crimson text and rose border) overrides */
        html body .border-rose-200 {
          border-color: rgba(212, 175, 55, 0.3) !important;
        }
        html body .hover\:bg-rose-50\/50:hover {
          background-color: rgba(212, 175, 55, 0.05) !important;
        }
        html body .text-rose-600 {
          color: #0F4C3A !important;
        }
        html body .hover\:text-rose-700:hover {
          color: #0A3327 !important;
        }
        
        /* Select Dropdown highlighted/focused options */
        [data-radix-select-viewport] [role="option"][data-highlighted],
        [data-radix-select-viewport] [role="option"]:focus,
        [role="option"][data-highlighted],
        [role="option"]:focus {
          background-color: rgba(15, 76, 58, 0.1) !important;
          color: #0F4C3A !important;
        }
        
        /* Focus outline and ring for select/date inputs */
        html body .focus\:ring-primary:focus {
          --tw-ring-color: #0F4C3A !important;
          ring-color: #0F4C3A !important;
        }
        html body .focus-visible\:ring-primary:focus-visible {
          --tw-ring-color: #0F4C3A !important;
          ring-color: #0F4C3A !important;
        }
        
        /* Overrides for SelectTrigger focus outlines and active border */
        button[role="combobox"]:focus,
        button[role="combobox"][data-state="open"],
        html body .focus\:ring-ring:focus {
          border-color: #0F4C3A !important;
          --tw-ring-color: rgba(15, 76, 58, 0.2) !important;
          box-shadow: 0 0 0 2px rgba(15, 76, 58, 0.2) !important;
          outline: none !important;
        }
      ` }} />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FAF8F3] to-[#FAF6ED] pt-4 pb-8 md:pt-6 md:pb-12 px-4 border-b border-[#D4AF37]/15">
        
        {/* Grid Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(212,175,55,0.08)_1px,transparent_1px)] [background-size:36px_36px] pointer-events-none" />

        <div className="container mx-auto max-w-6xl flex flex-col lg:flex-row items-center gap-12 lg:gap-16 relative z-10 w-full min-w-0">
          
          {/* Left Text Column */}
          <div className="w-full lg:flex-1 text-center lg:text-left space-y-4 md:space-y-6 min-w-0">
            
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/45 bg-[#0F4C3A]/5 px-4.5 py-1.5 text-xs font-bold text-[#0F4C3A] backdrop-blur-sm shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
              100% Free Islamic Biodata Maker
            </div>

            {/* Headline */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-[#0F4C3A] leading-[1.12] font-sans">
              Muslim marriage <span className="text-[#D4AF37]">biodata format</span>
            </h1>

            {/* Description Paragraph */}
            <p className="text-stone-600 text-xs md:text-sm lg:text-base max-w-2xl mx-auto lg:mx-0 leading-relaxed font-semibold">
              Creating a professional Muslim biodata in just a few minutes is totally doable! This format is perfect for individuals from Sunni, Shia, Bohra, and all other Muslim communities.
            </p>

            {/* Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
              <Button size="lg" className="rounded-full text-sm px-8 py-6 w-full sm:w-auto bg-[#0F4C3A] hover:bg-[#0A3327] text-white border-0 font-bold tracking-wide shadow-xl shadow-[#0F4C3A]/15 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer" asChild>
                <a href="#builder">
                  Create Muslim Biodata
                  <ArrowDown className="w-4 h-4 ml-2" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full text-sm px-8 py-6 w-full sm:w-auto border-[#D4AF37]/50 hover:bg-[#D4AF37]/10 text-[#0F4C3A] font-bold hover:border-[#D4AF37] transition-all duration-200 cursor-pointer" asChild>
                <Link href="/biodata-templates">View Templates</Link>
              </Button>
            </div>

            {/* Features Row */}
            <div className="hidden md:block pt-4">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 text-xs font-bold text-stone-650">
                {[
                  "Sunni & Shia designs",
                  "Islamic symbols",
                  "Download free PDF",
                  "With photo option"
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-1.5 bg-white/60 border border-[#D4AF37]/20 rounded-full px-4 py-1.5 shadow-3xs">
                    <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Pure CSS Overlapping Templates Showcase */}
          <div className="flex-1 w-full max-w-lg mx-auto lg:mx-0 relative flex items-center justify-center py-6">
            
            {/* Soft radial glow backgrounds */}
            <div className="absolute w-72 h-72 rounded-full bg-[#D4AF37]/10 blur-3xl pointer-events-none" />
            <div className="absolute w-72 h-72 rounded-full bg-[#0F4C3A]/8 blur-3xl pointer-events-none -translate-x-12 translate-y-12" />

            {/* CSS Stack Container */}
            <div className="flex items-center justify-center gap-2 md:gap-3.5 w-full select-none">
              
              {/* Left Card */}
              <div className="w-[30%] aspect-[595/842] rounded-xl overflow-hidden border border-[#D4AF37]/25 shadow-md bg-white rotate-[-6deg] translate-y-4 hover:rotate-0 hover:scale-110 hover:-translate-y-4 hover:z-20 transition-all duration-300 ease-out cursor-pointer z-10">
                <img 
                  src="https://biodata99.com/uploads/biodata/thumbnails/b28b8e39-994c-4f96-9977-7d23fc1adc44.webp" 
                  alt="Premium marriage biodata format left preview"
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>

              {/* Center Card */}
              <div className="w-[34%] aspect-[595/842] rounded-xl overflow-hidden border-2 border-[#D4AF37] shadow-[0_15px_40px_rgba(15,76,58,0.15)] bg-white z-10 hover:scale-110 hover:-translate-y-4 hover:z-20 transition-all duration-300 ease-out cursor-pointer">
                <img 
                  src="https://biodata99.com/uploads/biodata/thumbnails/1c0be22d-0657-4329-bcb1-2adf2096d659.webp" 
                  alt="Featured Premium Islamic Gold Marriage Biodata Template"
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>

              {/* Right Card */}
              <div className="w-[30%] aspect-[595/842] rounded-xl overflow-hidden border border-[#D4AF37]/25 shadow-md bg-white rotate-[6deg] translate-y-4 hover:rotate-0 hover:scale-110 hover:-translate-y-4 hover:z-20 transition-all duration-300 ease-out cursor-pointer z-10">
                <img 
                  src="https://biodata99.com/uploads/biodata/thumbnails/5e8750b0-d87d-40b3-ac88-70919b2e3c81.webp" 
                  alt="Premium marriage biodata format right preview"
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>

            </div>
          </div>

        </div>

        {/* Elegant Curved Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0 h-12 overflow-hidden pointer-events-none">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-[120%] h-full text-[#FAF8F3] fill-current">
            <path d="M0,30 C150,90 350,120 600,90 C850,60 1050,100 1200,40 L1200,120 L0,120 Z" fill="#D4AF37" opacity="0.08" />
            <path d="M0,50 C150,100 350,130 600,100 C850,70 1050,110 1200,60 L1200,120 L0,120 Z" fill="#FAF8F3" />
          </svg>
        </div>
      </section>

      {/* Dynamic Biodata Builder Form Section */}
      <section id="builder" className="scroll-mt-20">
        <BiodataBuilderSection
          defaultCommunity="Muslim"
          defaultReligion="Muslim"
          defaultTitle="Bismillah"
          defaultTemplateId="6a477bb0-f965-450e-b415-727599cabd7a"
          hideCommunityAndReligion={true}
        />
      </section>

      {/* Dedicated Space for Body Content below Hero */}
      <div className="container mx-auto max-w-6xl relative z-10 py-6 px-4">
        {/* Muslim Communities Section */}
        <div className="text-center space-y-8">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#0F4C3A] font-sans">
            Created for Every Muslim Community
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 max-w-4xl mx-auto">
            {[
              { name: "Sunni", icon: Moon, bg: "bg-[#FFFBEB]", border: "border-[#F59E0B]/20 hover:border-[#F59E0B]/50", text: "text-[#B45309]", iconColor: "text-[#D97706]" },
              { name: "Shia", icon: Compass, bg: "bg-[#F0FDF4]", border: "border-[#15803D]/20 hover:border-[#15803D]/50", text: "text-[#15803D]", iconColor: "text-[#16A34A]" },
              { name: "Bohra", icon: BookOpen, bg: "bg-[#EEF2FF]", border: "border-[#4338CA]/20 hover:border-[#4338CA]/50", text: "text-[#4338CA]", iconColor: "text-[#4F46E5]" },
              { name: "Ahmadiyya", icon: Globe, bg: "bg-[#F0F9FF]", border: "border-[#0369A1]/20 hover:border-[#0369A1]/50", text: "text-[#0369A1]", iconColor: "text-[#0284C7]" },
              { name: "Other Muslim Communities", icon: Users, bg: "bg-[#FFF1F2]", border: "border-[#BE123C]/20 hover:border-[#BE123C]/50", text: "text-[#BE123C]", iconColor: "text-[#E11D48]" }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <span 
                  key={item.name}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full border ${item.border} ${item.bg} ${item.text} font-bold text-xs md:text-sm transition-all shadow-xs group cursor-default hover:scale-105 active:scale-95`}
                >
                  <Icon className={`w-4 h-4 ${item.iconColor} transition-transform group-hover:rotate-12 duration-200`} />
                  <span>{item.name}</span>
                </span>
              );
            })}
          </div>
        </div>

        {/* Features Content Section */}
        <div className="mt-10 border-t border-[#D4AF37]/15 pt-8 space-y-6">
          <div className="text-center space-y-4">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#0F4C3A] font-sans">
              Features
            </h2>
            <div className="w-12 h-1 bg-[#D4AF37] mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto text-left">
            {/* Feature 1 */}
            <div className="bg-white border border-[#D4AF37]/25 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all space-y-4">
              <h3 className="text-lg font-bold text-[#0F4C3A]">1. Islamic Biodata Header Designs</h3>
              <p className="text-xs text-stone-600 font-semibold leading-relaxed">
                Add Islamic design elements such as 786 Bismillah, a crescent moon, stars, and decorative patterns.
              </p>
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">You can include things, like</p>
                <ul className="list-disc pl-4 text-xs text-stone-600 font-medium space-y-1">
                  <li>A 786 symbol</li>
                  <li>A Bismillah phrase</li>
                  <li>A crescent moon icon</li>
                  <li>Stars and</li>
                  <li>Decorative motifs</li>
                </ul>
                <p className="text-xs text-stone-600 font-semibold mt-1">to give it a touch.</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white border border-[#D4AF37]/25 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all space-y-4">
              <h3 className="text-lg font-bold text-[#0F4C3A]">2. Custom Muslim Biodata Templates</h3>
              <p className="text-xs text-stone-600 font-semibold leading-relaxed">
                Edit the layouts, change the colours, pick backgrounds and choose text styles to make your marriage biodata.
              </p>
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">You can change how it looks by</p>
                <ul className="list-disc pl-4 text-xs text-stone-600 font-medium space-y-1">
                  <li>picking a layout</li>
                  <li>selecting colours</li>
                  <li>choosing backgrounds</li>
                  <li>and text styles</li>
                </ul>
                <p className="text-xs text-stone-600 font-semibold mt-1">This way, you can create a marriage biodata that&apos;s just right for you.</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white border border-[#D4AF37]/25 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all space-y-4">
              <h3 className="text-lg font-bold text-[#0F4C3A]">3. Muslim Biodata with Photo</h3>
              <p className="text-xs text-stone-600 font-semibold leading-relaxed">
                Upload your passport photo to your biodata template.
              </p>
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <p className="text-xs text-stone-600 font-semibold">
                  Make sure it is the size for a passport picture.
                </p>
                <p className="text-xs text-stone-600 font-semibold">
                  Place it in the spot in your template.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-white border border-[#D4AF37]/25 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all space-y-4 md:col-span-2 lg:col-span-1 lg:max-w-none">
              <h3 className="text-lg font-bold text-[#0F4C3A]">4. Free Muslim Biodata PDF Download</h3>
              <p className="text-xs text-stone-600 font-semibold leading-relaxed">
                You can make your marriage biodata change it the way you like and then save it as a PDF file. This marriage biodata will be in a format that you can easily download. You can customise your marriage biodata and download it in PDF format.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white border border-[#D4AF37]/25 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all space-y-4 md:col-span-2 lg:col-span-2 lg:max-w-none">
              <h3 className="text-lg font-bold text-[#0F4C3A]">5. Sunni, Shia & Bohra Friendly Designs</h3>
              <p className="text-xs text-stone-600 font-semibold leading-relaxed">
                There are templates and customisation options that are really good for many different Muslim communities. These Muslim communities are very diverse. It is nice that there are templates and customisation options that are suitable for them.
              </p>
            </div>
          </div>
        </div>

        {/* How to Make a Muslim Biodata Section */}
        <div className="mt-10 border-t border-[#D4AF37]/15 pt-8 space-y-6">
          <div className="text-center space-y-3">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#0F4C3A] font-sans">
              How to Make a Muslim Biodata for Marriage
            </h2>
            <div className="w-12 h-1 bg-[#D4AF37] mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-6xl mx-auto">
            {[
              {
                step: "Step 1",
                title: "Choose a Muslim Biodata Format",
                desc: "Select an Islamic biodata template. It should match your style. Also, consider your preferences when choosing one.",
              },
              {
                step: "Step 2",
                title: "Upload Your Photo & Select Islamic Header Elements",
                desc: "Add a passport-size photo and personalise your biodata with beautiful Islamic header designs such as 786, Bismillah, crescent moon, stars, and other decorative Islamic symbols.",
              },
              {
                step: "Step 3",
                title: "Add Personal Information",
                desc: "Enter your name, age, date of birth, height, and contact details.",
              },
              {
                step: "Step 4",
                title: "Enter Family Details",
                desc: "Provide information about your parents, siblings, family background, and values.",
              },
              {
                step: "Step 5",
                title: "Add Education & Career Information",
                desc: "Enter your educational qualifications, profession, workplace, and career achievements.",
              },
              {
                step: "Step 6",
                title: "Customise colours & Design with Editor Studio",
                desc: "Modify background colours, text colours, fonts, stickers, and layout elements to create a biodata that reflects your personality.",
              },
              {
                step: "Step 7",
                title: "Preview & Download PDF",
                desc: "Review your biodata, make final adjustments, and download a high-quality PDF ready to share with family and matrimonial prospects.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex gap-4 bg-white border border-[#D4AF37]/20 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all"
              >
                <div className="shrink-0 w-9 h-9 rounded-full bg-[#0F4C3A] text-white flex items-center justify-center font-black text-sm">
                  {i + 1}
                </div>
                <div className="space-y-1 min-w-0">
                  <p className="text-[10px] font-black text-[#92400E] uppercase tracking-widest">{item.step}</p>
                  <h3 className="text-sm font-bold text-stone-900 leading-snug">{item.title}</h3>
                  <p className="text-xs text-stone-600 font-semibold leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why Choose Biodata99 Section */}
        <div className="mt-10 border-t border-[#D4AF37]/15 pt-8 space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#0F4C3A] font-sans">
              Why Choose Biodata99 for Your Muslim Biodata?
            </h2>
            <div className="w-12 h-1 bg-[#D4AF37] mx-auto rounded-full" />
          </div>

          {/* Intro paragraphs */}
          <div className="max-w-3xl mx-auto space-y-4 text-center">
            <p className="text-sm text-stone-600 font-semibold leading-relaxed">
              Making a Muslim biodata for marriage should be easy. A lot of people waste a lot of time looking for the right Muslim biodata format or template. This is why we made Biodata99.
            </p>
            <p className="text-sm text-stone-600 font-semibold leading-relaxed">
              We did not just make any templates. We made a collection of Muslim biodata templates just for Muslim marriage profiles. If you are making a biodata for a boy or a Muslim girl, you will find templates that are made by professionals. You can change these templates to suit what you like about Muslim biodata.
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
            {[
              {
                title: "Designed for Muslim Marriage Biodata",
                body: "Our Muslim biodata maker is built to help you create a professional marriage biodata quickly. All templates are suitable for Sunni, Shia, Bohra, and other Muslim communities.",
              },
              {
                title: "Personalise Every Template",
                body: "Every Muslim biodata template is fully customizable. You can change colours, backgrounds, text styles, and add beautiful Islamic header elements such as 786, Bismillah, crescent moon symbols, stars, and decorative stickers to make your biodata more personal and visually appealing.",
              },
              {
                title: "Live Biodata Preview",
                body: "As you enter your information, you can instantly see your Muslim biodata update on the screen. The live preview helps you review your profile, photo, and design before downloading the final PDF.",
              },
              {
                title: "Smart Company Search",
                body: "Adding professional details is easier with our smart company search feature. Simply search for your company while filling in your biodata, and the company name and logo will automatically appear in the preview and final PDF, giving your profile a more professional look.",
              },
              {
                title: "Easy to Use for Everyone",
                body: "You don't need any design experience. Simply choose a Muslim biodata format, upload your photo, enter your details, customise the design, and download your biodata PDF in minutes.",
              },
              {
                title: "Reusable for Boys and Girls",
                body: "All Muslim biodata templates can be customised and reused for both boys and girls, helping families create multiple biodata profiles without starting from scratch.",
              },
              {
                title: "Professional PDF Download",
                body: "Once you're satisfied with your design, download a high-quality Muslim marriage biodata PDF that's ready to share with family members and matrimonial prospects.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white border border-[#D4AF37]/20 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all space-y-2"
              >
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-5 rounded-full bg-[#0F4C3A] shrink-0" />
                  <h3 className="text-sm font-bold text-stone-900 leading-snug">{item.title}</h3>
                </div>
                <p className="text-xs text-stone-600 font-semibold leading-relaxed pl-3.5">{item.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-10 border-t border-[#D4AF37]/15 pt-8 space-y-6">
          <div className="text-center space-y-3">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#0F4C3A] font-sans">
              Frequently Asked Questions
            </h2>
            <div className="w-12 h-1 bg-[#D4AF37] mx-auto rounded-full" />
          </div>

          <div className="bg-white border border-[#D4AF37]/25 rounded-2xl p-6 md:p-8 shadow-sm">
            <Accordion type="multiple" defaultValue={["muslim-faq-0"]} className="w-full space-y-2">
              {muslimFaqs.map((faq, idx) => (
                <AccordionItem key={idx} value={`muslim-faq-${idx}`} className="border-b border-[#D4AF37]/20 py-1">
                  <AccordionTrigger className="text-sm md:text-base font-bold text-left text-stone-900 hover:text-[#0F4C3A] hover:no-underline py-4">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-xs md:text-sm text-stone-600 font-semibold leading-relaxed pt-1 pb-4">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>

      {/* Structured Data (HowTo & FAQ Schema) for Search Crawlers */}
      <JsonLd schema={muslimHowToSchema} />
      <JsonLd schema={generateFaqSchema(muslimFaqs)} />
    </div>
  );
}
