import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import cloudinary from "@/lib/cloudinary";

async function getSessionUser() {
  const session = await getServerSession(authOptions);
  return (session?.user as any) || null;
}

function makeColorizableCloudinaryUrl(url: string): string {
  if (url.includes("res.cloudinary.com") && url.includes("/image/upload/")) {
    if (url.includes("{color}")) return url;
    
    // If it is an SVG, keep it as vector and don't convert to PNG/WebP (avoid f_auto)
    if (url.toLowerCase().endsWith(".svg") || url.toLowerCase().includes(".svg?")) {
      return url.replace("/image/upload/", "/image/upload/e_tint:100:rgb:{color}/");
    }
    
    return url.replace("/image/upload/", "/image/upload/f_auto,q_auto,e_tint:100:rgb:{color}/");
  }
  return url;
}

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

    const existing = await prisma.template.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {};

    const fields = [
      "name",
      "description",
      "defaultPrimary",
      "defaultSecondary",
      "defaultAccent",
      "frameType",
      "frameBgType",
      "frameBgColor",
      "frameComponentId",
      "active",
    ];

    fields.forEach((field) => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    const numericFields = [
      "defaultPadding",
      "defaultYPadding",
      "photoX",
      "photoY",
      "photoWidth",
      "photoHeight",
      "photoCornerRadius",
      "frameOuterInset",
      "frameOuterStrokeWidth",
      "frameOuterCornerRadius",
      "frameInnerInset",
      "frameInnerStrokeWidth",
      "frameInnerCornerRadius",
    ];

    numericFields.forEach((field) => {
      if (body[field] !== undefined) {
        updateData[field] = body[field] !== null ? parseInt(body[field]) : null;
      }
    });

    if (body.frameHasCornerCurves !== undefined) {
      updateData.frameHasCornerCurves = body.frameHasCornerCurves === true;
    }

    if (body.frameGradientColors !== undefined) {
      updateData.frameGradientColors = body.frameGradientColors;
    }

    if (body.frameBgGradientColors !== undefined) {
      updateData.frameBgGradientColors = body.frameBgGradientColors;
    }

    // File re-uploads
    if (body.frameFile) {
      if (body.frameFile.startsWith("data:image/svg+xml")) {
        updateData.frameUrlTemplate = body.frameFile;
      } else {
        const secureUrl = await uploadToCloudinary(body.frameFile, "frames");
        updateData.frameUrlTemplate = makeColorizableCloudinaryUrl(secureUrl);
      }
    } else if (body.frameUrlTemplate !== undefined) {
      updateData.frameUrlTemplate = body.frameUrlTemplate;
    }

    if (body.thumbnailFile) {
      updateData.thumbnailUrl = await uploadToCloudinary(body.thumbnailFile, "thumbnails");
    } else if (body.thumbnailUrl !== undefined) {
      updateData.thumbnailUrl = body.thumbnailUrl;
    }

    const updated = await prisma.template.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, template: updated });
  } catch (error: any) {
    console.error("Update template error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
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

    const existing = await prisma.template.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    await prisma.template.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Template deleted successfully" });
  } catch (error: any) {
    console.error("Delete template error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
