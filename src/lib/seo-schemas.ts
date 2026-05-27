/**
 * biodata99.com SEO Schema Registry
 * Central repository for all JSON-LD schemas utilized across the site.
 */

// 1. Global WebApplication Schema
export const webApplicationSchema = {
  "@context": "https://schema.org" as const,
  "@type": "WebApplication" as const,
  "name": "Biodata99 - Marriage Biodata Maker",
  "url": "https://biodata99.com",
  "description": "Create professional marriage biodata online for free. Choose from beautiful templates, multiple Indian languages, and download as PDF instantly.",
  "applicationCategory": "UtilitiesApplication",
  "operatingSystem": "All",
  "browserRequirements": "Requires JavaScript. Requires HTML5.",
  "inLanguage": ["en", "hi", "mr", "gu", "te", "bn"],
  "isAccessibleForFree": true,
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "INR"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Biodata99",
    "url": "https://biodata99.com",
    "email": "support@biodata99.com"
  },
  "featureList": [
    "Premium marriage biodata templates",
    "Multiple Indian languages support",
    "No login or registration required",
    "Instant PDF and Word download",
    "100% private, no data stored on servers"
  ]
};

// 2. Homepage HowTo Schema
export const howToSchema = {
  "@context": "https://schema.org" as const,
  "@type": "HowTo" as const,
  "name": "How to Create a Marriage Biodata Online",
  "description": "Learn how to make a beautiful matrimonial biodata with photo in 4 simple steps using our free online builder.",
  "step": [
    {
      "@type": "HowToStep",
      "position": 1,
      "name": "Fill In Your Details",
      "text": "Enter your personal details, family background, education, and contact info step by step in the simple form."
    },
    {
      "@type": "HowToStep",
      "position": 2,
      "name": "Pick a Biodata Format",
      "text": "Browse and select from over 50 traditional, modern, or community-specific marriage templates."
    },
    {
      "@type": "HowToStep",
      "position": 3,
      "name": "Add Photo & Customize",
      "text": "Upload a professional portrait photo, select a premium gold or color theme, and add your religious symbol or heading."
    },
    {
      "@type": "HowToStep",
      "position": 4,
      "name": "Download & Share",
      "text": "Download the final print-ready PDF or editable Word document. Share it instantly on WhatsApp or other matrimonial sites."
    }
  ]
};

// 3. ContactPage Schema
export const contactPageSchema = {
  "@context": "https://schema.org" as const,
  "@type": "ContactPage" as const,
  "name": "Contact Us | biodata99.com",
  "description": "Reach out to biodata99.com for support, template requests, or feedback. We respond within 24 hours, Monday to Saturday.",
  "url": "https://biodata99.com/contact-us",
  "mainEntity": {
    "@type": "Organization",
    "name": "biodata99.com",
    "url": "https://biodata99.com",
    "logo": "https://biodata99.com/logo.svg",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "email": "support@biodata99.com",
      "availableLanguage": ["English", "Hindi"],
      "hoursAvailable": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        "opens": "09:00",
        "closes": "18:00"
      }
    }
  }
};
interface BlogSchemaParams {
  title: string;
  description: string;
  slug: string;
  author: string;
  publishDate?: string;
  modifiedDate?: string;
  image?: string;
}

export function generateArticleSchema({
  title,
  description,
  slug,
  author,
  publishDate = new Date().toISOString().split("T")[0],
  modifiedDate = new Date().toISOString().split("T")[0],
  image = "https://biodata99.com/og-image.jpg",
}: BlogSchemaParams) {
  return {
    "@context": "https://schema.org" as const,
    "@type": "Article" as const,
    "headline": title,
    "description": description,
    "url": `https://biodata99.com/blog/${slug}`,
    "datePublished": publishDate,
    "dateModified": modifiedDate,
    "image": {
      "@type": "ImageObject",
      "url": image,
      "width": 1200,
      "height": 630
    },
    "author": {
      "@type": "Person",
      "name": author,
      "url": "https://biodata99.com/blog"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Biodata99",
      "url": "https://biodata99.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://biodata99.com/logo.svg",
        "width": 200,
        "height": 60
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://biodata99.com/blog/${slug}`
    }
  };
}

interface FaqItem {
  q?: string;
  a?: string;
  question?: string;
  answer?: string;
}

// 5. Dynamic FAQPage Schema Generator
export function generateFaqSchema(faqs: FaqItem[]) {
  return {
    "@context": "https://schema.org" as const,
    "@type": "FAQPage" as const,
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.q || faq.question || "",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a || faq.answer || "",
      },
    })),
  };
}

// 6. LocalBusiness Schema representing the business location and details
export const localBusinessSchema = {
  "@context": "https://schema.org" as const,
  "@type": "LocalBusiness" as const,
  "name": "biodata99.com",
  "image": "https://biodata99.com/og-image.png",
  "@id": "https://biodata99.com/#localbusiness",
  "url": "https://biodata99.com",
  "email": "support@biodata99.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Jadhav Nagar Dhayri",
    "addressLocality": "Pune",
    "addressRegion": "Maharashtra",
    "postalCode": "411041",
    "addressCountry": "IN"
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      "opens": "09:00",
      "closes": "18:00"
    }
  ]
};