import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const mantras = await prisma.mantra.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ mantras });
  } catch (error) {
    console.error("[GET_MANTRAS_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch mantras" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { religion, text, nativeText, meaning } = body;
    
    if (!religion || !text) {
      return NextResponse.json({ error: "Religion and text are required" }, { status: 400 });
    }

    const newMantra = await prisma.mantra.create({
      data: {
        religion,
        text,
        nativeText,
        meaning
      }
    });

    return NextResponse.json({ mantra: newMantra });
  } catch (error) {
    console.error("[POST_MANTRA_ERROR]", error);
    return NextResponse.json({ error: "Failed to create mantra" }, { status: 500 });
  }
}
