import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { error: "Coupon code is required" },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();

    // 1. Dynamic Seeding of default test coupons if database is empty
    const count = await prisma.coupon.count();
    if (count === 0) {
      try {
        await prisma.coupon.createMany({
          data: [
            { code: "WELCOME50", discountType: "percentage", discountValue: 50, active: true },
            { code: "LOVE20", discountType: "percentage", discountValue: 20, active: true },
            { code: "FREE100", discountType: "percentage", discountValue: 100, active: true },
            { code: "BIODATA10", discountType: "fixed", discountValue: 10, active: true },
          ],
        });
      } catch (seedErr) {
        console.error("Failed to seed default coupons:", seedErr);
      }
    }

    // 2. Query coupon code
    const coupon = await prisma.coupon.findUnique({
      where: { code: cleanCode },
    });

    if (!coupon) {
      return NextResponse.json(
        { error: "Invalid coupon code" },
        { status: 404 }
      );
    }

    if (!coupon.active) {
      return NextResponse.json(
        { error: "This coupon is no longer active" },
        { status: 400 }
      );
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: "This coupon has expired" },
        { status: 400 }
      );
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json(
        { error: "This coupon usage limit has been reached" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Coupon applied successfully",
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
    });
  } catch (error: any) {
    console.error("Coupon Validation Error:", error);
    return NextResponse.json(
      { error: "Failed to validate coupon", details: error.message },
      { status: 500 }
    );
  }
}
