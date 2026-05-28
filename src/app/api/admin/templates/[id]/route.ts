import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { z } from "zod";
import cloudinary from "@/lib/cloudinary";

export const BgConfigSchema = z.object({
  url: z.string().optional().nullable(),
  file: z.string().optional().nullable(),
  x: z.number().default(0),
  y: z.number().default(0),
  width: z.number().default(595),
  height: z.number().default(842),
  opacity: z.number().min(0).max(1).default(1.0),
});

async function getSessionUser() {
  const session = await getServerSession(authOptions);
  return (session?.user as any) || null;
}

// Frame images are stored as plain Cloudinary URLs.
// Dynamic tinting is no longer applied — users manually pick their theme colors.
function makeColorizableCloudinaryUrl(url: string): string {
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

function extractCloudinaryPublicId(url: string): string | null {
  if (!url || !url.includes("res.cloudinary.com")) return null;
  try {
    const parts = url.split("/image/upload/");
    if (parts.length < 2) return null;
    
    // Remove version segment (e.g., v12345678/) if present
    let path = parts[1];
    const versionMatch = path.match(/^v\d+\/(.+)$/);
    if (versionMatch) {
      path = versionMatch[1];
    }
    
    // Remove file extension
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
    console.log(`Cloudinary asset deleted [${publicId}]:`, result);
  } catch (error) {
    console.error(`Failed to delete Cloudinary asset [${publicId}]:`, error);
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || (sessionUser.role !== "admin" && sessionUser.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const template = await prisma.template.findUnique({
      where: { id },
    });

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, template });
  } catch (error: any) {
    console.error("Get template error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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
      "language",
      "active",
      "detailsLayout",
      "titleShape",
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

    if (body.photoShowBorder !== undefined) {
      updateData.photoShowBorder = body.photoShowBorder === true;
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
        // Clean up previous frame from Cloudinary if it existed
        if (existing.frameUrlTemplate) {
          await deleteFromCloudinary(existing.frameUrlTemplate);
        }
        const secureUrl = await uploadToCloudinary(body.frameFile, "frames");
        updateData.frameUrlTemplate = makeColorizableCloudinaryUrl(secureUrl);
      }
    } else if (body.frameUrlTemplate !== undefined) {
      updateData.frameUrlTemplate = body.frameUrlTemplate;
    }

    if (body.thumbnailFile) {
      // Clean up previous thumbnail from Cloudinary if it existed
      if (existing.thumbnailUrl) {
        await deleteFromCloudinary(existing.thumbnailUrl);
      }
      updateData.thumbnailUrl = await uploadToCloudinary(body.thumbnailFile, "thumbnails");
    } else if (body.thumbnailUrl !== undefined) {
      updateData.thumbnailUrl = body.thumbnailUrl;
    }

    // Process and validate bgConfig JSON schema if provided
    if (body.bgConfig !== undefined) {
      if (body.bgConfig === null) {
        updateData.bgConfig = null;
      } else {
        const parsed = BgConfigSchema.safeParse(body.bgConfig);
        if (!parsed.success) {
          return NextResponse.json({ error: "Invalid background configuration", details: parsed.error.format() }, { status: 400 });
        }
        const bgConfigData = { ...parsed.data };
        if (bgConfigData.file) {
          // If there is an existing background image in Cloudinary, delete it first
          if (existing.bgConfig) {
            try {
              const prevConfig = typeof existing.bgConfig === "string" ? JSON.parse(existing.bgConfig) : existing.bgConfig;
              if (prevConfig?.url) {
                await deleteFromCloudinary(prevConfig.url);
              }
            } catch (e) {
              console.error("Error deleting old bgConfig image:", e);
            }
          }
          const secureUrl = await uploadToCloudinary(bgConfigData.file, "backgrounds");
          bgConfigData.url = secureUrl;
          delete bgConfigData.file;
        }
        updateData.bgConfig = bgConfigData;
      }
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

    // Clean up template assets from Cloudinary
    if (existing.frameUrlTemplate) {
      await deleteFromCloudinary(existing.frameUrlTemplate);
    }
    if (existing.thumbnailUrl) {
      await deleteFromCloudinary(existing.thumbnailUrl);
    }
    if (existing.bgConfig) {
      try {
        const prevConfig = typeof existing.bgConfig === "string" ? JSON.parse(existing.bgConfig) : existing.bgConfig;
        if (prevConfig?.url) {
          await deleteFromCloudinary(prevConfig.url);
        }
      } catch (e) {
        console.error("Error deleting bgConfig image on template delete:", e);
      }
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
