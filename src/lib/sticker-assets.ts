// High quality SVG paths and Cloudinary image URLs for matrimonial symbols

export interface StickerAsset {
  id: string;
  name: string;
  type: 'svg' | 'image';
  path?: string; // for SVG
  viewBox?: string; // for SVG
  url?: string;  // for Image
}

const GOD_SIGNS = [
  {
    name: "Om",
    url: "https://res.cloudinary.com/dhlyinfwd/image/upload/v1778842209/biodata/Stickers/God%20Signs/om.png"
  },
  {
    name: "Om2",
    url: "https://res.cloudinary.com/dhlyinfwd/image/upload/v1778846971/biodata/Stickers/God%20Signs/om2.png"
  },
  {
    name: "Ganesha",
    url: "https://res.cloudinary.com/dhlyinfwd/image/upload/v1778844624/biodata/Stickers/God%20Signs/ganesh.png"
  },
  {
    name: "Swastik",
    url: "https://res.cloudinary.com/dhlyinfwd/image/upload/v1778847514/biodata/Stickers/God%20Signs/swastik.png"
  },
  {
    name: "Shivling",
    url: "https://res.cloudinary.com/dhlyinfwd/image/upload/v1778847756/biodata/Stickers/God%20Signs/shivling.png"
  },



];

export const STICKER_ASSETS: StickerAsset[] = [
  // Image-based stickers from Cloudinary
  ...GOD_SIGNS.map((item) => ({
    id: `god-sign-${item.name.toLowerCase()}`,
    name: item.name,
    type: 'image' as const,
    url: item.url
  })),
];

export function registerDynamicStickers(customStickers: any[]) {
  customStickers.forEach((sticker) => {
    const exists = STICKER_ASSETS.some((s) => s.id === sticker.id || s.url === sticker.url);
    if (!exists) {
      STICKER_ASSETS.push({
        id: sticker.id,
        name: sticker.name,
        type: "image" as const,
        url: sticker.url,
      });
    }
  });
}
