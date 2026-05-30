import { create } from "zustand";
import { persist } from "zustand/middleware";
import { temporal } from "zundo";

export interface Palette {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  bgColors?: string[]; // Custom gradient backgrounds for this palette
}

export const PALETTES: Palette[] = [
  // --- Solid & Traditional Palettes ---
  { name: "Royal Maroon", primary: "#800000", secondary: "#333333", accent: "#D4AF37" },
  { name: "Golden Elegance", primary: "#D4AF37", secondary: "#444444", accent: "#8B5E3C" },
  { name: "Deep Ocean", primary: "#1A3A5F", secondary: "#444444", accent: "#A4B6C8" },
  { name: "Emerald Luxury", primary: "#0D5C3A", secondary: "#2F3E46", accent: "#DFB15B" },
  { name: "Imperial Purple", primary: "#4A154B", secondary: "#333333", accent: "#E6C64C" },
  { name: "Peacock Majesty", primary: "#004B49", secondary: "#2D3748", accent: "#E5A93B" },
  { name: "Ruby Crimson", primary: "#9B111E", secondary: "#2C3E50", accent: "#F3C68F" },
  { name: "Saffron Blessings", primary: "#FF6F00", secondary: "#3E2723", accent: "#FFD54F" },
  { name: "Rose Gold", primary: "#B76E79", secondary: "#333333", accent: "#D4AF37" },
  { name: "Sandalwood Calm", primary: "#8D6E63", secondary: "#3E2723", accent: "#F5C27C" },
  { name: "Classic Charcoal", primary: "#2C3E50", secondary: "#555555", accent: "#BDC3C7" },

  // --- Gradient & Modern Palettes ---
  { name: "Auspicious Blue", primary: "#1E3A8A", secondary: "#1E293B", accent: "#3B82F6", bgColors: ["#EFF6FF", "#DBEAFE", "#BFDBFE"] },
  { name: "Modern Glow", primary: "#0F172A", secondary: "#334155", accent: "#0D9488", bgColors: ["#E0F2FE", "#D1FAE5", "#FEF08A"] },
  { name: "Sunrise Glow", primary: "#4c1d95", secondary: "#7c3aed", accent: "#f59e0b", bgColors: ["#fef3c7", "#fde68a", "#fcd34d"] },
  { name: "Ocean Breeze", primary: "#1e3a8a", secondary: "#3b82f6", accent: "#10b981", bgColors: ["#dcfce7", "#bbf7d0", "#86efac"] },
  { name: "Divine Saffron", primary: "#92400E", secondary: "#78350F", accent: "#F59E0B", bgColors: ["#FFFBEB", "#FEF3C7", "#FDE68A"] },
  { name: "Soft Rose", primary: "#9D174D", secondary: "#831843", accent: "#F472B6", bgColors: ["#FDF2F8", "#FCE7F3", "#FBCFE8"] },
  { name: "Lilac Dream", primary: "#5B21B6", secondary: "#4C1D95", accent: "#8B5CF6", bgColors: ["#F5F3FF", "#EDE9FE", "#DDD6FE"] },
  { name: "Warm Sand", primary: "#78350F", secondary: "#451A03", accent: "#D97706", bgColors: ["#FAF8F5", "#F4EFE6", "#EADEC9"] },
  { name: "Classic Ivory", primary: "#5D4037", secondary: "#3E2723", accent: "#8D6E63", bgColors: ["#FCFBF7", "#FAF7EE", "#F4F0E0"] },
];

export type FontFamily = "noto" | "inter" | "playfair";
export type FontWeight = "regular" | "medium" | "bold";
export type Alignment = "left" | "center" | "right";

export interface ThemeState {
  fontFamily: FontFamily;
  fontWeight: FontWeight;
  fontSize: number;
  alignment: Alignment;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  bgColors: string[];
  padding: number;
  paddingY?: number;
  borderRadius: number;
  selectedElement: string | null;
  selectedPaletteName: string | null;
  bgImageUrl: string | null;
  bgImageOpacity: number;
  bgImageScale: number;
  bgImageXOffset: number;
  bgImageYOffset: number;

