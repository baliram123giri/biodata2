import type { Metadata } from "next";
import Link from "next/link";
import NextImage from "next/image";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { generateArticleSchema, generateBreadcrumbSchema } from "@/lib/seo-schemas";
import { JsonLd } from "@/components/seo/JsonLd";
import { ShareButton } from "@/components/blog/ShareButton";

interface BlogPostPageProps {
  params: Promise<{ slug: string[] }>;
}

const langMap: Record<string, string> = {
  eng: "English",
  en: "English",
  hi: "Hindi",
  mr: "Marathi",
  gu: "Gujarati",
};

const codeMap: Record<string, string> = {
  "English": "en",
  "Hindi": "hi",
  "Marathi": "mr",
  "Gujarati": "gu",
};

/**
 * Utility helper to parse the optional language prefix and the actual blog slug.
 * Supports:
 * - /blog/slug-name            (length = 1) -> langCode = null, actualSlug = slug-name
 * - /blog/hi/slug-name         (length = 2) -> langCode = hi, actualSlug = slug-name
 * - /blog/mr/slug-name         (length = 2) -> langCode = mr, actualSlug = slug-name
 */
async function parseSlugAndLang(paramsPromise: Promise<{ slug: string[] }>) {
  const { slug } = await paramsPromise;
  
  let langCode: string | null = null;
  let actualSlug = "";

  if (slug && slug.length >= 2) {
    langCode = slug[0]; // e.g. "eng", "hi", "mr"
    actualSlug = slug[1];
  } else if (slug && slug.length === 1) {
    actualSlug = slug[0];
  }

  return { langCode, actualSlug };
}

/**
 * Generate static paths for dynamic blog pages at build time.
 * Pre-renders both base URLs and language-prefixed URLs (en, eng, hi, mr, gu) to guarantee static file performance.
 */
export async function generateStaticParams() {
  try {
    const posts = await prisma.blogPost.findMany({
      select: { slug: true, language: true }
    });
    
    const params: { slug: string[] }[] = [];
    
    posts.forEach((post) => {
      // 1. Base route: /blog/slug-name
      params.push({ slug: [post.slug] });
      
      // 2. Localized routes for all supported languages
      const languages = ["en", "eng", "hi", "mr", "gu"];
      languages.forEach((lang) => {
        params.push({ slug: [lang, post.slug] });
      });
    });
    
    return params;
  } catch (error) {
    console.error("Error in generateStaticParams:", error);
    return [];
  }
}

/**
 * Dynamic metadata generator for premium crawler targeting.
 * Maps localized alternates, open graph settings, and canonical URLs.
 */
export async function generateMetadata(
  props: BlogPostPageProps
): Promise<Metadata> {
  const { langCode, actualSlug } = await parseSlugAndLang(props.params);
  
  const post = await prisma.blogPost.findUnique({
    where: { slug: actualSlug }
  });

  if (!post) {
    return {
      title: "Article Not Found | biodata99.com",
    };
  }

  const currentLangCode = langCode || codeMap[post.language] || "en";
  const canonicalUrl = `https://biodata99.com/blog/${currentLangCode}/${post.slug}`;
  const imageUrl = post.thumbnailUrl || "https://biodata99.com/og-image.jpg";

  return {
    title: `${post.title} | Marriage Biodata Maker`,
    description: post.description,
    keywords: [
      post.category,
      "marriage biodata",
      "matrimonial biodata",
      "biodata format",
      "biodata template",
      "biodata maker",
      post.title.toLowerCase()
    ],
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'x-default': `https://biodata99.com/blog/${post.slug}`,
        'en': `https://biodata99.com/blog/en/${post.slug}`,
        'hi': `https://biodata99.com/blog/hi/${post.slug}`,
        'mr': `https://biodata99.com/blog/mr/${post.slug}`,
        'gu': `https://biodata99.com/blog/gu/${post.slug}`,
      }
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: canonicalUrl,
      siteName: "Biodata99",
      locale: currentLangCode === "hi" ? "hi_IN" : currentLangCode === "mr" ? "mr_IN" : "en_IN",
      type: "article",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      publishedTime: post.publishDate || post.createdAt?.toISOString(),
      modifiedTime: post.updatedAt?.toISOString(),
      authors: [post.author],
      section: post.category,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [imageUrl],
      creator: "@biodata99",
    },
  };
}

