import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";

export async function POST(req: NextRequest) {
  try {
    const { 
      type, // "name" or "description"
      name, // optional (passed when generating description)
      frameType, 
      frameBgColor, 
      defaultPrimary, 
      defaultSecondary, 
      defaultAccent 
    } = await req.json();

    // 1. Fetch existing templates for RAG context
    let existingText = "";
    try {
      if (prisma) {
        const existing = await prisma.template.findMany({
          select: {
            name: true,
            description: true,
          },
          take: 6,
        });
        if (type === "name") {
          existingText = existing.map(t => `- "${t.name}"`).join("\n");
        } else {
          existingText = existing.map(t => `- "${t.description}"`).join("\n");
        }
      }
    } catch (dbErr) {
      console.warn("Could not retrieve RAG context:", dbErr);
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Please set the GEMINI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY environment variable in your .env file." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const googleProvider = createGoogleGenerativeAI({ apiKey });

    let prompt = "";
    if (type === "name") {
      prompt = `You are a professional designer assistant for a premium Indian matrimonial biodata builder.
Here are the existing template names in our system (for style reference):
${existingText || "None"}

Generate a creative, premium Indian matrimonial biodata template name (2-3 words max, e.g., "Mughal Splendor", "Marigold Bliss", "Sanskrit Classic") for a template with these characteristics:
- Frame Type: ${frameType}
- Frame Background Color: ${frameBgColor}
- Theme Primary Color: ${defaultPrimary}
- Theme Secondary Color: ${defaultSecondary}
- Theme Accent Color: ${defaultAccent}

Output ONLY the raw template name. Do not write any explanations, quotes, or markdown.`;
    } else {
      prompt = `You are a professional designer assistant for a premium Indian matrimonial biodata builder.
Here are the existing template descriptions in our system (for style reference):
${existingText || "None"}

Generate an aesthetic layout description (1-2 sentences) for a matrimonial biodata template named "${name || "Premium"}" with these characteristics:
- Frame Type: ${frameType}
- Frame Background Color: ${frameBgColor}
- Theme Primary Color: ${defaultPrimary}
- Theme Secondary Color: ${defaultSecondary}
- Theme Accent Color: ${defaultAccent}

Output ONLY the raw description text describing the visual theme, borders, layout, and colors. Do not write any explanations, quotes, or markdown.`;
    }

    const result = streamText({
      model: googleProvider("gemini-2.5-flash"),
      prompt: prompt,
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
