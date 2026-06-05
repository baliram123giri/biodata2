import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  try {
    // Determine content type based on URL extension
    let contentType = "image/svg+xml";
    if (url.toLowerCase().endsWith(".webp")) {
      contentType = "image/webp";
    } else if (url.toLowerCase().endsWith(".png")) {
      contentType = "image/png";
    } else if (url.toLowerCase().endsWith(".jpg") || url.toLowerCase().endsWith(".jpeg")) {
      contentType = "image/jpeg";
    }

    // Check if the URL is local (starts with localhost, 127.0.0.1, or has no protocol)
    const isLocal = !url.startsWith("http") || 
                    url.startsWith("http://localhost") || 
                    url.startsWith("http://127.0.0.1");

    console.log("[PROXY-SVG-LOG] url:", url, "isLocal:", isLocal, "contentType:", contentType);

    if (isLocal) {
      let pathname = "";
      try {
        pathname = new URL(url.startsWith("http") ? url : `http://localhost${url}`).pathname;
      } catch {
        pathname = url;
      }

      // Read directly from the public directory
      const filePath = path.join(process.cwd(), "public", pathname);
      
      if (fs.existsSync(filePath)) {
        const fileContent = await fs.promises.readFile(filePath);
        return new Response(fileContent, {
          headers: {
            "Content-Type": contentType,
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      }
    }

    // Fetch remote URL with server-side caching
    const res = await fetch(url, { cache: "force-cache" });
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch resource" }, { status: res.status });
    }

    // Use the content-type from the response if available, otherwise fallback
    const respContentType = res.headers.get("content-type") || contentType;
    const arrayBuffer = await res.arrayBuffer();

    return new Response(Buffer.from(arrayBuffer), {
      headers: {
        "Content-Type": respContentType,
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err: any) {
    console.error("Proxy error:", err);
    return NextResponse.json({ error: "Failed to fetch resource content" }, { status: 500 });
  }
}
