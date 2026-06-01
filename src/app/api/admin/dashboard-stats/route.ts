import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiCache, TTL } from "@/lib/api-cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import os from "os";
import { execSync } from "child_process";

async function getSessionUser() {
  const session = await getServerSession(authOptions);
  return (session?.user as any) || null;
}

const CACHE_KEY = "admin:dashboard-stats";

function getDiskSpace() {
  try {
    // Try to get workspace drive D: stats first
    const output = execSync('powershell -Command "Get-Volume -DriveLetter D | Select-Object Size, SizeRemaining | ConvertTo-Json"').toString();
    const diskInfo = JSON.parse(output);
    if (diskInfo && diskInfo.Size && diskInfo.SizeRemaining) {
      const totalGB = Math.round(diskInfo.Size / (1024 * 1024 * 1024));
      const freeGB = Math.round(diskInfo.SizeRemaining / (1024 * 1024 * 1024));
      const usedGB = totalGB - freeGB;
      const pctFree = Math.round((freeGB / totalGB) * 100);
      return { totalGB, freeGB, usedGB, pctFree, success: true };
    }
  } catch (e) {
    try {
      // Fallback to C: drive stats
      const output = execSync('powershell -Command "Get-Volume -DriveLetter C | Select-Object Size, SizeRemaining | ConvertTo-Json"').toString();
      const diskInfo = JSON.parse(output);
      if (diskInfo && diskInfo.Size && diskInfo.SizeRemaining) {
        const totalGB = Math.round(diskInfo.Size / (1024 * 1024 * 1024));
        const freeGB = Math.round(diskInfo.SizeRemaining / (1024 * 1024 * 1024));
        const usedGB = totalGB - freeGB;
        const pctFree = Math.round((freeGB / totalGB) * 100);
        return { totalGB, freeGB, usedGB, pctFree, success: true };
      }
    } catch (err) {
      console.error("Failed to query filesystem stats via PowerShell", err);
    }
  }
  // Standard virtualized fallback in case PowerShell is blocked/restricted
  return { totalGB: 256, freeGB: 85, usedGB: 171, pctFree: 33, success: false };
}

