import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiCache, TTL } from "@/lib/api-cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { z } from "zod";
import cloudinary from "@/lib/cloudinary";

export const TEMPLATES_CACHE_KEY = "admin:templates";

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

    const templates = await apiCache.remember(TEMPLATES_CACHE_KEY, TTL.LONG, () =>
      prisma.template.findMany({ orderBy: { createdAt: "desc" } })
    );

    return NextResponse.json({ templates });
  } catch (error: any) {
    console.error("List admin templates error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  let body: any = null;
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || (sessionUser.role !== "admin" && sessionUser.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    body = await req.json();
    const {
      name,
      description,
      defaultPrimary,
      defaultSecondary,
      defaultAccent,
      defaultPadding,
      defaultYPadding,
      defaultPaddingTop,
      defaultPaddingRight,
      defaultPaddingLeft,
      defaultFontSize,
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
      bgConfig, // dynamic bg configuration
      language, // template language e.g. "English", "मराठी", "हिंदी", etc.
      detailsLayout,
      titleShape,
      photoShowBorder,
      // Pricing
      isPremium,
      price,
      discountPrice,
      currency,
      // Format-specific Pricing
      pdfPrice,
      pdfDiscountPrice,
      jpgPrice,
      jpgDiscountPrice,
      pngPrice,
      pngDiscountPrice,
      comboPrice,
      comboDiscountPrice,
      previewPhotoFile,
      rawInput,
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

    let previewPhotoUrl: string | null = null;
    if (previewPhotoFile) {
      previewPhotoUrl = await uploadToCloudinary(previewPhotoFile, "previews");
    }

    // Process and validate bgConfig JSON schema if provided
    let bgConfigData: any = null;
    if (bgConfig) {
      const parsed = BgConfigSchema.safeParse(bgConfig);
      if (!parsed.success) {
        return NextResponse.json({ error: "Invalid background configuration", details: parsed.error.format() }, { status: 400 });
      }
      bgConfigData = { ...parsed.data };
      if (bgConfigData.file) {
        const secureUrl = await uploadToCloudinary(bgConfigData.file, "backgrounds");
        bgConfigData.url = secureUrl;
        delete bgConfigData.file;
      }
    }

    const template = await prisma.template.create({
      data: {
        name,
        description: description || "",
        defaultPrimary,
        defaultSecondary,
        defaultAccent,
        defaultPadding: safeParseInt(defaultPadding, 60)!,
        defaultYPadding: safeParseInt(defaultYPadding),
        defaultPaddingTop: safeParseInt(defaultPaddingTop),
        defaultPaddingRight: safeParseInt(defaultPaddingRight),
        defaultPaddingLeft: safeParseInt(defaultPaddingLeft),
        defaultFontSize: safeParseInt(defaultFontSize),
        photoX: safeParseInt(photoX, 390)!,
        photoY: safeParseInt(photoY, 100)!,
        photoWidth: safeParseInt(photoWidth, 100)!,
        photoHeight: safeParseInt(photoHeight, 130)!,
        photoCornerRadius: safeParseInt(photoCornerRadius, 8)!,
        frameType,
        frameBgType: frameBgType || "solid",
        frameBgColor: frameBgColor || "#ffffff",
        frameBgGradientColors: frameBgGradientColors || [],
        frameUrlTemplate,
        frameOuterInset: safeParseInt(frameOuterInset),
        frameOuterStrokeWidth: safeParseInt(frameOuterStrokeWidth),
        frameOuterCornerRadius: safeParseInt(frameOuterCornerRadius),
        frameInnerInset: safeParseInt(frameInnerInset),
        frameInnerStrokeWidth: safeParseInt(frameInnerStrokeWidth),
        frameInnerCornerRadius: safeParseInt(frameInnerCornerRadius),
        frameHasCornerCurves: frameHasCornerCurves === true,
        frameGradientColors: frameGradientColors || [],
        frameComponentId: frameComponentId || null,
        thumbnailUrl,
        previewPhotoUrl,
        rawInput: rawInput || undefined,
        bgConfig: bgConfigData || undefined,
        language: language || "English",
        detailsLayout: detailsLayout || "classic",
        titleShape: titleShape || "simple",
        photoShowBorder: photoShowBorder !== false, // default true
        active: true,
        // Pricing
        isPremium: isPremium === true,
        price: safeParseFloat(price),
        discountPrice: safeParseFloat(discountPrice),
        currency: currency || "INR",
        // Format-specific Pricing
        pdfPrice: safeParseFloat(pdfPrice),
        pdfDiscountPrice: safeParseFloat(pdfDiscountPrice),
        jpgPrice: safeParseFloat(jpgPrice),
        jpgDiscountPrice: safeParseFloat(jpgDiscountPrice),
        pngPrice: safeParseFloat(pngPrice),
        pngDiscountPrice: safeParseFloat(pngDiscountPrice),
        comboPrice: safeParseFloat(comboPrice),
        comboDiscountPrice: safeParseFloat(comboDiscountPrice),
      },
    });

    // Bust templates cache so next GET returns fresh list
    apiCache.invalidate(TEMPLATES_CACHE_KEY);

    return NextResponse.json({ success: true, template });
  } catch (error: any) {
    console.error("Create template error:", error);
    try {
      const fs = require("fs");
      fs.writeFileSync("d:\\MERN\/\/biodata\\biodata2\\prisma-create-error.log", JSON.stringify({
        errorMessage: error.message,
        errorStack: error.stack,
        requestBody: body
      }, null, 2));
    } catch (e) {
      console.error("Failed to write prisma-create-error.log:", e);
    }
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
