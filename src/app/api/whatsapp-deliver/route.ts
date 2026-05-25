import { NextRequest, NextResponse } from "next/server";
import { generatePDFBuffer } from "@/lib/pdfkit-generator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phoneNumber, countryCode, formData, templateId, theme } = body;

    if (!phoneNumber) {
      return NextResponse.json({ error: "phoneNumber is required" }, { status: 400 });
    }
    if (!formData) {
      return NextResponse.json({ error: "formData is required" }, { status: 400 });
    }

    const cleanCode = (countryCode || "+91").replace("+", "");
    const cleanPhone = phoneNumber.replace(/\D/g, "");
    const fullPhoneNumber = `${cleanCode}${cleanPhone}`;

    // 1. Generate PDF Buffer
    const pdfBuffer = await generatePDFBuffer({
      formData,
      templateId: templateId || "royal",
      theme: theme || {
        fontFamily: "noto",
        primaryColor: "#800000",
        secondaryColor: "#333333",
        accentColor: "#D4AF37",
        fontSize: 11,
        padding: 45,
        selectedPaletteName: null,
      },
    });

    const nameField =
      formData.personalDetails?.find((f: any) => f.id === "fullName")?.value ||
      "biodata";

    // 2. Fetch WhatsApp Credentials from environment variables
    const token = process.env.WHATSAPP_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    // Check if configuration is missing - if so, instruct client to use client-side fallback
    if (!token || !phoneNumberId) {
      return NextResponse.json({
        success: true,
        fallback: true,
        message: "No credentials configured. Using client-side direct link fallback."
      }, { status: 200 });
    }

    // 3. Upload PDF Buffer to Meta WhatsApp Media Endpoint
    const mediaFormData = new FormData();
    // Convert Buffer to Blob for multipart upload
    const pdfBlob = new Blob([new Uint8Array(pdfBuffer)], { type: "application/pdf" });
    mediaFormData.append("file", pdfBlob, `${nameField}.pdf`);
    mediaFormData.append("messaging_product", "whatsapp");
    mediaFormData.append("type", "application/pdf");

    const mediaUploadRes = await fetch(
      `https://graph.facebook.com/v19.0/${phoneNumberId}/media`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: mediaFormData,
      }
    );

    if (!mediaUploadRes.ok) {
      const errorText = await mediaUploadRes.text();
      console.error("Meta Media Upload Error:", errorText);
      throw new Error(`Meta Media API error: ${mediaUploadRes.status} - ${errorText}`);
    }

    const mediaUploadJson = await mediaUploadRes.json();
    const mediaId = mediaUploadJson.id;

    if (!mediaId) {
      throw new Error("Failed to retrieve Media ID from Meta API response");
    }

    // 4. Send the Document Message containing the Media ID to the user's phone number
    const messagePayload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: fullPhoneNumber,
      type: "document",
      document: {
        id: mediaId,
        filename: `${nameField}.pdf`,
        caption: `Here is your requested marriage biodata for ${nameField}. 🙏`
      }
    };

    const sendMessageRes = await fetch(
      `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(messagePayload),
      }
    );

    if (!sendMessageRes.ok) {
      const errorText = await sendMessageRes.text();
      console.error("Meta Send Message Error:", errorText);
      throw new Error(`Meta Send Message API error: ${sendMessageRes.status} - ${errorText}`);
    }

    const sendMessageJson = await sendMessageRes.json();

    return NextResponse.json({
      success: true,
      mode: "live",
      message: "Biodata PDF delivered successfully to WhatsApp!",
      recipient: fullPhoneNumber,
      messageId: sendMessageJson.messages?.[0]?.id
    }, { status: 200 });

  } catch (err: any) {
    console.error("WhatsApp delivery endpoint error:", err);
    return NextResponse.json(
      {
        error: "Failed to deliver WhatsApp message",
        details: err instanceof Error ? err.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
