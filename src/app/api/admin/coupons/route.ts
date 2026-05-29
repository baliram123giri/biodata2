import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
// Import standard authOptions or fallback if needed, but since we are executing in NextAuth context:
// we can check session easily

export async function GET(req: Request) {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, coupons });
  } catch (error: any) {
    console.error("GET Coupons Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch coupons", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, discountType, discountValue, active, maxUses, expiresAt } = body;

    if (!code || !discountType || discountValue === undefined) {
      return NextResponse.json(
        { error: "Code, discountType, and discountValue are required fields" },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();

    // Check if code already exists
    const existing = await prisma.coupon.findUnique({
      where: { code: cleanCode },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A coupon with this code already exists" },
        { status: 409 }
      );
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: cleanCode,
        discountType,
        discountValue: parseFloat(discountValue),
        active: active !== undefined ? active : true,
        maxUses: maxUses ? parseInt(maxUses) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return NextResponse.json({ success: true, coupon });
  } catch (error: any) {
    console.error("Create Coupon Error:", error);
    return NextResponse.json(
      { error: "Failed to create coupon", details: error.message },
      { status: 500 }
    );
  }
}
