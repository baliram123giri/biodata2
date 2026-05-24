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
    console.error("Fetch templates error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
