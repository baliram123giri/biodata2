import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, location, format, templateId, orderId } = body;

    if (!name || !format) {
      return NextResponse.json(
        { error: "Name and format are required fields" },
        { status: 400 }
      );
    }

    // Get client IP address and User Agent from request headers
    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      null;
    const userAgent = req.headers.get("user-agent");

    const isDev = process.env.NEXT_PUBLIC_IS_DEV === "true";
    let log = null;

    if (isDev) {
      console.log("Dev mode active: skipping download logs insertion to DB.");
      log = {
        id: "dev-mock-log-id",
        name,
        location: location || null,
        format,
        templateId: templateId || null,
        ipAddress,
        userAgent,
        createdAt: new Date(),
      };
    } else {
      log = await prisma.downloadLog.create({
        data: {
          name,
          location: location || null,
          format,
          templateId: templateId || null,
          ipAddress,
          userAgent,
          orderId: orderId || null,
        },
      });
    }

    // If orderId is provided, update downloadStatus on the Order table
    if (orderId && orderId !== "sandbox" && orderId !== "dev_bypass" && !isDev) {
      try {
        await prisma.order.update({
          where: { razorpayOrderId: orderId },
          data: { downloadStatus: "success" },
        });
      } catch (dbErr) {
        console.warn("Failed to update downloadStatus of order in download-log API:", dbErr);
      }
    }

    return NextResponse.json({ success: true, log });
  } catch (error: any) {
    console.error("Download log error:", error);
    return NextResponse.json(
      { error: "Failed to record download", details: error.message },
      { status: 500 }
    );
  }
}
