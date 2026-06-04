import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiCache, TTL } from "@/lib/api-cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { uploadToVPS } from "@/lib/vps-upload";

export const HERO_SLIDES_CACHE_KEY = "admin:hero-slides";

async function getSessionUser() {
  const session = await getServerSession(authOptions);
  return (session?.user as any) || null;
}

// Helper to upload base64 to VPS
async function uploadToCloudinary(fileStr: string, folder: string) {
  return uploadToVPS(fileStr, `biodata/${folder}`);
}

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || (sessionUser.role !== "admin" && sessionUser.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const slides = await apiCache.remember(HERO_SLIDES_CACHE_KEY, TTL.LONG, () =>
      prisma.heroSlide.findMany({
        orderBy: { order: "asc" },
      })
    );

    return NextResponse.json({ slides });
  } catch (error: any) {
    console.error("List admin hero slides error:", error);
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
    const { title, imageFile, order, active } = body;

    if (!imageFile) {
      return NextResponse.json({ error: "Image file is required" }, { status: 400 });
    }

    // Upload high-quality template preview to Cloudinary
    const imageUrl = await uploadToCloudinary(imageFile, "hero_slides");

    const slide = await prisma.heroSlide.create({
      data: {
        title: title || "",
        imageUrl,
        order: typeof order === "number" ? order : 0,
        active: active !== false,
      },
    });

    // Invalidate hero-slides cache
    apiCache.invalidate(HERO_SLIDES_CACHE_KEY);

    return NextResponse.json({ slide });
  } catch (error: any) {
    console.error("Create hero slide error:", error);
    return NextResponse.json({ error: error.message || "Failed to create hero slide" }, { status: 500 });
  }
}
