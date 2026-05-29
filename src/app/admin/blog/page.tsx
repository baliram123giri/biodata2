"use client";

import * as React from "react";
import NextImage from "next/image";
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Edit3, 
  Calendar, 
  Clock, 
  User, 
  Search, 
  Loader2, 
  ExternalLink,
  Heading2,
  Heading3,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Eye,
  Sparkles,
  Image as ImageIcon,
  Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger, 
  DialogFooter,
  DialogDescription 
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";
import Link from "next/link";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import ImageExtension from "@tiptap/extension-image";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnailUrl?: string | null;
  publishDate: string;
  readTime: string;
  category: string;
  language: string;
  author: string;
  content: string;
  createdAt: string;
}

export default function AdminBlogPosts() {
  const queryClient = useQueryClient();
  const { data: postsData, isLoading } = useQuery({
    queryKey: ["admin", "blog"],
    queryFn: async () => {
      const res = await fetch("/api/admin/blog");
      if (!res.ok) throw new Error("Failed to load blog posts");
      const json = await res.json();
      return (json.posts || []) as BlogPost[];
    },
    staleTime: Infinity, // Cache until page refresh
  });
  const posts = postsData || [];

  const [isSubmitLoading, setIsSubmitLoading] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingPost, setEditingPost] = React.useState<BlogPost | null>(null);
  const [activeTab, setActiveTab] = React.useState("write");
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("All");

  // Form State
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [category, setCategory] = React.useState("Biodata Tips");
  const [language, setLanguage] = React.useState("English");
  const [thumbnailUrl, setThumbnailUrl] = React.useState("");
  const [isThumbnailUploading, setIsThumbnailUploading] = React.useState(false);
  const [author, setAuthor] = React.useState("");
  const [content, setContent] = React.useState("");
  const [publishDate, setPublishDate] = React.useState("");
  const [readTime, setReadTime] = React.useState("");

  const categories = ["Biodata Tips", "Cultural Guide", "Style & Grooming"];
  const languages = ["English", "Marathi (मराठी)", "Hindi (हिंदी)", "Gujarati (ગુજરાતી)"];
  const [languageFilter, setLanguageFilter] = React.useState("All");

  // Initialize Tiptap WYSIWYG editor with Placeholder and custom typography styling
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: "Start writing your matrimonial guide here... Select headings, bold highlights, quotes, or custom alerts from the toolbar above to style your content in real-time.",
        emptyNodeClass: "is-editor-empty",
      }),
      ImageExtension.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full my-4 mx-auto block border border-border shadow-sm",
        },
      }),
    ],
    content: "",
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[260px] prose dark:prose-invert prose-sm max-w-none text-foreground p-4 bg-background border border-border border-t-0 rounded-b-lg tiptap-content-canvas",
      },
    },
  });

  // Sync Form and Tiptap state
  React.useEffect(() => {
    if (editingPost) {
      setTitle(editingPost.title);
      setDescription(editingPost.description);
      setSlug(editingPost.slug);
      setCategory(editingPost.category);
      setLanguage(editingPost.language || "English");
      setThumbnailUrl(editingPost.thumbnailUrl || "");
      setAuthor(editingPost.author);
      setContent(editingPost.content);
      setPublishDate(editingPost.publishDate);
      setReadTime(editingPost.readTime);
      if (editor) {
        editor.commands.setContent(editingPost.content);
      }
    } else {
      setTitle("");
      setDescription("");
      setSlug("");
      setCategory("Biodata Tips");
      setLanguage("English");
      setThumbnailUrl("");
      setAuthor("");
      setContent("");
      setPublishDate("");
      setReadTime("");
      if (editor) {
        editor.commands.setContent("");
      }
    }
    setActiveTab("write");
  }, [editingPost, isDialogOpen, editor]);

  const handleOpenEdit = (post: BlogPost) => {
    setEditingPost(post);
    setIsDialogOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingPost(null);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !content) {
      toast.error("Title, description, and content are required fields");
      return;
    }

    setIsSubmitLoading(true);
    try {
      const payload = {
        title,
        description,
        slug,
        category,
        language,
        thumbnailUrl: thumbnailUrl || null,
        author,
        content,
        publishDate: publishDate || undefined,
        readTime: readTime || undefined,
      };

      const url = editingPost 
        ? `/api/admin/blog/${editingPost.id}` 
        : "/api/admin/blog";
      
      const method = editingPost ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(editingPost ? "Blog post updated successfully!" : "Blog post created successfully!");
        setIsDialogOpen(false);
        setEditingPost(null);
        queryClient.invalidateQueries({ queryKey: ["admin", "blog"] });
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to save blog post");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while saving the blog post");
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this blog post?")) return;

    try {
      const res = await fetch(`/api/admin/blog/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Blog post deleted successfully!");
        queryClient.invalidateQueries({ queryKey: ["admin", "blog"] });
      } else {
        toast.error("Failed to delete blog post");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === "All" || post.category === categoryFilter;
    const matchesLanguage = languageFilter === "All" || post.language === languageFilter;

    return matchesSearch && matchesCategory && matchesLanguage;
  });

  return (
    <div className="space-y-6 text-foreground max-w-7xl mx-auto">
      {/* Dynamic self-contained styled stylesheet for Tiptap editor canvas */}
      <style dangerouslySetInnerHTML={{ __html: `
        .tiptap-content-canvas p.is-editor-empty:first-child::before {
          color: #64748b;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
          font-style: italic;
          line-height: 1.6;
          font-size: 0.85rem;
        }
        .tiptap-content-canvas {
          outline: none !important;
          font-size: 0.9rem;
          line-height: 1.6;
          transition: all 0.2s ease;
        }
        .tiptap-content-canvas p {
          margin-bottom: 0.85rem;
        }
        .tiptap-content-canvas p:last-child {
          margin-bottom: 0;
        }
        .tiptap-content-canvas h2 {
          font-size: 1.25rem;
          font-weight: 850;
          margin-top: 1.5rem;
          margin-bottom: 0.6rem;
          color: var(--foreground);
          letter-spacing: -0.025em;
        }
        .tiptap-content-canvas h3 {
          font-size: 1.1rem;
          font-weight: 750;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
          color: var(--foreground);
        }
        .tiptap-content-canvas ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 0.85rem;
        }
        .tiptap-content-canvas ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin-bottom: 0.85rem;
        }
        .tiptap-content-canvas li {
          margin-bottom: 0.25rem;
        }
        .tiptap-content-canvas blockquote {
          border-left: 4px solid var(--primary);
          padding-left: 1.1rem;
          font-style: italic;
          color: #94a3b8;
          margin: 1.2rem 0;
          background: rgba(201, 168, 76, 0.04);
          padding-top: 0.4rem;
          padding-bottom: 0.4rem;
          border-radius: 0 4px 4px 0;
        }
        .tiptap-content-canvas-focused {
          border-color: var(--primary) !important;
          box-shadow: 0 0 0 2px rgba(201, 168, 76, 0.15) !important;
        }
      ` }} />

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-primary" />
            Manage Matrimonial Articles
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Write and moderate SEO-rich marriage biodata guides, styling tips, and cultural custom articles.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Button 
            onClick={handleOpenCreate}
            className="rounded-lg bg-gradient-primary border-0 font-bold tracking-wide shadow-md hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            Write New Post
          </Button>
          
          <DialogContent className="sm:max-w-[850px] max-h-[92vh] overflow-hidden bg-card border border-border rounded-xl shadow-xl flex flex-col p-0">
            <DialogHeader className="p-6 pb-2">
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                {editingPost ? "Edit Blog Article" : "Write New Blog Article"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Write premium matrimonial guides. Use the WYSIWYG HTML Toolbar below to style lists, headings, blocks, and look at live styled previews in real-time.
              </DialogDescription>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col px-6">
              <TabsList className="mb-4">
                <TabsTrigger value="write" className="flex items-center gap-1">
                  <Edit3 className="w-3.5 h-3.5" /> Write WYSIWYG
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-primary" /> Live Styled Preview
                </TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col space-y-4 pb-6">
                <TabsContent value="write" className="flex-1 overflow-y-auto pr-1 space-y-4 outline-none">
                  {/* Metadata Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="post-title" className="text-xs font-bold text-muted-foreground">Article Title *</Label>
                      <Input
                        id="post-title"
                        type="text"
                        required
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="e.g. 5 Mistakes to Avoid in Marriage Biodata"
                        className="focus-visible:ring-primary rounded-lg"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="post-slug" className="text-xs font-bold text-muted-foreground">Custom URL Slug (Optional)</Label>
                      <Input
                        id="post-slug"
                        type="text"
                        value={slug}
                        onChange={e => setSlug(e.target.value)}
                        placeholder="e.g. mistakes-to-avoid-biodata"
                        className="focus-visible:ring-primary rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-muted-foreground">Category *</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="focus:ring-primary rounded-lg">
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-muted-foreground">Language *</Label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="focus:ring-primary rounded-lg">
                          <SelectValue placeholder="Select Language" />
                        </SelectTrigger>
                        <SelectContent>
                          {languages.map((lang) => (
                            <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="post-author" className="text-xs font-bold text-muted-foreground">Author Name</Label>
                      <Input
                        id="post-author"
                        type="text"
                        value={author}
                        onChange={e => setAuthor(e.target.value)}
                        placeholder="e.g. Rohan Deshmukh"
                        className="focus-visible:ring-primary rounded-lg"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="post-readtime" className="text-xs font-bold text-muted-foreground">Read Time (Optional)</Label>
                      <Input
                        id="post-readtime"
                        type="text"
                        value={readTime}
                        onChange={e => setReadTime(e.target.value)}
                        placeholder="e.g. 5 min read"
                        className="focus-visible:ring-primary rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="post-desc" className="text-xs font-bold text-muted-foreground">Brief Meta Description *</Label>
                    <Textarea
                      id="post-desc"
                      required
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Summarise the article for search results and social previews..."
                      className="focus-visible:ring-primary rounded-lg resize-none min-h-[60px]"
                    />
                  </div>

                  {/* Thumbnail Image Uploader */}
                  <div className="border border-border/60 bg-muted/20 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="space-y-1 w-full">
                      <Label className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5 text-primary" /> Blog Post Thumbnail Image
                      </Label>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        Upload a thumbnail image to represent this blog post in the article grids, search engines, and social share cards. Max size 2MB.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {thumbnailUrl && (
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-border bg-card shadow-xs group">
                          <NextImage
                            src={thumbnailUrl}
                            alt="Post thumbnail"
                            fill
                            sizes="64px"
                            className="object-cover"
                            loading="lazy"
                          />
                          <button
                            type="button"
                            onClick={() => setThumbnailUrl("")}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] text-white font-bold cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      )}

                      <div className="relative">
                        <input
                          id="thumbnail-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.size > 2 * 1024 * 1024) {
                              toast.error("File size exceeds 2MB limit");
                              return;
                            }
                            setIsThumbnailUploading(true);
                            try {
                              const reader = new FileReader();
                              reader.onloadend = async () => {
                                try {
                                  const res = await fetch("/api/admin/upload", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ file: reader.result, folder: "blog" }),
                                  });
                                  const data = await res.json();
                                  if (data.success) {
                                    setThumbnailUrl(data.url);
                                    toast.success("Thumbnail uploaded successfully!");
                                  } else {
                                    toast.error(data.error || "Failed to upload thumbnail");
                                  }
                                } catch (err) {
                                  toast.error("An error occurred during upload");
                                } finally {
                                  setIsThumbnailUploading(false);
                                }
                              };
                              reader.readAsDataURL(file);
                            } catch (err) {
                              setIsThumbnailUploading(false);
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isThumbnailUploading}
                          className="h-10 text-xs font-bold rounded-lg border-border/80 bg-card hover:bg-muted/50 cursor-pointer"
                          onClick={() => document.getElementById("thumbnail-upload")?.click()}
                        >
                          {isThumbnailUploading ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin text-primary" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5 mr-2" />
                              {thumbnailUrl ? "Change Image" : "Upload Image"}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* WYSIWYG HTML Content & Toolbar */}
                  <div className="space-y-1.5 flex flex-col">
                    <Label className="text-xs font-bold text-muted-foreground">Article Body Content (WYSIWYG Rich Text) *</Label>

                    {editor && (
                      <div className={`flex flex-col border rounded-lg overflow-hidden transition-all duration-200 ${
                        editor.isFocused ? "border-primary ring-2 ring-primary/15" : "border-border"
                      }`}>
                        {/* Editor Action Toolbar */}
                        <div className="flex flex-wrap gap-1 bg-muted p-2 border-b border-border">
                          <button
                            type="button"
                            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                            className={`p-1.5 rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                              editor.isActive("heading", { level: 2 }) ? "bg-primary text-primary-foreground" : "bg-card hover:bg-primary/10 text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <Heading2 className="w-3.5 h-3.5" /> H2
                          </button>
                          <button
                            type="button"
                            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                            className={`p-1.5 rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                              editor.isActive("heading", { level: 3 }) ? "bg-primary text-primary-foreground" : "bg-card hover:bg-primary/10 text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <Heading3 className="w-3.5 h-3.5" /> H3
                          </button>
                          <button
                            type="button"
                            onClick={() => editor.chain().focus().toggleBold().run()}
                            className={`p-1.5 rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                              editor.isActive("bold") ? "bg-primary text-primary-foreground" : "bg-card hover:bg-primary/10 text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <Bold className="w-3.5 h-3.5" /> Bold
                          </button>
                          <button
                            type="button"
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                            className={`p-1.5 rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                              editor.isActive("italic") ? "bg-primary text-primary-foreground" : "bg-card hover:bg-primary/10 text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <Italic className="w-3.5 h-3.5" /> Italic
                          </button>
                          <button
                            type="button"
                            onClick={() => editor.chain().focus().toggleBulletList().run()}
                            className={`p-1.5 rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                              editor.isActive("bulletList") ? "bg-primary text-primary-foreground" : "bg-card hover:bg-primary/10 text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <List className="w-3.5 h-3.5" /> Bullets
                          </button>
                          <button
                            type="button"
                            onClick={() => editor.chain().focus().toggleOrderedList().run()}
                            className={`p-1.5 rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                              editor.isActive("orderedList") ? "bg-primary text-primary-foreground" : "bg-card hover:bg-primary/10 text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <ListOrdered className="w-3.5 h-3.5" /> Numbers
                          </button>
                          <button
                            type="button"
                            onClick={() => editor.chain().focus().toggleBlockquote().run()}
                            className={`p-1.5 rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                              editor.isActive("blockquote") ? "bg-primary text-primary-foreground" : "bg-card hover:bg-primary/10 text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <Quote className="w-3.5 h-3.5" /> Quote
                          </button>
                          
                          <input
                            id="rich-image-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              toast.info("Uploading image to content editor...");
                              try {
                                const reader = new FileReader();
                                reader.onloadend = async () => {
                                  try {
                                    const res = await fetch("/api/admin/upload", {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({ file: reader.result, folder: "blog" }),
                                    });
                                    const data = await res.json();
                                    if (data.success) {
                                      editor.chain().focus().setImage({ src: data.url }).run();
                                      toast.success("Image inserted successfully!");
                                    } else {
                                      toast.error(data.error || "Failed to upload image");
                                    }
                                  } catch (err) {
                                    toast.error("An error occurred during upload");
                                  }
                                };
                                reader.readAsDataURL(file);
                              } catch (err) {
                                toast.error("An error occurred reading image");
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => document.getElementById("rich-image-upload")?.click()}
                            className="p-1.5 rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-all bg-card hover:bg-primary/10 text-muted-foreground hover:text-foreground"
                          >
                            <ImageIcon className="w-3.5 h-3.5" /> Insert Image
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => {
                              // Insert a premium styled container block
                              editor.chain().focus().insertContent('<div class="bg-[#9B1B30]/5 border-l-4 border-[#9B1B30] p-4.5 rounded-r-xl my-4 text-sm"><strong>Premium Tip:</strong> Enter your detail text here...</div>').run();
                            }}
                            className="p-1.5 rounded text-xs font-semibold bg-card hover:bg-primary/10 text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-1 transition-all"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 animate-pulse" /> Add Alert Box
                          </button>
                        </div>

                        {/* Tiptap content canvas */}
                        <EditorContent editor={editor} />
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="preview" className="flex-1 overflow-y-auto pr-1 outline-none border border-border bg-[#FFFBF8] dark:bg-[#1A0A0E] rounded-xl p-6 shadow-inner">
                  {/* Live Rendered Article inside public styled block */}
                  <div className="max-w-2xl mx-auto space-y-6">
                    <div className="space-y-4 border-b border-border/40 pb-6">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#FBF5E6] dark:bg-[#8A7233]/25 text-[#8A7233] dark:text-[#E6C97A] border border-[#C9A84C]/20">
                        {category}
                      </div>

                      <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground leading-tight">
                        {title || "Untitled Article"}
                      </h1>

                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground font-semibold">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-[#C9A84C]" />
                          By {author || "Administrator"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#C9A84C]" />
                          {publishDate || new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#C9A84C]" />
                          {readTime || "1 min read"}
                        </span>
                      </div>
                    </div>

                    {/* Article Render */}
                    <article
                      className="prose max-w-none dark:prose-invert prose-headings:text-foreground prose-headings:font-black prose-headings:text-xl prose-p:text-muted-foreground prose-p:leading-relaxed prose-li:text-muted-foreground prose-ul:list-disc prose-ul:pl-6 space-y-6 pt-2 pb-6 text-foreground"
                      dangerouslySetInnerHTML={{ 
                        __html: content || "<p class='text-muted-foreground italic text-xs'>Type some content in the Write tab and click insert buttons to see a real-time live preview styled exactly as readers will see it on the website...</p>" 
                      }}
                    />
                  </div>
                </TabsContent>

                <div className="border-t border-border pt-4 flex justify-end gap-3 px-6">
                  <DialogFooter className="w-full flex justify-end">
                    <Button
                      type="submit"
                      disabled={isSubmitLoading}
                      className="rounded-lg bg-gradient-primary border-0 font-bold px-8 shadow-md cursor-pointer h-10"
                    >
                      {isSubmitLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving changes...
                        </>
                      ) : (
                        editingPost ? "Update & Save Article" : "Publish Article"
                      )}
                    </Button>
                  </DialogFooter>
                </div>
              </form>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-card border border-border/70 rounded-xl p-4 shadow-xs">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search articles by title..."
            className="pl-9 pr-3 py-1.5 text-xs rounded-lg focus-visible:ring-primary bg-background/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Label className="text-xs font-bold text-muted-foreground whitespace-nowrap">Filter Category:</Label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px] h-9 text-xs focus:ring-primary rounded-lg">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Label className="text-xs font-bold text-muted-foreground whitespace-nowrap">Filter Language:</Label>
            <Select value={languageFilter} onValueChange={setLanguageFilter}>
              <SelectTrigger className="w-[150px] h-9 text-xs focus:ring-primary rounded-lg">
                <SelectValue placeholder="All Languages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Languages</SelectItem>
                {languages.map((lang) => (
                  <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Grid View */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider">Loading articles...</span>
        </div>
      ) : filteredPosts.length === 0 ? (
        <Card className="border border-border/60 bg-card rounded-2xl shadow-sm text-center py-16">
          <CardContent className="space-y-4">
            <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto">
              <BookOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold">No Articles Found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Write informative guides or cultural explainers to draw search engine traffic and help candidates design their marriage biodata.
              </p>
            </div>
            <Button 
              onClick={handleOpenCreate}
              variant="outline" 
              className="rounded-lg border-primary/30 hover:bg-primary/5 text-xs font-bold cursor-pointer"
            >
              Add Your First Article
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="pt-0 pb-0 border border-border bg-card rounded-xl shadow-md flex flex-col justify-between overflow-hidden group hover:shadow-lg transition-all duration-200">
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  {post.thumbnailUrl && (
                    <div className="relative aspect-video w-full overflow-hidden border-b border-border bg-muted">
                      <NextImage
                        src={post.thumbnailUrl}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  )}

                  <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                          {post.category}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#9B1B30]/10 text-[#9B1B30] border border-[#9B1B30]/20">
                          {post.language || "English"}
                        </span>
                      </div>
                      
                      <Link 
                        href={`/blog/${post.slug}`} 
                        target="_blank" 
                        className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 text-[10px] font-bold"
                      >
                        View Post <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="text-base font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors" title={post.title}>
                        {post.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                        {post.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-5 pb-5">
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-muted-foreground font-semibold pt-4 border-t border-border/40">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-primary" />
                      {post.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      {post.publishDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      {post.readTime}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted/20 border-t border-border/40 flex justify-between gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenEdit(post)}
                  className="rounded-lg text-xs h-8 flex-1 font-bold cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                  Edit Post
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeletePost(post.id)}
                  className="rounded-lg text-xs h-8 flex-1 font-bold cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
