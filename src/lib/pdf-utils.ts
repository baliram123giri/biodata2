import { toPng } from "html-to-image";
import jsPDF from "jspdf";

export async function generatePDF(elementId: string, filename: string = "biodata.pdf") {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error("Element not found");
    return;
  }

  try {
    // Use html-to-image which has better support for modern CSS (oklch, oklab)
    // and captures higher quality output via SVG rendering
    const imgData = await toPng(element, {
      quality: 1.0,
      pixelRatio: 7, // High quality scale
      backgroundColor: "#ffffff",
      cacheBust: true,
    });

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Create a temporary image to get dimensions
    const img = new Image();
    img.src = imgData;

    await new Promise((resolve) => {
      img.onload = resolve;
    });

    const imgWidth = img.width;
    const imgHeight = img.height;
    const ratio = imgWidth / imgHeight;

    let finalWidth = pageWidth;
    let finalHeight = finalWidth / ratio;

    // If the calculated height is more than the page height, scale down
    if (finalHeight > pageHeight) {
      finalHeight = pageHeight;
      finalWidth = finalHeight * ratio;
    }

    // Center the image on the page
    const x = (pageWidth - finalWidth) / 2;
    const y = (pageHeight - finalHeight) / 2;

    // Add image to PDF
    pdf.addImage(imgData, "PNG", 0, 0, finalWidth, finalHeight);

    // Save the PDF
    pdf.save(filename);
  } catch (error) {
    console.error("Error generating PDF:", error);
  }
}
