"use client";

import { useState } from "react";
import Link from "next/link";
import { BlogPost } from "@/lib/blog-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Calendar, Clock, User, ArrowRight } from "lucide-react";

interface BlogListWrapperProps {
  posts: BlogPost[];
}

export function BlogListWrapper({ posts }: BlogListWrapperProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Biodata Tips", "Cultural Guide", "Style & Grooming"];

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-12">
      {/* Search & Categories Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card border border-[#C9A84C]/20 rounded-2xl p-6 shadow-sm">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                selectedCategory === category
                  ? "bg-gradient-primary text-white shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 border border-border/40"
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-border bg-background text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Articles Grid */}
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <Card
              key={post.slug}
              className="border border-[#C9A84C]/25 bg-card overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col group"
            >
              {/* Dummy Image Cover */}
              <div 
                className="h-44 relative overflow-hidden bg-muted flex items-center justify-center p-3"
                style={{
                  background: `linear-gradient(135deg, #FFFBF8 0%, #FBF5E6 100%)`,
                  borderBottom: `1px solid rgba(201,168,76,0.15)`
                }}
              >
                {/* Traditional Decorative Pattern Background */}
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
                  {/* Meta Details */}
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
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
            }}
          >
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
}
