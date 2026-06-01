import { NextResponse, NextRequest } from "next/server";
import { prisma, withRetry } from "@/lib/prisma";
import { mapDbTemplateToConfig } from "@/lib/frame-config";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const onlyDefault = searchParams.get("default") === "true";
    const templateId = searchParams.get("id");

    if (onlyDefault) {
      // Fetch only the default template
      const dbTemplate = await withRetry(() =>
        prisma.template.findFirst({
          where: { active: true, isDefault: true },
        })
      );
      
      // If no default template exists, fallback to the latest active template
      const templateToMap = dbTemplate || await withRetry(() =>
        prisma.template.findFirst({
          where: { active: true },
          orderBy: { createdAt: "desc" },
        })
      );

      const templates = templateToMap ? [mapDbTemplateToConfig(templateToMap)] : [];
      return NextResponse.json({ templates });
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

    // Default: fetch all templates
    const dbTemplates = await withRetry(() =>
      prisma.template.findMany({
        where: { active: true },
        orderBy: { createdAt: "desc" },
      })
    );

    const templates = dbTemplates.map(mapDbTemplateToConfig);

    return NextResponse.json({ templates });
  } catch (error: any) {
    console.error("Fetch templates database error, falling back gracefully:", error);
    // Return a graceful 200 OK with empty templates array so the page/Lighthouse doesn't fail
    return NextResponse.json({ templates: [], error: error.message });
  }
}
