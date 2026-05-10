import { NextRequest, NextResponse } from "next/server";
import { generatePDFBuffer } from "@/lib/pdfkit-generator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { formData, templateId, theme } = body;

    if (!formData) {
      return NextResponse.json({ error: "formData is required" }, { status: 400 });
    }

    const pdfBuffer = await generatePDFBuffer({
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

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="biodata.pdf"`,
        "Content-Length": String(pdfBuffer.length),
      },
    });
  } catch (err: any) {
    console.error("PDF generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate PDF", details: err instanceof Error ? err.message : "Unknown error", stack: err instanceof Error ? err.stack : undefined },
      { status: 500 }
    );
  }
}
