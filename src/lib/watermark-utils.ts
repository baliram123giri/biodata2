export const WATERMARK_CONFIG = {
  // SVG logo used for browser preview watermark
  url: "/new_logo.svg",
  // PNG fallback logo used for PDF/DOCX server-side export watermarks
  fallbackPngPath: "public/logo.png",
  width: 250,
  height: 250,
  opacity: 0.06,
  // Set to true to show the watermark
  isEnabled: true,
};

export function getWatermarkCoordinates(pageWidth: number, pageHeight: number) {
  return {
    x: (pageWidth - WATERMARK_CONFIG.width) / 2,
    y: (pageHeight - WATERMARK_CONFIG.height) / 2,
    width: WATERMARK_CONFIG.width,
    height: WATERMARK_CONFIG.height,
    radius: Math.min(WATERMARK_CONFIG.width, WATERMARK_CONFIG.height) / 2,
  };
}
