import { NextResponse } from "next/server";
import { prisma, withRetry } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      razorpay_contact, // mobile number confirmed by Razorpay at payment time
      isSandbox,
    } = body;

    if (!razorpay_order_id) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Build the data update — always set phone if Razorpay returned one
    const phoneUpdate = razorpay_contact
      ? { customerPhone: String(razorpay_contact).replace(/\D/g, "").slice(-10) }
      : {};

    if (isSandbox || razorpay_order_id.startsWith("mock_order_")) {
      // Sandbox mode verification
      const updatedOrder = await withRetry(() =>
        prisma.order.update({
          where: { razorpayOrderId: razorpay_order_id },
          data: {
            status: "paid",
            razorpayPaymentId: razorpay_payment_id || `mock_pay_${Date.now()}`,
            razorpaySignature: razorpay_signature || "mock_signature",
            ...phoneUpdate,
          },
        })
      );

      return NextResponse.json({
        success: true,
        message: "Sandbox payment verified successfully",
        order: updatedOrder,
      });
    }

    if (!razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Payment ID and signature are required for live verification" },
        { status: 400 }
      );
    }

    // Live mode — verify HMAC-SHA256 signature
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (!isSignatureValid) {
      await withRetry(() =>
        prisma.order.update({
          where: { razorpayOrderId: razorpay_order_id },
          data: { status: "failed" },
        })
      ).catch((e: any) => console.error("Failed to update order to failed status:", e));

      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Update order: mark paid + save Razorpay-confirmed phone
    const updatedOrder = await withRetry(() =>
      prisma.order.update({
        where: { razorpayOrderId: razorpay_order_id },
        data: {
          status: "paid",
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          ...phoneUpdate,
        },
      })
    );

    return NextResponse.json({
      success: true,
      message: "Payment verified and completed successfully",
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error("Verify Payment Error:", error);
    return NextResponse.json(
      { error: "Payment verification failed", details: error.message },
      { status: 500 }
    );
  }
}