  setFontFamily: (font: FontFamily) => void;
  setFontWeight: (weight: FontWeight) => void;
  setFontSize: (size: number) => void;
  setAlignment: (alignment: Alignment) => void;
  setPrimaryColor: (color: string) => void;
  setSecondaryColor: (color: string) => void;
  setAccentColor: (color: string) => void;
  setPalette: (palette: Palette) => void;
  setPadding: (padding: number) => void;
  setPaddingY: (paddingY: number | undefined) => void;
  setBorderRadius: (radius: number) => void;
  setSelectedElement: (elementId: string | null) => void;
  setBgImageUrl: (url: string | null) => void;
  setBgImageOpacity: (opacity: number) => void;
  setBgImageScale: (scale: number) => void;
  setBgImageXOffset: (x: number) => void;
  setBgImageYOffset: (y: number) => void;
  photoCornerRadius?: number;
  photoBorderSize?: number;
  setPhotoCornerRadius: (radius: number | undefined) => void;
  setPhotoBorderSize: (size: number | undefined) => void;
  resetTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    temporal(
      (set) => ({
        fontFamily: "noto",
        fontWeight: "medium",
        fontSize: 16,
        alignment: "center",
        primaryColor: "#800000",
        secondaryColor: "#333333",
        accentColor: "#D4AF37",
        bgColors: [],
        padding: 45,
        paddingY: undefined,
        borderRadius: 12,
        selectedElement: "Section Group",
        selectedPaletteName: "Royal Maroon",
        bgImageUrl: null,
        bgImageOpacity: 0.15,
        bgImageScale: 1.0,
        bgImageXOffset: 0,
        bgImageYOffset: 0,
        photoCornerRadius: undefined,
        photoBorderSize: undefined,

        setFontFamily: (font) => set({ fontFamily: font }),
        setFontWeight: (weight) => set({ fontWeight: weight }),
        setFontSize: (size) => set({ fontSize: size }),
        setAlignment: (alignment) => set({ alignment: alignment }),
        setPrimaryColor: (color) => set({ primaryColor: color }),
        setSecondaryColor: (color) => set({ secondaryColor: color }),
        setAccentColor: (color) => set({ accentColor: color }),
        setPalette: (palette) => set({ 
          primaryColor: palette.primary, 
          secondaryColor: palette.secondary, 
          accentColor: palette.accent,
          bgColors: palette.bgColors || [],
          selectedPaletteName: palette.name === "None" ? null : palette.name,
        }),
        setPadding: (padding) => set({ padding: padding }),
        setPaddingY: (paddingY) => set({ paddingY: paddingY }),
        setBorderRadius: (radius) => set({ borderRadius: radius }),
        setSelectedElement: (elementId) => set({ selectedElement: elementId }),
        setBgImageUrl: (url) => set({ 
          bgImageUrl: url,
          bgImageOpacity: 0.15,
          bgImageScale: 1.0,
          bgImageXOffset: 0,
          bgImageYOffset: 0
        }),
        setBgImageOpacity: (opacity) => set({ bgImageOpacity: opacity }),
        setBgImageScale: (scale) => set({ bgImageScale: scale }),
        setBgImageXOffset: (x) => set({ bgImageXOffset: x }),
        setBgImageYOffset: (y) => set({ bgImageYOffset: y }),
        setPhotoCornerRadius: (radius) => set({ photoCornerRadius: radius }),
        setPhotoBorderSize: (size) => set({ photoBorderSize: size }),
        resetTheme: () => set({
          fontFamily: "noto",
          fontWeight: "medium",
          fontSize: 16,
          alignment: "center",
          primaryColor: "#800000",
          secondaryColor: "#333333",
          accentColor: "#D4AF37",
          bgColors: [],
          padding: 45,
          paddingY: undefined,
          borderRadius: 12,
          selectedElement: "Section Group",
          selectedPaletteName: "Royal Maroon",
          bgImageUrl: null,
          bgImageOpacity: 0.15,
          bgImageScale: 1.0,
          bgImageXOffset: 0,
          bgImageYOffset: 0,
        }),
      })
    ),
    {
      name: "theme-storage",
    }
  )
);
