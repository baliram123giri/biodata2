import { Suspense } from "react";
import type { Metadata } from "next";
import { Inter, Noto_Serif, Playfair_Display, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const notoSerif = Noto_Serif({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  preload: false,
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  preload: false,
});

const notoDevanagari = Noto_Sans_Devanagari({
  variable: "--font-noto-sans-devanagari",
  subsets: ["devanagari", "latin"],
  weight: ["400", "700"],
  display: "swap",
  preload: false,
});

import { Header } from "@/components/layout/Header";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Footer } from "@/components/layout/Footer";
import { FooterReviews } from "@/components/layout/FooterReviews";
import { ClientLayoutProviders } from "@/components/layout/ClientLayoutProviders";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { webApplicationSchema } from "@/lib/seo-schemas";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  metadataBase: new URL('https://biodata99.com'),
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  title: {
    default: "Free Online Biodata Maker for Marriage | biodata99.com",
    template: "%s | biodata99.com"
  },
  description: "Create professional marriage biodata online for FREE in 2 minutes. Choose from our premium templates, supports multiple Indian languages (Hindi, Marathi, Gujarati, etc.). Instant PDF download.",
  keywords: ["marriage biodata maker", "online biodata builder", "matrimonial biodata format", "free biodata maker", "marriage resume maker", "shadi biodata creator"],
  authors: [{ name: "biodata99.com Team" }],
  creator: "biodata99.com",
  publisher: "biodata99.com",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://biodata99.com",
    siteName: "biodata99.com",
    title: "Free Online Biodata Maker for Marriage | biodata99.com",
    description: "Create professional marriage biodata online for FREE in 2 minutes. Premium templates, multiple Indian languages.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "biodata99.com - Create Marriage Biodata Online",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Online Biodata Maker for Marriage | biodata99.com",
    description: "Create professional marriage biodata online for FREE in 2 minutes. Premium templates.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: "https://biodata99.com",
  },
  other: {
    "p:domain_verify": "259c0a9accc44c5fd0b0fe527fa56d4d",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${notoSerif.variable} ${playfair.variable} ${notoDevanagari.variable} h-full antialiased`}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <head>
        {/* DNS prefetch + preconnect for Google Fonts CDN */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <script src="https://analytics.ahrefs.com/analytics.js" data-key="ipvfSRsOf49Lu1SY3qaOTw" async></script>
      </head>
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
        <JsonLd schema={webApplicationSchema} />
        <QueryProvider>
          <ClientLayoutProviders>
            <Header />
            <main className="flex-1">
              <Breadcrumbs />
              {children}
            </main>
            <Footer>
              <Suspense fallback={
                <div className="flex flex-col gap-2 mt-2.5 w-fit">
                  <span className="text-[11px] font-semibold text-slate-400 tracking-wide">
                    Trusted by Indian families
                  </span>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mt-0.5 min-h-[52px]">
                    <div className="h-[38px] w-[148px] bg-white/3 border border-white/5 rounded-xl animate-pulse" />
                    <div className="h-[38px] w-[148px] bg-white/3 border border-white/5 rounded-xl animate-pulse" />
                  </div>
                </div>
              }>
                <FooterReviews />
              </Suspense>
            </Footer>
          </ClientLayoutProviders>
        </QueryProvider>
      </body>
    </html>
  );
}
