import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import cloudinary from "@/lib/cloudinary";

async function getSessionUser() {
  const session = await getServerSession(authOptions);
  return (session?.user as any) || null;
}

function extractCloudinaryPublicId(url: string): string | null {
  if (!url || !url.includes("res.cloudinary.com")) return null;
  try {
    const parts = url.split("/image/upload/");
    if (parts.length < 2) return null;
    
    let path = parts[1];
    const versionMatch = path.match(/^v\d+\/(.+)$/);
    if (versionMatch) {
      path = versionMatch[1];
    }
    
    const dotIndex = path.lastIndexOf(".");
    if (dotIndex !== -1) {
      path = path.substring(0, dotIndex);
    }
    
    return path;
  } catch (err) {
    console.error("Error extracting Cloudinary public_id:", err);
    return null;
  }
}

async function deleteFromCloudinary(url: string) {
  const publicId = extractCloudinaryPublicId(url);
  if (!publicId) return;
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(`Cloudinary sticker deleted [${publicId}]:`, result);
  } catch (error) {
    console.error(`Failed to delete Cloudinary sticker [${publicId}]:`, error);
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

    const existing = await prisma.sticker.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Sticker not found" }, { status: 404 });
    }

    // Delete image from Cloudinary
    await deleteFromCloudinary(existing.url);

    // Delete from database
    await prisma.sticker.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Sticker deleted successfully" });
  } catch (error: any) {
    console.error("Delete sticker error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
