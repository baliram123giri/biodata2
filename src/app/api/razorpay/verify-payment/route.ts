import { NextResponse } from "next/server";
import { prisma, withRetry } from "@/lib/prisma";
import Razorpay from "razorpay";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      razorpay_contact, // mobile number used at checkout
      razorpay_email,   // email used at checkout (client-forwarded)
      isSandbox,
    } = body;

    if (!razorpay_order_id) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // ── Helper: build the contact/email update fields ────────────────────────
    const buildContactUpdate = (email?: string | null, phone?: string | null) => {
      const update: Record<string, string> = {};
      if (phone) update.customerPhone = String(phone).replace(/\D/g, "").slice(-10);
      if (email && email.includes("@")) update.customerEmail = String(email).trim();
      return update;
    };

    // ── SANDBOX path ─────────────────────────────────────────────────────────
    if (isSandbox || razorpay_order_id.startsWith("mock_order_")) {
      const contactUpdate = buildContactUpdate(razorpay_email, razorpay_contact);

      const updatedOrder = await withRetry(() =>
        prisma.order.update({
          where: { razorpayOrderId: razorpay_order_id },
          data: {
            status: "paid",
            razorpayPaymentId: razorpay_payment_id || `mock_pay_${Date.now()}`,
            razorpaySignature: razorpay_signature || "mock_signature",
            ...contactUpdate,
          },
        })
      );

      return NextResponse.json({
        success: true,
        message: "Sandbox payment verified successfully",
        order: updatedOrder,
      });
    }

    // ── LIVE path: require payment ID + signature ────────────────────────────
    if (!razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Payment ID and signature are required for live verification" },
        { status: 400 }
      );
    }

    // Verify HMAC-SHA256 signature
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
      ).catch((e: any) => console.error("Failed to mark order as failed:", e));

      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // ── Fetch confirmed payment details from Razorpay API ────────────────────
    // This is the authoritative source for the email & contact the customer
    // actually used — even if they changed the prefilled values in the widget.
    let confirmedEmail: string | undefined = razorpay_email || undefined;
    let confirmedPhone: string | undefined = razorpay_contact || undefined;

    try {
      const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
      if (keyId && keySecret) {
        const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret });
        const payment = await rzp.payments.fetch(razorpay_payment_id) as any;
        if (payment?.email && payment.email.includes("@")) {
          confirmedEmail = payment.email;
        }
        if (payment?.contact) {
          confirmedPhone = String(payment.contact).replace(/\D/g, "").slice(-10);
        }
      }
    } catch (fetchErr: any) {
      // Non-fatal — fall back to client-forwarded values
      console.warn("[verify-payment] Could not fetch payment details from Razorpay:", fetchErr.message);
    }

    const contactUpdate = buildContactUpdate(confirmedEmail, confirmedPhone);

    // Mark order paid + save confirmed contact details
    const updatedOrder = await withRetry(() =>
      prisma.order.update({
        where: { razorpayOrderId: razorpay_order_id },
        data: {
          status: "paid",
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          ...contactUpdate,
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
