import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiCache } from "@/lib/api-cache";
import { HERO_SLIDES_CACHE_KEY } from "../route";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

async function getSessionUser() {
  const session = await getServerSession(authOptions);
  return (session?.user as any) || null;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || (sessionUser.role !== "admin" && sessionUser.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { title, order, active } = body;

    const data: any = {};
    if (typeof title === "string") data.title = title;
    if (typeof order === "number") data.order = order;
    if (typeof active === "boolean") data.active = active;

    const slide = await prisma.heroSlide.update({
      where: { id },
      data,
    });

    // Invalidate cache
    apiCache.invalidate(HERO_SLIDES_CACHE_KEY);

    return NextResponse.json({ slide });
  } catch (error: any) {
    console.error("Update hero slide error:", error);
    return NextResponse.json({ error: "Failed to update hero slide" }, { status: 500 });
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

    await prisma.heroSlide.delete({
      where: { id },
    });

    // Invalidate cache
    apiCache.invalidate(HERO_SLIDES_CACHE_KEY);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete hero slide error:", error);
    return NextResponse.json({ error: "Failed to delete hero slide" }, { status: 500 });
  }
}
