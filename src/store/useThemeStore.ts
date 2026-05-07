import { create } from "zustand";
import { persist } from "zustand/middleware";
import { temporal } from "zundo";

export interface Palette {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
}

export const PALETTES: Palette[] = [
  { name: "Royal Maroon", primary: "#800000", secondary: "#333333", accent: "#D4AF37" },
  { name: "Golden Elegance", primary: "#D4AF37", secondary: "#444444", accent: "#8B5E3C" },
  { name: "Deep Ocean", primary: "#1A3A5F", secondary: "#444444", accent: "#A4B6C8" },
  { name: "Emerald Forest", primary: "#1E4D2B", secondary: "#333333", accent: "#9CC1A4" },
  { name: "Classic Charcoal", primary: "#2C3E50", secondary: "#555555", accent: "#BDC3C7" },
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
  padding: number;
  borderRadius: number;
  selectedElement: string | null;
  selectedPaletteName: string | null;

  setFontFamily: (font: FontFamily) => void;
  setFontWeight: (weight: FontWeight) => void;
  setFontSize: (size: number) => void;
  setAlignment: (alignment: Alignment) => void;
  setPrimaryColor: (color: string) => void;
  setPalette: (palette: Palette) => void;
  setPadding: (padding: number) => void;
  setBorderRadius: (radius: number) => void;
  setSelectedElement: (elementId: string | null) => void;
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
        padding: 45,
        borderRadius: 12,
        selectedElement: "Section Group",
        selectedPaletteName: "Royal Maroon",

        setFontFamily: (font) => set({ fontFamily: font }),
        setFontWeight: (weight) => set({ fontWeight: weight }),
        setFontSize: (size) => set({ fontSize: size }),
        setAlignment: (alignment) => set({ alignment: alignment }),
        setPrimaryColor: (color) => set({ primaryColor: color }),
        setPalette: (palette) => set({ 
          primaryColor: palette.primary, 
          secondaryColor: palette.secondary, 
          accentColor: palette.accent,
          selectedPaletteName: palette.name === "None" ? null : palette.name
        }),
        setPadding: (padding) => set({ padding: padding }),
        setBorderRadius: (radius) => set({ borderRadius: radius }),
        setSelectedElement: (elementId) => set({ selectedElement: elementId }),
      })
    ),
    {
      name: "theme-storage",
    }
  )
);
