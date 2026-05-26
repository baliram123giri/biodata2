import { Suspense } from "react";
import type { Metadata } from "next";
import { Inter, Noto_Serif, Playfair_Display, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const notoSerif = Noto_Serif({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const notoDevanagari = Noto_Sans_Devanagari({
  variable: "--font-noto-sans-devanagari",
  subsets: ["devanagari", "latin"],
  weight: ["400", "700"],
});

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ClientLayoutProviders } from "@/components/layout/ClientLayoutProviders";
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
    >
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
        <JsonLd schema={webApplicationSchema} />
        <ClientLayoutProviders />
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
