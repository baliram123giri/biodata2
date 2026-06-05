import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  try {
    const res = await fetch(url);
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch SVG" }, { status: res.status });
    }
    const svgText = await res.text();
    return new Response(svgText, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err: any) {
    console.error("Proxy SVG error:", err);
    return NextResponse.json({ error: "Failed to fetch SVG content" }, { status: 500 });
  }
}
