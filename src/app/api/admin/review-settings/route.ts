import { NextResponse } from "next/server";
import { prisma, withRetry } from "@/lib/prisma";
import { revalidateTag } from "next/cache";

export async function GET() {
  try {
    if (!prisma || !(prisma as any).reviewSettings) {
      console.warn("[review-settings GET] prisma.reviewSettings is undefined. Returning default settings.");
      return NextResponse.json({
        settings: {
          id: "global",
          googleEnabled: true,
          googleRating: 4.9,
          googleCount: 524,
          googleUrl: "https://share.google/T4eEjxMJkqDKaFWGN",
          trustpilotEnabled: true,
          trustpilotRating: 4.8,
          trustpilotCount: 320,
          trustpilotUrl: "https://www.trustpilot.com/review/biodata99.com",
        }
      });
    }

    const settings = await withRetry(() =>
      (prisma as any).reviewSettings.upsert({
        where: { id: "global" },
        update: {},
        create: {
          id: "global",
          googleEnabled: true,
          googleRating: 4.9,
          googleCount: 524,
          googleUrl: "https://share.google/T4eEjxMJkqDKaFWGN",
          trustpilotEnabled: true,
          trustpilotRating: 4.8,
          trustpilotCount: 320,
          trustpilotUrl: "https://www.trustpilot.com/review/biodata99.com",
        },
      })
    );
    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error("Failed to fetch review settings:", error);
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      googleEnabled,
      googleRating,
      googleCount,
      googleUrl,
      trustpilotEnabled,
      trustpilotRating,
      trustpilotCount,
      trustpilotUrl,
    } = body;

    if (!prisma || !(prisma as any).reviewSettings) {
      return NextResponse.json({ 
        error: "Prisma reviewSettings client model is not yet compiled. Please restart the dev server." 
      }, { status: 400 });
    }

    const settings = await withRetry(() =>
      (prisma as any).reviewSettings.upsert({
        where: { id: "global" },
        update: {
          googleEnabled: googleEnabled ?? true,
          googleRating: parseFloat(googleRating),
          googleCount: parseInt(googleCount),
          googleUrl,
          trustpilotEnabled: trustpilotEnabled ?? true,
          trustpilotRating: parseFloat(trustpilotRating),
          trustpilotCount: parseInt(trustpilotCount),
          trustpilotUrl,
        },
        create: {
          id: "global",
          googleEnabled: googleEnabled ?? true,
          googleRating: parseFloat(googleRating),
          googleCount: parseInt(googleCount),
          googleUrl,
          trustpilotEnabled: trustpilotEnabled ?? true,
          trustpilotRating: parseFloat(trustpilotRating),
          trustpilotCount: parseInt(trustpilotCount),
          trustpilotUrl,
        },
      })
    );

    // Invalidate the cache to reflect changes immediately in FooterReviews
    try {
      revalidateTag("footer-reviews", "max");
    } catch (e) {
      console.error("Failed to revalidate footer-reviews tag:", e);
    }

    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error("Failed to update review settings:", error);
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}
