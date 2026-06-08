/**
 * Font loader for Konva canvas rendering.
 * Uses the Google Fonts CSS API (injected <link> tags) for reliable font loading
 * across all browsers. Falls back gracefully if a font fails to load.
 */

export interface KonvaFontDefinition {
  family: string;
  weight: number;
  style?: string;
}

/**
 * All supported English font options — key, display label, CSS family, and category.
 */
export const ENGLISH_FONTS: { key: string; label: string; family: string; category: string }[] = [
  { key: "noto",       label: "Noto Serif",        family: "Noto Serif",         category: "Serif" },
  { key: "playfair",   label: "Playfair Display",   family: "Playfair Display",   category: "Serif" },
  { key: "cormorant",  label: "Cormorant Garamond", family: "Cormorant Garamond", category: "Serif" },
  { key: "cinzel",     label: "Cinzel",             family: "Cinzel",             category: "Serif" },
  { key: "lora",       label: "Lora",               family: "Lora",               category: "Serif" },
  { key: "ebgaramond", label: "EB Garamond",        family: "EB Garamond",        category: "Serif" },
  { key: "inter",      label: "Inter",              family: "Inter",              category: "Sans" },
  { key: "raleway",    label: "Raleway",            family: "Raleway",            category: "Sans" },
];

/**
 * Maps each Google Font family name → the Google Fonts API query param.
 * Noto Sans Devanagari is kept for Hindi/Marathi script rendering.
 */
const GOOGLE_FONTS_MAP: Record<string, string> = {
  "Inter":                "Inter:wght@400;700",
  "Noto Serif":           "Noto+Serif:wght@400;700",
  "Playfair Display":     "Playfair+Display:wght@400;700",
  "Cormorant Garamond":   "Cormorant+Garamond:wght@400;700",
  "Cinzel":               "Cinzel:wght@400;700",
  "Lora":                 "Lora:wght@400;700",
  "EB Garamond":          "EB+Garamond:wght@400;700",
  "Raleway":              "Raleway:wght@400;700",
  "Noto Sans Devanagari": "Noto+Sans+Devanagari:wght@400;700",
};

const loadedFamilies = new Set<string>();

/**
 * Injects a Google Fonts <link> stylesheet for the given family and waits
 * until the browser reports the font as loaded.
 */
async function loadGoogleFont(family: string): Promise<void> {
  if (loadedFamilies.has(family)) return;

  const query = GOOGLE_FONTS_MAP[family];
  if (!query) {
    console.warn(`No Google Fonts mapping for: ${family}`);
    return;
  }

  // Only inject once per session
  const linkId = `gfont-${family.replace(/\s+/g, "-").toLowerCase()}`;
  if (!document.getElementById(linkId)) {
    const link = document.createElement("link");
    link.id = linkId;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${query}&display=swap`;
    document.head.appendChild(link);

    // Wait for the stylesheet to finish loading
    await new Promise<void>((resolve) => {
      link.onload = () => resolve();
      link.onerror = () => {
        console.warn(`Failed to load Google Font stylesheet for: ${family}`);
        resolve();
      };
      // Timeout fallback in case onload never fires
      setTimeout(resolve, 3000);
    });
  }

  // Now wait for the browser font engine to make the font available
  try {
    await document.fonts.load(`700 1em "${family}"`);
    await document.fonts.load(`400 1em "${family}"`);
  } catch {
    // Non-fatal: canvas will fall back to the system serif/sans
  }

  loadedFamilies.add(family);
}

/**
 * Ensures the given font families are loaded and ready for canvas rendering.
 * Call this before creating Konva Text nodes that use the font.
 */
export async function loadKonvaFonts(families: string[]): Promise<void> {
  const needed = families.filter(f => !loadedFamilies.has(f));
  if (needed.length === 0) return;
  await Promise.all(needed.map(loadGoogleFont));
  await document.fonts.ready;
}

/**
 * Maps the theme fontFamily key → the CSS font-family name used by Konva.
 */
export function getKonvaFontFamily(themeFontKey: string): string {
  const found = ENGLISH_FONTS.find(f => f.key === themeFontKey);
  return found ? found.family : "Noto Serif";
}
