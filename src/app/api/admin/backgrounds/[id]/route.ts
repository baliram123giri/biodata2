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
    console.log(`Cloudinary background deleted [${publicId}]:`, result);
  } catch (error) {
    console.error(`Failed to delete Cloudinary background [${publicId}]:`, error);
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

    const existing = await prisma.background.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Background not found" }, { status: 404 });
    }

    // Delete image from Cloudinary
    await deleteFromCloudinary(existing.url);

    // Delete from database
    await prisma.background.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Background deleted successfully" });
  } catch (error: any) {
    console.error("Delete background error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function uploadToCloudinary(fileStr: string, folder: string): Promise<string> {
  try {
    const options = {
      folder: `matrimonial/${folder}`,
      resource_type: "auto" as const,
    };
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
    const { name, file } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const existing = await prisma.background.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Background not found" }, { status: 404 });
    }

    const updateData: any = {
      name: name.trim(),
    };

    if (file) {
      // 1. Upload new background file to Cloudinary
      const secureUrl = await uploadToCloudinary(file, "backgrounds");
      updateData.url = secureUrl;

      // 2. Delete the old background file from Cloudinary
      if (existing.url) {
        await deleteFromCloudinary(existing.url);
      }
    }

    const updated = await prisma.background.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, background: updated });
  } catch (error: any) {
    console.error("Update background error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}


