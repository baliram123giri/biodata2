import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { uploadToVPS } from "@/lib/vps-upload";

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
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const cursor = searchParams.get("cursor") || undefined;
    const type = searchParams.get("type");
    const religion = searchParams.get("religion");

    const whereClause: any = {};
    if (type) whereClause.type = type;
    if (religion && religion !== "All") whereClause.religion = religion;

    const stickers = await prisma.sticker.findMany({
      where: whereClause,
      take: limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { createdAt: "desc" },
    });

    const nextCursor = stickers.length === limit ? stickers[stickers.length - 1].id : null;

    return NextResponse.json({ success: true, stickers, nextCursor });
  } catch (error: any) {
    console.error("Fetch stickers error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || (sessionUser.role !== "admin" && sessionUser.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, file, type = "Normal", religion = null } = body;

    if (!name || !file) {
      return NextResponse.json({ error: "Missing name or file parameter" }, { status: 400 });
    }

    const secureUrl = await uploadToVPS(file, "matrimonial/stickers");

    const sticker = await prisma.sticker.create({
      data: {
        name,
        url: secureUrl,
        type,
        religion,
      },
    });

    return NextResponse.json({ success: true, sticker });
  } catch (error: any) {
    console.error("Create sticker error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
