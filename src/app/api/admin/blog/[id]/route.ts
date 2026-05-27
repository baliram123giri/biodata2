import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

async function getSessionUser() {
  const session = await getServerSession(authOptions);
  return (session?.user as any) || null;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || (sessionUser.role !== "admin" && sessionUser.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { title, description, slug, publishDate, readTime, category, author, content } = body;

    const existingPost = await prisma.blogPost.findUnique({
      where: { id }
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    const data: any = {};
    if (typeof title === "string") data.title = title;
    if (typeof description === "string") data.description = description;
    if (typeof publishDate === "string") data.publishDate = publishDate;
    if (typeof readTime === "string") data.readTime = readTime;
    if (typeof category === "string") data.category = category;
    if (typeof author === "string") data.author = author;
    if (typeof content === "string") data.content = content;

    if (typeof slug === "string" && slug.trim()) {
      const finalSlug = slug
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");

      if (finalSlug !== existingPost.slug) {
        // Verify unique slug
        const duplicate = await prisma.blogPost.findUnique({
          where: { slug: finalSlug }
        });
        if (duplicate) {
          return NextResponse.json({ error: "A blog post with this slug already exists" }, { status: 400 });
        }
        data.slug = finalSlug;
      }
    } else if (typeof title === "string" && !slug) {
      // Re-generate slug if title changed and slug not specified
      const finalSlug = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      
      if (finalSlug !== existingPost.slug) {
        const duplicate = await prisma.blogPost.findUnique({
          where: { slug: finalSlug }
        });
        if (!duplicate) {
          data.slug = finalSlug;
        }
      }
    }

    const updatedPost = await prisma.blogPost.update({
      where: { id },
      data,
    });

    return NextResponse.json({ post: updatedPost });
  } catch (error: any) {
    console.error("Update blog post error:", error);
    return NextResponse.json({ error: error.message || "Failed to update blog post" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || (sessionUser.role !== "admin" && sessionUser.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.blogPost.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete blog post error:", error);
    return NextResponse.json({ error: "Failed to delete blog post" }, { status: 500 });
  }
}
