import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

async function getSessionUser() {
  const session = await getServerSession(authOptions);
  return (session?.user as any) || null;
}

export async function GET(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || (sessionUser.role !== "admin" && sessionUser.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";
    const format = searchParams.get("format") || "all";
    const templateId = searchParams.get("templateId") || "all";

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { id: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
        { templateId: { contains: search, mode: "insensitive" } },
      ];
    }

    if (format && format !== "all") {
      where.format = { equals: format, mode: "insensitive" };
    }

    if (templateId && templateId !== "all") {
      where.templateId = templateId;
    }

    // Query downloads and count total matches in parallel
    const [downloads, total] = await Promise.all([
      prisma.downloadLog.findMany({
        where,
        include: {
          order: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.downloadLog.count({ where }),
    ]);

    return NextResponse.json({ downloads, total });
  } catch (error: any) {
    console.error("List downloads error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || (sessionUser.role !== "admin" && sessionUser.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { id, ids } = body;

    const { searchParams } = new URL(req.url);
    const queryId = searchParams.get("id");

    const targetId = id || queryId;
    const targetIds = ids || (targetId ? [targetId] : null);

    if (!targetIds || !Array.isArray(targetIds) || targetIds.length === 0) {
      return NextResponse.json({ error: "ID or IDs are required" }, { status: 400 });
    }

    await prisma.downloadLog.deleteMany({
      where: {
        id: { in: targetIds }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete download log error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
