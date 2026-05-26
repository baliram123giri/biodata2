import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const slides = await prisma.heroSlide.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ slides });
  } catch (error: any) {
    console.error("Fetch hero slides database error, falling back gracefully:", error);
    // Return a graceful 200 OK with empty slides array so the page/Lighthouse doesn't fail
    return NextResponse.json({ slides: [], error: error.message });
  }
}