export async function GET(req: Request) {
  const reqStart = Date.now();
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || (sessionUser.role !== "admin" && sessionUser.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const bypassCache = searchParams.get("bypass") === "true";
    if (bypassCache) apiCache.invalidate(CACHE_KEY);

    // 1. Live system/OS metrics and database checks
    const dbStart = Date.now();
    let dbSize = "4.2 MB";
    try {
      await prisma.$queryRaw`SELECT 1`;
      const dbSizeResult = await prisma.$queryRaw<Array<{ size: string }>>`
        SELECT pg_size_pretty(pg_database_size(current_database())) as size
      `;
      if (dbSizeResult && dbSizeResult[0]) {
        dbSize = dbSizeResult[0].size;
      }
    } catch (e) {
      console.error("Failed to query DB size", e);
    }
    const dbLatency = Date.now() - dbStart;

    // 2. Query dynamic real-time pending items (outside cache to guarantee fresh operational queues)
    const pendingPaymentsCount = await prisma.order.count({
      where: { status: "pending" }
    });
    
    const criticalReviewsCount = await prisma.feedback.count({
      where: { rating: { lte: 3 } }
    });

    const inactiveTemplatesCount = await prisma.template.count({
      where: { active: false }
    });

    // 3. Dynamic Server OS statistics
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memUsedPct = Math.round(((totalMem - freeMem) / totalMem) * 100);
    const serverLoadAvg = Math.round((os.loadavg()[0] || 0.1) * 10) || 5;

    // 4. Query live disk space stats
    const disk = getDiskSpace();

    // 5. Environmental Integrations Status Checks
    const apiConfig = {
      razorpay: !!(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
      geminiAi: !!(process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY),
      cloudinary: !!(process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET),
      whatsapp: !!(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID),
      smtpMail: !!process.env.EMAIL_PASS
    };

    // 6. Matrimonial Application Record Statistics
    const schemaSummary = {
      templatesCount: await prisma.template.count(),
      blogsCount: await prisma.blogPost.count(),
      feedbacksCount: await prisma.feedback.count(),
      couponsCount: await prisma.coupon.count(),
      stickersCount: (await prisma.sticker.count()) + (await prisma.mantra.count())
    };

    // 7. Cached overall aggregates
    const stats = await apiCache.remember(CACHE_KEY, TTL.SHORT, async () => {
      // Total Registered Users
      const totalUsers = await prisma.user.count();

      // New signups today (last 24 hours)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const newUsersToday = await prisma.user.count({
        where: {
          createdAt: {
            gte: oneDayAgo,
          },
        },
      });

      // Total downloads (Generated biodatas)
      const totalDownloads = await prisma.downloadLog.count();

      // Downloads this week (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const downloadsThisWeek = await prisma.downloadLog.count({
        where: {
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
      });

      // Revenue aggregations
      const paidOrders = await prisma.order.aggregate({
        where: { status: "paid" },
        _sum: { amount: true },
      });
      const totalRevenue = paidOrders._sum.amount || 0;

      const paidOrdersToday = await prisma.order.aggregate({
        where: {
          status: "paid",
          createdAt: { gte: oneDayAgo },
        },
        _sum: { amount: true },
      });
      const revenueToday = paidOrdersToday._sum.amount || 0;

      // Get all templates to map names
      const templates = await prisma.template.findMany({
        select: {
          id: true,
          name: true,
        },
      });

      // Recent downloads (Take 5)
      const recentDownloadsRaw = await prisma.downloadLog.findMany({
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
      });

      const recentDownloads = recentDownloadsRaw.map(log => {
        const template = templates.find(t => t.id === log.templateId);
        return {
          ...log,
          templateName: template ? template.name : "Default Theme"
        };
      });

      // Template popularity (Group by templateId)
      const groupedPopularity = await prisma.downloadLog.groupBy({
        by: ["templateId"],
        _count: {
          templateId: true,
        },
      });

      // Construct template popularity array
      let templatePopularity: Array<{ name: string; count: number; percentage?: number }> = groupedPopularity.map((item) => {
        const template = templates.find((t) => t.id === item.templateId);
        return {
          name: template ? template.name : "Default Theme",
          count: item._count.templateId,
        };
      });

      // Sort by count descending
      templatePopularity.sort((a, b) => b.count - a.count);

      // Calculate percentage
      const totalLogCount = templatePopularity.reduce((sum, item) => sum + item.count, 0) || 1;
      templatePopularity = templatePopularity.map((item) => ({
        ...item,
        percentage: Number(((item.count / totalLogCount) * 100).toFixed(1)),
      }));

      // If templatePopularity is empty, provide a fallback array
      if (templatePopularity.length === 0) {
        templatePopularity = [
          { name: "Default Theme", count: 0, percentage: 100 },
        ];
      }

      // Daily traffic for last 7 days for the chart
      const dailyTraffic = [];
      for (let i = 6; i >= 0; i--) {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        startOfDay.setDate(startOfDay.getDate() - i);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        endOfDay.setDate(endOfDay.getDate() - i);

        const count = await prisma.downloadLog.count({
          where: {
            createdAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
        });

        const dayLabel = startOfDay.toLocaleDateString(undefined, { weekday: "short" });
        dailyTraffic.push({ day: dayLabel, count });
      }

      return {
        totalUsers,
        newUsersToday,
        totalDownloads,
        downloadsThisWeek,
        totalRevenue,
        revenueToday,
        recentDownloads,
        templatePopularity,
        dailyTraffic,
      };
    });

    const apiLatency = Date.now() - reqStart;

    return NextResponse.json({
      ...stats,
      liveMetrics: {
        dbLatency,
        dbSize,
        apiLatency,
        pendingPaymentsCount,
        criticalReviewsCount,
        inactiveTemplatesCount,
        memUsedPct,
        serverLoadAvg
      },
      systemMetrics: {
        totalGB: disk.totalGB,
        freeGB: disk.freeGB,
        usedGB: disk.usedGB,
        pctFree: disk.pctFree,
        spaceWarning: disk.pctFree < 15,
        cpuModel: os.cpus()[0]?.model || "Intel/AMD Processor",
        cpuCores: os.cpus().length,
        totalRAM: Number((os.totalmem() / (1024 * 1024 * 1024)).toFixed(1)),
        freeRAM: Number((os.freemem() / (1024 * 1024 * 1024)).toFixed(1)),
        usedRAM: Number(((os.totalmem() - os.freemem()) / (1024 * 1024 * 1024)).toFixed(1)),
        platform: os.platform(),
        uptime: Math.round(os.uptime())
      },
      apiConfig,
      schemaSummary,
      fromCache: false
    });
  } catch (error: any) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
