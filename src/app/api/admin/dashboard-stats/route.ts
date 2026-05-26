import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

async function getSessionUser() {
  const session = await getServerSession(authOptions);
  return (session?.user as any) || null;
}

// Memory caching variables
let cachedStats: any = null;
let lastCacheTime = 0;
const CACHE_TTL = 30 * 1000; // Cache TTL set to 30 seconds

export async function GET(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || (sessionUser.role !== "admin" && sessionUser.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if URL specifies bypassCache parameter (like when clicking refresh)
    const { searchParams } = new URL(req.url);
    const bypassCache = searchParams.get("bypass") === "true";

    const now = Date.now();
    if (!bypassCache && cachedStats && now - lastCacheTime < CACHE_TTL) {
      return NextResponse.json({ ...cachedStats, fromCache: true });
    }

    // 1. Total Registered Users
    const totalUsers = await prisma.user.count();

    // 2. New signups today (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const newUsersToday = await prisma.user.count({
      where: {
        createdAt: {
          gte: oneDayAgo,
        },
      },
    });

    // 3. Total downloads (Generated biodatas)
    const totalDownloads = await prisma.downloadLog.count();

    // 4. Downloads this week (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const downloadsThisWeek = await prisma.downloadLog.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    // Get all templates to map names
    const templates = await prisma.template.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    // 5. Recent downloads (Take 5)
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

    // 6. Template popularity (Group by templateId)
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

    // 7. Daily traffic for last 7 days for the chart
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

    // Save result into global cache
    cachedStats = {
      totalUsers,
      newUsersToday,
      totalDownloads,
      downloadsThisWeek,
      recentDownloads,
      templatePopularity,
      dailyTraffic,
    };
    lastCacheTime = now;

    return NextResponse.json({ ...cachedStats, fromCache: false });
  } catch (error: any) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
