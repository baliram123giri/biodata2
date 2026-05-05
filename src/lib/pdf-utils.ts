import { toCanvas } from "html-to-image";
import { jsPDF } from "jspdf";

export async function generatePDF(elementId: string, filename: string = "biodata.pdf") {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error("Element not found");
    return;
  }

  try {
    // 1. Get the HTML and ensure all images have absolute URLs
    const origin = window.location.origin;
    let htmlContent = element.innerHTML;
    
    // Convert relative image paths to absolute for Puppeteer
    htmlContent = htmlContent.replace(/src="\//g, `src="${origin}/`);

    // 2. Wrap in a full HTML document with Tailwind and Fonts
    // Using Tailwind v4 CDN for the rendering phase
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
          <style type="text/tailwindcss">
            @theme {
              --color-primary: #800000;
              --color-secondary: #D4AF37;
              --color-accent: #FFD700;
            }
            html, body { margin: 0; padding: 0; width: 210mm; height: 297mm; overflow: hidden; }
            body { font-family: 'Inter', sans-serif; background: white; }
            @page { size: A4; margin: 0; }
            .print-container { width: 210mm; height: 297mm; position: relative; overflow: hidden; }
            /* Force the template itself to fill the container in PDF */
            .print-container > div { height: 100% !important; min-height: 100% !important; overflow: hidden !important; }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${htmlContent}
          </div>
        </body>
      </html>
    `;

    // 3. Send to the Server-Side Puppeteer API
    const response = await fetch("/api/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ html: fullHtml, filename }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate PDF on server");
    }

    // 4. Download the result
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error("Puppeteer PDF Error:", error);
    throw error;
  }
}
