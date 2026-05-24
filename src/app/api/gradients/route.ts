import { NextResponse } from "next/server";
import { GRADIENT_PRESETS } from "@/lib/gradient-presets";

export async function GET() {
  return NextResponse.json(GRADIENT_PRESETS, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=60",
    },
  });
}
