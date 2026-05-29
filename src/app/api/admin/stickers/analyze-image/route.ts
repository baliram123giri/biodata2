import { NextRequest, NextResponse } from "next/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

async function getSessionUser() {
  const session = await getServerSession(authOptions);
  return (session?.user as any) || null;
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || (sessionUser.role !== "admin" && sessionUser.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { file } = body;

    if (!file) {
      return NextResponse.json({ error: "Missing file parameter" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Google Generative AI API Key not configured in environment variables" },
        { status: 500 }
      );
    }

    let base64Data = file;
    let mimeType = "image/png"; // fallback

    if (file.startsWith("data:")) {
      const parts = file.split(",");
      base64Data = parts[1];
      const match = parts[0].match(/data:(.*?);base64/);
      if (match) {
        mimeType = match[1];
      }
    }

    const imageBuffer = Buffer.from(base64Data, "base64");
    const googleProvider = createGoogleGenerativeAI({ apiKey });

    let generatedText = "";

    if (mimeType === "image/svg+xml") {
      const svgText = imageBuffer.toString("utf-8");
      const { text } = await generateText({
        model: googleProvider("gemini-2.5-flash"),
        prompt: `Analyze this SVG code of a matrimonial sticker/divider. By examining the paths, tags, and attributes, provide a highly descriptive, concise 2 to 4 word English title/name for it (for example: 'Ganesh Icon', 'Golden Mandala Border', 'Red Rose Floral', 'Elegant Swastik', 'Shubh Vivah Chant'). Return ONLY the name itself, with no punctuation, no surrounding quotes, and no extra explanation.

SVG CONTENT:
${svgText}`,
      });
      generatedText = text;
    } else {
      const { text } = await generateText({
        model: googleProvider("gemini-2.5-flash"),
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this matrimonial sticker/clipart/divider image. Provide a highly descriptive, concise 2 to 4 word English title/name for it (for example: 'Ganesh Icon', 'Golden Mandala Border', 'Red Rose Floral', 'Elegant Swastik', 'Shubh Vivah Chant'). Return ONLY the name itself, with no punctuation, no surrounding quotes, and no extra explanation."
              },
              {
                type: "image",
                image: imageBuffer,
                mediaType: mimeType
              }
            ]
          }
        ]
      });
      generatedText = text;
    }

    const cleanName = generatedText
      .trim()
      .replace(/^["']|["']$/g, "") // remove surrounding quotes
      .replace(/[.#*?^${}()|[\]\\]/g, "") // remove special chars
      .trim();

    return NextResponse.json({ success: true, name: cleanName });
  } catch (error: any) {
    console.error("[AI Analyze Sticker] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze image" },
      { status: 500 }
    );
  }
}
