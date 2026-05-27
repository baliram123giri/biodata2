import type { Metadata } from "next";
import Link from "next/link";
import NextImage from "next/image";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { generateArticleSchema } from "@/lib/seo-schemas";
import { JsonLd } from "@/components/seo/JsonLd";

export const dynamic = "force-dynamic";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(
  props: BlogPostPageProps
): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await prisma.blogPost.findUnique({
    where: { slug }
  });

  if (!post) {
    return {
      title: "Article Not Found | biodata99.com",
    };
  }

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `https://biodata99.com/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://biodata99.com/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage(props: BlogPostPageProps) {
  const { slug } = await props.params;
  const post = await prisma.blogPost.findUnique({
    where: { slug }
  });

  if (!post) {
    notFound();
  }

  const articleSchema = generateArticleSchema({
    title: post.title,
    description: post.description,
    slug: post.slug,
    author: post.author,
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#FFFBF8] dark:bg-[#1A0A0E] pt-24 pb-20 px-4">
      {/* JSON-LD Article Schema */}
      <JsonLd schema={articleSchema} />

      {/* Decorative Ornaments */}
      <div className="absolute top-0 right-0 w-[40%] h-[40%] rounded-full bg-gradient-to-tr from-[#9B1B30]/5 to-[#C9A84C]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40%] h-[40%] rounded-full bg-gradient-to-br from-[#C9A84C]/5 to-[#9B1B30]/5 blur-[120px] pointer-events-none" />

      <div className="container mx-auto max-w-3xl relative z-10 space-y-8">

        {/* Back Link */}
        <Button variant="ghost" size="sm" className="rounded-full gap-1.5 hover:bg-muted text-muted-foreground hover:text-foreground" asChild>
          <Link href="/blog">
            <ArrowLeft className="w-4 h-4" />
            Back to Articles
          </Link>
        </Button>

        {/* Article Header block */}
        <div className="space-y-6 border-b border-border/40 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-[#FBF5E6] dark:bg-[#8A7233]/25 text-[#8A7233] dark:text-[#E6C97A] border border-[#C9A84C]/20 w-fit">
            {post.category}
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-tight">
            {post.title}
          </h1>

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
        </div>

        {/* Thumbnail Image Cover */}
        {post.thumbnailUrl && (
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-[#C9A84C]/15 bg-muted shadow-md">
            <NextImage
              src={post.thumbnailUrl}
              alt={post.title}
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

        {/* CTA Block */}
        <div className="bg-card border border-[#C9A84C]/25 rounded-2xl p-8 text-center space-y-6 shadow-md max-w-2xl mx-auto">
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
              <Link href="/templates">View Themes</Link>
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
