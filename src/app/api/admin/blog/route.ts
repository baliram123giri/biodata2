import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

async function getSessionUser() {
  const session = await getServerSession(authOptions);
  return (session?.user as any) || null;
}

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || (sessionUser.role !== "admin" && sessionUser.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const posts = await prisma.blogPost.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ posts });
  } catch (error: any) {
    console.error("List admin blog posts error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || (sessionUser.role !== "admin" && sessionUser.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, slug, publishDate, readTime, category, author, content } = body;

    if (!title || !description || !content) {
      return NextResponse.json({ error: "Title, description, and content are required fields" }, { status: 400 });
    }

    // Auto-generate slug from title if not supplied
    const finalSlug = (slug || title)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Check slug uniqueness
    const existing = await prisma.blogPost.findUnique({
      where: { slug: finalSlug }
    });

    if (existing) {
      return NextResponse.json({ error: "A blog post with this slug or title already exists" }, { status: 400 });
    }

    // Default publishDate to current date formatted
    const finalPublishDate = publishDate || new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });

    // Auto-estimate read time if not provided
    const words = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
    const estimatedMinutes = Math.max(1, Math.ceil(words / 200));
    const finalReadTime = readTime || `${estimatedMinutes} min read`;

    const post = await prisma.blogPost.create({
      data: {
        title,
        description,
        slug: finalSlug,
        publishDate: finalPublishDate,
        readTime: finalReadTime,
        category: category || "Biodata Tips",
        author: author || sessionUser.name || "Admin",
        content,
      },
    });

    return NextResponse.json({ post });
  } catch (error: any) {
    console.error("Create blog post error:", error);
    return NextResponse.json({ error: error.message || "Failed to create blog post" }, { status: 500 });
  }
}
