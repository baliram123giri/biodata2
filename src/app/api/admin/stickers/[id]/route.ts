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

    const existing = await prisma.sticker.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Sticker not found" }, { status: 404 });
    }

    // Delete image from VPS
    await deleteFromVPS(existing.url);

    // Delete from database
    await prisma.sticker.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Sticker deleted successfully" });
  } catch (error: any) {
    console.error("Delete sticker error:", error);
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
    const { name, type, religion, file } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const existing = await prisma.sticker.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Sticker not found" }, { status: 404 });
    }

    const updateData: any = {
      name: name.trim(),
      type: type !== undefined ? type : existing.type,
      religion: type === "Mantra" ? religion || existing.religion : (type === "Normal" ? null : existing.religion),
    };

    if (file) {
      // 1. Upload new sticker file to VPS
      const secureUrl = await uploadToVPS(file, "matrimonial/stickers");
      updateData.url = secureUrl;

      // 2. Delete the old sticker file from VPS
      if (existing.url) {
        await deleteFromVPS(existing.url);
      }
    }

    const updated = await prisma.sticker.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, sticker: updated });
  } catch (error: any) {
    console.error("Update sticker error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}


