import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, rating, comment } = body;

    if (!name || typeof rating !== "number") {
      return NextResponse.json(
        { error: "Name and rating are required fields" },
        { status: 400 }
      );
    }

    const feedback = await prisma.feedback.create({
      data: {
        name,
        rating: Math.min(5, Math.max(1, rating)),
        comment: comment || null,
      },
    });

    return NextResponse.json({ success: true, feedback });
  } catch (error: any) {
    console.error("Feedback Save Error:", error);
    return NextResponse.json(
      { error: "Failed to save feedback", details: error.message },
      { status: 500 }
    );
  }
}
