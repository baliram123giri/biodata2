import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

async function getSessionUser() {
  const session = await getServerSession(authOptions);
  return (session?.user as any) || null;
}

export async function POST(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || (sessionUser.role !== "admin" && sessionUser.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { orderId, orderIds } = body;

    if (!orderId && (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0)) {
      return NextResponse.json(
        { error: "orderId or orderIds are required fields for deletion" },
        { status: 400 }
      );
    }

    if (orderIds && Array.isArray(orderIds)) {
      const deleted = await prisma.order.deleteMany({
        where: { id: { in: orderIds } },
      });
      return NextResponse.json({
        success: true,
        message: `Successfully deleted ${deleted.count} transaction records`,
      });
    }

    const deletedOrder = await prisma.order.delete({
      where: { id: orderId },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully deleted transaction record`,
      order: deletedOrder,
    });
  } catch (error: any) {
    console.error("Delete transactions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
