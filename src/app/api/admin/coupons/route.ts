import { NextResponse } from "next/server";
import { prisma, withRetry } from "@/lib/prisma";
import { apiCache, TTL } from "@/lib/api-cache";

const CACHE_KEY = "admin:coupons";

export async function GET() {
  try {
    const coupons = await apiCache.remember(CACHE_KEY, TTL.MEDIUM, () =>
      withRetry(() => prisma.coupon.findMany({ orderBy: { createdAt: "desc" } }))
    );

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
    const { code, discountType, discountValue, active, isPublic, maxUses, expiresAt } = body;

    if (!code || !discountType || discountValue === undefined) {
      return NextResponse.json(
        { error: "Code, discountType, and discountValue are required fields" },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();

    const existing = await withRetry(() =>
      prisma.coupon.findUnique({ where: { code: cleanCode } })
    );

    if (existing) {
      return NextResponse.json(
        { error: "A coupon with this code already exists" },
        { status: 409 }
      );
    }

    const coupon = await withRetry(() =>
      prisma.coupon.create({
        data: {
          code: cleanCode,
          discountType,
          discountValue: parseFloat(discountValue),
          active: active !== undefined ? active : true,
          isPublic: isPublic !== undefined ? isPublic : true,
          maxUses: maxUses ? parseInt(maxUses) : null,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
        },
      })
    );

    // Bust coupon cache so next GET is fresh
    apiCache.invalidate(CACHE_KEY);

    return NextResponse.json({ success: true, coupon });
  } catch (error: any) {
    console.error("Create Coupon Error:", error);
    return NextResponse.json(
      { error: "Failed to create coupon", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { id, ids } = body;

    const targetIds = ids || (id ? [id] : null);

    if (!targetIds || !Array.isArray(targetIds) || targetIds.length === 0) {
      return NextResponse.json(
        { error: "ID or IDs are required" },
        { status: 400 }
      );
    }

    await withRetry(() =>
      prisma.coupon.deleteMany({
        where: {
          id: { in: targetIds }
        }
      })
    );

    // Bust coupon cache so next GET is fresh
    apiCache.invalidate(CACHE_KEY);

    return NextResponse.json({ success: true, message: `${targetIds.length} coupons deleted successfully` });
  } catch (error: any) {
    console.error("Delete Coupon Error:", error);
    return NextResponse.json(
      { error: "Failed to delete coupons", details: error.message },
      { status: 500 }
    );
  }
}
