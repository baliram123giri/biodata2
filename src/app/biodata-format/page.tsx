import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { JsonLd } from "@/components/seo/JsonLd";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Biodata Format for Marriage – Complete Guide & Free Templates",
  description: "Learn what a marriage biodata format includes, how to make one, and what sections to add. Free templates for Hindu, Muslim, Sikh & more. Ready in minutes.",
  alternates: {
    canonical: "https://biodata99.com/biodata-format",
  },
  openGraph: {
    title: "Biodata Format for Marriage – Complete Guide & Free Templates",
    description: "Learn what a marriage biodata format includes, how to make one, and what sections to add. Free templates for Hindu, Muslim, Sikh & more. Ready in minutes.",
    url: "https://biodata99.com/biodata-format",
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Biodata Format for Marriage – Complete Guide & Free Templates",
  "datePublished": "2026-06-07",
  "dateModified": "2026-06-07",
  "author": {
    "@type": "Organization",
    "name": "Biodata99"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Biodata99",
    "logo": {
      "@type": "ImageObject",
      "url": "https://biodata99.com/logo.png"
    }
  },
  "url": "https://biodata99.com/biodata-format",
  "description": "Learn what a marriage biodata format includes, how to make one, and what sections to add. Free templates for Hindu, Muslim, Sikh & more. Ready in minutes.",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://biodata99.com/biodata-format"
  }
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the format of a biodata for marriage?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A complete biodata format for marriage is divided into sections: personal details, religious or astrological details, educational and professional details, family details, hobbies, partner preferences, and contact information - all on a single A4 page."
      }
    },
    {
      "@type": "Question",
      "name": "How to make a biodata format for marriage?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Choose a template, gather your personal and family details, fill in each section honestly, add a recent photograph, and download as PDF. You can create one free at biodata99.com in under two minutes without any login."
      }
    },
    {
      "@type": "Question",
      "name": "How to create a biodata format in Word?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Open an A4 document in Microsoft Word, set up a two-column layout, add section headings, insert your photo, use a readable font, and export as PDF before sharing."
      }
    },
    {
      "@type": "Question",
      "name": "What are the types of biodata format for marriage?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Common types include Hindu marriage biodata (with horoscope section), Muslim marriage biodata (with religious background), Christian biodata, Jain biodata, and Sikh biodata. Each follows a similar structure but includes community-specific fields."
      }
    }
  ]
};

interface TemplateCtaCardProps {
  src: string;
  alt: string;
  title: string;
  templateId?: string;
  ctaText?: string;
}

