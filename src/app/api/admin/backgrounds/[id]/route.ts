import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { uploadToVPS, deleteFromVPS } from "@/lib/vps-upload";

async function getSessionUser() {
  const session = await getServerSession(authOptions);
  return (session?.user as any) || null;
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

    const existing = await prisma.background.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Background not found" }, { status: 404 });
    }

    // Delete image from VPS
    await deleteFromVPS(existing.url);

    // Delete from database
    await prisma.background.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Background deleted successfully" });
  } catch (error: any) {
    console.error("Delete background error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
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
    const { name, file } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const existing = await prisma.background.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Background not found" }, { status: 404 });
    }

    const updateData: any = {
      name: name.trim(),
    };

    if (file) {
      // 1. Upload new background file to VPS
      const secureUrl = await uploadToVPS(file, "matrimonial/backgrounds");
      updateData.url = secureUrl;

      // 2. Delete the old background file from VPS
      if (existing.url) {
        await deleteFromVPS(existing.url);
      }
    }

    const updated = await prisma.background.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, background: updated });
  } catch (error: any) {
    console.error("Update background error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}


