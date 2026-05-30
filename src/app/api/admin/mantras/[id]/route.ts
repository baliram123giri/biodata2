import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { religion, text, nativeText, meaning } = body;

    const updatedMantra = await prisma.mantra.update({
      where: { id },
      data: {
        religion,
        text,
        nativeText,
        meaning
      }
    });

    return NextResponse.json({ mantra: updatedMantra });
  } catch (error) {
    console.error("[PATCH_MANTRA_ERROR]", error);
    return NextResponse.json({ error: "Failed to update mantra" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.mantra.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE_MANTRA_ERROR]", error);
    return NextResponse.json({ error: "Failed to delete mantra" }, { status: 500 });
  }
}
