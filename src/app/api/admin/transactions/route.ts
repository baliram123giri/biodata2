import { NextResponse } from "next/server";
import { prisma, withRetry } from "@/lib/prisma";
import { apiCache, TTL } from "@/lib/api-cache";
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
    const downloadStatus = searchParams.get("downloadStatus") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const bypassCache = searchParams.get("bypass") === "true";
    const skip = (page - 1) * limit;

    // Unique cache key per filter combination
    const cacheKey = `transactions:${search}:${status}:${format}:${downloadStatus}:${page}:${limit}`;
    if (bypassCache) apiCache.invalidatePrefix("transactions");

    // Build query filters
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (format) {
      where.format = format;
    }

    if (downloadStatus) {
      if (downloadStatus.toLowerCase() === "pending") {
        where.downloadStatus = null;
      } else {
        where.downloadStatus = downloadStatus.toLowerCase();
      }
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

    const result = await apiCache.remember(cacheKey, TTL.SHORT, async () => {
      // Execute all 6 database queries concurrently to prevent PG connection pool starvation and eliminate hangs
      const [
        ordersRaw,
        total,
        templates,
        allPaidOrders,
        allPendingOrders,
        totalTransactions
      ] = await Promise.all([
        withRetry(() =>
          prisma.order.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
          })
        ),
        withRetry(() => prisma.order.count({ where })),
        withRetry(() =>
          prisma.template.findMany({
            select: {
              id: true,
              name: true,
            },
          })
        ),
        withRetry(() =>
          prisma.order.aggregate({
            where: { status: "paid" },
            _sum: { amount: true },
            _count: { id: true },
          })
        ),
        withRetry(() => prisma.order.count({ where: { status: "pending" } })),
        withRetry(() => prisma.order.count()),
      ]);

      const orders = ordersRaw.map((order) => {
        const template = templates.find((t) => t.id === order.templateId);
        return {
          ...order,
          templateName: template ? template.name : "Premium Theme",
          downloadStatus: (order as any).downloadStatus || null,
        };
      });

      const totalRevenue = allPaidOrders._sum.amount || 0;
      const paidCount = allPaidOrders._count.id;
      const successRate = totalTransactions > 0 ? Math.round((paidCount / totalTransactions) * 100) : 100;

    return {
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
      };
    }); // end apiCache.remember

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Fetch transactions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
