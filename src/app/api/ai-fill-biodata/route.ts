import { NextRequest, NextResponse } from "next/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

const SYSTEM_PROMPT = `You are a matrimonial biodata generator for Indian families. Generate realistic, culturally appropriate dummy biodata data in JSON format.

Return ONLY valid JSON (no markdown, no code blocks, no explanation) matching this exact schema:
{
  "mantra": "string (Sanskrit mantra like ॥ श्री गणेशाय नमः ॥)",
  "title": "string (like Biodata, Vivah Parichay, Marriage Biodata)",
  "personalDetails": {
    "fullName": "string (Indian full name)",
    "dateOfBirth": "YYYY-MM-DD",
    "timeOfBirth": "hh:mm AM/PM format like 10:30 AM",
    "placeOfBirth": "City, State",
    "height": "5 ft 6 in (167 cm)",
    "maritalStatus": "Single",
    "bloodGroup": "B+",
    "complexion": "one of: Fair, Very Fair, Wheatish, Wheatish Brown, Dark",
    "religion": "the religion passed in the request",
    "caste": "string",
    "gotra": "string (authentic Sanskrit gotra name)",
    "rashi": "one of the 12 rashis with English zodiac in parentheses",
    "nakshatra": "one of the 27 nakshatras",
    "manglik": "one of: No, Yes, Partial (Anshik)"
  },
  "educationDetails": {
    "education": "one of: 10th, 12th, Diploma, B.A., B.Sc., B.Com, B.E. / B.Tech, BCA, BBA, M.A., M.Sc., M.Com, M.E. / M.Tech, MCA, MBA, MBBS, Ph.D., CA, Other",
    "college": "Full college or university name in India",
    "occupation": "one of: Software Engineer, Doctor, Teacher / Professor, Government Job, Business, Self Employed, Banker, CA / Accountant, Lawyer, Engineer (Non-IT), Defense / Police, Private Job, Not Working, Other",
    "annualIncome": "one of: 0-5 LPA, 5-10 LPA, 10-15 LPA, 15-20 LPA, 20-25 LPA, 25-30 LPA, 30-35 LPA, 35-40 LPA, 40-45 LPA, 45-50 LPA, 50+ LPA",
    "companyName": "Well-known Indian or multinational company name"
  },
  "familyDetails": {
    "fatherName": "Full Indian name",
    "fatherOccupation": "Occupation string",
    "motherName": "Full Indian name",
    "motherOccupation": "one of: Housewife, Teacher, Doctor, Business, Government Job, Other",
    "totalBrothers": "0 or 1 or 2",
    "totalSisters": "0 or 1 or 2",
    "nativePlace": "Village or Town, State"
  },
  "contactDetails": {
    "mobileNumber": "+91 9XXXXXXXXX",
    "email": "firstname.lastname@gmail.com",
    "residentialAddress": "Street/Colony, City, PIN Code"
  }
}

IMPORTANT RULES:
- Generate DIFFERENT data each call (vary names, cities, professions randomly)
- Person must be 23-35 years old (dateOfBirth must reflect this)
- Height options must be exact like: 5 ft 4 in (162 cm) or 5 ft 9 in (175 cm) etc
- timeOfBirth must be like "10:30 AM" or "06:15 PM"
- All field values must be strings
- Return ONLY the JSON object with no extra text`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { gender = "male", religion = "Hindu" } = body;

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GOOGLE_GENERATIVE_AI_API_KEY not configured in environment variables" },
        { status: 500 }
      );
    }

    const googleProvider = createGoogleGenerativeAI({ apiKey });

    const prompt = `${SYSTEM_PROMPT}

Generate biodata for a ${gender} person from ${religion} religion. Make all details realistic, authentic, and varied. Output ONLY valid JSON.`;

    const { text } = await generateText({
      model: googleProvider("gemini-2.5-flash"),
      prompt,
    });

    // Strip any markdown code blocks if model wraps it
    const cleaned = text
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    return NextResponse.json({ data: parsed });
  } catch (error: any) {
    console.error("[AI Fill Biodata] Error:", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "AI returned invalid JSON. Please try again." },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to generate AI data" },
      { status: 500 }
    );
  }
}
