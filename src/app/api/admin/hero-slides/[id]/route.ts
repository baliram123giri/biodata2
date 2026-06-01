import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiCache } from "@/lib/api-cache";
import { HERO_SLIDES_CACHE_KEY } from "../route";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import cloudinary from "@/lib/cloudinary";

async function getSessionUser() {
  const session = await getServerSession(authOptions);
  return (session?.user as any) || null;
}

// Utility to parse public_id from Cloudinary secure_url
function getCloudinaryPublicId(url: string): string | null {
  try {
    const uploadIndex = url.indexOf("/image/upload/");
    if (uploadIndex === -1) return null;
    
    const pathAfterUpload = url.substring(uploadIndex + "/image/upload/".length);
    const pathParts = pathAfterUpload.split("/");
    
    // Remove version number prefix if present (e.g. v17123982)
    if (pathParts[0].startsWith("v") && /^\d+$/.test(pathParts[0].substring(1))) {
      pathParts.shift();
    }
    
    const fullPublicId = pathParts.join("/");
    const dotIndex = fullPublicId.lastIndexOf(".");
    if (dotIndex !== -1) {
      return fullPublicId.substring(0, dotIndex);
    }
    return fullPublicId;
  } catch (error) {
    console.error("Cloudinary parsing error:", error);
    return null;
  }
}

// Helper to upload or replace base64 image on Cloudinary
async function uploadToCloudinary(fileStr: string, folder: string, existingPublicId?: string | null) {
  try {
    const options: any = {
      resource_type: "auto",
    };

    if (existingPublicId) {
      // Overwrite the existing asset directly so Cloudinary keeps the same URL/filename and doesn't create a new one!
      options.public_id = existingPublicId;
      options.overwrite = true;
      options.invalidate = true; // Clear Cloudinary CDN cache instantly so the edited slide updates in real-time
    } else {
      options.folder = `biodata/${folder}`;
    }

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
    const { title, order, active, imageFile } = body;

    // Fetch the existing slide to see if we need to replace its image
    const existingSlide = await prisma.heroSlide.findUnique({
      where: { id },
    });

    if (!existingSlide) {
      return NextResponse.json({ error: "Hero slide not found" }, { status: 404 });
    }

    const data: any = {};
    if (typeof title === "string") data.title = title;
    if (typeof order === "number") data.order = order;
    if (typeof active === "boolean") data.active = active;

    // If a new image file is provided, overwrite the existing Cloudinary asset
    if (imageFile) {
      const existingPublicId = getCloudinaryPublicId(existingSlide.imageUrl);
      console.log(`Replacing existing Cloudinary asset. Public ID parsed: ${existingPublicId || "None (New Upload)"}`);
      
      const imageUrl = await uploadToCloudinary(imageFile, "hero_slides", existingPublicId);
      data.imageUrl = imageUrl;
    }

    const slide = await prisma.heroSlide.update({
      where: { id },
      data,
    });

    // Invalidate cache
    apiCache.invalidate(HERO_SLIDES_CACHE_KEY);

    return NextResponse.json({ slide });
  } catch (error: any) {
    console.error("Update hero slide error:", error);
    return NextResponse.json({ error: error.message || "Failed to update hero slide" }, { status: 500 });
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

    const existingSlide = await prisma.heroSlide.findUnique({
      where: { id },
    });

    if (existingSlide) {
      // Optional/Premium clean-up: delete the image from Cloudinary when the slide is purged
      const publicId = getCloudinaryPublicId(existingSlide.imageUrl);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
          console.log(`Successfully deleted Cloudinary asset: ${publicId}`);
        } catch (cloudinaryErr) {
          console.error(`Failed to delete Cloudinary asset [${publicId}] on slide delete:`, cloudinaryErr);
        }
      }
    }

    await prisma.heroSlide.delete({
      where: { id },
    });

    // Invalidate cache
    apiCache.invalidate(HERO_SLIDES_CACHE_KEY);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete hero slide error:", error);
    return NextResponse.json({ error: "Failed to delete hero slide" }, { status: 500 });
  }
}
