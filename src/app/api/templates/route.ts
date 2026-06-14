import { NextResponse, NextRequest } from "next/server";
import { prisma, withRetry } from "@/lib/prisma";
import { mapDbTemplateToConfig } from "@/lib/frame-config";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const onlyDefault = searchParams.get("default") === "true";
    const templateId = searchParams.get("id");
    const limit = parseInt(searchParams.get("limit") || "0") || 0;
    const page = parseInt(searchParams.get("page") || "1") || 1;
    const religion = searchParams.get("religion");

    if (onlyDefault) {
      const whereClause: any = { active: true };
      if (religion) {
        whereClause.religion = { equals: religion, mode: "insensitive" };
      }

      // Fetch the default template first matching the religion
      const defaultTemplate = await withRetry(() =>
        prisma.template.findFirst({
          where: { ...whereClause, isDefault: true },
        })
      );

      // Fallback to latest active matching religion if no default is set
      const primaryTemplate = defaultTemplate || await withRetry(() =>
        prisma.template.findFirst({
          where: whereClause,
          orderBy: { createdAt: "desc" },
        })
      );

      // Fallback to any active template if none matched religion
      const finalPrimaryTemplate = primaryTemplate || await withRetry(() =>
        prisma.template.findFirst({
          where: { active: true },
          orderBy: { createdAt: "desc" },
        })
      );

      if (!finalPrimaryTemplate) {
        return NextResponse.json({ templates: [] });
      }

      // If a limit is requested, fill remaining slots with other templates
      if (limit > 1) {
        const [others, total] = await Promise.all([
          withRetry(() =>
            prisma.template.findMany({
              where: { ...whereClause, id: { not: finalPrimaryTemplate.id } },
              orderBy: { createdAt: "desc" },
              take: limit - 1,
            })
          ),
          withRetry(() => prisma.template.count({ where: whereClause })),
        ]);
        const templates = [finalPrimaryTemplate, ...others].map(mapDbTemplateToConfig);
        const hasMore = templates.length < total;
        return NextResponse.json({ templates, hasMore, total });
      }

      return NextResponse.json({ templates: [mapDbTemplateToConfig(finalPrimaryTemplate)], hasMore: false, total: 1 });
    }

    if (templateId) {
      // Fetch only the template with specific ID
      const dbTemplate = await withRetry(() =>
        prisma.template.findUnique({
          where: { id: templateId, active: true },
        })
      );

      const templates = dbTemplate ? [mapDbTemplateToConfig(dbTemplate)] : [];
      return NextResponse.json({ templates });
    }

    // Default: fetch all or paginated templates
    const pageLimit = limit > 0 ? limit : 10;
    const skip = (page - 1) * pageLimit;

    const whereClause: any = { active: true };
    if (religion) {
      whereClause.religion = { equals: religion, mode: "insensitive" };
    }

    const [dbTemplates, total] = await Promise.all([
      withRetry(() =>
        prisma.template.findMany({
          where: whereClause,
          orderBy: { createdAt: "desc" },
          skip,
          take: pageLimit,
        })
      ),
      withRetry(() => prisma.template.count({ where: whereClause })),
    ]);

    const templates = dbTemplates.map(mapDbTemplateToConfig);
    const hasMore = skip + dbTemplates.length < total;
    return NextResponse.json({ templates, hasMore, total });
  } catch (error: any) {
    console.error("Fetch templates database error, falling back gracefully:", error);
    return NextResponse.json({ templates: [], error: error.message });
  }
}
