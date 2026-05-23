import type { Metadata } from "next";
import { Inter, Noto_Serif, Playfair_Display } from "next/font/google";
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

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  metadataBase: new URL('https://biodata99.com'),
  title: {
    default: "Free Online Biodata Maker for Marriage | biodata99.com",
    template: "%s | biodata99.com"
  },
  description: "Create professional marriage biodata online for FREE in 2 minutes. Choose from 50+ premium templates, supports 10+ Indian languages (Hindi, Marathi, Gujarati, etc.). Instant PDF download.",
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
    description: "Create professional marriage biodata online for FREE in 2 minutes. 50+ premium templates, 10+ Indian languages.",
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
    description: "Create professional marriage biodata online for FREE in 2 minutes. 50+ premium templates.",
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
      className={`${inter.variable} ${notoSerif.variable} ${playfair.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "biodata99.com",
              "url": "https://biodata99.com",
              "description": "Create professional marriage biodata online for FREE. 50+ templates, 10+ languages.",
              "applicationCategory": "MultimediaApplication",
              "operatingSystem": "All",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "INR"
              },
              "featureList": [
                "50+ Premium Templates",
                "10+ Indian Languages",
                "No Login Required",
                "Instant PDF Download",
                "100% Private"
              ]
            })
          }}
        />
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
