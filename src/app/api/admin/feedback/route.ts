import { NextResponse } from "next/server";
import { prisma, withRetry } from "@/lib/prisma";
import { apiCache, TTL } from "@/lib/api-cache";

const CACHE_KEY = "admin:feedback";

export async function GET() {
  try {
    const feedback = await apiCache.remember(CACHE_KEY, TTL.SHORT, () =>
      withRetry(() => prisma.feedback.findMany({ orderBy: { createdAt: "desc" } }))
    );

    return NextResponse.json({ success: true, feedback });
  } catch (error: any) {
    console.error("GET Feedback Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { id, ids } = body;

    const targetIds = ids || (id ? [id] : null);

    if (!targetIds || !Array.isArray(targetIds) || targetIds.length === 0) {
      return NextResponse.json(
        { error: "ID or IDs are required" },
        { status: 400 }
      );
    }

    await withRetry(() =>
      prisma.feedback.deleteMany({
        where: {
          id: { in: targetIds }
        }
      })
    );

    // Bust feedback cache so next GET is fresh
    apiCache.invalidate(CACHE_KEY);

    return NextResponse.json({ success: true, message: `${targetIds.length} feedback items deleted successfully` });
  } catch (error: any) {
    console.error("Delete Feedback Error:", error);
    return NextResponse.json(
      { error: "Failed to delete feedback", details: error.message },
      { status: 500 }
    );
  }
}
