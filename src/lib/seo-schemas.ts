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
      "@type": "HowToStep" as const,
      "position": 1,
      "name": "Fill in Your Details",
      "text": "Start by entering your information into the editor. The form is organised into clear sections so nothing feels overwhelming."
    },
    {
      "@type": "HowToStep" as const,
      "position": 2,
      "name": "Choose a Template",
      "text": "Pick a design that matches your family's taste. Each template is built around the sections families actually look for in a marriage biodata."
    },
    {
      "@type": "HowToStep" as const,
      "position": 3,
      "name": "Add a Photo (Optional)",
      "text": "Upload a photo directly from your phone or computer. You can crop and position it to fit cleanly within the template layout."
    },
    {
      "@type": "HowToStep" as const,
      "position": 4,
      "name": "Download and Share",
      "text": "When you are happy with how it looks, click Download. Your biodata is generated instantly as PDF, JPG, or DOCX formats."
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

// 7. RefundPolicy WebPage Schema
export const refundPolicySchema = {
  "@context": "https://schema.org" as const,
  "@type": "WebPage" as const,
  "name": "Refund Policy",
  "description": "Biodata99 offers free and premium biodata templates. Read our refund policy to understand what is covered and how to request a refund if something goes wrong.",
  "url": "https://biodata99.com/refund-policy",
  "publisher": {
    "@type": "Organization",
    "name": "Biodata99",
    "url": "https://biodata99.com",
    "logo": "https://biodata99.com/logo.svg"
  }
};

// 8. TermsConditions WebPage Schema
export const termsConditionsSchema = {
  "@context": "https://schema.org" as const,
  "@type": "WebPage" as const,
  "name": "Terms and Conditions",
  "description": "Read the terms and conditions for using Biodata99. Covers free and paid templates, your content rights, privacy, payments, and how we operate.",
  "url": "https://biodata99.com/terms-conditions",
  "publisher": {
    "@type": "Organization",
    "name": "Biodata99",
    "url": "https://biodata99.com",
    "logo": "https://biodata99.com/logo.svg"
  }
};