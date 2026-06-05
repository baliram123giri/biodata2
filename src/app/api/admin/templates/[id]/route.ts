import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiCache } from "@/lib/api-cache";
import { TEMPLATES_CACHE_KEY } from "../route";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { z } from "zod";
import { uploadToVPS, deleteFromVPS } from "@/lib/vps-upload";

export const BgConfigSchema = z.object({
  url: z.string().optional().nullable(),
  file: z.string().optional().nullable(),
  x: z.number().default(0),
  y: z.number().default(0),
  width: z.number().default(595),
  height: z.number().default(842),
  opacity: z.number().min(0).max(1).default(1.0),
  fontFamily: z.string().optional().nullable(),
  fontWeight: z.string().optional().nullable(),
  fontSize: z.number().optional().nullable(),
  alignment: z.string().optional().nullable(),
  sectionOffsets: z.string().optional().nullable(),
  sectionStyles: z.string().optional().nullable(),
  imageFrameOffset: z.string().optional().nullable(),
  frameImageX: z.number().optional().nullable(),
  frameImageY: z.number().optional().nullable(),
  frameImageWidth: z.number().optional().nullable(),
  frameImageHeight: z.number().optional().nullable(),
  enableSvgTint: z.boolean().optional().nullable(),
});

async function getSessionUser() {
  const session = await getServerSession(authOptions);
  return (session?.user as any) || null;
}

function safeParseInt(val: any, defaultVal: number | null = null): number | null {
  if (val === undefined || val === null || val === "") return defaultVal;
  const parsed = parseInt(val);
  return isNaN(parsed) ? defaultVal : parsed;
}

function safeParseFloat(val: any, defaultVal: number | null = null): number | null {
  if (val === undefined || val === null || val === "") return defaultVal;
  const parsed = parseFloat(val);
  return isNaN(parsed) ? defaultVal : parsed;
}

// Frame images are stored as plain Cloudinary URLs.
// Dynamic tinting is no longer applied — users manually pick their theme colors.
function makeColorizableCloudinaryUrl(url: string): string {
  return url;
}

// Helper to upload base64 to VPS
async function uploadToCloudinary(fileStr: string, folder: string) {
  return uploadToVPS(fileStr, `biodata/${folder}`);
}

// Helper to delete image from VPS
async function deleteFromCloudinary(url: string) {
  return deleteFromVPS(url);
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
  let body: any = null;
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || (sessionUser.role !== "admin" && sessionUser.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    body = await req.json();

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
      "defaultPaddingTop",
      "defaultPaddingRight",
      "defaultPaddingLeft",
      "defaultFontSize",
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
        updateData[field] = safeParseInt(body[field]);
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

    // Pricing fields
    if (body.isPremium !== undefined) {
      updateData.isPremium = body.isPremium === true;
    }
    if (body.isDefault !== undefined) {
      updateData.isDefault = body.isDefault === true;
    }
    if (body.price !== undefined) {
      updateData.price = safeParseFloat(body.price);
    }
    if (body.discountPrice !== undefined) {
      updateData.discountPrice = safeParseFloat(body.discountPrice);
    }
    if (body.currency !== undefined) {
      updateData.currency = body.currency || "INR";
    }
    if (body.pdfPrice !== undefined) {
      updateData.pdfPrice = safeParseFloat(body.pdfPrice);
    }
    if (body.pdfDiscountPrice !== undefined) {
      updateData.pdfDiscountPrice = safeParseFloat(body.pdfDiscountPrice);
    }
    if (body.jpgPrice !== undefined) {
      updateData.jpgPrice = safeParseFloat(body.jpgPrice);
    }
    if (body.jpgDiscountPrice !== undefined) {
      updateData.jpgDiscountPrice = safeParseFloat(body.jpgDiscountPrice);
    }
    if (body.pngPrice !== undefined) {
      updateData.pngPrice = safeParseFloat(body.pngPrice);
    }
    if (body.pngDiscountPrice !== undefined) {
      updateData.pngDiscountPrice = safeParseFloat(body.pngDiscountPrice);
    }
    if (body.comboPrice !== undefined) {
      updateData.comboPrice = safeParseFloat(body.comboPrice);
    }
    if (body.comboDiscountPrice !== undefined) {
      updateData.comboDiscountPrice = safeParseFloat(body.comboDiscountPrice);
    }

    // File re-uploads
    if (body.frameFile) {
      if (body.frameFile.startsWith("data:") || body.frameFile.trim().startsWith("<svg") || body.frameFile.includes("http://www.w3.org/2000/svg")) {
        // Clean up previous frame from Cloudinary if it existed
        if (existing.frameUrlTemplate && !existing.frameUrlTemplate.startsWith("data:")) {
          await deleteFromCloudinary(existing.frameUrlTemplate);
        }
        const secureUrl = await uploadToCloudinary(body.frameFile, "frames");
        updateData.frameUrlTemplate = makeColorizableCloudinaryUrl(secureUrl);
      } else {
        updateData.frameUrlTemplate = body.frameFile;
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

    if (body.previewPhotoFile) {
      if (existing.previewPhotoUrl) {
        await deleteFromCloudinary(existing.previewPhotoUrl);
      }
      updateData.previewPhotoUrl = await uploadToCloudinary(body.previewPhotoFile, "previews");
    } else if (body.previewPhotoUrl !== undefined) {
      updateData.previewPhotoUrl = body.previewPhotoUrl;
    }

    if (body.rawInput !== undefined) {
      updateData.rawInput = body.rawInput;
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

    if (updateData.isDefault === true) {
      await prisma.template.updateMany({
        data: { isDefault: false }
      });
    }

    const updated = await prisma.template.update({
      where: { id },
      data: updateData,
    });

    // Bust templates list cache — individual template changed
    apiCache.invalidate(TEMPLATES_CACHE_KEY);

    return NextResponse.json({ success: true, template: updated });
  } catch (error: any) {
    console.error("Update template error:", error);
    try {
      const fs = require("fs");
      fs.writeFileSync("d:\\MERN\/\/biodata\\biodata2\\prisma-update-error.log", JSON.stringify({
        errorMessage: error.message,
        errorStack: error.stack,
        requestBody: body
      }, null, 2));
    } catch (e) {
      console.error("Failed to write prisma-update-error.log:", e);
    }
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
    if (existing.previewPhotoUrl) {
      await deleteFromCloudinary(existing.previewPhotoUrl);
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

    await prisma.template.delete({ where: { id } });

    // Bust templates list cache — template removed
    apiCache.invalidate(TEMPLATES_CACHE_KEY);

    return NextResponse.json({ success: true, message: "Template deleted successfully" });
  } catch (error: any) {
    console.error("Delete template error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
