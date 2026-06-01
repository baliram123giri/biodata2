import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { apiCache } from "@/lib/api-cache";

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
    const { orderId, orderIds, status, downloadStatus } = body;

    if (!orderId && (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0)) {
      return NextResponse.json(
        { error: "orderId or orderIds is required" },
        { status: 400 }
      );
    }

    const dataToUpdate: any = {};

    if (status) {
      const validStatuses = ["paid", "pending", "failed", "refunded", "cancelled"];
      const targetStatus = status.toLowerCase();

      if (!validStatuses.includes(targetStatus)) {
        return NextResponse.json(
          { error: "Invalid checkout status type" },
          { status: 400 }
        );
      }
      dataToUpdate.status = targetStatus;
    }

    if (downloadStatus !== undefined) {
      const validDLStatuses = ["success", "failed", "pending"];
      const targetDLStatus = downloadStatus === null ? "pending" : String(downloadStatus).toLowerCase();

      if (!validDLStatuses.includes(targetDLStatus)) {
        return NextResponse.json(
          { error: "Invalid download status type" },
          { status: 400 }
        );
      }
      // If "pending", save as null in the DB
      dataToUpdate.downloadStatus = targetDLStatus === "pending" ? null : targetDLStatus;
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json(
        { error: "No fields to update provided (status or downloadStatus)" },
        { status: 400 }
      );
    }

    if (orderIds && Array.isArray(orderIds)) {
      const updated = await prisma.order.updateMany({
        where: { id: { in: orderIds } },
        data: dataToUpdate,
      });

      apiCache.invalidatePrefix("transactions");

      return NextResponse.json({
        success: true,
        message: `Transaction values updated for ${updated.count} orders`,
      });
    }

    // Update order in the database
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: dataToUpdate,
    });

    apiCache.invalidatePrefix("transactions");

    return NextResponse.json({
      success: true,
      message: `Transaction successfully updated`,
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error("Update status error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
