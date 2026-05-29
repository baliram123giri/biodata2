import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { 
      gender = "male", 
      style = "traditional", 
      age = "26", 
      religion = "Hindu" 
    } = body;

    // Build a high-quality, professional prompt for an Indian matrimonial candidate portrait
    const subject = gender === "female" ? "an Indian woman" : "an Indian man";
    const dress = style === "traditional" 
      ? (gender === "female" ? "elegant traditional saree with subtle jewelry" : "traditional elegant Nehru jacket or bandhgala suit") 
      : "formal professional business attire";

    const promptText = `passport size professional photo of ${subject}, ${age} years old, ${religion} family background, looking at the camera, gentle warm smile, neutral clean light gradient background, ${dress}, high-end corporate studio portrait, passport size, sharp focus, highly detailed, realistic skin texture, professional lighting`;

    const encodedPrompt = encodeURIComponent(promptText);
    const seed = Math.floor(Math.random() * 1000000);
    
    // Using pollinations.ai for free, fast, beautiful Flux generation
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=600&height=800&model=flux&seed=${seed}&nologo=true`;

    // Fetch the image from Pollinations and convert it to Base64 to bypass CORS issues on the client Canvas
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to generate image from AI provider: ${imageResponse.statusText}`);
    }
    
    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = `data:image/jpeg;base64,${buffer.toString("base64")}`;

    return NextResponse.json({ 
      success: true, 
      url: base64Image 
    });
  } catch (error: any) {
    console.error("[AI Portrait Generator] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate AI portrait" },
      { status: 500 }
    );
  }
}
