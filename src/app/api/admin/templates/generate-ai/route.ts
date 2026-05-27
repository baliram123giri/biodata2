import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      type, // "name" or "description"
      name, // optional (passed when generating description)
      frameType,
      frameBgType = "solid",
      frameBgColor,
      frameBgGradientColors,
      defaultPrimary,
      defaultSecondary,
      defaultAccent,
      frameOuterInset,
      frameOuterStrokeWidth,
      frameOuterCornerRadius,
      frameInnerInset,
      frameInnerStrokeWidth,
      frameInnerCornerRadius,
      frameHasCornerCurves,
      frameGradientColors,
      frameComponentId
    } = body;

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

    // Format background properties for AI context
    let bgDesc = "";
    if (frameBgType === "solid") {
      bgDesc = `Solid Color background (${frameBgColor})`;
    } else {
      bgDesc = `${frameBgType === "linear" ? "Linear" : "Radial"} Gradient background using colors: ${frameBgGradientColors || frameBgColor}`;
    }

    // Format SVG frame/layout properties for AI context
    let frameDetail = "";
    if (frameType === "svg") {
      frameDetail = `Classic SVG Geometric Frame:
- Outer border: inset ${frameOuterInset}px, thickness ${frameOuterStrokeWidth}px, corner radius ${frameOuterCornerRadius}px (Color: ${defaultPrimary})
- Inner border: inset ${frameInnerInset}px, thickness ${frameInnerStrokeWidth}px, corner radius ${frameInnerCornerRadius}px (Color: ${defaultAccent})
- Corner loops decoration: ${frameHasCornerCurves ? "Enabled (Traditional Indian loops in corner)" : "Disabled"}`;
    } else if (frameType === "gradient") {
      frameDetail = `Gradient SVG Border:
- Border colors: ${frameGradientColors || defaultPrimary}
- Outer border: inset ${frameOuterInset}px, thickness ${frameOuterStrokeWidth}px, corner radius ${frameOuterCornerRadius}px
- Inner border: inset ${frameInnerInset}px, thickness ${frameInnerStrokeWidth}px, corner radius ${frameInnerCornerRadius}px`;
    } else if (frameType === "custom") {
      let componentName = "Custom Renderer";
      if (frameComponentId === "new-generation-arch") {
        componentName = "New Generation Arch (Mughal/Rajput Dome Arch shape)";
      } else if (frameComponentId === "ornate-grandeur") {
        componentName = "Ornate Grandeur (Traditional scroll accents and corner filigree)";
      } else if (frameComponentId === "green-shapes") {
        componentName = "Green Leaves Motif (Organic natural leaves border)";
      }
      frameDetail = `Custom SVG Theme Component: ${componentName} (Component ID: "${frameComponentId}")`;
    } else if (frameType === "image") {
      frameDetail = `Decorative Image Asset Frame (High-fidelity PNG/SVG overlay border tinted with the primary theme color)`;
    }

    let prompt = "";
    if (type === "name") {
      prompt = `You are a professional designer assistant for a premium Indian matrimonial biodata builder.
Here are the existing template names in our system (for style reference):
${existingText || "None"}

Generate a creative, premium Indian matrimonial biodata template name (2-3 words max, e.g., "Mughal Splendor", "Marigold Bliss", "Sanskrit Classic", "Gulabi Dusk") for a template with these visual design properties:
- Layout Frame Type: ${frameType}
- Frame Background: ${bgDesc}
- Theme Primary Color: ${defaultPrimary}
- Theme Secondary Color: ${defaultSecondary}
- Theme Accent Color: ${defaultAccent}
- Border & Geometric details:
${frameDetail}

Analyze these colors, gradients, and layout shapes to determine the template's artistic mood (e.g., royal heritage, vibrant festive, minimalist modern, natural organic, serene pastel, starry night) and name it accordingly.
Output ONLY the raw template name. Do not write any explanations, quotes, or markdown.`;
    } else {
      prompt = `You are an expert SEO copywriter specializing in marriage biodata and wedding template marketplaces (such as Etsy, Creative Market, and Canva).

When given a template name and its visual details (colors, style, layout, mood), generate a product description for an Indian matrimonial biodata template named "${name || "Premium"}" with these visual design properties:
- Layout Frame Type: ${frameType}
- Frame Background: ${bgDesc}
- Theme Primary Color: ${defaultPrimary}
- Theme Secondary Color: ${defaultSecondary}
- Theme Accent Color: ${defaultAccent}
- Border & Geometric details:
${frameDetail}

Reference existing template descriptions only for basic context, if available:
${existingText || "None"}

Please strictly follow these guidelines:

1. LEADS with the primary keyword in the first sentence. Always include phrases like "marriage biodata template", "biodata for marriage", "wedding biodata A4", or "shaadi biodata format" naturally in the first 2 lines.

2. MENTIONS the design style and mood in human, emotional language - parents and families are the buyers, so speak to them warmly (e.g., "elegant", "traditional", "modern", "minimal", "royal"). Adapt the vocabulary specifically to match the visual details: if the colors/shapes are royal red/gold arch, use majestic, heritage, and imperial tones; if pastel, use breezy, serene, and soft romantic tones; if minimal, use clean, modern, and understated elegance.

3. LISTS what is included or customizable in plain language: editable fields, photo placeholder, A4 size, print-ready, etc.

4. INCLUDES long-tail keyword phrases naturally - do not stuff. Dynamically choose 2-3 from this list and weave them in seamlessly:
   - "Hindu marriage biodata format"
   - "printable biodata template A4"
   - "editable biodata in Word / Canva"
   - "biodata for boy / girl marriage"
   - "Indian wedding biodata design"

5. ENDS with a short call-to-action that builds trust (e.g., "Perfect for sharing digitally via WhatsApp or printing at home.").

6. LENGTH: 80 to 120 words. No bullet points. Pure flowing paragraph format.

7. TONE: Warm, trustworthy, slightly formal - like a helpful wedding planner speaking to a family.

8. UNIQUE STYLE DIVERSITY: To ensure that different templates do not have the same repetitive rhythm, format, or exact phrasing:
   - Vary the sentence length and order of points.
   - Use dynamic synonyms (e.g., instead of always starting with "This is...", start with "Introduce your family's profile with...", "Celebrate this sacred journey using...", or "An exquisite canvas for your proposal...").
   - Match the writing style directly to the layout's aesthetic.

Output ONLY the raw description text. No headings, no explanations, no quotes, and no markdown.`;
    }

    const result = streamText({
      model: googleProvider("gemini-2.5-flash"),
      prompt: prompt,
    });

    return result.toTextStreamResponse({
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      }
    });
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
