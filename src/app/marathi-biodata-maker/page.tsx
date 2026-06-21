import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowDown,
  CheckCircle2,
  Briefcase,
  Moon,
  Compass,
  BookOpen,
  Users,
  Globe,
  FileDown,
  Download,
  Languages,
  Wand2
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { BiodataBuilderSection } from "./BiodataBuilderSection";
import { generateFaqSchema } from "@/lib/seo-schemas";
import { JsonLd } from "@/components/seo/JsonLd";
import { TemplateCarousel } from "@/components/home/TemplateCarousel";
import MarathiInfoSection from "@/components/biodata/MarathiInfoSection";

const MARATHI_SAMPLES = [
  {
    id: "m1",
    src: "https://res.cloudinary.com/dhlyinfwd/image/upload/w_400,c_scale,q_auto,f_auto/v1780333327/biodata/hero_slides/umpd0mqssairpwfzpytk.png",
    title: "Royal Gold Premium",
    community: "Marathi / Hindu",
    description: "सोनेरी किनार असलेला आणि गणपती बाप्पाच्या लोगोचा आकर्षक लग्नाचा बायोडाटा."
  },
  {
    id: "m2",
    src: "https://res.cloudinary.com/dhlyinfwd/image/upload/w_400,c_scale,q_auto,f_auto/v1780333386/biodata/hero_slides/rslwwcxq7e8hdcsz0vbk.png",
    title: "Neelambari Dream",
    community: "Marathi / Hindu",
    description: "राॅयल निळा आणि सोनेरी रंगाची अप्रतिम जुळवाजुळव असलेला सुंदर बायोडाटा."
  },
  {
    id: "m3",
    src: "https://res.cloudinary.com/dhlyinfwd/image/upload/w_400,c_scale,q_auto,f_auto/v1780333404/biodata/hero_slides/vwqpwpwy72u2xnnwlc0x.png",
    title: "Peacock Royal",
    community: "Marathi / Hindu",
    description: "मोरपंखी हिरवा आणि पारंपरिक डिझाईनचा सुंदर लग्नाचा बायोडाटा."
  }
];

const marathiHowToSchema = {
  "@context": "https://schema.org" as const,
  "@type": "HowTo" as const,
  "name": "मराठीत लग्नाचा बायोडाटा कसा बनवायचा | How to Make a Marathi Marriage Biodata",
  "description": "फक्त ५ सोप्या स्टेप्समध्ये मराठीत लग्नाचा आकर्षक बायोडाटा ऑनलाईन बनवा.",
  "step": [
    {
      "@type": "HowToStep" as const,
      "position": 1,
      "name": "मराठी बायोडाटा फॉरमॅट निवडा",
      "text": "तुमच्या पसंतीनुसार आमच्या डिझाईन्सपैकी एक उत्कृष्ट मराठी लग्नाचा बायोडाटा नमुना निवडा."
    },
    {
      "@type": "HowToStep" as const,
      "position": 2,
      "name": "फोटो अपलोड करा आणि शुभ चिन्ह निवडा",
      "text": "तुमचा चांगला फोटो अपलोड करा आणि '॥ श्री गणेशाय नमः ॥' किंवा इतर धार्मिक मंत्र व शुभ चिन्ह निवडा."
    },
    {
      "@type": "HowToStep" as const,
      "position": 3,
      "name": "वैयक्तिक आणि कौटुंबिक माहिती भरा",
      "text": "नाव, उंची, जन्म तारीख, शिक्षण, नोकरी/व्यवसाय आणि कुटुंबाची माहिती मराठीत किंवा इंग्रजीत भरा."
    },
    {
      "@type": "HowToStep" as const,
      "position": 4,
      "name": "रंग आणि फॉन्ट कस्टमाईज करा",
      "text": "आमच्या सोप्या एडिटरचा वापर करून बायोडाटाचा रंग, बॅकग्राउंड डिझाईन्स आणि अक्षरांचे प्रकार बदला."
    },
    {
      "@type": "HowToStep" as const,
      "position": 5,
      "name": "प्रीव्ह्यू पहा आणि PDF डाऊनलोड करा",
      "text": "तुमचा बायोडाटा कसा दिसतो ते तपासा आणि एका क्लिकवर प्रिंट-रेडी PDF किंवा फोटो फॉरमॅटमध्ये डाऊनलोड करा."
    }
  ]
};

