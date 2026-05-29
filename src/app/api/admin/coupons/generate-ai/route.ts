import { NextRequest, NextResponse } from "next/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

const SYSTEM_PROMPT = `You are a coupon generator for a premium Indian matrimonial biodata platform.
Create a clever, auspicious, and highly catchy promotional coupon code themed around Indian weddings, families, or relationships.
Examples of good coupon codes: VIVAH50, MANGAL20, SHADI30, ROYAL100, GATHBANDHAN25, WEDDING40, LOVE2026.

Return ONLY valid JSON (no markdown, no code blocks, no explanation) matching this exact schema:
{
  "code": "A clever uppercase promo code string (e.g. VIVAH40)",
  "discountType": "one of: 'percentage', 'fixed'",
  "discountValue": number (if percentage: 10 to 100; if fixed: 20 to 150),
  "maxUses": number (suggested max uses between 50 and 500),
  "expiresAt": "YYYY-MM-DD formatted date string representing 14 to 30 days in the future"
}

IMPORTANT RULES:
- The discountType can be 'percentage' or 'fixed', but percentage is preferred (80% of the time).
- Do not return duplicate suggestions. Be creative!
- Return ONLY the JSON object with no extra text or wrapping.`;

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GOOGLE_GENERATIVE_AI_API_KEY not configured in environment variables" },
        { status: 500 }
      );
    }

    const googleProvider = createGoogleGenerativeAI({ apiKey });

    const { text } = await generateText({
      model: googleProvider("gemini-2.5-flash"),
      prompt: `${SYSTEM_PROMPT}\nGenerate a clever new coupon code now. Make it highly engaging for a premium marriage platform.`,
    });

    // Strip any markdown code blocks if model wraps it
    const cleaned = text
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    return NextResponse.json({ success: true, coupon: parsed });
  } catch (error: any) {
    console.error("[AI Generate Coupon] Error:", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "AI returned invalid JSON. Please try again." },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to generate AI coupon" },
      { status: 500 }
    );
  }
}
