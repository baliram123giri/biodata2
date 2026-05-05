import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function POST(req: NextRequest) {
  try {
    const { html, filename } = await req.json();

    if (!html) {
      return NextResponse.json({ error: "HTML content is required" }, { status: 400 });
    }

    // Launch puppeteer with stability flags
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox", 
        "--disable-setuid-sandbox",
        "--disable-gpu",
        "--disable-dev-shm-usage",
        "--disable-extensions"
      ],
      dumpio: true, // This will show browser errors in your terminal if it fails
    });

    const page = await browser.newPage();
    
    // Set content and wait for images/fonts to load
    await page.setContent(html, { 
      waitUntil: ["networkidle0", "domcontentloaded", "load"],
      timeout: 30000 
    });

    // Smart Scaling: Measure natural height then shrink to fit
    const zoomFactor = await page.evaluate(() => {
      const A4_HEIGHT_PX = 1123;
      const container = document.querySelector('.print-container') as HTMLElement;
      if (!container) return 1.0;
      
      // Temporarily allow container to grow to measure true height
      container.style.height = 'auto';
      container.style.overflow = 'visible';
      
      const contentHeight = container.scrollHeight;
      
      if (contentHeight > A4_HEIGHT_PX) {
        // Calculate factor with a small safety margin
        const factor = Math.max(0.6, (A4_HEIGHT_PX / contentHeight) * 0.96);
        
        const wrapper = container.firstElementChild as HTMLElement;
        if (wrapper) {
          wrapper.style.zoom = factor.toString();
          wrapper.style.transformOrigin = 'top center';
        }
        
        // Re-lock to A4 now that we've shrunk the inside
        container.style.height = '297mm';
        container.style.overflow = 'hidden';
        return factor;
      }
      
      // Still re-lock for short content to ensure frame corners fit
      container.style.height = '297mm';
      container.style.overflow = 'hidden';
      return 1.0;
    });

    // Generate PDF - Forced to a single page
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      preferCSSPageSize: true,
      pageRanges: "1", // STRICTLY force only the first page
    });

    await browser.close();

    // Return the PDF
    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename || "biodata.pdf"}"`,
      },
    });
  } catch (error: any) {
    console.error("Puppeteer Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate PDF" }, { status: 500 });
  }
}
