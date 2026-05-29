import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const cursor = searchParams.get("cursor") || undefined;

    const { prisma } = await import("@/lib/prisma");
    const backgrounds = await prisma.background.findMany({
      take: limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { createdAt: "desc" },
    });

    const nextCursor = backgrounds.length === limit ? backgrounds[backgrounds.length - 1].id : null;

    return NextResponse.json({ success: true, backgrounds, nextCursor }, {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=30",
      },
    });
  } catch (error: any) {
    console.error("Fetch public backgrounds error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
