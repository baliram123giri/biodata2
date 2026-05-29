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
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "orderId and status are required fields" },
        { status: 400 }
      );
    }

    const validStatuses = ["paid", "pending", "failed", "refunded", "cancelled"];
    const targetStatus = status.toLowerCase();

    if (!validStatuses.includes(targetStatus)) {
      return NextResponse.json(
        { error: "Invalid checkout status type" },
        { status: 400 }
      );
    }

    // Update order status in the database
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: targetStatus },
    });

    return NextResponse.json({
      success: true,
      message: `Transaction status updated to ${targetStatus}`,
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error("Update status error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
