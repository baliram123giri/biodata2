import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Search, Calendar, Clock, User, ArrowRight } from "lucide-react";
import { blogPosts } from "@/lib/blog-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

interface BlogPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
  }>;
}

export default async function BlogPage(props: BlogPageProps) {
  const searchParams = await props.searchParams;
  const searchQuery = searchParams.search || "";
  const selectedCategory = searchParams.category || "All";

  const categories = ["All", "Biodata Tips", "Cultural Guide", "Style & Grooming"];

  // Filter posts on the server
  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#FFFBF8] dark:bg-[#1A0A0E] pt-24 pb-20 px-4">
      {/* Decorative Ornaments */}
      <div className="absolute top-0 right-0 w-[40%] h-[40%] rounded-full bg-gradient-to-tr from-[#9B1B30]/5 to-[#C9A84C]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40%] h-[40%] rounded-full bg-gradient-to-br from-[#C9A84C]/5 to-[#9B1B30]/5 blur-[120px] pointer-events-none" />

      <div className="container mx-auto max-w-6xl relative z-10 space-y-12">
        {/* Header Block */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#C9A84C]/45 bg-[#FBF5E6]/90 dark:bg-[#8A7233]/25 px-4.5 py-1.5 text-xs font-black text-[#8A7233] dark:text-[#E6C97A]">
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

        {/* Server-Side Search & Categories Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card border border-[#C9A84C]/20 rounded-2xl p-6 shadow-sm">
          {/* Category Tabs as Links */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const queryParams = new URLSearchParams();
              if (category !== "All") queryParams.set("category", category);
              if (searchQuery) queryParams.set("search", searchQuery);
              const href = `/blog${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

              return (
                <Link
                  key={category}
                  href={href}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 ${
                    selectedCategory === category
                      ? "bg-gradient-primary text-white shadow-md font-black"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 border border-border/40"
                  }`}
                >
                  {category}
                </Link>
              );
            })}
          </div>

          {/* Pure HTML Search Form */}
          <form method="GET" action="/blog" className="relative max-w-sm w-full">
            {selectedCategory !== "All" && (
              <input type="hidden" name="category" value={selectedCategory} />
            )}
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              name="search"
              placeholder="Search articles..."
              defaultValue={searchQuery}
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-border bg-background text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </form>
        </div>

        {/* Server-side Articles Grid */}
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <Card
                key={post.slug}
                className="border border-[#C9A84C]/25 bg-card overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col group"
              >
                {/* Image Cover */}
                <div 
                  className="h-44 relative overflow-hidden bg-muted flex items-center justify-center p-3"
                  style={{
                    background: `linear-gradient(135deg, #FFFBF8 0%, #FBF5E6 100%)`,
                    borderBottom: `1px solid rgba(201,168,76,0.15)`
                  }}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(rgba(201,168,76,0.08)_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                  <div className="w-16 h-16 rounded-full border border-dashed border-[#C9A84C]/45 flex items-center justify-center bg-card shadow-inner transition-transform duration-700 group-hover:rotate-12">
                    <span className="text-[#C9A84C] text-2xl font-serif">📖</span>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-card text-[#8A7233] border border-[#C9A84C]/20 shadow-xs">
                      {post.category}
                    </span>
                  </div>
                </div>

                <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-semibold">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {post.publishDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {post.readTime}
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                      <Link href={`/blog/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h3>
                    
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {post.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-border/40 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-bold flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      By {post.author}
                    </span>
                    
                    <Button variant="link" className="p-0 text-primary font-black hover:no-underline flex items-center gap-1 text-sm" asChild>
                      <Link href={`/blog/${post.slug}`}>
                        Read Article <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-card border border-[#C9A84C]/15 rounded-2xl space-y-3 shadow-inner">
            <p className="text-lg font-bold text-foreground">No articles match your search.</p>
            <p className="text-sm text-muted-foreground">Try clearing your filters or typing a different query.</p>
            <Button 
              variant="outline" 
              className="rounded-full border-[#C9A84C]/40"
              asChild
            >
              <Link href="/blog">Reset Filters</Link>
            </Button>
          </div>
        )}

        {/* Bottom CTA Block */}
        <div className="bg-card border border-[#C9A84C]/20 rounded-2xl p-8 max-w-4xl mx-auto shadow-md text-center space-y-4">
          <h3 className="text-xl font-bold text-foreground">Can't decide which template is right?</h3>
          <p className="text-muted-foreground text-sm max-w-2xl mx-auto">
            Don't worry! You can change your template and layout style with a single click inside the editor **without losing any filled details**. Start with any design and customize it later.
          </p>
          <Button size="lg" className="rounded-full bg-gradient-primary border-0 font-bold px-8 shadow-md" asChild>
            <Link href="/edit">Open Creator Studio</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