function TemplateCtaCard({
  src,
  alt,
  title,
  templateId,
  ctaText = "Edit Template",
}: TemplateCtaCardProps) {
  const href = templateId ? `/edit?template=${templateId}` : "/edit";

  return (
    <div className="my-8 flex flex-col items-center">
      <Link href={href} className="group w-full max-w-sm block">
        <div className="relative rounded-2xl overflow-hidden border border-[#C9A84C]/25 bg-card p-4 transition-all duration-300 hover:shadow-[0_20px_40px_-10px_rgba(201,168,76,0.25)] hover:border-[#C9A84C]/50 hover:-translate-y-1 flex flex-col items-center shadow-lg">
          <div className="relative w-full aspect-[595/842] rounded-xl overflow-hidden mb-4 bg-muted/10 border border-border/40">
            <Image
              src={src}
              alt={alt}
              fill
              sizes="(max-width: 768px) 100vw, 380px"
              className="object-contain transition-transform duration-500 group-hover:scale-[1.03]"
              priority={false}
            />
            {/* Hover overlay with a nice text/icon */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-xs">
              <span className="bg-white/95 text-stone-900 font-extrabold px-5 py-2.5 rounded-full text-xs shadow-lg tracking-wider uppercase flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                <span>⚡</span> {ctaText}
              </span>
            </div>
          </div>

          <div className="w-full text-center space-y-2">
            <h4 className="text-base font-black text-foreground group-hover:text-primary transition-colors duration-200">
              {title}
            </h4>
            <Button className="w-full rounded-full bg-gradient-primary border-0 text-white font-bold tracking-wide shadow-md group-hover:scale-[1.01] transition-transform">
              {ctaText}
            </Button>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default function BiodataFormatPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FFFBF8] dark:bg-[#1A0A0E] pt-10 pb-20 px-4 overflow-hidden relative">
      <JsonLd schema={articleSchema} />
      <JsonLd schema={faqSchema} />

      {/* Decorative background elements */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#9B1B30]/5 dark:bg-[#C9A84C]/5 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />
      <div className="absolute top-1/3 -left-48 w-96 h-96 bg-[#C9A84C]/5 dark:bg-[#9B1B30]/5 rounded-full blur-3xl pointer-events-none -z-10 animate-float" />
      <div className="absolute bottom-10 -right-48 w-96 h-96 bg-[#9B1B30]/5 dark:bg-[#C9A84C]/5 rounded-full blur-3xl pointer-events-none -z-10 animate-float-slow" />

      <div className="container mx-auto max-w-4xl relative z-10 space-y-12">

        {/* Header Section */}
        <div className="space-y-6 text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground leading-[1.2]">
            Biodata Format for Marriage – Complete Guide & Free Templates
          </h1>
          <p className="text-xl text-stone-600 dark:text-stone-300 font-medium max-w-2xl mx-auto md:mx-0">
            Learn exactly what to include in your marriage biodata, how to structure it, and access free templates for every Indian community.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium justify-center md:justify-start">
            <span>Published on biodata99.com</span>
            <span>&bull;</span>
            <span>Updated June 2026</span>
          </div>
        </div>

        <Separator className="bg-[#C9A84C]/30" />

        {/* Content Section */}
        <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-black prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed prose-a:text-[#9B1B30] dark:prose-a:text-[#C9A84C] prose-a:font-bold prose-a:no-underline hover:prose-a:underline">
          <p>
            Let's be honest. When an aunty from your neighbourhood says "beta, bas ek biodata bana lo," she's not asking you to build a rocket. But somehow, the moment you sit down to actually create one, it feels exactly like that.
          </p>
          <p>
            You open a blank Word document. You stare at it. It stares back.
          </p>
          <p>
            This guide is here to end that staring contest - for good.
          </p>
          <p>
            Whether you're a parent searching for a suitable match for your child, or a young professional who just told their family "okay, I'm ready," this is the only biodata format guide you need to read today.
          </p>

          <Separator className="bg-[#C9A84C]/30 my-8" />

          <h2>What Is a Biodata Format, Really?</h2>
          <p>
            A <strong>biodata</strong> is essentially your formal introduction to a prospective family. Think of it as a résumé - but instead of impressing HR, you're impressing future in-laws. Same pressure. Slightly different stakes.
          </p>
          <p>
            The word "biodata" comes from "biographical data." In the context of marriage, it is a structured, single-page document that captures personal, professional, family, and cultural information about a prospective bride or groom.
          </p>
          <p>
            Unlike a LinkedIn profile (which is also basically a biodata, let's face it), a marriage biodata follows a community-specific format and includes information such as caste, gotra, horoscope details, and family background - fields you definitely don't see on LinkedIn.
          </p>
          <p>
            In India, arriving at a family introduction without a biodata is unusual. Even for families who rely on platforms like Shaadi.com or BharatMatrimony, a standalone biodata PDF remains useful - it can be attached to messages, printed for relatives who aren't online, or submitted to local community networks and temple notice boards that still operate the traditional way.
          </p>
          <p>
            So yes, the biodata format is very much alive, very much relevant, and very much worth getting right.
          </p>

          <Separator className="bg-[#C9A84C]/30 my-8" />

          <h2>What Is the Standard Format of a Biodata for Marriage?</h2>
          <p>
            Before you start worrying about fonts and borders, understand this: the <strong>structure of a marriage biodata</strong> is fairly consistent across communities. The design changes, but the bones stay the same.
          </p>
          <p>
            A standard marriage biodata format follows a single-page structure used across all Indian communities - one A4 page, clearly organised into sections, with a photograph in the top corner. The format remains consistent whether you call it a matrimonial biodata, a wedding biodata, or a biodata for marriage.
          </p>
          <p>Here is what that structure looks like:</p>

          <h3>1. Personal Details</h3>
          <p>
            This is where everything begins. Personal Details is always the opening section - it sets identity through name, date of birth, height, religion, and community. Families use it to orient the rest of the profile.
          </p>
          <p>What to include:</p>
          <ul>
            <li>Full name</li>
            <li>Date of birth and age</li>
            <li>Height and weight</li>
            <li>Religion and caste (if applicable)</li>
            <li>Mother tongue</li>
            <li>Complexion (optional, but some families ask)</li>
            <li>Current city and country</li>
            <li>Manglik status (for Hindu biodatas)</li>
          </ul>
          <p>
            Keep this section clean and factual. No need to write "I am a fun-loving person" in the personal details section - that belongs elsewhere.
          </p>

          <h3>2. Astrological and Religious Details</h3>
          <div className="my-8 rounded-xl overflow-hidden shadow-md border border-[#C9A84C]/20 w-full relative">
            <Image 
              src="/content/astrological-religious-details-marriage-biodata.webp" 
              alt="2D illustration of kundali matching, moon sign, nakshatra, and family reviewing marriage biodata for horoscope compatibility."
              title="Astrological and Religious Details in Marriage Biodata"
              width={800}
              height={450}
              className="w-full h-auto object-cover m-0"
              priority={false}
            />
          </div>
          <p>
            For many Indian families, particularly Hindu ones, the spiritual section carries significant weight. Many families will not proceed to a meeting without reviewing horoscope compatibility first.
          </p>
          <p>This section typically includes:</p>
          <ul>
            <li>Rashi (Moon Sign)</li>
            <li>Nakshatra (Birth Star)</li>
            <li>Gotra</li>
            <li>Time and place of birth (for kundali matching)</li>
          </ul>
          <p>
            If astrology doesn't matter to you or your family, it's completely fine to skip this. If astrology is not important to you, feel free to remove this field - your biodata format is about your authenticity and personal values.
          </p>

          <h3>3. Educational and Professional Details</h3>
          <p>
            This is where you make your credentials shine. Be specific but don't overstuff it.
          </p>
          <p>Include:</p>
          <ul>
            <li>Highest educational qualification</li>
            <li>College or university name</li>
            <li>Current job role and company</li>
            <li>Annual income (optional, but often expected)</li>
            <li>Work location</li>
          </ul>
          <p>
            One tip: if you've studied abroad or hold a professional degree, mention it clearly. Families notice. It matters.
          </p>

          <h3>4. Family Details</h3>
          <p>
            Family Details is the most-read section. Indian marriages are often as much about family compatibility as they are about individual compatibility - sometimes more so.
          </p>
          <p>Include:</p>
          <ul>
            <li>Father's name and occupation</li>
            <li>Mother's name and occupation</li>
            <li>Number of siblings (brothers/sisters) and their marital status</li>
            <li>Family type (nuclear or joint)</li>
            <li>Native place</li>
            <li>Family values (brief, optional)</li>
          </ul>
          <p>
            Keep this honest. Inflating your father's designation or pretending you live in a bungalow when you don't will catch up to you at the first family meeting.
          </p>

          <h3>5. Hobbies, Interests, and Values</h3>
          <p>
            This is where your personality finally gets a chance to speak. Don't write "reading, travelling, cooking" and call it a day - everyone writes that.
          </p>
          <p>
            Be a little specific: "I enjoy trekking on weekends and am currently learning classical guitar." That's a human. That's memorable.
          </p>
          <p>
            Keep this section authentic - your future partner should connect with the real you.
          </p>

          <h3>6. Partner Preferences</h3>
          <p>
            What are you looking for in a life partner? This section is often where people either get too vague ("someone who is caring and understanding") or too demanding (a specific height, income bracket, and zip code).
          </p>
          <p>
            Avoid being too rigid - openness can lead to wonderful matches.
          </p>
          <p>
            A good partner preference section mentions values, outlook on life, and broad compatibility - not a checklist that sounds like a government tender.
          </p>

          <h3>7. Contact Details</h3>
          <p>
            End with how to reach you. This usually includes:
          </p>
          <ul>
            <li>A phone number (the family's, or yours)</li>
            <li>An email address</li>
            <li>City/location</li>
          </ul>
          <p>
            Avoid adding your home address on a document you're sharing widely. Privacy matters, even in matrimonial matters.
          </p>

          <Separator className="bg-[#C9A84C]/30 my-8" />

          <h2>Types of Biodata Formats (And How They Differ)</h2>
          <p>
            Not all biodata formats look the same - and they shouldn't. India's diversity means different communities have different priorities and different traditions. Here's a quick breakdown:
          </p>

          <h3>Hindu Marriage Biodata Format</h3>
          <p>
            This format includes sections for personal information, family details, education, profession, horoscope, and preferences for a life partner. The horoscope section is often the most detailed - gotra, nakshatra, Rashi, and birth time are all standard entries.
          </p>
          <p>
            Visual style tends to lean traditional: floral borders, deity images at the top (Ganesha is a popular choice), and warm colours like red, gold, or maroon.
          </p>

          <h3>Muslim Marriage Biodata Format</h3>
          <p>
            This format includes sections of personal details, religious background, educational qualification, family details, career information, and spouse preferences - a structured biodata format that's easy to share as a PDF.
          </p>
          <p>
            Religious observance, sect (Sunni, Shia, etc.), and family piety are often included. The tone is generally more formal and values-focused.
          </p>

          <TemplateCtaCard
            src="/content/muslim-marriage-biodata-template-urdu-green-design.png"
            alt="Muslim marriage biodata template in Urdu with elegant green Islamic border, mosque motifs, lantern decorations, and female profile photo section."
            title="Muslim Marriage Biodata Template (Urdu / Green Design)"
            templateId="6a477bb0-f965-450e-b415-727599cabd7a"
            ctaText="Edit Template"
          />

          <h3>Christian Marriage Biodata Format</h3>
          <p>
            Christian biodatas tend to have a cleaner, more Western-influenced layout. They include denomination (Catholic, Protestant, Pentecostal, etc.), church affiliation, and sometimes a short personal statement about faith. The design is often minimal and elegant.
          </p>

          <h3>Jain and Sikh Biodata Formats</h3>
          <p>
            Jain biodatas emphasise community (sub-caste like Digambar or Shvetambar), vegetarianism, and business background. Sikh biodatas often include information about the Gurdwara the family attends, along with gotra and ancestral village.
          </p>

          <h3>One-Page vs. Two-Page Biodata</h3>
          <p>
            You can choose between a concise one-page format or a more detailed two-page format. The one-page format provides a brief overview, while the two-page format allows for more comprehensive information - additional sections such as family background, interests, hobbies, and aspirations.
          </p>
          <p>
            For most purposes, one page is enough. Two pages are useful when you have a lot to say and the family has asked for a detailed profile.
          </p>

          <Separator className="bg-[#C9A84C]/30 my-8" />

          <h2>How to Make a Biodata Format (Step by Step)</h2>
          <p>
            Now let's get practical. Here's how you actually build a biodata - from scratch or using an online tool like <strong>biodata99.com</strong>.
          </p>

          <h3>Step 1: Choose Your Format and Template</h3>
          <p>
            Start by picking a design that suits your community and personal taste. A minimalist template works for most modern families. A traditional border design works well for families who value cultural aesthetics.
          </p>
          <p>
            On biodata99.com, you can browse templates by religion, language, and style - all free, no login required.
          </p>

          <h3>Step 2: Gather Your Information</h3>
          <p>
            Before you start filling anything in, collect all the details you'll need. This includes:
          </p>
          <ul>
            <li>Your date of birth and birth time (for horoscope)</li>
            <li>Gotra, Nakshatra, and Rashi (if applicable)</li>
            <li>Current employer and designation</li>
            <li>Family members' names and occupations</li>
            <li>A recent, good-quality photograph</li>
          </ul>
          <p>
            If your community uses gotra or nakshatra, confirm these before you start - and verify your employer name, city, and income range too.
          </p>

          <h3>Step 3: Write Clear, Honest Content</h3>
          <p>
            Fill in each section with accurate information. Don't exaggerate your income. Don't describe your family home as something it isn't. Don't write that you're "open to all communities" and then list fifteen restrictions in the next line.
          </p>
          <p>
            Families are perceptive. Honesty in a biodata builds trust before you've even met.
          </p>

          <h3>Step 4: Add a Good Photograph</h3>
          <p>
            Upload a recent, high-resolution headshot or head-and-shoulders picture with a smile. Keep it natural - clear resolution, minimal editing, confident posture, modest attire, and no group shots.
          </p>
          <p>
            A photo from your cousin's wedding five years ago does not count as a "recent" photo. Use something current.
          </p>

          <h3>Step 5: Review, Proofread, Download</h3>
          <p>
            Use clear headings, bullet points, and concise language to convey your information accurately and attractively. Proofread carefully for any errors and maintain consistent formatting throughout.
          </p>
          <p>
            Read it out loud once. If something sounds awkward, rewrite it. Ask a friend or sibling to review it too.
          </p>
          <p>
            Then download it - ideally as a PDF, which is the most widely accepted format for sharing over WhatsApp, email, and matrimonial platforms.
          </p>

          <Separator className="bg-[#C9A84C]/30 my-8" />

          <h2>How to Create a Biodata Format in Word</h2>
          <p>
            If you prefer Microsoft Word, here's a quick method:
          </p>
          <ol>
            <li>Open a new document and set the page size to A4.</li>
            <li>Use a two-column layout: left column for the photo and key personal details, right column for extended information.</li>
            <li>Add section headings using Heading 2 style (bold, slightly larger font).</li>
            <li>Use a simple, readable font - Times New Roman or Georgia for traditional looks, Calibri for a modern feel.</li>
            <li>Add a thin border around the page for a polished finish.</li>
            <li>Insert your photo in the top corner and align it properly.</li>
            <li>Save as PDF before sharing.</li>
          </ol>
          <p>
            Word is fine for basic biodatas. But if you want a more designed, template-ready output in under two minutes, an online biodata maker saves you a lot of formatting headache.
          </p>

          <Separator className="bg-[#C9A84C]/30 my-8" />

          <h2>Common Biodata Format Mistakes to Avoid</h2>
          <p>
            A few things that quietly ruin an otherwise good biodata:
          </p>
          <p>
            <strong>1. Vague descriptions.</strong> "Good family background" means nothing. Be specific: "Father is a retired government officer, mother is a homemaker. Joint family of six."
          </p>
          <p>
            <strong>2. Outdated photographs.</strong> A decade-old photo creates immediate distrust at the first meeting.
          </p>
          <p>
            <strong>3. Overcrowding the page.</strong> Don't try to fit your entire life story on one page. Prioritise. Edit. White space is your friend.
          </p>
          <p>
            <strong>4. Missing contact details.</strong> Surprising how often this happens. Always double-check that the phone number is current and correct.
          </p>
          <p>
            <strong>5. Inconsistent information.</strong> If your biodata says you're 5'8" and you arrive at a meeting at 5'5", you've already started things on the wrong foot.
          </p>
          <p>
            <strong>6. Using a template that doesn't match your community.</strong> A heavily astrological template looks out of place for a Christian biodata. Match the format to the context.
          </p>

          <Separator className="bg-[#C9A84C]/30 my-8" />

          <h2>Why the Biodata Format Still Matters in 2025</h2>
          <p>
            Some people ask: with so many matrimonial apps and websites, does a biodata PDF still matter?
          </p>
          <p>
            Yes. And here's why.
          </p>
          <p>
            Apps show profiles. Biodatas show <em>effort</em>. When a family receives a well-designed, clearly written biodata, they understand immediately that you - or your family - are serious about this process.
          </p>
          <p>
            It's also the most portable format. A PDF works on WhatsApp, email, print, and every platform. It doesn't require the other person to create an account or download an app.
          </p>
          <p>
            And practically speaking, many matchmakers, community networks, and pandit ji's local matrimonial list still operate entirely on printed biodatas. Old school? Sure. But still very much in use.
          </p>

          <Separator className="bg-[#C9A84C]/30 my-8" />

          <h2>Frequently Asked Questions About Biodata Format</h2>
          
          <h3>What is the format of a biodata for marriage?</h3>
          <p>
            A complete biodata format for marriage is usually divided into four sections: spiritual or religious information, personal details, family details, and contact details. Most well-designed biodatas also include education, profession, hobbies, and partner preferences.
          </p>

          <h3>What is the format of a biodata (general)?</h3>
          <p>
            A biodata, in its most basic form, is a one-page biographical document. For marriage purposes, it follows the community-specific matrimonial structure described throughout this guide. For job applications, it's closer to a CV with personal details included.
          </p>

          <h3>How to make a biodata format easily?</h3>
          <p>
            The fastest way is to use a free online tool like <strong>biodata99.com</strong>. You can create a biodata in any of several supported Indian languages, upload your photo, fill in the sections, and download in minutes. No design skills needed. No login required.
          </p>

          <h3>How to create a biodata format in Word?</h3>
          <p>
            Use an A4 page, set up columns, apply consistent heading styles, pick a readable font, add a border and photo, and export to PDF. The manual method works but takes time. For better design results, an online biodata maker is significantly more efficient.
          </p>

          <Separator className="bg-[#C9A84C]/30 my-8" />

          <h2>Final Word: Make It Real, Make It Yours</h2>
          <p>
            A biodata format is a starting point - not an ending. No amount of design polish or careful formatting will substitute for authenticity. Write things as they are. Include what matters to your family. Leave out what doesn't.
          </p>
          <p>
            The goal isn't to create the most impressive document in a pile of biodatas. The goal is to represent yourself honestly so the right match can recognise you.
          </p>
          <p>
            If you're ready to create yours, head over to <strong><Link href="/">biodata99.com</Link></strong> - no account needed, no complicated steps, and no cost. Pick a template, fill in your details, and download a professionally designed marriage marriage biodata PDF in just a couple of minutes.
          </p>
          <p>
            Because you deserve a biodata that actually sounds like you.
          </p>

          <Separator className="bg-[#C9A84C]/30 my-8" />

          <p className="italic text-muted-foreground">
            Create your free marriage biodata at <Link href="/" className="text-[#9B1B30] dark:text-[#C9A84C] font-bold hover:underline">biodata99.com</Link> - available in Hindi, Marathi, Gujarati, Tamil, Telugu, and more.
          </p>
        </div>

      </div>
    </div>
  );
}
