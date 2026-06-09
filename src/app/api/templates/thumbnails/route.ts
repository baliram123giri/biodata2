import { NextResponse } from "next/server";
import { prisma, withRetry } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const templates = await withRetry(() =>
      prisma.template.findMany({
        where: { active: true },
        select: {
          id: true,
          name: true,
          thumbnailUrl: true,
          language: true,
          religion: true,
          isPremium: true,
          price: true,
          discountPrice: true,
          jpgPrice: true,
          jpgDiscountPrice: true,
        },
        orderBy: { createdAt: "desc" },
      })
    );

    return NextResponse.json({ templates });
  } catch (error: any) {
    console.error("Fetch template thumbnails database error:", error);
    return NextResponse.json({ templates: [], error: error.message }, { status: 500 });
  }
}
