import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { BlogListWrapper } from "@/components/blog/BlogListWrapper";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Marriage Biodata Guides & Matrimonial Tips",
  description: "Learn how to write a professional marriage biodata. Read expert tips on profiles, layout formats, regional customs, and matrimonial resume structures.",
  alternates: {
    canonical: "https://biodata99.com/blog",
  },
  openGraph: {
    title: "Marriage Biodata Guides & Matrimonial Tips",
    description: "Learn how to write a professional marriage biodata. Read expert tips on profiles, layout formats, regional customs, and matrimonial resume structures.",
    url: "https://biodata99.com/blog",
  },
};

export default async function BlogPage() {
  // Fetch all posts from DB
  const blogPosts = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#FFFBF8] dark:bg-[#1A0A0E] pt-10 pb-20 px-4">
      {/* Decorative Ornaments */}
      <div className="absolute top-0 right-0 w-[40%] h-[40%] rounded-full bg-gradient-to-tr from-[#9B1B30]/5 to-[#C9A84C]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40%] h-[40%] rounded-full bg-gradient-to-br from-[#C9A84C]/5 to-[#9B1B30]/5 blur-[120px] pointer-events-none" />

      <div className="container mx-auto max-w-6xl relative z-10 space-y-8">
        {/* Header Block */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#C9A84C]/45 bg-[#FBF5E6]/90 dark:bg-[#8A7233]/25 px-4.5 py-1.5 text-xs font-black text-[#9B1B30] dark:text-[#E6C97A]">
            <BookOpen className="w-3.5 h-3.5" />
            Matrimonial Resources
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
            Marriage Biodata <span className="text-gradient-primary">Guides &amp; Tips</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Browse our library of articles, expert guides, and cultural explanations to help you craft the perfect marriage biodata.
          </p>
        </div>

        {/* Dynamic Client-Side Articles & Search Panel */}
        <h2 className="sr-only">Browse Matrimonial Guides &amp; Tips</h2>
        <BlogListWrapper posts={blogPosts as any} />
      </div>
    </div>
  );
}
