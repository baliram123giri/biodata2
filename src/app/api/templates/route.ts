import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mapDbTemplateToConfig } from "@/lib/frame-config";

export async function GET() {
  try {
    const dbTemplates = await prisma.template.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    });

    const templates = dbTemplates.map(mapDbTemplateToConfig);

    return NextResponse.json({ templates });
  } catch (error: any) {
    console.error("Fetch templates database error, falling back gracefully:", error);
    // Return a graceful 200 OK with empty templates array so the page/Lighthouse doesn't fail
    return NextResponse.json({ templates: [], error: error.message });
  }
}
