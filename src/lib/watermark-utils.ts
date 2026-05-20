export const WATERMARK_CONFIG = {
  // Replace this URL with your custom watermark image URL
  url: "https://res.cloudinary.com/dhlyinfwd/image/upload/v1778844624/biodata/Stickers/God%20Signs/ganesh.png",
  width: 300,
  height: 300,
  opacity: 0.07,
  // Set to false if you want to completely disable the watermark
  isEnabled: false,
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
