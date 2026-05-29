import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { active, code, discountType, discountValue, maxUses, expiresAt } = body;

    const dataToUpdate: any = {};
    if (active !== undefined) dataToUpdate.active = active;
    if (code !== undefined) dataToUpdate.code = code.trim().toUpperCase();
    if (discountType !== undefined) dataToUpdate.discountType = discountType;
    if (discountValue !== undefined) dataToUpdate.discountValue = parseFloat(discountValue);
    if (maxUses !== undefined) dataToUpdate.maxUses = maxUses ? parseInt(maxUses) : null;
    if (expiresAt !== undefined) dataToUpdate.expiresAt = expiresAt ? new Date(expiresAt) : null;

    const updated = await prisma.coupon.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, coupon: updated });
  } catch (error: any) {
    console.error("Update Coupon Error:", error);
    return NextResponse.json(
      { error: "Failed to update coupon", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.coupon.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Coupon deleted successfully" });
  } catch (error: any) {
    console.error("Delete Coupon Error:", error);
    return NextResponse.json(
      { error: "Failed to delete coupon", details: error.message },
      { status: 500 }
    );
  }
}