const marathiFaqs = [
  {
    q: "लग्नाचा बायोडाटा मराठीत कसा बनवायचा?",
    a: "तुम्ही आमच्या वेबसाईटवर जाऊन तुमची पसंतीचा नमुना निवडून संपूर्ण माहिती मराठी कीबोर्डच्या साहाय्याने टाईप करून अवघ्या २ मिनिटांत मराठी बायोडाटा बनवू शकता."
  },
  {
    q: "लग्नाच्या बायोडाटा मध्ये कोणती माहिती असावी?",
    a: "बायोडाटा मध्ये वैयक्तिक माहिती (नाव, जन्मतारीख, उंची, शिक्षण, नोकरी), कौटुंबिक माहिती (वडिलांचे नाव व व्यवसाय, मामांचे नाव, मूळ गाव) आणि संपर्क माहिती असणे आवश्यक आहे."
  },
  {
    q: "लग्नाचा बायोडाटा किती पानांचा असावा?",
    a: "सामान्यतः 1 ते 2 पानांचा बायोडाटा पुरेसा असतो. आवश्यक माहिती स्पष्ट आणि संक्षिप्त असावी."
  },
  {
    q: "वधू आणि वर दोघांसाठी टेम्पलेट्स उपलब्ध आहेत का?",
    a: "होय, आमच्याकडे वधू आणि वर दोघांसाठी वेगवेगळ्या शैलीतील टेम्पलेट्स उपलब्ध आहेत."
  },
  {
    q: "फोटो असलेला मराठी बायोडाटा बनवता येतो का?",
    a: "होय, आमच्या एडिटरमध्ये तुम्ही तुमचा आवडीचा पासपोर्ट आकाराचा फोटो सहज अपलोड करून आकर्षक डिझाईनमध्ये फोटोसह बायोडाटा तयार करू शकता."
  },
  {
    q: "बायोडाटामध्ये फोटो जोडणे आवश्यक आहे का?",
    a: "फोटो जोडणे बंधनकारक नाही, परंतु चांगला आणि स्पष्ट फोटो जोडल्यास प्रोफाइल अधिक आकर्षक दिसते."
  },
  {
    q: "हा बायोडाटा मेकर मोफत आहे का?",
    a: "होय, आमचा ऑनलाईन बायोडाटा मेकर वापरणे अगदी सोपे आहे. अनेक सुंदर टेम्पलेट्स तुम्ही मोफत वापरू शकता आणि तयार झालेला बायोडाटा PDF स्वरूपात डाउनलोड करू शकता. याशिवाय, अधिक आकर्षक आणि विशेष डिझाइनसाठी काही प्रीमियम टेम्पलेट्स देखील उपलब्ध आहेत।"
  },
  {
    q: "मराठीत शुभ मंत्र आणि गणेश चिन्ह बदलता येते का?",
    a: "होय! तुम्ही '॥ श्री गणेशाय नमः ॥', '॥ श्री कुलदेवता प्रसन्न ॥' यांसारखे मंत्र निवडून वरच्या बाजूला हवे असलेले देवतेचे चिन्ह जोडू शकता."
  },
  {
    q: "मराठी बायोडाटा मोबाईलवर तयार करता येतो का?",
    a: "होय, तुम्ही मोबाईल, टॅबलेट किंवा संगणकावरून सहजपणे बायोडाटा तयार करू शकता."
  },
  {
    q: "मराठी बायोडाटामध्ये कुंडलीची माहिती जोडता येते का?",
    a: "होय, इच्छेनुसार राशी, नक्षत्र, गोत्र आणि इतर कुंडलीची माहिती देखील जोडता येते."
  },
  {
    q: "Biodata99 इतर बायोडाटा मेकरपेक्षा वेगळे कसे आहे?",
    a: "Biodata99 मध्ये मराठीसह अनेक भाषांतील टेम्पलेट्स, सोपे संपादन, रिअल-टाइम प्रीव्ह्यू आणि जलद PDF डाउनलोडची सुविधा उपलब्ध आहे."
  }
];

