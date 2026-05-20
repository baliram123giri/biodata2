import { NextRequest, NextResponse } from "next/server";
import { generateDocxBuffer } from "@/lib/docx-generator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { formData, templateId, theme } = body;

    if (!formData) {
      return NextResponse.json({ error: "formData is required" }, { status: 400 });
    }

    const docxBuffer = await generateDocxBuffer({
      formData,
      templateId: templateId || "royal",
      theme: theme || {
        fontFamily: "noto",
        primaryColor: "#800000",
        secondaryColor: "#333333",
        accentColor: "#D4AF37",
        fontSize: 11,
        padding: 45,
        selectedPaletteName: null,
      },
    });

    return new NextResponse(new Uint8Array(docxBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="biodata.docx"`,
        "Content-Length": String(docxBuffer.length),
      },
    });
  } catch (err: any) {
    console.error("DOCX generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate DOCX", details: err instanceof Error ? err.message : "Unknown error", stack: err instanceof Error ? err.stack : undefined },
      { status: 500 }
    );
  }
}
