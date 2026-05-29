import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany({
      where: {
        active: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    // Filter out exhausted coupons
    const validCoupons = coupons.filter(
      (c) => c.maxUses === null || c.usedCount < c.maxUses
    );

    return NextResponse.json({ success: true, coupons: validCoupons });
  } catch (err: any) {
    console.error("GET Active Coupons Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch active coupons" },
      { status: 500 }
    );
  }
}
