import { NextRequest } from "next/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { theme = "floral", color = "gold and white", additionalPrompt = "" } = body;

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return new Response("Missing Gemini API Key", { status: 500 });
    }

    const google = createGoogleGenerativeAI({ apiKey });

    const systemPrompt = `You are a world-class SVG vector artist specializing in ultra-luxurious, highly intricate Indian Matrimonial Biodata frames and royal page borders.
Your task is to write raw, valid SVG code for a beautiful, premium A4 background frame.

Dimensions MUST be exactly: viewBox="0 0 595 842" width="595" height="842"

CRITICAL INSTRUCTIONS FOR DETAIL & QUALITY:
1. STRICTLY FORBIDDEN to generate "lazy", "minimalist", or "simple" geometry (e.g., just one or two basic rectangles). 
2. You MUST generate highly complex, dense, and intricate borders (at least 20-30 intricate <path> elements, floral vines, or geometric mandala motifs).
3. Ensure all 4 corners have highly detailed ornamental corner-pieces.
4. The entire outer margin (about 40-50px from the edges) should be richly decorated.
5. Use beautiful, aesthetic gradients (<linearGradient>), gold-foil style colors, and elegant stroke widths.
6. The center area MUST be left blank/transparent to accommodate biodata text.
7. Return ONLY the raw <svg>...</svg> string. DO NOT use markdown wrappers like \`\`\`svg. Output ONLY valid XML/SVG code.
8. DO NOT TRUNCATE the code. Generate the FULL, COMPLETE SVG.`;

    const userPrompt = `Generate a magnificent, ultra-detailed A4 biodata SVG frame.
Theme/Style: ${theme}
Color Palette: ${color}
Additional Details: ${additionalPrompt || "Make it highly detailed, elegant, and professional."}

REMEMBER: DO NOT return just a few rectangles. You MUST use complex <path> data to draw ornate, highly detailed corners, floral motifs, or royal patterns across the entire border! The output MUST be a breathtaking work of art.`;

    const result = await streamText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.7,
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error("[AI Frame Generator] Error:", error);
    return new Response(error.message || "Failed to generate AI frame", { status: 500 });
  }
}
