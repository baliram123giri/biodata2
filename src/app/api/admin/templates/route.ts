import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import cloudinary from "@/lib/cloudinary";

async function getSessionUser() {
  const session = await getServerSession(authOptions);
  return (session?.user as any) || null;
}

// Convert a standard Cloudinary URL to one that supports dynamic tinting color replacements
function makeColorizableCloudinaryUrl(url: string): string {
  if (url.includes("res.cloudinary.com") && url.includes("/image/upload/")) {
    // Avoid doubling if already format
    if (url.includes("{color}")) return url;
    
    // If it is an SVG, keep it as vector and don't convert to PNG/WebP (avoid f_auto)
    if (url.toLowerCase().endsWith(".svg") || url.toLowerCase().includes(".svg?")) {
      return url.replace("/image/upload/", "/image/upload/e_tint:100:rgb:{color}/");
    }
    
    return url.replace("/image/upload/", "/image/upload/f_auto,q_auto,e_tint:100:rgb:{color}/");
  }
  return url;
}

// Helper to upload base64 to Cloudinary
async function uploadToCloudinary(fileStr: string, folder: string) {
  try {
    const options: any = {
      folder: `biodata/${folder}`,
      resource_type: "auto",
    };

    // Extract original extension from base64 header
    const mimeMatch = fileStr.match(/^data:([^;]+);base64,/);
    if (mimeMatch) {
      const mime = mimeMatch[1];
      if (mime === "image/svg+xml") {
        options.format = "svg";
      } else if (mime === "image/png") {
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

    const templates = await prisma.template.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ templates });
  } catch (error: any) {
    console.error("List admin templates error:", error);
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
    const {
      name,
      description,
      defaultPrimary,
      defaultSecondary,
      defaultAccent,
      defaultPadding,
      defaultYPadding,
      photoX,
      photoY,
      photoWidth,
      photoHeight,
      photoCornerRadius,
      frameType,
      frameBgColor,
      frameOuterInset,
      frameOuterStrokeWidth,
      frameOuterCornerRadius,
      frameInnerInset,
      frameInnerStrokeWidth,
      frameInnerCornerRadius,
      frameHasCornerCurves,
      frameGradientColors,
      frameBgType,
      frameBgGradientColors,
      frameComponentId,
      frameFile, // base64 string
      thumbnailFile, // base64 string
    } = body;

    if (!name || !defaultPrimary || !defaultSecondary || !defaultAccent || !frameType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let frameUrlTemplate = body.frameUrlTemplate || "";
    let thumbnailUrl = body.thumbnailUrl || "";

    // Upload frame image file if provided as Base64
    if (frameType === "image" && frameFile) {
      if (frameFile.startsWith("data:image/svg+xml")) {
        frameUrlTemplate = frameFile;
      } else {
        const secureUrl = await uploadToCloudinary(frameFile, "frames");
        frameUrlTemplate = makeColorizableCloudinaryUrl(secureUrl);
      }
    }

    // Upload thumbnail if provided as Base64
    if (thumbnailFile) {
      thumbnailUrl = await uploadToCloudinary(thumbnailFile, "thumbnails");
    }

    const template = await prisma.template.create({
      data: {
        name,
        description: description || "",
        defaultPrimary,
        defaultSecondary,
        defaultAccent,
        defaultPadding: parseInt(defaultPadding) || 60,
        defaultYPadding: defaultYPadding ? parseInt(defaultYPadding) : null,
        photoX: parseInt(photoX) ?? 390,
        photoY: parseInt(photoY) ?? 100,
        photoWidth: parseInt(photoWidth) ?? 140,
        photoHeight: parseInt(photoHeight) ?? 175,
        photoCornerRadius: parseInt(photoCornerRadius) ?? 8,
        frameType,
        frameBgType: frameBgType || "solid",
        frameBgColor: frameBgColor || "#ffffff",
        frameBgGradientColors: frameBgGradientColors || [],
        frameUrlTemplate,
        frameOuterInset: frameOuterInset ? parseInt(frameOuterInset) : null,
        frameOuterStrokeWidth: frameOuterStrokeWidth ? parseInt(frameOuterStrokeWidth) : null,
        frameOuterCornerRadius: frameOuterCornerRadius ? parseInt(frameOuterCornerRadius) : null,
        frameInnerInset: frameInnerInset ? parseInt(frameInnerInset) : null,
        frameInnerStrokeWidth: frameInnerStrokeWidth ? parseInt(frameInnerStrokeWidth) : null,
        frameInnerCornerRadius: frameInnerCornerRadius ? parseInt(frameInnerCornerRadius) : null,
        frameHasCornerCurves: frameHasCornerCurves === true,
        frameGradientColors: frameGradientColors || [],
        frameComponentId: frameComponentId || null,
        thumbnailUrl,
        active: true,
      },
    });

    return NextResponse.json({ success: true, template });
  } catch (error: any) {
    console.error("Create template error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
