import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Hostinger SMTP configuration
const smtpHost = process.env.EMAIL_HOST || "smtp.hostinger.com";
const smtpPort = parseInt(process.env.EMAIL_PORT || "465");
const smtpUser = process.env.EMAIL_USER || "support@biodata99.com";
const smtpPass = process.env.EMAIL_PASS;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, topic, message } = body;

    // Real-time validation
    if (!name || !email || !topic || !message) {
      return NextResponse.json(
        { error: "All fields are required. Please check your inputs and try again." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (message.trim().length < 10) {
      return NextResponse.json(
        { error: "Message must be at least 10 characters long." },
        { status: 400 }
      );
    }

    // If SMTP_PASS is not configured (e.g. in local development), log it and return success
    if (!smtpPass) {
      console.warn("SMTP Password (EMAIL_PASS) is not configured in env. Skipping real email dispatch.");
      return NextResponse.json(
        {
          success: true,
          message: "Message received locally! (SMTP credentials not configured in env, email skipped)",
        },
        { status: 200 }
      );
    }

    // Configure SMTP transporter for Hostinger
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // True for port 465 SSL, false for others TLS
      debug: true, // Enable detailed SMTP conversation logs
      logger: true, // Log conversation directly to server output
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false, // Prevents certificate verification issues on some environments
      },
    });

    // 1. Email notification to the Administrator (support@biodata99.com)
    const adminMailOptions = {
      from: `"biodata99.com Contact" <${smtpUser}>`,
      to: smtpUser,
      subject: `[${topic}] New Contact Inquiry from ${name}`,
      html: `
        <div style="font-family: 'Inter', sans-serif; background-color: #fdf8f4; padding: 30px; border-radius: 12px; border: 1px solid #C9A84C; max-width: 600px; margin: 0 auto; color: #333333;">
          <h2 style="color: #9B1B30; border-bottom: 2px solid #C9A84C; padding-bottom: 10px; margin-top: 0;">New Support Inquiry</h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <tr>
              <td style="padding: 6px 0; font-weight: bold; width: 120px; color: #666666;">Full Name:</td>
              <td style="padding: 6px 0; font-size: 15px; font-weight: bold;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #666666;">Email:</td>
              <td style="padding: 6px 0; font-size: 15px;"><a href="mailto:${email}" style="color: #9B1B30; text-decoration: none; font-weight: bold;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #666666;">Inquiry Topic:</td>
              <td style="padding: 6px 0; font-size: 15px; font-weight: bold; color: #C9A84C;">${topic}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #666666;">Received At:</td>
              <td style="padding: 6px 0; font-size: 14px; color: #888888;">${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</td>
            </tr>
          </table>
          <div style="background-color: #ffffff; border: 1px solid #eee; border-radius: 8px; padding: 20px; margin-top: 20px; line-height: 1.6; white-space: pre-wrap; font-size: 14px; color: #444444;">
            ${message}
          </div>
          <p style="font-size: 12px; color: #888888; text-align: center; margin-top: 25px; border-top: 1px solid #eee; padding-top: 15px;">
            This email was sent automatically from the contact form on biodata99.com.
          </p>
        </div>
      `,
    };

    // 2. Personalized Auto-Reply to the Customer
    const userMailOptions = {
      from: `"biodata99.com Support" <${smtpUser}>`,
      to: email,
      subject: `Inquiry Received: ${topic} - biodata99.com`,
      html: `
        <div style="font-family: 'Inter', sans-serif; background-color: #fdf8f4; padding: 30px; border-radius: 12px; border: 1px solid #C9A84C; max-width: 600px; margin: 0 auto; color: #333333;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #9B1B30; margin: 0; font-size: 24px;">biodata99.com</h1>
            <p style="color: #C9A84C; margin: 2px 0 0 0; font-size: 13px; letter-spacing: 1px; font-weight: bold; text-transform: uppercase;">Marriage Biodata Maker</p>
          </div>
          <p style="font-size: 15px; line-height: 1.6;">Dear <strong>${name}</strong>,</p>
          <p style="font-size: 15px; line-height: 1.6;">
            Thank you for reaching out to us! We have successfully received your inquiry regarding <strong>${topic}</strong>.
          </p>
          <p style="font-size: 15px; line-height: 1.6;">
            Our support team is currently reviewing your message, and we aim to get back to you with a comprehensive response within <strong>24 hours</strong> (excluding Sundays).
          </p>
          
          <div style="background-color: #ffffff; border-left: 4px solid #9B1B30; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0; font-size: 14px; color: #555555;">
            <h4 style="margin: 0 0 6px 0; color: #9B1B30; font-size: 13px; text-transform: uppercase; tracking-wider: 1px;">Your Message Copy:</h4>
            <div style="white-space: pre-wrap; line-height: 1.5;">${message}</div>
          </div>

          <div style="background-color: #f9f6f0; border: 1px solid #e6dfd3; border-radius: 8px; padding: 15px; font-size: 13px; color: #776e5d; margin-top: 20px;">
            🛡️ <strong>Privacy Shield Reminder:</strong> Since we prioritize your privacy and **do not store any user details or biodatas on our servers**, we cannot retrieve or recover downloaded PDFs or editing details. Any future updates must be performed directly through the app on the same device.
          </div>

          <p style="font-size: 15px; line-height: 1.6; margin-top: 25px;">
            Warm regards,<br />
            <strong>biodata99.com Support Team</strong>
          </p>
          
          <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 15px; text-align: center; font-size: 12px; color: #888888;">
            <p style="margin: 0 0 5px 0;">Have an urgent question? You can also message us directly on WhatsApp!</p>
            <a href="https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMMBER}" style="color: #25d366; font-weight: bold; text-decoration: none;">Chat with Support on WhatsApp</a>
          </div>
        </div>
      `,
    };

    // Dispatch both emails concurrently
    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(userMailOptions),
    ]);

    return NextResponse.json(
      {
        success: true,
        message: "Your message has been delivered successfully! We've sent a confirmation email to you.",
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Contact Form SMTP Dispatch Error:", err);
    return NextResponse.json(
      { error: "Failed to dispatch email inquiry. Please try again or email support@biodata99.com directly." },
      { status: 500 }
    );
  }
}
