import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const cursor = searchParams.get("cursor") || undefined;
    const type = searchParams.get("type");
    const religion = searchParams.get("religion");

    const whereClause: any = {};
    if (type) whereClause.type = type;
    if (religion) whereClause.religion = religion;

    const { prisma } = await import("@/lib/prisma");
    const stickers = await prisma.sticker.findMany({
      where: whereClause,
      take: limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { createdAt: "desc" },
    });

    const nextCursor = stickers.length === limit ? stickers[stickers.length - 1].id : null;

    return NextResponse.json({ success: true, stickers, nextCursor }, {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=30",
      },
    });
  } catch (error: any) {
    try {
      const fs = require("fs");
      fs.writeFileSync("error.log", error?.stack || String(error));
    } catch (e) {}
    console.error("Fetch public stickers error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