export default async function BlogPostPage(props: BlogPostPageProps) {
  const { langCode, actualSlug } = await parseSlugAndLang(props.params);
  
  const post = await prisma.blogPost.findUnique({
    where: { slug: actualSlug }
  });

  if (!post) {
    notFound();
  }

  // Fetch related articles (prioritize same category, fallback to other recent posts)
  let relatedPosts = await prisma.blogPost.findMany({
    where: {
      category: post.category,
      NOT: {
        id: post.id,
      },
    },
    take: 3,
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      thumbnailUrl: true,
      publishDate: true,
      readTime: true,
      category: true,
      author: true,
      language: true,
    },
  });

  if (relatedPosts.length < 3) {
    const excludeIds = [post.id, ...relatedPosts.map((p) => p.id)];
    const additionalPosts = await prisma.blogPost.findMany({
      where: {
        NOT: {
          id: { in: excludeIds },
        },
      },
      take: 3 - relatedPosts.length,
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        thumbnailUrl: true,
        publishDate: true,
        readTime: true,
        category: true,
        author: true,
        language: true,
      },
    });
    relatedPosts = [...relatedPosts, ...additionalPosts];
  }

  const articleSchema = generateArticleSchema({
    title: post.title,
    description: post.description,
    slug: post.slug,
    author: post.author,
    publishDate: post.publishDate || (post.createdAt ? new Date(post.createdAt).toISOString().split("T")[0] : undefined),
    modifiedDate: post.updatedAt ? new Date(post.updatedAt).toISOString().split("T")[0] : undefined,
    image: post.thumbnailUrl || undefined,
  });

  const breadcrumbItems = [
    { name: "Home", item: "https://biodata99.com" },
    { name: "Blog", item: "https://biodata99.com/blog" },
  ];

  if (langCode) {
    const langLabel = langMap[langCode] || langCode.toUpperCase();
    breadcrumbItems.push({ name: langLabel, item: `https://biodata99.com/blog?lang=${langCode}` });
  }

  breadcrumbItems.push({
    name: post.title,
    item: `https://biodata99.com/blog/${langCode ? `${langCode}/` : ""}${post.slug}`
  });

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);

  return (
    <div className="flex flex-col min-h-screen bg-[#FFFBF8] dark:bg-[#1A0A0E] pt-10 pb-10 px-4">
      {/* JSON-LD Article Schema */}
      <JsonLd schema={articleSchema} />
      
      {/* JSON-LD Breadcrumb Schema */}
      <JsonLd schema={breadcrumbSchema} />

      {/* Decorative Ornaments */}
      <div className="absolute top-0 right-0 w-[40%] h-[40%] rounded-full bg-gradient-to-tr from-[#9B1B30]/5 to-[#C9A84C]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40%] h-[40%] rounded-full bg-gradient-to-br from-[#C9A84C]/5 to-[#9B1B30]/5 blur-[120px] pointer-events-none" />

      <div className="container mx-auto max-w-3xl relative z-10 space-y-8">
        
        {/* Navigation and Breadcrumbs header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Button variant="ghost" size="sm" className="rounded-full gap-1.5 hover:bg-muted text-muted-foreground hover:text-foreground w-fit" asChild>
            <Link href="/blog">
              <ArrowLeft className="w-4 h-4" />
              Back to Articles
            </Link>
          </Button>

          {/* On-Page Breadcrumb for indexing and UX */}
          <nav aria-label="Breadcrumb" className="text-xs font-semibold text-muted-foreground/80 flex flex-wrap items-center gap-1.5">
            {breadcrumbItems.map((item, index) => (
              <span key={`${item.item}-${index}`} className="flex items-center gap-1.5">
                {index > 0 && <span className="text-[#C9A84C]/60">/</span>}
                {index === breadcrumbItems.length - 1 ? (
                  <span className="text-foreground font-bold truncate max-w-[200px] md:max-w-none">
                    {item.name}
                  </span>
                ) : (
                  <Link href={item.item.replace("https://biodata99.com", "")} className="hover:text-[#9B1B30] dark:hover:text-[#E6C97A] transition-colors">
                    {item.name}
                  </Link>
                )}
              </span>
            ))}
          </nav>
        </div>

        {/* Article Header block */}
        <header className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-[#FBF5E6] dark:bg-[#8A7233]/25 text-[#8A7233] dark:text-[#E6C97A] border border-[#C9A84C]/20 w-fit">
              {post.category}
            </span>
            {langCode && (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-[#9B1B30]/10 dark:bg-[#9B1B30]/30 text-[#9B1B30] dark:text-[#FFAAB4] border border-[#9B1B30]/20 w-fit">
                {langMap[langCode] || langCode.toUpperCase()}
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-8">
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground font-semibold">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#C9A84C]" />
                By {post.author}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#C9A84C]" />
                {post.publishDate}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#C9A84C]" />
                {post.readTime}
              </span>
            </div>

            {/* Social Share Button (Radix-UI Popover) */}
            <ShareButton
              url={`https://biodata99.com/blog/${langCode ? `${langCode}/` : ""}${post.slug}`}
              title={post.title}
            />
          </div>
        </header>

        {/* Thumbnail Image Cover */}
        {post.thumbnailUrl && (
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-[#C9A84C]/15 bg-muted shadow-md">
            <NextImage
              src={post.thumbnailUrl}
              alt={`Thumbnail banner image for the article: ${post.title}`}
              fill
              sizes="(max-width: 768px) 100vw, 800px"
              priority={true} // Priority loading on the main detail cover page for LCP optimization
              className="object-cover"
            />
          </div>
        )}

        {/* Article Body Content */}
        <article
          className="prose max-w-none dark:prose-invert prose-headings:text-foreground prose-headings:font-black prose-p:text-muted-foreground prose-p:leading-relaxed prose-li:text-muted-foreground prose-ul:list-disc prose-ul:pl-6 space-y-6 pt-4 pb-12 border-b border-border/40"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Dynamic Related Articles Section */}
        {relatedPosts.length > 0 && (
          <section className="space-y-6 pt-8 pb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-black text-foreground tracking-tight">
                Related Articles
              </h2>
              <Button variant="ghost" size="sm" className="rounded-full gap-1 text-[#8A7233] dark:text-[#E6C97A] hover:bg-[#FBF5E6]/40 font-bold" asChild>
                <Link href="/blog">View All Articles →</Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => {
                const relRawLang = relatedPost.language || "English";
                let relLangCode = "en";
                const relNorm = relRawLang.toLowerCase();
                if (relNorm.includes("marathi")) relLangCode = "mr";
                else if (relNorm.includes("hindi")) relLangCode = "hi";
                else if (relNorm.includes("gujarati")) relLangCode = "gu";

                const relUrl = `/blog/${relLangCode}/${relatedPost.slug}`;

                return (
                  <article
                    key={relatedPost.slug}
                    className="group flex flex-col bg-white dark:bg-[#1E0D11]/60 border border-[#C9A84C]/10 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    {relatedPost.thumbnailUrl && (
                      <div className="relative aspect-video w-full overflow-hidden bg-muted">
                        <NextImage
                          src={relatedPost.thumbnailUrl}
                          alt={`Related article thumbnail: ${relatedPost.title}`}
                          fill
                          sizes="(max-width: 768px) 100vw, 300px"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A7233] dark:text-[#E6C97A] bg-[#FBF5E6] dark:bg-[#8A7233]/25 px-2 py-0.5 rounded-md w-fit block">
                          {relatedPost.category}
                        </span>
                        <h3 className="text-base font-extrabold text-foreground leading-snug group-hover:text-[#9B1B30] dark:group-hover:text-[#E6C97A] transition-colors line-clamp-2">
                          <Link href={relUrl}>
                            {relatedPost.title}
                          </Link>
                        </h3>
                        <p className="text-xs text-muted-foreground/90 font-medium line-clamp-2">
                          {relatedPost.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-900 text-[11px] text-muted-foreground font-semibold">
                        <span>{relatedPost.publishDate}</span>
                        <span>{relatedPost.readTime}</span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* CTA Block */}
        <section className="bg-card border border-[#C9A84C]/25 rounded-2xl p-8 text-center space-y-6 shadow-md max-w-2xl mx-auto">
          <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center mx-auto text-white shadow-md">
            💍
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-foreground">Build your marriage biodata now</h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Select one of our premium, culturally elegant layout formats and customize it instantly in 10 languages for free.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="rounded-full bg-gradient-primary border-0 font-bold px-8 shadow-md" asChild>
              <Link href="/edit">Start Creating</Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full border-[#C9A84C]/50 text-foreground font-bold px-8" asChild>
              <Link href="/biodata-templates">View Themes</Link>
            </Button>
          </div>
        </section>

      </div>
    </div>
  );
}
