import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import cloudinary from "@/lib/cloudinary";

async function getSessionUser() {
  const session = await getServerSession(authOptions);
  return (session?.user as any) || null;
}

// Helper to upload base64 to Cloudinary
async function uploadToCloudinary(fileStr: string, folder: string) {
  try {
    const options: any = {
      folder: `biodata/${folder}`,
      resource_type: "auto",
    };

    const mimeMatch = fileStr.match(/^data:([^;]+);base64,/);
    if (mimeMatch) {
      const mime = mimeMatch[1];
      if (mime === "image/png") {
        options.format = "png";
      } else if (mime === "image/jpeg" || mime === "image/jpg") {
        options.format = "jpg";
      } else if (mime === "image/webp") {
        options.format = "webp";
      }
    }

    const uploadRes = await cloudinary.uploader.upload(fileStr, options);
    return uploadRes.secure_url;
  } catch (error) {
    console.error(`Cloudinary upload error [${folder}]:`, error);
    throw new Error("Failed to upload asset to Cloudinary");
  }
}

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || (sessionUser.role !== "admin" && sessionUser.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const slides = await prisma.heroSlide.findMany({
      orderBy: { order: "asc" },
    });

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

    return NextResponse.json({ slide });
  } catch (error: any) {
    console.error("Create hero slide error:", error);
    return NextResponse.json({ error: error.message || "Failed to create hero slide" }, { status: 500 });
  }
}