export const metadata: Metadata = {
  title: {
    absolute: "Marathi Biodata Maker – Create विवाह बायोडाटा मराठी Online",
  },
  description: "Create a professional विवाह बायोडाटा मराठी with Biodata99. Use our Marathi Biodata Maker, customize your profile, and download instantly.",
  alternates: {
    canonical: "https://biodata99.com/marathi-biodata-maker",
  },
  openGraph: {
    title: "Marathi Biodata Maker – Create विवाह बायोडाटा मराठी Online",
    description: "Create a professional विवाह बायोडाटा मराठी with Biodata99. Use our Marathi Biodata Maker, customize your profile, and download instantly.",
    url: "https://biodata99.com/marathi-biodata-maker",
  },
};

export default function MarathiBiodataMakerPage() {
  return (
    <div
      className="min-h-screen text-[#1F2937] pb-16 relative font-sans"
      style={{
        '--theme-primary': '#C2410C',
        '--theme-secondary': '#EAB308',
        '--theme-bg': '#FFFDF9',
        '--theme-text': '#1F2937',
        '--theme-accent': '#FEF3C7',
      } as React.CSSProperties}
    >
      {/* Override global body background and brand buttons with Marathi theme colors */}
      <style dangerouslySetInnerHTML={{
        __html: `
        :root, body, html body {
          background: #FFFDF9 !important;
          --ring: #C2410C !important;
          --color-ring: #C2410C !important;
          --primary: #C2410C !important;
          --color-primary: #C2410C !important;
          --popover-foreground: #1F2937 !important;
          --muted-foreground: #4B5563 !important;
          --card-foreground: #1F2937 !important;
          --border: #E5E7EB !important;
          --accent: rgba(254, 243, 199, 0.3) !important;
          --accent-foreground: #C2410C !important;
          --muted: #FFFBEB !important;
        }
        html body .bg-gradient-primary {
          background: linear-gradient(to right, #C2410C, #EA580C, #C2410C) !important;
          color: #ffffff !important;
          box-shadow: 0 10px 15px -3px rgba(194, 65, 12, 0.3) !important;
        }
        html body .bg-gradient-primary:hover {
          opacity: 0.95 !important;
        }
        html body .text-primary {
          color: #C2410C !important;
        }
        html body .border-primary {
          border-color: #C2410C !important;
        }
        html body .bg-primary {
          background-color: #C2410C !important;
        }
        html body .hover\:bg-primary\/90:hover {
          background-color: #A2350A !important;
        }
        html body .bg-primary\/10 {
          background-color: rgba(194, 65, 12, 0.1) !important;
        }
        html body .bg-primary\/20 {
          background-color: rgba(194, 65, 12, 0.2) !important;
        }
        
        /* Reset button overrides */
        html body .border-rose-200 {
          border-color: rgba(234, 179, 8, 0.3) !important;
        }
        html body .hover\:bg-rose-50\/50:hover {
          background-color: rgba(234, 179, 8, 0.05) !important;
        }
        html body .text-rose-600 {
          color: #C2410C !important;
        }
        html body .hover\:text-rose-700:hover {
          color: #9A3412 !important;
        }
        
        /* Select Dropdown highlighted/focused options */
        [data-radix-select-viewport] [role="option"][data-highlighted],
        [data-radix-select-viewport] [role="option"]:focus,
        [role="option"][data-highlighted],
        [role="option"]:focus {
          background-color: rgba(194, 65, 12, 0.1) !important;
          color: #C2410C !important;
        }
        
        /* Focus outline and ring for select/date inputs */
        html body .focus\:ring-primary:focus {
          --tw-ring-color: #C2410C !important;
          ring-color: #C2410C !important;
        }
        html body .focus-visible\:ring-primary:focus-visible {
          --tw-ring-color: #C2410C !important;
          ring-color: #C2410C !important;
        }
        
        /* Overrides for SelectTrigger focus outlines and active border */
        button[role="combobox"]:focus,
        button[role="combobox"][data-state="open"],
        html body .focus\:ring-ring:focus {
          border-color: #C2410C !important;
          --tw-ring-color: rgba(194, 65, 12, 0.2) !important;
          box-shadow: 0 0 0 2px rgba(194, 65, 12, 0.2) !important;
          outline: none !important;
        }
      ` }} />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FFFDF9] to-[#FFFBEB] pt-4 pb-8 md:pt-6 md:pb-12 px-4 border-b border-[#EAB308]/15">
        <div className="absolute inset-0 bg-[radial-gradient(rgba(234,179,8,0.06)_1px,transparent_1px)] [background-size:36px_36px] pointer-events-none" />

        <div className="container mx-auto max-w-6xl flex flex-col lg:flex-row items-center gap-12 lg:gap-16 relative z-10 w-full min-w-0">
          
          {/* Left Text Column */}
          <div className="w-full lg:flex-1 text-center lg:text-left space-y-4 md:space-y-6 min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#EAB308]/45 bg-[#C2410C]/5 px-4.5 py-1.5 text-xs font-bold text-[#C2410C] backdrop-blur-sm shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#EAB308] animate-pulse" />
              १००% मोफत मराठी लग्नाचा बायोडाटा मेकर
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-[#C2410C] leading-[1.12] font-sans">
              Marathi Biodata Maker <span className="text-[#EAB308]">(विवाह बायोडाटा मराठी)</span>
            </h1>

            <p className="text-stone-700 text-xs md:text-sm lg:text-base max-w-2xl mx-auto lg:mx-0 leading-relaxed font-semibold">
              विवाह बायोडाटा मराठी ऑनलाइन तयार करा. Biodata99 वर उपलब्ध असलेल्या आकर्षक मराठी नमुन्यांमधून आपल्या पसंतीचा नमुना निवडा, वैयक्तिक व कौटुंबिक माहिती जोडा आणि काही मिनिटांत व्यावसायिक लग्नाचा बायोडाटा तयार करा.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
              <Button size="lg" className="rounded-full text-sm px-8 py-6 w-full sm:w-auto bg-[#C2410C] hover:bg-[#A2350A] text-white border-0 font-bold tracking-wide shadow-xl shadow-[#C2410C]/15 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer" asChild>
                <a href="#builder" aria-label="लग्नाचा बायोडाटा बनवा — बिल्डर कडे जा">
                  तुमचा बायोडाटा तयार करा
                  <ArrowDown className="w-4 h-4 ml-2" aria-hidden="true" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full text-sm px-8 py-6 w-full sm:w-auto border-[#EAB308]/50 hover:bg-[#EAB308]/10 text-[#C2410C] font-bold hover:border-[#EAB308] transition-all duration-200 cursor-pointer" asChild>
                <Link href="/biodata-templates">सर्व विवाह नमुने पहा</Link>
              </Button>
            </div>

            {/* Features Row */}
            <div className="hidden md:block pt-4">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 text-xs font-bold text-stone-750">
                {[
                  "आकर्षक मराठी फॉन्ट्स",
                  "शुभ चिन्हे व मंत्र",
                  "मोफत PDF डाऊनलोड",
                  "फोटो जोडण्याची सोय"
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-1.5 bg-white border border-[#EAB308]/20 rounded-full px-4 py-1.5 shadow-3xs">
                    <CheckCircle2 className="w-4 h-4 text-[#EAB308] shrink-0" aria-hidden="true" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Pure CSS Overlapping Templates Showcase */}
          <div className="flex-1 w-full max-w-lg mx-auto lg:mx-0 relative flex items-center justify-center py-6">

            {/* Soft radial glow backgrounds */}
            <div className="absolute w-72 h-72 rounded-full bg-[#EAB308]/10 blur-3xl pointer-events-none" />
            <div className="absolute w-72 h-72 rounded-full bg-[#C2410C]/8 blur-3xl pointer-events-none -translate-x-12 translate-y-12" />

            {/* CSS Stack Container */}
            <div className="flex items-center justify-center gap-2 md:gap-3.5 w-full select-none">

              {/* Left Card */}
              <div className="w-[30%] aspect-[595/842] rounded-xl overflow-hidden border border-[#EAB308]/25 shadow-md bg-white rotate-[-6deg] translate-y-4 hover:rotate-0 hover:scale-110 hover:-translate-y-4 hover:z-20 transition-all duration-300 ease-out cursor-pointer z-10">
                <img
                  src="https://res.cloudinary.com/dhlyinfwd/image/upload/w_400,c_scale,q_auto,f_auto/v1780333327/biodata/hero_slides/umpd0mqssairpwfzpytk.png"
                  alt="Marathi marriage biodata template preview"
                  className="w-full h-full object-cover"
                  width={178}
                  height={252}
                  loading="eager"
                  decoding="async"
                />
              </div>

              {/* Center Card — LCP element */}
              <div className="w-[34%] aspect-[595/842] rounded-xl overflow-hidden border-2 border-[#EAB308] shadow-[0_15px_40px_rgba(194,65,12,0.15)] bg-white z-10 hover:scale-110 hover:-translate-y-4 hover:z-20 transition-all duration-300 ease-out cursor-pointer">
                <img
                  src="https://res.cloudinary.com/dhlyinfwd/image/upload/w_400,c_scale,q_auto,f_auto/v1780333386/biodata/hero_slides/rslwwcxq7e8hdcsz0vbk.png"
                  alt="Featured Premium Marathi Marriage Biodata Template"
                  className="w-full h-full object-cover"
                  width={202}
                  height={286}
                  loading="eager"
                  fetchPriority="high"
                  decoding="sync"
                />
              </div>

              {/* Right Card */}
              <div className="w-[30%] aspect-[595/842] rounded-xl overflow-hidden border border-[#EAB308]/25 shadow-md bg-white rotate-[6deg] translate-y-4 hover:rotate-0 hover:scale-110 hover:-translate-y-4 hover:z-20 transition-all duration-300 ease-out cursor-pointer z-10">
                <img
                  src="https://res.cloudinary.com/dhlyinfwd/image/upload/w_400,c_scale,q_auto,f_auto/v1780333404/biodata/hero_slides/vwqpwpwy72u2xnnwlc0x.png"
                  alt="Marathi marriage biodata template preview"
                  className="w-full h-full object-cover"
                  width={178}
                  height={252}
                  loading="eager"
                  decoding="async"
                />
              </div>

            </div>
          </div>

        </div>

        {/* Elegant Curved Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0 h-12 overflow-hidden pointer-events-none" aria-hidden="true">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-[120%] h-full text-[#FFFDF9] fill-current" role="presentation">
            <path d="M0,30 C150,90 350,120 600,90 C850,60 1050,100 1200,40 L1200,120 L0,120 Z" fill="#EAB308" opacity="0.08" />
            <path d="M0,50 C150,100 350,130 600,100 C850,70 1050,110 1200,60 L1200,120 L0,120 Z" fill="#FFFDF9" />
          </svg>
        </div>
      </section>

      {/* Dynamic Biodata Builder Form Section */}
      <section id="builder" className="scroll-mt-20 py-10 px-4 bg-gradient-to-b from-background via-accent/30 to-background">
        <div className="container mx-auto max-w-[1400px] mb-10 text-center flex flex-col items-center gap-4">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold bg-[#C2410C]/10 text-[#C2410C]">
            <Wand2 className="w-4 h-4" />
            आत्ताच बनवायला सुरुवात करा
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#C2410C] font-sans">
            मराठी विवाह बायोडाटा मेकर
          </h2>
          <div className="text-base md:text-lg font-semibold max-w-2xl text-stone-650">
            <span className="hidden md:inline">
              खाली तुमची माहिती भरा आणि तुमचा बायोडाटा रिअल-टाइममध्ये तयार होताना पहा. तुम्ही कोणताही टेम्पलेट निवडू शकता किंवा उजव्या बाजूला दिसणाऱ्या टेम्पलेट्सवर क्लिक करून कधीही डिझाइन बदलू शकता।
            </span>
            <span className="inline md:hidden">
              खाली तुमची माहिती भरा आणि तुमचा बायोडाटा रिअल-टाइममध्ये तयार होताना पहा. तुम्ही कोणताही टेम्पलेट निवडू शकता किंवा खाली दिलेल्या टूलबार मधून कधीही डिझाइन बदलू शकता।
            </span>
          </div>
        </div>

        <BiodataBuilderSection
          defaultCommunity="Marathi"
          defaultReligion="Hindu"
          defaultTitle="॥ श्री गणेशाय नमः ॥"
          defaultTemplateId="m1"
          defaultLanguage="मराठी"
          hideCommunityAndReligion={false}
          hideHeader={true}
        />
      </section>

      {/* Samples Carousel */}
      <TemplateCarousel
        samples={MARATHI_SAMPLES}
        title="उत्कृष्ट मराठी बायोडाटा डिझाईन्स"
        subtitle="तुमच्या आवडीचे डिझाईन निवडून लग्नाचा आकर्षक बायोडाटा तयार करा. मोठ्या आकारात पाहण्यासाठी कोणत्याही फोटोवर क्लिक करा."
        badgeText="मराठी डिझाईन्स"
        themePrimary="#C2410C"
        themeAccent="#EAB308"
      />

      {/* Detailed Informative Content */}
      <div className="container mx-auto max-w-7xl relative z-10 py-2 px-4">
        {/* Step-by-Step Guide */}
        <div className="space-y-6 pt-0">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#EAB308]/30 bg-[#C2410C]/5 px-3.5 py-1.5 text-xs font-bold text-[#C2410C]">
              <Languages className="w-3.5 h-3.5" />
              Easy Step Guide
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#C2410C] font-sans">
              मराठीत लग्नाचा बायोडाटा कसा बनवायचा?
            </h2>
            <p className="text-stone-700 text-xs md:text-sm font-semibold leading-relaxed">
              लग्नाचा बायोडाटा बनवणे आता झाले अत्यंत सोपे. खालील सोप्या टिप्स वापरून तुम्ही काही मिनिटांत प्रिंट-रेडी बायोडाटा तयार करू शकता:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
            {marathiHowToSchema.step.map((step) => (
              <div key={step.position} className="bg-white border border-[#EAB308]/20 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all space-y-3 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#C2410C]/5 rounded-bl-full flex items-center justify-center font-black text-lg text-[#C2410C] z-10">
                  {step.position}
                </div>
                <h3 className="text-base font-extrabold text-[#C2410C] pr-10">{step.name}</h3>
                <p className="text-xs text-stone-750 font-medium leading-relaxed">{step.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Why Choose Section */}
        <div className="mt-8 border-t border-[#EAB308]/15 pt-6 space-y-6">
          <div className="text-center space-y-4">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#C2410C] font-sans">
              लग्नाचा बायोडाटा बनवण्यासाठी आमचीच निवड का करावी?
            </h2>
            <div className="w-12 h-1 bg-[#EAB308] mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto text-left">
            <div className="bg-white border border-[#EAB308]/25 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all space-y-3">
              <h3 className="text-base font-bold text-[#C2410C]">१. आकर्षक मराठी फॉन्ट्स आणि शुभ चिन्हे</h3>
              <p className="text-xs text-stone-700 font-semibold leading-relaxed">
                मराठी भाषा आणि संस्कृतीनुसार योग्य असणारे सुंदर फॉन्ट्स आणि शुभ चिन्हे (गणपती बाप्पा, कुलदेवता, स्वस्तिक इत्यादी) वापरण्याची सोय.
              </p>
            </div>

            <div className="bg-white border border-[#EAB308]/25 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all space-y-3">
              <h3 className="text-base font-bold text-[#C2410C]">२. १००% मोफत आणि सुरक्षित</h3>
              <p className="text-xs text-stone-700 font-semibold leading-relaxed">
                तुमच्याकडून कोणतीही छुपा फी घेतली जाणार नाही. तसेच तुमची माहिती तुमच्याच डिव्हाइसवर सुरक्षित राहते. आम्ही तुमची माहिती साठवून ठेवत नाही.
              </p>
            </div>

            <div className="bg-white border border-[#EAB308]/25 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all space-y-3">
              <h3 className="text-base font-bold text-[#C2410C]">३. एका क्लिकवर PDF डाऊनलोड</h3>
              <p className="text-xs text-stone-700 font-semibold leading-relaxed">
                बायोडाटा पूर्ण झाल्यावर त्वरित उच्च दर्जाची PDF किंवा फोटो डाऊनलोड करा, जेणेकरून तुम्ही ती कोणाशीही सहज शेअर करू शकता.
              </p>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-[11px] font-semibold text-stone-600">
              Looking for specialized Islamic themes? We also provide a dedicated <Link href="/muslim-biodata-format" className="text-[#C2410C] underline font-extrabold hover:text-[#EAB308]">Muslim Marriage Biodata Format</Link> collection.
            </p>
          </div>
        </div>

        {/* Beautiful Marathi Marriage Biodata Info Section */}
        <div className="mt-8 border-t border-[#EAB308]/15 pt-6">
          <MarathiInfoSection />
        </div>

        {/* Multi-Expandable FAQ Accordion using existing pattern */}
        <section className="mt-8 border-t border-[#EAB308]/15 pt-6 max-w-7xl mx-auto space-y-6">
          <div className="text-center space-y-4">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#C2410C] font-sans">
              नेहमी विचारले जाणारे प्रश्न (FAQ)
            </h2>
            <p className="text-xs text-stone-600 font-semibold uppercase tracking-wider">
              Frequently Asked Questions
            </p>
          </div>

          <Accordion type="multiple" defaultValue={["faq-0"]} className="w-full space-y-4">
            {marathiFaqs.map((faq, idx) => (
              <AccordionItem
                key={idx}
                value={`faq-${idx}`}
                className="border border-[#EAB308]/20 bg-white rounded-2xl overflow-hidden shadow-xs hover:border-[#EAB308]/40 transition-all duration-200"
              >
                <AccordionTrigger className="px-6 py-4.5 hover:no-underline text-left text-sm font-extrabold text-[#C2410C] transition-colors hover:bg-stone-50/50">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-5 pt-1 text-xs text-stone-750 font-semibold leading-relaxed border-t border-stone-50">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </div>

      {/* JSON-LD Schemas for SEO */}
      <JsonLd schema={marathiHowToSchema} />
      <JsonLd schema={generateFaqSchema(marathiFaqs)} />
    </div>
  );
}
