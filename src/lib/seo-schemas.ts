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
      "text": "When you are happy with how it looks, click Download. Your biodata is generated instantly as PDF, or JPG formats."
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

// 9. Templates WebPage Schema
export const templatesPageSchema = {
  "@context": "https://schema.org" as const,
  "@type": "WebPage" as const,
  "name": "Marriage Biodata Templates",
  "description": "Browse free and premium marriage biodata templates designed for Indian families. Pick a style, customise your details, and download as a PDF in minutes.",
  "url": "https://biodata99.com/biodata-templates",
  "publisher": {
    "@type": "Organization",
    "name": "Biodata99",
    "url": "https://biodata99.com",
    "logo": "https://biodata99.com/logo.svg"
  }
};

export const templatesPageFaqSchema = {
  "@context": "https://schema.org" as const,
  "@type": "FAQPage" as const,
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is a marriage biodata format?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A marriage biodata format is a structured document used to introduce yourself to potential marriage prospects and their families. It typically includes personal details, education, profession, family background, interests, and partner preferences. A well-designed biodata makes it easier to present important information clearly and professionally."
      }
    },
    {
      "@type": "Question",
      "name": "What information should be included in a marriage biodata?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A marriage biodata usually contains personal information such as name, age, date of birth, height, education, occupation, and contact details. Many people also include family details, hobbies, lifestyle preferences, religious information, and a recent photograph. The exact information depends on personal and family preferences."
      }
    },
    {
      "@type": "Question",
      "name": "How can I create a marriage biodata online?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You can create a marriage biodata online by selecting a template, filling in your details, uploading a photo, and customizing the design according to your preferences. Once everything looks correct, you can download the completed biodata and share it digitally or in print."
      }
    },
    {
      "@type": "Question",
      "name": "How do I make a biodata format in Word?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You can create a biodata in Microsoft Word by using a ready-made template or designing your own layout. Add sections for personal details, education, profession, family information, and partner preferences. While Word offers flexibility, dedicated biodata makers can save time and provide professionally designed layouts."
      }
    },
    {
      "@type": "Question",
      "name": "Can I download my biodata as a PDF?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. PDF is one of the most popular formats for marriage biodatas because it preserves the layout and formatting across different devices. A PDF file is also easy to share through WhatsApp, email, and matrimonial platforms."
      }
    },
    {
      "@type": "Question",
      "name": "Are Biodata99 templates free to use?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Biodata99 offers free marriage biodata templates that can be customized with your personal information. Depending on the template and features you choose, additional premium options may also be available."
      }
    },
    {
      "@type": "Question",
      "name": "How do I write a biodata for marriage?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Start by providing accurate personal details, educational qualifications, profession, and family background. Keep the information clear, honest, and concise. You can also include hobbies, interests, and partner expectations if you feel they are relevant. A recent photograph and a clean design can help create a positive first impression."
      }
    },
    {
      "@type": "Question",
      "name": "Which biodata format is best for marriage?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The best biodata format is one that presents your information clearly and reflects your personality. Some families prefer traditional layouts, while others prefer modern designs with photographs and organized sections. The ideal format depends on your preferences, cultural background, and the audience you are sharing it with."
      }
    },
    {
      "@type": "Question",
      "name": "Can I create a biodata in Marathi, Hindi, and English?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Marriage biodatas can be created in multiple languages, including Marathi, Hindi, English, and many other regional languages. Choosing a language that is comfortable for both families can make communication easier and more effective."
      }
    },
    {
      "@type": "Question",
      "name": "Can I add my photo to the biodata?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. You can upload a recent photograph directly to your biodata. During upload, you can crop the image to fit the design perfectly. In our Creator Studio editor, you have complete control to adjust the photo's position, scale (zoom in/out), and change the border radius (making it square, rounded, or a perfect circle) to match your template style."
      }
    },
    {
      "@type": "Question",
      "name": "Can I edit my marriage biodata after creating it?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. While you cannot directly edit a downloaded PDF or image file, your filled details are securely saved in your browser's local storage. You can return to the editor at any time, update your information (such as changing occupation, contact details, photos, or preferences), and download the new version again instantly."
      }
    },
    {
      "@type": "Question",
      "name": "What file formats can I download my biodata in?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Most modern biodata makers provide PDF downloads because they are easy to share and print. Some platforms may also offer image formats such as PNG or JPEG for sharing on social media and messaging applications."
      }
    },
    {
      "@type": "Question",
      "name": "Do I need design skills to create a marriage biodata?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. Ready-made templates are designed to make the process simple for everyone. You only need to enter your details, choose a design, and customize it if needed. No graphic design experience is required."
      }
    },
    {
      "@type": "Question",
      "name": "Is it safe to create my marriage biodata online?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Creating a biodata on Biodata99 is completely safe. As promised, we do not store any of your personal details or photos on our servers. All information you enter remains stored locally in your browser's storage, ensuring 100% privacy while allowing you to save time and edit your biodata later."
      }
    },
    {
      "@type": "Question",
      "name": "Can I use these biodata templates on mobile devices?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Most modern biodata creators are designed to work on smartphones, tablets, laptops, and desktop computers. This allows you to create, edit, and download your biodata from virtually anywhere. We have taken special care to optimize our Creator Studio, ensuring all editing panels and templates work exceptionally well on small mobile devices."
      }
    },
    {
      "@type": "Question",
      "name": "How many pages should a marriage biodata be?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A marriage biodata is usually one or two pages long. The goal is to provide enough information for an introduction without overwhelming the reader. Keeping the content organized and concise often creates the best impression."
      }
    },
    {
      "@type": "Question",
      "name": "What is the difference between a marriage biodata and a matrimonial profile?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A marriage biodata is a document that can be downloaded, printed, and shared directly with families or individuals. A matrimonial profile is typically an online profile created on a matchmaking platform. Both serve a similar purpose, but a biodata gives you more control over the presentation and design."
      }
    },
    {
      "@type": "Question",
      "name": "Can I create a marriage biodata without a photo?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. While many people choose to include a photograph, it is not mandatory. You can create and share a marriage biodata without a photo if you prefer to keep the initial introduction focused on personal, educational, and family details."
      }
    }
  ]
};

// 10. Dynamic BreadcrumbList Schema Generator
interface BreadcrumbItem {
  name: string;
  item: string;
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org" as const,
    "@type": "BreadcrumbList" as const,
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem" as const,
      "position": index + 1,
      "name": item.name,
      "item": item.item
    }))
  };
}

// 11. Video Tutorial Schema
export const videoTutorialSchema = {
  "@context": "https://schema.org" as const,
  "@type": "VideoObject" as const,
  "name": "How to Create a Marriage Biodata Online - Step by Step Tutorial",
  "description": "Watch this quick guide to learn how to fill in your details, customize a template, and download your biodata with ease.",
  "thumbnailUrl": [
    "https://img.youtube.com/vi/tSXLftIk8Fg/maxresdefault.jpg",
    "https://img.youtube.com/vi/tSXLftIk8Fg/sddefault.jpg",
    "https://img.youtube.com/vi/tSXLftIk8Fg/hqdefault.jpg"
  ],
  "uploadDate": "2025-10-15T08:00:00+05:30",
  "duration": "PT2M15S",
  "contentUrl": "https://youtu.be/tSXLftIk8Fg",
  "embedUrl": "https://www.youtube.com/embed/tSXLftIk8Fg",
  "publisher": {
    "@type": "Organization",
    "name": "Biodata99",
    "url": "https://biodata99.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://biodata99.com/logo.svg"
    }
  },
  "regionsAllowed": ["IN", "US", "CA", "GB", "AU"]
};