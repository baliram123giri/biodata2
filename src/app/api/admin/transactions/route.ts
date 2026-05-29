import { NextResponse } from "next/server";
import { prisma, withRetry } from "@/lib/prisma";
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
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const format = searchParams.get("format") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Build query filters
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (format) {
      where.format = format;
    }

    if (search) {
      where.OR = [
        { razorpayOrderId: { contains: search, mode: "insensitive" } },
        { razorpayPaymentId: { contains: search, mode: "insensitive" } },
        { customerName: { contains: search, mode: "insensitive" } },
        { customerEmail: { contains: search, mode: "insensitive" } },
        { customerPhone: { contains: search, mode: "insensitive" } },
        { couponCode: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get orders
    const [ordersRaw, total] = await Promise.all([
      withRetry(() =>
        prisma.order.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        })
      ),
      withRetry(() => prisma.order.count({ where })),
    ]);

    // Map template names
    const templates = await withRetry(() =>
      prisma.template.findMany({
        select: {
          id: true,
          name: true,
        },
      })
    );

    const orders = ordersRaw.map((order) => {
      const template = templates.find((t) => t.id === order.templateId);
      return {
        ...order,
        templateName: template ? template.name : "Premium Theme",
      };
    });

    // Calculate quick stats across ALL filtered results for context
    const allPaidOrders = await withRetry(() =>
      prisma.order.aggregate({
        where: { status: "paid" },
        _sum: { amount: true },
        _count: { id: true },
      })
    );

    const allPendingOrders = await withRetry(() =>
      prisma.order.count({ where: { status: "pending" } })
    );

    const totalRevenue = allPaidOrders._sum.amount || 0;
    const totalTransactions = await withRetry(() => prisma.order.count());
    const paidCount = allPaidOrders._count.id;
    const successRate = totalTransactions > 0 ? Math.round((paidCount / totalTransactions) * 100) : 100;

    return NextResponse.json({
      success: true,
      orders,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      stats: {
        totalRevenue,
        totalTransactions,
        paidCount,
        pendingCount: allPendingOrders,
        successRate,
      },
    });
  } catch (error: any) {
    console.error("Fetch transactions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
