import { NextResponse } from "next/server";
import { prisma, withRetry } from "@/lib/prisma";
import Razorpay from "razorpay";

// Razorpay enforces a minimum order of ₹1 (100 paise).
// Any final amount below this threshold is treated as a free/promo order.
const RAZORPAY_MIN_AMOUNT_INR = 1;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, currency, templateId, format, customerName, customerEmail, customerPhone, couponCode } = body;

    // amount=0 is valid for free templates; only reject truly missing fields
    if (amount === undefined || amount === null || !templateId || !format) {
      return NextResponse.json(
        { error: "Amount, templateId, and format are required fields" },
        { status: 400 }
      );
    }

    // 1. Calculate discount and final amount on the server
    let discountApplied = 0;
    let finalAmount = parseFloat(amount);

    if (couponCode) {
      const cleanCoupon = couponCode.trim().toUpperCase();
      const couponRecord = await withRetry(() =>
        prisma.coupon.findUnique({ where: { code: cleanCoupon } })
      );

      if (couponRecord && couponRecord.active) {
        const isNotExpired = !couponRecord.expiresAt || new Date(couponRecord.expiresAt) > new Date();
        const hasRemainingUses = !couponRecord.maxUses || couponRecord.usedCount < couponRecord.maxUses;

        if (isNotExpired && hasRemainingUses) {
          if (couponRecord.discountType === "percentage") {
            discountApplied = (finalAmount * couponRecord.discountValue) / 100;
          } else {
            discountApplied = Math.min(couponRecord.discountValue, finalAmount);
          }
          finalAmount = Math.max(0, finalAmount - discountApplied);

          // Update coupon usage count
          withRetry(() =>
            prisma.coupon.update({
              where: { id: couponRecord.id },
              data: { usedCount: { increment: 1 } },
            })
          ).catch((e: any) => console.error("Failed to increment coupon usedCount:", e));
        }
      }
    }

    // Razorpay hard minimum is ₹1 (100 paise).
    // If a coupon brings the price below ₹1 but not to ₹0,
    // clamp UP to ₹1 so Razorpay accepts it.
    // Only a 100% discount (finalAmount === 0) bypasses Razorpay as a free order.
    if (finalAmount > 0 && finalAmount < RAZORPAY_MIN_AMOUNT_INR) {
      finalAmount = RAZORPAY_MIN_AMOUNT_INR; // clamp to ₹1 minimum
    }

    // 2. Handle 100% discount / free promo / sub-minimum amount checkout directly
    if (finalAmount <= 0) {
      const freeOrderId = `free_promo_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      
      await withRetry(() =>
        prisma.order.create({
          data: {
            razorpayOrderId: freeOrderId,
            razorpayPaymentId: `free_coupon_applied_${Date.now()}`,
            razorpaySignature: "free_checkout_signature",
            amount: 0,
            currency: currency || "INR",
            status: "paid", // Auto paid!
            format,
            templateId,
            customerName: customerName || null,
            customerEmail: customerEmail || null,
            customerPhone: customerPhone || null,
            couponCode: couponCode || null,
            discountApplied: parseFloat(amount), // full discount
          },
        })
      );

      return NextResponse.json({
        success: true,
        isFreeOrder: true,
        order: {
          id: freeOrderId,
          amount: 0,
          currency: currency || "INR",
        },
      });
    }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
    
    // Detect sandbox test mode if credentials are placeholders or not configured
    const isSandbox = !keyId || !keySecret || keyId === "rzp_test_placeholder" || keySecret === "placeholder_secret_key";

    if (isSandbox) {
      // Sandbox mode: create a mock order in database
      const mockOrderId = `mock_order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      
      await withRetry(() =>
        prisma.order.create({
          data: {
            razorpayOrderId: mockOrderId,
            amount: finalAmount,
            currency: currency || "INR",
            status: "pending",
            format,
            templateId,
            customerName: customerName || null,
            customerEmail: customerEmail || null,
            customerPhone: customerPhone || null,
            couponCode: couponCode || null,
            discountApplied: discountApplied,
          },
        })
      );

      return NextResponse.json({
        success: true,
        isSandbox: true,
        order: {
          id: mockOrderId,
          amount: Math.round(finalAmount * 100),
          currency: currency || "INR",
        },
        keyId: "sandbox_key",
      });
    }

    // Real mode: Initialize Razorpay SDK
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // Create order on Razorpay with discount applied
    // finalAmount is guaranteed >= RAZORPAY_MIN_AMOUNT_INR (₹1) here
    const amountInPaise = Math.round(finalAmount * 100);
    const paymentOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: currency || "INR",
      receipt: `receipt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    });

    // Save order in database with status pending
    await withRetry(() =>
      prisma.order.create({
        data: {
          razorpayOrderId: paymentOrder.id,
          amount: finalAmount,
          currency: currency || "INR",
          status: "pending",
          format,
          templateId,
          customerName: customerName || null,
          customerEmail: customerEmail || null,
          customerPhone: customerPhone || null,
          couponCode: couponCode || null,
          discountApplied: discountApplied,
        },
      })
    );

    return NextResponse.json({
      success: true,
      isSandbox: false,
      order: paymentOrder,
      keyId: keyId,
    });
  } catch (error: any) {
    console.error("Create Razorpay Order Error:", error);
    return NextResponse.json(
      { error: "Failed to create order", details: error.message },
      { status: 500 }
    );
  }
}
